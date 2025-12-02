import express from 'express'
import { ridecomplete, rideDetails, trip, getRideHistory } from '../Controller/Ride.js'
import { LoginCheck } from '../Middleware/User.js'


const ride = express.Router()

ride.get("/trip/:id", trip)
ride.get("/ridecomplete/:id", ridecomplete)
ride.get("/ridedetails", LoginCheck, rideDetails)
ride.get("/history", LoginCheck, getRideHistory)

export default ride