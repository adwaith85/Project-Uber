import express from 'express'
import { upload } from "../multer.js"
import { 
  acceptride, 
  bookride, 
  Details, 
  DriverLogin, 
  Driverlogout, 
  DriverRegister, 
  getDriverEarnings, 
  nearby, 
  Rideprice, 
  updatedistancerate, 
  UpdateDriver, 
  UpdateLocation } from '../Controller/Driver.js'
import { LoginCheck } from '../Middleware/User.js'

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
driver.post("/updatedistancerate",LoginCheck,updatedistancerate)
driver.post("/getdriverearnings",LoginCheck, getDriverEarnings)
driver.get("/driver-earnings/:driverId", getDriverEarnings)
driver.get("/rideprice/:rideId", LoginCheck,Rideprice)



export default driver