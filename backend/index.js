import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import UserRoute from "./Routes/User.js"
import driverRoute from "./Routes/Driver.js"

dotenv.config()
const MONGO_URL = process.env.MONGO_URL
const PORT = process.env.PORT
const app = express()
mongoose.connect(MONGO_URL)
app.use(express.json())
app.use(cors())

app.use("/uploads", express.static("uploads"));

app.use(UserRoute)
app.use(driverRoute)


app.listen(PORT, () => console.log(`running on ${PORT}`))