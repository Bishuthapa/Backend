import mongoose, {isValidObjectId} from "mongoose"
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler( async (req , res) => {
    const  {videoId} = req.params;
    if(!videoId){
        throw new ApiError(401, "Video ID is required");
    }

    const existingLike = await Like.findOne({
        video : videoId,
        likedBy : req.user._id
    })

    let isLiked;
    let message;
    if(existingLike){

       await Like.findByIdAndDelete(existingLike._id);       
       isLiked = false;
       message = "Video unliked successfully";

    }else{
         await Like.create({
            video : videoId,
            likedBy : req.user._id
        })
        isLiked = true;
        message = "Video liked successfully";
    }

     const totalLikes = await Like.countDocuments({ video: videoId });

     return res
        .status(200)
        .json(new ApiResponse(200, {isLiked, totalLikes}, message));
    });

const toggleCommentLike = asyncHandler( async (req , res) => {});

const toggleTweetLike = asyncHandler( async (req , res) => {});

const getLikedVideos = asyncHandler( async (req , res) => {});

export {toggleVideoLike}
