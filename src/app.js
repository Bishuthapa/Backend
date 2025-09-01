import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true

}))

app.use(express.json({limit : "20kb"}))
app.use(express.urlencoded({extended: true, limit: "20kb"}))
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";


//routes declaratoin
app.use("/api/v1/users", userRouter)//using middelware
app.use("api/v1/videos", videoRouter)

export default app;

