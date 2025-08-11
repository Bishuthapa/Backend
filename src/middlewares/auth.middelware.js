import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken"

//to verify the user create a middelware that can check the user details

export const verifyJWT = asyncHandler(async(req, res, next) =>{
    const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer" , "");// get the access token from the cookies or from the authorisation header
    if(!token){
        throw new ApiError(401, "Unauthorized request");
    }
    //if the token successfully got then compare the access and refresh token

    const decodedToken= jwt.verifyJWT(token, process.env.ACCESS_TOKEN_SCRECT)
    
} )