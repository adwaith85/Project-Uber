import RideModel from "../Model/Ride.js";
import UserModel from "../Model/User.js";

export const trip = async (req, res) => {
  try {
    const trip = await RideModel.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export const ridecomplete = async (req, res) => {
  try {
    const trip = await RideModel.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    trip.status = "completed"
    await trip.save();
    // console.log("Ride completed:", trip);
    res.json({ message: "Trip marked as completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export const rideDetails = async (req, res) => {
  try {
    const rides = await RideModel.find();
    res.json(rides);
    // console.log("All rides fetched:", rides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRideHistory = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const rides = await RideModel.find({ userId: user._id }).sort({ date: -1 });
    res.json(rides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};