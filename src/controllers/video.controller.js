import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiRespones";
import { Video } from "../models/video.model";
import mongoose, { Mongoose } from "mongoose";
import { User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";

const getAllVideos = asyncHandler( async (req , res) => {

    let {page = 1, limit=10,  query, sortBy, shortType, userId} = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    sortBy = sortBy || "createdAt";
    shortType = shortType === "asc" ? 1 : -1;

    const filter = {};

    if(query){
        filter.title = {
            $regex : query,
            $options : "i"

        };
    }

    if(userId) {
        filter.owner = new mongoose.Types.ObjectId(userId);
    }





    const videos = await Video.aggregate([
        {
            $match : filter
        },

        {
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "owner",
                pipeline : [
                    {
                        $project : {
                            username : 1,
                            avatar : 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind : "$owner"
        },
        {
            $sort : {
                [sortBy] : shortType
            }
        },
        {
            $skip : (page - 1) * limit            
        },
        {
            $limit : parseInt(limit)
        },
    ]);

    const totalViews = await Video.countDocuments(filer);

    

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            totalViews,
            page,
            limit,
            "Videos fetched successfully"
        )
    )


});

const publishVideo = asyncHandler (async (req, res) => {

    


})

const getVideoById = asyncHandler (async (req, res) => {

}) 

const updateVideoDetail = asyncHandler (async (req, res) => {

})

const deleteVideo = asyncHandler (async (req, res) => {

})


export {
    getAllVideos
}