import RideModel from "../Model/Ride.js";

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