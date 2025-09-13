// 
// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  // 1. Get token from cookies or Authorization header
  const token = req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 3. Find the user in DB
    const user = await User.findById(decoded._id)
      .select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid access token - user not found");
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid access token");
  }
});

