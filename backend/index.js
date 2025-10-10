import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import UserRoute from "./Routes/User.js"

dotenv.config()
const MONGO_URL = process.env.MONGO_URL
const PORT = process.env.PORT
const app = express()
mongoose.connect(MONGO_URL)
app.use(express.json())
app.use(cors())

app.use(UserRoute)



app.listen(PORT, () => console.log(`running on ${PORT}`))