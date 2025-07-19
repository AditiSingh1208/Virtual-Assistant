import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
import connectDB from './config/db.js';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.routes.js';
import geminieResponse from './gemini.js';


const allowedOrigins = [
  "http://localhost:5173",
  "https://virtual-assistant-auq1.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

const port = process.env.PORT;

app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/api/auth" , authRouter)
app.use("/api/user" , userRouter)



app.listen(port, () => {
    connectDB();
    console.log("server started")
})
