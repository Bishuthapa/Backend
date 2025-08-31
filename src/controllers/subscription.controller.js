import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Valid Channel ID is required");
  }

  // Check if the channel exists
  const channelExists = await User.findById(channelId);
  if (!channelExists) {
    throw new ApiError(404, "Channel not found");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  let isSubscribed;
  let message;

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);
    isSubscribed = false;
    message = "Channel unsubscribed successfully";
  } else {
    await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });
    isSubscribed = true;
    message = "Channel subscribed successfully";
  }

  // Aggregate channel info with subscriber count
  const channelInfo = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $group: {
        _id: "$user._id",
        username: { $first: "$user.username" },
        avatar: { $first: "$user.avatar" },
        subscribersCount: { $sum: 1 },
      },
    },
  ]);

  const result = {
    isSubscribed,
    channel: channelInfo[0] || {
      _id: channelExists._id,
      username: channelExists.username,
      avatar: channelExists.avatar,
      subscribersCount: 0,
    },
  };

  return res.status(200).json(new ApiResponse(200, result, message));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // controller to return subscriber list of a channel
  const { channelId } = req.params;
  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel does not exist");
  }

  const channelExists = await User.findById(channelId);
  if (!channelExists) {
    throw new ApiError(404, "Channel not found");
  }

  const subscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
      },
    },
    {
      $unwind: "$subscriberInfo", //Converts the subscriberInfo array (from $lookup) into a single object.
    },
    {
      $project: {
        _id: 0,
        subscriberId: "$subscriberInfo._id",
        username: "$subscriberInfo.username",
        avatar: "$subscriberInfo.avatar",
        subscribedAt: "$createdAt",
      },
    },
    {
      $sort: {
        subscribedAt: -1,
      },
    },
  ]);
  const result = {
    subscribers: subscriberList,
    totalSubscribers: subscriberList.length,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Fetched total subscriber list successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId || !isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Subscriber ID does not exist");
  }

  const subscriberExist = await User.findById(subscriberId);

  if (!subscriberExist) {
    throw new ApiError(404, "Subscriber does not found");
  }

  const channelList = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelInfo",
      },
    },
    {
      $unwind: "$channelInfo",
    },
    {
      $project: {
        _id: 0,
        channelId: "$channelInfo._id",
        username: "$channelInfo.username",
        avatar: "$channelInfo.avatar",
        subscribedAt: "$createdAt",
      },
    },
    {
      $sort: {
        subscribedAt: -1,
      },
    },
  ]);

  const result = {
    channels: channelList,
    totalChannels: channelList.length,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Fetched channel list successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
