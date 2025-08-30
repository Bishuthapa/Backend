import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiRespones";
import { Video } from "../models/video.model";
import mongoose, { Mongoose } from "mongoose";
import { User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query, sortBy, shortType, userId } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  sortBy = sortBy || "createdAt";
  shortType = shortType === "asc" ? 1 : -1;

  const filter = {};

  if (query) {
    filter.title = {
      $regex: query,
      $options: "i",
    };
  }

  if (userId) {
    filter.owner = new mongoose.Types.ObjectId(userId);
  }

  const videos = await Video.aggregate([
    {
      $match: filter,
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
        [sortBy]: shortType,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
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
    );
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!req.file) {
    throw new ApiError(400, "No video file is uploaded");
  }

  const videoLocalPath = req.file?.video[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  const uploadVideo = await uploadOnCloudinary(videoLocalPath);
  if (!uploadVideo) {
    throw new ApiError(400, "Video file is required");
  }

  const thumbnailLocalPath = req.file?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!uploadThumbnail) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: uploadVideo?.url,
    thumbnail: uploadThumbnail?.url,
    owner: req.user?._id,
    duration: req.file?.video[0]?.duration || 0,
    views: 0,
    isPublished: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, shortType = "desc", shortBy ="createdAt", userId } = req.body;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  shortBy = shortBy || "createdAt";
  shortType = shortType === "asc" ? 1 : -1;

  const filter = {};
  if (userId && mongoose.isValidObjectId(userId)) {
        filter.owner = new mongoose.Types.ObjectId(userId);
    }


  const videos = await Video.aggregate([
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "user",
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
      $sort: {
        [shortBy]: shortType,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);
  const totalCount = await Video.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
      },
      "Videos fetched successfully"
    )
  );
});

const updateVideoDetail = asyncHandler(async (req, res) => {});

const deleteVideo = asyncHandler(async (req, res) => {});

export { getAllVideos, publishVideo, getVideoById};
