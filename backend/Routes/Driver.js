import express from 'express'
import { upload } from "../multer.js"
import { Details, DriverLogin, DriverRegister, UpdateDriver } from '../Controller/Driver.js'
import { LoginCheck } from '../Middleware/User.js'
const driver=express.Router()

driver.post("/driverlogin",DriverLogin)
driver.post("/driverregister",DriverRegister)
driver.post("/updatedriver",LoginCheck, upload.single("profileimg"), UpdateDriver)
driver.get("/Details",LoginCheck,  Details)


export default driver