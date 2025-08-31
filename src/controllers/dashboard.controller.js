import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // Extract channelId from params
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Valid Channel ID is required");
  }

  // Check if channel exists
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  // 1️⃣ Total videos uploaded
  const totalVideos = await Video.countDocuments({ owner: channelId });

  // 2️⃣ Total views across all videos
  const totalViewsAgg = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalViews = totalViewsAgg[0]?.totalViews || 0;

  // 3️⃣ Total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  // 4️⃣ Total likes across all videos
  const totalLikesAgg = await Like.aggregate([
    { $match: { video: { $in: await Video.find({ owner: channelId }).distinct("_id") } } },
    { $group: { _id: null, totalLikes: { $sum: 1 } } },
  ]);
  const totalLikes = totalLikesAgg[0]?.totalLikes || 0;

  // Final stats object
  const stats = {
    channelId,
    totalVideos,
    totalViews,
    totalSubscribers,
    totalLikes,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});


const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { page = 1, limit = 10 } = req.query; // default: page 1, 10 videos per page
  const skip = (page - 1) * limit;

  const { channelId } = req.params;
  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Valid Channel ID is required");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
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
      $unwind: "$owner",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    { $skip: skip },
    { $limit: parseInt(limit) },
    {
      $project: {
        title: 1,
        views: 1,
        createdAt: 1,
        "owner.username": 1,
        "owner.avatar": 1,
      },
    },
  ]);
  const totalVideos = await Video.countDocuments({ owner: channelId });

  const results = {
    totalVideos,
    totalPages: Math.ceil(totalVideos / limit),
    currentPage: parseInt(page),
    videos,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, results, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
