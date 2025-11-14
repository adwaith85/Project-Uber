import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import UserRoute from "./Routes/User.js";
import driverRoute from "./Routes/Driver.js";
import DriverModel from "./Model/Driver.js";
import RideModel from "./Model/Ride.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ create raw HTTP server

export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // rider (5173) and driver (5174)
    methods: ["GET", "POST"],
  },
});

// In-memory OTP store for rides (rideId -> otp)
const rideOtps = new Map();
// Track sockets and latest coordinates per ride: { driver: socketId, user: socketId, driverCoords, userCoords }
const rideSockets = new Map();

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 8080;

mongoose.connect(MONGO_URL);

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(UserRoute);
app.use(driverRoute);

// ============================================================
// ✅ SOCKET.IO LOGIC
// ============================================================
io.on("connection", (socket) => {
  console.log("🚗 Client connected:", socket.id);

  // -----------------------------
  // Join a ride room when ride is accepted
  // -----------------------------
  socket.on("ride:join", ({ rideId, role, email }) => {
    if (!rideId || !role) return;

  const roomName = `ride_${rideId}`;
  socket.join(roomName);
  console.log(`🔹 ${role} (${email || 'unknown'}) joined room: ${roomName} socket:${socket.id}`);

  // store socket id for this role
  const key = String(rideId);
  const entry = rideSockets.get(key) || {};
  if (role === "driver") entry.driver = socket.id;
  if (role === "user") entry.user = socket.id;
  rideSockets.set(key, entry);

    // Confirm to client
    socket.emit("ride:joined", { rideId, room: roomName });
  });

  // -----------------------------
  // Driver real-time location update (on-ride)
  // -----------------------------
  socket.on("driver:location:update:onride", async (data) => {
    try {
      const { rideId, coordinates, email, socketid } = data;
      if (!rideId || !coordinates || !email) return;

      const { lat, lng } = coordinates;

      // Update driver location in DB
      await DriverModel.findOneAndUpdate(
        { email },
        {
          $set: {
            socketid: socketid || socket.id,
            location: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        },
        { new: true }
      );

      const roomName = `ride_${rideId}`;
      io.to(roomName).emit("driver:location", coordinates);
      
      console.log(`📍 Driver (${email}) in ride ${rideId}:`, coordinates);
      console.log(`  📢 Broadcasting 'driver:location' to room: ${roomName}`);
      // store latest driver coords for this ride
      try {
        const key = String(rideId);
        const entry = rideSockets.get(key) || {};
        entry.driverCoords = { lat, lng };
        rideSockets.set(key, entry);
      } catch (e) {
        console.warn("Could not store driver coords for ride", rideId, e);
      }
    } catch (err) {
      console.error("❌ Error updating driver location:", err);
    }
  });

  // -----------------------------
  // User real-time location update (on-ride)
  // -----------------------------
  socket.on("user:location:update:onride", ({ rideId, coordinates, email }) => {
    if (!rideId || !coordinates) {
      console.warn("user:location:update:onride missing rideId or coordinates", { rideId, coordinates, email });
      return;
    }

    const roomName = `ride_${rideId}`;
    io.to(roomName).emit("user:location", coordinates);

    if (email) {
      console.log(`👤 User (${email}) in ride ${rideId}:`, coordinates);
    } else {
      console.log(`👤 User (no-email) in ride ${rideId}:`, coordinates);
    }
    console.log(`  📢 Broadcasting 'user:location' to room: ${roomName}`);
    // store latest user coords for this ride
    try {
      const key = String(rideId);
      const entry = rideSockets.get(key) || {};
      entry.userCoords = coordinates;
      rideSockets.set(key, entry);
    } catch (e) {
      console.warn("Could not store user coords for ride", rideId, e);
    }
  });

  // -----------------------------
  // Driver signals arrival at pickup — generate OTP and notify room
  // -----------------------------
  socket.on("driver:arrived", ({ rideId, email }) => {
    try {
      if (!rideId) return;
      const key = String(rideId);
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      rideOtps.set(key, otp);

      const entry = rideSockets.get(key) || {};
      // send OTP only to the user's socket (do not expose to driver)
      if (entry.user) {
        io.to(entry.user).emit("driver:arrived", { rideId, otp });
      } else {
        // fallback: emit to room if user socket unknown
        const roomName = `ride_${rideId}`;
        io.to(roomName).emit("driver:arrived", { rideId, otp });
      }

      // notify driver that OTP was sent to user (without revealing it)
      if (entry.driver) {
        io.to(entry.driver).emit("otp:sent-to-user", { rideId });
      }

      console.log(`🔔 Driver-generated OTP for ride ${rideId} — sent to user socket`);
    } catch (err) {
      console.error("Error handling driver:arrived", err);
    }
  });

  // -----------------------------
  // Rider confirms OTP to start the journey
  // -----------------------------
  socket.on("otp:confirm", ({ rideId, otp }) => {
    try {
      if (!rideId || !otp) return;
      const key = String(rideId);
      const entry = rideSockets.get(key) || {};

      // ensure only driver socket can confirm
      if (!entry.driver || socket.id !== entry.driver) {
        io.to(socket.id).emit("otp:confirmed", { rideId, success: false, message: "Only driver can confirm OTP" });
        console.log(`❌ OTP confirm attempt by non-driver socket for ride ${rideId}`);
        return;
      }

      // check proximity - require driver and user coords available
      const driverCoords = entry.driverCoords;
      const userCoords = entry.userCoords;
      const haversineKm = (a, b) => {
        if (!a || !b) return Infinity;
        const toRad = (v) => (v * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(b.lat - a.lat);
        const dLon = toRad(b.lng - a.lng);
        const lat1 = toRad(a.lat);
        const lat2 = toRad(b.lat);
        const sinDLat = Math.sin(dLat / 2) * Math.sin(dLat / 2);
        const sinDLon = Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const h = sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon;
        const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
        return R * c;
      };

      const distanceKm = haversineKm(driverCoords, userCoords);
      // allow tiny tolerance (1 meter) to account for GPS noise
      if (!isFinite(distanceKm) || distanceKm > 0.001) {
        io.to(entry.driver || socket.id).emit("otp:confirmed", { rideId, success: false, message: "Driver not at pickup location" });
        console.log(`❌ OTP confirm rejected - driver not at pickup for ride ${rideId}. distanceKm=${distanceKm}`);
        return;
      }

      const expected = rideOtps.get(key);
      const roomName = `ride_${rideId}`;
      if (expected && String(expected) === String(otp)) {
        rideOtps.delete(key);
        io.to(roomName).emit("otp:confirmed", { rideId, success: true });
        console.log(`✅ OTP confirmed for ride ${rideId}`);
      } else {
        io.to(entry.driver || socket.id).emit("otp:confirmed", { rideId, success: false, message: "Incorrect OTP" });
        console.log(`❌ OTP mismatch for ride ${rideId}`);
      }
    } catch (err) {
      console.error("Error handling otp:confirm", err);
    }
  });

  // -----------------------------
  // Check ride/order status
  // -----------------------------
  socket.on("checkOrderStatus", async ({ orderId }) => {
    console.log("User checking order:", orderId);

    setTimeout(async () => {
      try {
        const checkorder = await RideModel.findOne({ _id: orderId });
        if (checkorder?.status === "accepted") {
          io.to(socket.id).emit("orderStatus", {
            orderId,
            status: "accepted",
          });
        }
      } catch (err) {
        console.error("❌ Error checking order status:", err);
      }
    }, 16000);
  });

  // -----------------------------
  // Driver general location updates
  // -----------------------------
  socket.on("driver:location:update", async (data) => {
    try {
      const { email, coordinates, socketid } = data;
      if (!email || !coordinates) return;

      const { lat, lng } = coordinates;

      const driver = await DriverModel.findOneAndUpdate(
        { email },
        {
          $set: {
            socketid: socketid,
            location: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        },
        { new: true }
      );

      io.emit("driver:location", coordinates);

      if (driver) {
        console.log(`📍 Updated location for ${driver.email}:`, driver.location.coordinates);
      } else {
        console.warn(`⚠️ Driver not found for email: ${email}`);
      }
    } catch (err) {
      console.error("❌ Error updating location:", err);
    }
  });

  // -----------------------------
  // Disconnect
  // -----------------------------
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    // clean up rideSockets entries that reference this socket
    try {
      for (const [rideId, entry] of rideSockets.entries()) {
        let changed = false;
        if (entry.driver === socket.id) {
          delete entry.driver;
          delete entry.driverCoords;
          changed = true;
        }
        if (entry.user === socket.id) {
          delete entry.user;
          delete entry.userCoords;
          changed = true;
        }
        if (changed) {
          // if both driver and user are gone, remove the map entry entirely
          if (!entry.driver && !entry.user) {
            rideSockets.delete(rideId);
          } else {
            rideSockets.set(rideId, entry);
          }
        }
      }
    } catch (e) {
      console.warn("Error cleaning rideSockets on disconnect", e);
    }
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
