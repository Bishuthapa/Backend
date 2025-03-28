import dotenv from "dotenv";
import connectDB from "./DB/index.js";
import app from "./app.js";


dotenv.config({
    path: "./env"
});



connectDB()
.then(
    () => {
        app.get('/', (req, res) =>{
            res.send("your are on the home page");
        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: http://localhost:${process.env.PORT}`);
        })
    }
).catch((error) => {
    console.log("DB connection failed",  error);
})







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

