import mongoose from "mongoose";

const RideSchema = new mongoose.Schema({
  pickup: {
    type: String,
    required: true,
  },
  dropoff: {
    type: String,
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  date: {
      type: Date,
      default: Date.now, // stores both date & time (ISO format)
    },
  time: {
      type: String,
      default: () => {
        const now = new Date();
        return now.toLocaleTimeString("en-US", { hour12: false }); // HH:MM:SS format
      },
    },
    // onlinestatus:{
    //   type:String,
    //   enum:["loggin","logout"],
    //   default:"logout",
    // },
  status: {
    type: String,
    enum: ["requested", "accepted", "completed", "cancelled"],
    default: "requested",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
});

const RideModel = mongoose.model("Ride", RideSchema);

export default RideModel;