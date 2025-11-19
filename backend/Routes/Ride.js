import express from 'express'
import { ridecomplete, trip } from '../Controller/Ride.js'


const ride = express.Router()

ride.get("/trip/:id",trip )
ride.get("/ridecomplete/:id", ridecomplete)

export default ride