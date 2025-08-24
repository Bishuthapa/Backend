import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiRespones";
import {Comment} from "../models/comment.model";
import mongoose from "mongoose";
import {Video} from "../models/video.model";
const getVideoComment = asyncHandler(async (req , res) => {

    //get all comments for a video
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;

    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }
    //here the aggreation pipeline started

    const comments = await Comment.aggregate([
        {
            $match: {
                video : 

            }
        },{},{}
    ])

    

    // const comments = await Comment.find({video: videoId}).
    // populate("Owner", "avatar").
    // sort({createdAt: -1});

    // res
    // .status(200)
    // .json(
    //     new ApiResponse(
    //         200,
    //         comments,
    //         "Fetch video comments successfully"

    //     )
    // )




});

const addComment = asyncHandler(async (req, res) => {

}) ;
const updateComment = asyncHandler(async (req, res) =>{

}) ;
const deleteComment = asyncHandler(async (req, res) => {

});

export {
    getVideoComment,
    addComment,
    updateComment,
    deleteComment
}