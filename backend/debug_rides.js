import mongoose from "mongoose";
import RideModel from "./Model/Ride.js";
import UserModel from "./Model/User.js";
import dotenv from "dotenv";

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");

        const rides = await RideModel.find().sort({ date: -1 }).limit(5);
        console.log("Last 5 rides:");
        rides.forEach(r => {
            console.log(`ID: ${r._id}, Status: ${r.status}, UserId: ${r.userId}, DriverId: ${r.driverId}, Date: ${r.date}`);
        });

        const users = await UserModel.find().limit(3);
        console.log("\nSample Users:");
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

debug();
