import mongoose, { isValidObjectId } from "mongoose";
import  asyncHandler  from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(401, "Video ID is required");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  let isLiked;
  let message;
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    isLiked = false;
    message = "Video unliked successfully";
  } else {
    await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    isLiked = true;
    message = "Video liked successfully";
  }

  const totalLikes = await Like.countDocuments({ video: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked, totalLikes }, message));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Requested comment does not exists");
  }

  let isLiked;
  let message;

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    isLiked = false;
    message = "Comment unliked successfully";
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    isLiked = true;
    message = "Comment liked successfully";
  }

  const totalLikes = await Like.countDocuments({
    comment: commentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked, totalLikes }, message));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet ID is required");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Requested tweet does not exists");
  }

  let isLiked;
  let message;

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    isLiked = false;
    message = "Tweet unliked successfully";
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    isLiked = true;
    message = "Tweet liked successfully";
  }

  const totalLikes = await Like.countDocuments({
    tweet: tweetId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked, totalLikes }, message));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: { likedBy: req.user?._id },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $project: {
        _id: 0,
        likedAt: "$createdAt",
        videoId: "$videoDetails._id",
        title: "$videoDetails.title",
        description: "$videoDetails.description",
        thumbnail: "$videoDetails.thumbnail",
      },
    },
  ]);

  return res
  .status(200)
  .json(
    new ApiResponse(
        200, likedVideos, "Fetched all liked videos successfully"
    )
  )
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike,getLikedVideos };
