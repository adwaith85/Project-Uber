import express, { response } from "express"
import jwt from "jsonwebtoken"
import UserModel from "../Model/User.js"


export const Login = async (req, res) => {
  const { email, password } = req.body

  console.log("secret", process.env.JWT_SECRET)
  try {
    const user = await UserModel.findOne({ email: email })
    if (user) {
      const isMatch = await user.comparePassword(password)
      if (isMatch) {
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({
          status: "Login done",
          token: token,
        })
      } else {
        res.status(404).send("wrong password")
      }
    } else {
      res.send("user not found")
    }
  } catch (error) {
    console.log("login error:", error)
    return res.status(500).send("server error")
  }
};

export const Register = async (req, res) => {
  try {
    const { email, password, name, number } = req.body
    await UserModel.create({ email, password, name, number })
    res.send("created")

  } catch (error) {
    console.log(error)
  }
}


export const UpdateUser = async (req, res) => {
  try {
    const { number, name } = req.body;
    const file = req.file; // Multer adds this if file is uploaded

    // Find user by authenticated email
    const user = await UserModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only provided fields
    if (number) user.number = number;
    if (name) user.name = name;
    if (file) {
      // Save relative or public path to the image
      user.profileimg = `/uploads/${file.filename}`;
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const GetDetails = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ If profileimg is stored as a relative path (like "/uploads/filename.jpg"),
    // prepend the server URL to make it fully accessible
    const baseUrl = `${req.protocol}://${req.get("host")}`; // e.g. http://localhost:8080

    const userData = {
      ...user._doc,
      profileimg: user.profileimg
        ? `${baseUrl}${user.profileimg.startsWith("/") ? "" : "/"}${user.profileimg}`
        : null,
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};