import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiRespones";
import { Comment } from "../models/comment.model";
import mongoose from "mongoose";
import { Video } from "../models/video.model";
import { User } from "../models/user.model";


const getVideoComment = asyncHandler(async (req, res) => {
  //get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  //here the aggreation pipeline started

  const comments = await Comment.aggregate([ //here it returns a object array so comments is a array
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
        $unwind : "$owner",
    },
    {
        $sort: {createdAt : -1},
    },
    {
        $project : {
            content : 1, // it is a content of a comment
            owner: 1, // here it have username and avatar
            createdAt : 1, //it show the latest comment 
        },
    },
    { $skip: (page - 1) * limit },   // pagination: skip previous pages
    { $limit: parseInt(limit) }, //set the limit for the per page
  ]);


  if(!comments?.length){
    throw new ApiError(404, "No comments found for this video");
  }
  
  res
  .status(200)
  .json(
      new ApiResponse(
          200,
          comments,
          "Fetch video comments successfully"

      )
  )


});

const addComment = asyncHandler(async (req, res) => {

  //get the video id

  const {videoId} = req.params;

  if(!videoId){
    throw new ApiError(401, "Video ID is required");
  }

  const video = await Video.findById(videoId);

  if(!video){
    throw new ApiError(401, "Requested video does not exists");
  }
  
  const {content}  = req.body;

  if(!content || content?.trim() === ""){
    throw new ApiError(401, "Content is required");
  }

 const comment = await Comment.create({
  content,
  video: videoId,
  owner : req.user?._id,
 })

const populateComment = await comment.populate("owner", "email");
  res
  .status(201)
  .json(
    new ApiResponse(
      200, populateComment,  "sucessfully commented on the video"
    )
  )


  
});
const updateComment = asyncHandler(async (req, res) => {});
const deleteComment = asyncHandler(async (req, res) => {});

export { getVideoComment, addComment, updateComment, deleteComment };
