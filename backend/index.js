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
    console.log(`🔹 ${role} (${email || 'unknown'}) joined room: ${roomName}`);

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
  });

  // -----------------------------
  // Driver signals arrival at pickup — generate OTP and notify room
  // -----------------------------
  socket.on("driver:arrived", ({ rideId, email }) => {
    try {
      if (!rideId) return;
      const roomName = `ride_${rideId}`;
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      rideOtps.set(String(rideId), otp);
      io.to(roomName).emit("driver:arrived", { rideId, otp });
      console.log(`🔔 Driver arrived for ride ${rideId} — OTP sent to room ${roomName}`);
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
      const expected = rideOtps.get(String(rideId));
      const roomName = `ride_${rideId}`;
      if (expected && String(expected) === String(otp)) {
        rideOtps.delete(String(rideId));
        io.to(roomName).emit("otp:confirmed", { rideId, success: true });
        console.log(`✅ OTP confirmed for ride ${rideId}`);
      } else {
        io.to(socket.id).emit("otp:confirmed", { rideId, success: false });
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
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
