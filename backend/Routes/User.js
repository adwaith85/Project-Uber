import express from "express"
import { GetDetails, Login, Register, UpdateLocation, UpdateUser } from "../Controller/User.js"
import { LoginCheck } from "../Middleware/User.js"
import { upload } from "../multer.js"

const router = express.Router()

router.post("/login", Login)
router.put("/updatelocation", UpdateLocation)
router.post("/register", Register)
router.post("/updateuser", LoginCheck, upload.single("profileimg"), UpdateUser)
router.get("/GetDetails", LoginCheck, GetDetails)

export default router