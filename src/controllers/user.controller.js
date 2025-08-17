import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { request } from "express";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {

  //Steps:::::::
  //get user detial from frontend
  //check for validation  -non empty
  //chech if user already exist: Username, email
  //chech for image, avatar
  //upload them to the cloudinary
  //create user objcet, create entry in db
  //remove password and refresh token field from the response
  //check for user creation
  //return respones :return error if occure

  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists.");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;

  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){

    coverImageLocalPath = req.files.coverImage[0].path
    
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  console.log("avatarlocalpath:", avatarLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  console.log(avatar, coverImage);
  console.log(process.env.CLOUDINARY_CLOUD_NAME);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is primary required.");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  //Steps:::::::::::::::::::
  //get the data from the user
  //check the user based on the username or email
  //find email or username
  //if the email or username doesn't exists on the database then redirect the user to the register page and give the error that user doesn't exists
  //if exists then login and check the password that the user enter and compare to the database same username and password
  //if the username and password is correct the redirect the user to the homepage and create the access and refresh token and send to the user through 
  // the secure cookie? then give the error 

  const generateAccessAndRefreshToken = async(userId) => {
    try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({validateBeforeSave: false});

      return {accessToken, refreshToken}
      
    } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access token");     
    }

  }

  const {email, username, password} = req.body;


  if(!(username || email)){

    throw new ApiError(400, "Username or email is required");
  }


  const user = await User.findOne({
    $or: [{username},{email}]
  })


  if(!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(401, "Invalid Password");
  }


  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).
  select("-password -refreshToken");

  const options = {
    httpOnly : true, //no js can access the cookie
    secure: true //only sent over HTTPS
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json (
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },

      "User logged In successfully"
    )
)




});

const logoutUser = asyncHandler(async (req, res) => {
   //Steps::::::::::::::::
   //first get the user
   //1. Get the refresh token from the cookie
   //2. Find the user based on the refresh token
   //3. Delete the refresh token from the database
   
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken : undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly : true, //no js can access the cookie
    secure: true //only sent over HTTPS
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out sucessfully"));

})


const refreshAccessToken = asyncHandler(async (req, res) => { //create a new access token
  
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken; //get the refresh token from the user via cookie or body

  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized User");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET); //decode the encrypted refresh token to get the user id
    
    const user = await User.findById(decodedToken?._id); // find the user by user id got from the decoded refresh token if it exists
  
    if(!user){
      throw new ApiError(401, "Invalid refresh token");
    }
  
    if(incomingRefreshToken !== refreshToken){ //check if the refresh token is the same as the one in the database
      throw new ApiError(401, "Refresh token is expired");
    }
  
    const options = { //set the options for the cookie
      httpOnly :true,
      secure : true
    }
  
   const {refreshToken, accessToken} =  await generateAccessAndRefreshToken(user._id); //generate new access and refresh token
   
   return res //send the response
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
        200,
        {
          accessToken, refreshToken : newRefreshToken
        },
        "Access token refreshed"
      )
   )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token"); 
    
  }



})

export { registerUser, loginUser, logoutUser, refreshAccessToken  };
