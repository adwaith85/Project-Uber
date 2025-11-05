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