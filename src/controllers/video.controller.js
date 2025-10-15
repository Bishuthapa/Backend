import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  sortType = sortType === "asc" ? 1 : -1;

  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }

  if (userId && mongoose.isValidObjectId(userId)) {
    filter.owner = new mongoose.Types.ObjectId(userId); // 
  }

  const videos = await Video.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { username: 1, avatar: 1 } }],
      },

    },
    { $unwind: "$owner" },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        video: 1,
        createdAt: 1,
        owner: 1,
        duration: 1,
      },
    },
    { $sort: { [sortBy]: sortType } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
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


// Publish a new video
const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description)
    throw new ApiError(400, "Title and description are required");

  if (!req.files || !req.files.video || !req.files.thumbnail)
    throw new ApiError(400, "Video and thumbnail files are required");

  let uploadedVideo, uploadedThumbnail;
  try {
    uploadedVideo = await uploadOnCloudinary(req.files.video[0].path, "video");
    uploadedThumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path, "image");
  } catch (err) {
    throw new ApiError(500, "File upload failed");
  }

  const video = await Video.create({
    title,
    description,
    video: uploadedVideo.url,
    videoFilePublicId: uploadedVideo.public_id,
    thumbnail: uploadedThumbnail.url,
    thumbnailPublicId: uploadedThumbnail.public_id,
    owner: req.user._id,
    duration: 0, // replace with real duration extraction if needed
    views: 0,
    isPublished: true,
  });

  return res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
});

// Get video by ID
// const getVideoByUserId = asyncHandler(async (req, res) => {
//   const { videoId,userId } = req.params;
//   if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

//   const video = await Video.findById(videoId).populate("owner", "username avatar");
//   if (!video) throw new ApiError(404, "Video not found");

//   return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
// });
const getVideoByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId))
    throw new ApiError(400, "Invalid user ID");

  const videos = await Video.find({ owner: userId })
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 });

  if (!videos.length)
    throw new ApiError(404, "No videos found for this user");

  return res.status(200).json(
    new ApiResponse(200, { videos }, "Videos fetched successfully")
  );
});
// Update video details
const updateVideoDetail = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoId } = req.params;  // take ID from URL params

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findOne({ _id: videoId, owner: req.user._id });
  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  // Upload new video if provided
  if (req.files?.video) {
    const videoUpload = await uploadOnCloudinary(req.files.video[0].path, "video");
    video.videoFile = videoUpload.url;
    video.videoFilePublicId = videoUpload.public_id;
  }

  
  // Upload new thumbnail if provided
  if (req.files?.thumbnail) {
    const thumbnailUpload = await uploadOnCloudinary(req.files.thumbnail[0].path, "image");
    video.thumbnail = thumbnailUpload.url;
    video.thumbnailPublicId = thumbnailUpload.public_id;
  }

  if (title) video.title = title;
  if (description) video.description = description;

  await video.save();

  return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});


// Delete video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findOneAndDelete({ _id: videoId, owner: req.user._id });
  if (!video) throw new ApiError(404, "Video not found or unauthorized");

  // Delete files from Cloudinary
  if (video.videoFilePublicId) await cloudinary.uploader.destroy(video.videoFilePublicId, { resource_type: "video" });
  if (video.thumbnailPublicId) await cloudinary.uploader.destroy(video.thumbnailPublicId, { resource_type: "image" });

  return res.status(200).json(new ApiResponse(200, video, "Video deleted successfully"));
});

// Toggle publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findOne({ _id: videoId, owner: req.user._id });
  if (!video) throw new ApiError(404, "Video not found or unauthorized");

  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200).json(new ApiResponse(200, video, `Video is now ${video.isPublished ? "Published" : "Unpublished"}`));
});

export { getAllVideos, publishVideo, getVideoByUserId, updateVideoDetail, deleteVideo, togglePublishStatus };
