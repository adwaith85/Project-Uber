import express from 'express'
import { upload } from "../multer.js"
import { acceptride, bookride, Details, DriverLogin, Driverlogout, DriverRegister, nearby, UpdateDriver, UpdateLocation } from '../Controller/Driver.js'
import { LoginCheck } from '../Middleware/User.js'
import RideModel from '../Model/Ride.js'

const driver = express.Router()

driver.post("/driverlogin", DriverLogin)
driver.get("/driverlogout",LoginCheck,Driverlogout)
driver.put("/updatelocation", LoginCheck, UpdateLocation)
driver.post("/driverregister", DriverRegister)
driver.post("/updatedriver", LoginCheck, upload.single("profileimg"), UpdateDriver)
driver.get("/Details", LoginCheck, Details)
driver.get("/nearby", nearby)
driver.post("/acceptride", acceptride)
driver.post("/bookride", bookride)


driver.get("/trip/:id", async (req, res) => {
  try {
    const trip = await RideModel.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

driver.get("/ridecomplete/:id", async (req, res) => {
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
});





export default driver