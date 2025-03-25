import dotenv from "dotenv";
import connectDB from "./DB/index.js";

dotenv.config({
    path: "./env"
});

connectDB();







// ;(async () => {
//     try{
//          await mongooes.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//          app.on("error", (error)=>{
//             console.log("ERR", error);
//             throw error;
//          })

//          app.listen(process.env.PORT, ()=> {
//             console.log(`App is listening on ${process.env.PORT}`)
//          })

//     }
//     catch(error){
//         console.error("Error", error)


//     }

// })()

