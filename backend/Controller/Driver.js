import jwt from "jsonwebtoken";
import DriverModel from "../Model/Driver.js";
import RideModel from "../Model/Ride.js";


export const DriverLogin = async (req, res) => {
  const { email, password, location } = req.body;

  try {
    if (!email || !password || !location) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const driver = await DriverModel.findOne({ email });
    if (!driver) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await driver.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }
    if (
      location &&
      location.type === "Point" &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2
    ) {
      driver.location = {
        type: "Point",
        coordinates: location.coordinates,
      };
      driver.markModified("location");
      await driver.save();
    }

    const token = jwt.sign({ email: driver.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const UpdateLocation = async (req, res) => {
  const { location } = req.body
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(400).json({ status: "error", message: "missing email in token" });
    }

    const driver = await DriverModel.findOne({ email })

    if (!driver) {
      return res.status(400).json({ message: "user not found" })
    }
    if (
      location &&
      location.type === "Point" &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2
    ) {
      driver.location = {
        type: "Point",
        coordinates: location.coordinates,
      };
      driver.markModified("location");
      await driver.save();
      return res.status(200).json({
        status: "Success",
        message: "location updated successfully",
      })
    } else {
      return res.status(400).json({
        status: "error",
        message: "location update failed",
      })
    }
  } catch (error) {
    console.error("error while updating location", error.message, error.stack)
    res.status(500).json({ status: "error", message: error.message })
  }
}



export const DriverRegister = async (req, res) => {
  try {
    const { name, email, number, password } = req.body;

    if (!name || !email || !number || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await DriverModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    await DriverModel.create({ name, email, number, password });
    res.status(201).json({ message: "Driver registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





export const UpdateDriver = async (req, res) => {
  try {
    const { name, number, carnumber, cartype } = req.body;
    const file = req.file;

    const driver = await DriverModel.findOne({ email: req.user.email });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (name) driver.name = name;
    if (number) driver.number = number;
    if (carnumber) driver.carnumber = carnumber;
    if (cartype) driver.cartype = cartype;
    if (file) driver.profileimg = `/uploads/${file.filename}`;

    await driver.save();

    res.status(200).json({
      message: "Driver updated successfully",
      driver,
    });
  } catch (error) {
    console.error("Error updating driver:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};






export const Details = async (req, res) => {
  try {

    if (!req.user || !req.user.email) {
      console.error("Missing driver info in request");
      return res.status(401).json({ message: "Unauthorized - invalid or missing token" });
    }

    const driver = await DriverModel.findOne({ email: req.user.email });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const driverData = {
      ...driver._doc,
      profileimg: driver.profileimg
        ? `${baseUrl}${driver.profileimg.startsWith("/") ? "" : "/"}${driver.profileimg}`
        : null,
    };

    res.status(200).json(driverData);
  } catch (error) {
    console.error("Error fetching driver details:", error.message);
    res.status(500).json({ message: error.message });
  }
};




export const nearby = async (req, res) => {
  try {
    const { lat, lng } = req.query
    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude are required" })
    }

    const longitude = parseFloat(lng)
    const latitude = parseFloat(lat)

    // Find drivers within 5 km radius (5000 meters)
    const drivers = await DriverModel.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: 5000 // meters
        }
      }
    })

    res.json({ count: drivers.length, drivers })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
}





export const acceptride = async (req, res) => {
  const { rideId, driverEmail } = req.body;

  try {
    // Update ride status to 'accepted' and assign driver
    const ride = await RideModel.findByIdAndUpdate(rideId, {
      status: 'accepted',
      driverEmail: driverEmail
    }, { new: true });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    res.status(200).json({ message: "Ride accepted successfully", ride });
  } catch (error) {
    console.error("Error accepting ride:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


export const bookride = async (req, res) => {


  console.log(req.body)
  const driver = await DriverModel.findOne({ _id: req.body.driverId })
  const ride = await RideModel.create({
    pickup: req.body.pickup,
    dropoff: req.body.dropoff,
    driverId: req.body.driverId,
  })
  io.to(driver.socketid).emit('ride:alert', { pickup: req.body.pickup, dropoff: req.body.dropoff, rideId: ride._id });

  res.status(200).json({ message: "Ride requested successfully", rideId: ride._id })
}


