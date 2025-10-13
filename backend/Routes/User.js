import express from "express"
import { GetDetails, Login, Register, UpdateUser } from "../Controller/User.js"
import { LoginCheck } from "../Middleware/User.js"

const router = express.Router()

router.post("/login", Login)
router.post("/register", Register)
router.post("/updateuser",LoginCheck, UpdateUser)
router.get("/GetDetails",LoginCheck,GetDetails)

export default router