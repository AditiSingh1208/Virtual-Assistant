import express from "express"
import { SignIn, Logout, signUp} from "../controllers/auth.controllers.js"

const authRouter = express.Router()

authRouter.post("/signup" , signUp)
authRouter.post("/signin" , SignIn)
authRouter.get("/Logout" , Logout)

export default authRouter