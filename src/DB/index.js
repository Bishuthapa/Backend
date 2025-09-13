import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";




 


const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         .then(() => console.log("Connected!"))
  .catch(err => console.error("DB connection error:", err));
        console.log(`\n MongoDB connected: ${connectionInstance.connection.host}`);

    }
    catch (error) {
        console.error("MongoBD connection FAILED :", error);
        process.exit(1);
    }
} 

export default connectDB