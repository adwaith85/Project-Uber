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
    origin: "http://localhost:5173", // your React app port
    methods: ["GET", "POST"],
  },
});

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 8080;

mongoose.connect(MONGO_URL);

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(UserRoute);
app.use(driverRoute);


// const onlineDrivers = new Map();

io.on("connection", (socket) => {
  console.log("🚗 Client connected:", socket.id);

  // 🟢 DRIVER LOGIN HANDLER
  // socket.on("driver:login", async (driverId) => {
  //   try {
  //     console.log("✅ Driver logged in:", driverId);
  //     onlineDrivers.set(socket.id, driverId);
  //     await DriverModel.findByIdAndUpdate(driverId, { onlinestatus: "loggin" });
  //   } catch (err) {
  //     console.error("❌ Error updating driver login:", err);
  //   }
  // });

  // // 🔴 DRIVER LOGOUT HANDLER
  // socket.on("driver:logout", async (driverId) => {
  //   try {
  //     console.log("🚪 Driver logged out:", driverId);
  //     await DriverModel.findByIdAndUpdate(driverId, { onlinestatus: "logout" });
  //     onlineDrivers.delete(socket.id);
  //   } catch (err) {
  //     console.error("❌ Error updating driver logout:", err);
  //   }
  // });

// ✅ Socket.IO setup
io.on("connection", (socket) => {
  console.log("🚗 Client connected:", socket.id);

  socket.on("checkOrderStatus", async ({ orderId }) => {
    console.log("User checking order:", orderId);

    setTimeout(async () => {
      try {
        const checkorder = await RideModel.findOne({ _id: orderId })
        console.log("🚀 checkorder:", checkorder);
        if (checkorder.status === "accepted") {
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

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });

  // receive driver’s location from frontend
  socket.on("driver:location:update", async (data) => {
    try {
      const { email, coordinates, socketid } = data;

      if (!email || !coordinates) {
        console.warn("⚠️ Missing email or coordinates");
        return;
      }

      // GeoJSON expects [longitude, latitude]
      const { lat, lng } = coordinates;

      // Update driver’s location in DB
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
});


 // ❌ DISCONNECT HANDLER (auto logout)
  // socket.on("disconnect", async () => {
  //   console.log("🔴 Client disconnected:", socket.id);
  //   const driverId = onlineDrivers.get(socket.id);
  //   if (driverId) {
  //     await DriverModel.findByIdAndUpdate(driverId, { onlinestatus: "logout" });
  //     onlineDrivers.delete(socket.id);
  //     console.log("⚠️ Driver auto-logged out:", driverId);
  //   }
  // });
});

server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));