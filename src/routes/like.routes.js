import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middelware.js";
import {
    toggleVideoLike, 
    toggleCommentLike, 
    toggleTweetLike,
    getLikedVideos
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);
router.get("/videos", getLikedVideos);
router.route("/videos/:videoId/like").post(toggleVideoLike);
router.route("/comments/:commentId/like").post(toggleCommentLike);
router.route("/tweets/:tweetId/like").post(toggleTweetLike);

export default router;