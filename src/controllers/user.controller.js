import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiRespones.js";

const registerUser = asyncHandler(async(req, res) =>{

    //get user detial from frontend
    //check for validation  -non empty
    //chech if user already exist: Username, email
    //chech for image, avatar
    //upload them to the cloudinary
    //create user objcet, create entry in db
    //remove password and refresh token field from the response
    //check for user creation
    //return respones :return error if occure
    

    const {fullName, email, username, password } = req.body;

  
    if([fullName, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
        
    } 

    const existedUser = await User.findOne(
        {
          $or: [{ username }, { email }]
        }
    );

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.");
    }


    const avatarLocalPath = req.files && Array.isArray(req.files.avatar) && req.files.avatar[0]?.path ? req.files.avatar[0].path : null;
    const coverImageLocalPath = req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0]?.path ? req.files.coverImage[0].path : null;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required.");
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if(!avatar){
        throw new ApiError(400, "Avatar file is required.");
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully.")
    )

})
    

export  {registerUser}