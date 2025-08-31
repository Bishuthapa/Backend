import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content?.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "Requested user does not exists");
  }

  const tweet = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        _id: 1,
        content: 1,
        createdAt: 1,
        owner: 1,
        username: "$owner.username",
        avatar: "$owner.avatar",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;

  if (!content || content?.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet ID is required");
  }

  const updatedTweet = await Tweet.findOneAndUpdate(
    { 
        _id: tweetId, 
        owner: req.user._id 
    },
    { content },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "Tweet not found or you are not authorized");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;

    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400, "Tweet ID is required");
    }

   

    const tweetDeleted = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user?._id
    })

    if(!tweetDeleted){
        throw new ApiError(404, "Tweet not found or you are not authorized");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, tweetDeleted, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
