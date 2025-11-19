import express from 'express'
import { ridecomplete, rideDetails, trip } from '../Controller/Ride.js'
import { LoginCheck } from '../Middleware/User.js'


const ride = express.Router()

ride.get("/trip/:id",trip )
ride.get("/ridecomplete/:id", ridecomplete)
ride.get("/ridedetails",rideDetails )

export default ride