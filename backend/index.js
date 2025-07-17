import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
import connectDB from './config/db.js';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.routes.js';
import geminieResponse from './gemini.js';


const app = express()
app.use(cors({
    origin:"https://virtual-assistant-auq1.onrender.com",
    credentials:true,
}))
const port = process.env.PORT || 5173;

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth" , authRouter)
app.use("/api/user" , userRouter)



app.listen(port, () => {
    connectDB();
    console.log("server started")
})
