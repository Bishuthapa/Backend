import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiRespones.js";
import  asyncHandler  from "../utils/asyncHandler.js";


const healthcheck = asyncHandler(async (req, res) => {

    
    res
    .status(200)
    .json(new ApiResponse(200, { status: "OK" }, "Server is healthy 🚀"));
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
})

export {
    healthcheck
    }
    