import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  publishVideo,
  getVideoByUserId,
  updateVideoDetail,
  deleteVideo,
  togglePublishStatus
} from "../controllers/video.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
.get(getAllVideos)
.post(
  upload.fields([
    {name: "video", maxCount: 1},
    {name:"thumbnail", maxCount: 1}
  ]),
  publishVideo
);

router.get("/user/:userId", getVideoByUserId);

router
  .route("/:videoId")
  .patch(
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  updateVideoDetail
)
  .delete(deleteVideo);

  router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router;