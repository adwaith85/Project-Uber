import jwt from "jsonwebtoken";
import DriverModel from "../Model/Driver.js";

// ✅ DRIVER LOGIN
export const DriverLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
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



// ✅ DRIVER REGISTER
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



// ✅ UPDATE DRIVER DETAILS
export const UpdateDriver = async (req, res) => {
  try {
    const { name, number, carnumber } = req.body;
    const file = req.file;

    const driver = await DriverModel.findOne({ email: req.driver.email });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Update only the provided fields
    if (name) driver.name = name;
    if (number) driver.number = number;
    if (carnumber) driver.carnumber = carnumber;
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



// ✅ GET DRIVER DETAILS
export const Details = async (req, res) => {
  try {
    // 1️⃣ Ensure driver info exists from JWT middleware
    if (!req.driver || !req.driver.email) {
      console.error("Missing driver info in request");
      return res.status(401).json({ message: "Unauthorized - invalid or missing token" });
    }

    // 2️⃣ Fetch driver from DB
    const driver = await DriverModel.findOne({ email: req.driver.email });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // 3️⃣ Construct absolute image URL
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

