import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model";
//to verify the user create a middelware that can check the user details

export const verifyJWT = asyncHandler(async(req, res, next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer" , "");// get the access token from the cookies or from the authorisation header
        if(!token){
            throw new ApiError(401, "Unauthorized request");
        }
        //if the token successfully got then compare the access and refresh token
    
        const decodedToken= jwt.verify(token, process.env.ACCESS_TOKEN_SCRECT)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401, "Invalid access token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
        
    }    
    
} )