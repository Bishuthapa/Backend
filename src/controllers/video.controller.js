import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { Video } from "../models/video.model.js";
import mongoose, { Mongoose } from "mongoose";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  let {
    page = 1,
    limit = 10,
    shortType = "desc",
    shortBy = "createdAt",
    userId,
  } = req.body;

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

const updateVideoDetail = asyncHandler(async (req, res) => {
  const { videoId, newTitle, newDescription } = req.body;
  if (!videoId) {
    throw new ApiError(401, "Video ID is required");
  }

  if (!req.files) {
    throw new ApiError(400, "No video file is uploaded");
  }

  const newvideoLocalPath = req.files?.video[0]?.path;
  if (!newvideoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  const newuploadVideo = await uploadOnCloudinary(newvideoLocalPath);
  if (!newuploadVideo) {
    throw new ApiError(400, "Video file is required");
  }

  const newthumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!newthumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  const newuploadThumbnail = await uploadOnCloudinary(newthumbnailLocalPath);
  if (!newuploadThumbnail) {
    throw new ApiError(400, "Thumbnail file is required");
  }

  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      title: newTitle,
      description: newDescription,
      videoFile: newuploadVideo?.url,
      thumbnail: newuploadThumbnail?.url,
      owner: req.user?._id,
      isPublished: true,
    },
    {
      new: true,
    }
  );

  if (!updateVideo) {
    throw new ApiError(404, "Requested video does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateVideo, "Video detail updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(401, "Video ID is required");
  }

  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user?._id,
  });

  if (!video) {
    throw new ApiError(404, "Requested video does not exists or you are not the owner of this video");
  }

  if (video.videoFilePublicId) {
    await cloudinary.uploader.destroy(video.videoFilePublicId, {
      resource_type: "video",
    });
  }

  if (video.thumbnailPublicId) {
    await cloudinary.uploader.destroy(video.thumbnailPublicId, {
      resource_type: "image",
    });
  }

  
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});


const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: req.user._id, // ensure only owner can toggle
  });

  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  // Toggle publish status
  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      video,
      `Video publish status updated to ${video.isPublished ? "Published" : "Unpublished"}`
    )
  );
});



export { getAllVideos, publishVideo, getVideoById, updateVideoDetail, deleteVideo ,togglePublishStatus};
