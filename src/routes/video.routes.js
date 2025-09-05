import { Router } from "express";
import { upload } from "../middlewares/multer.middelware.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";
import {
  getAllVideos,
  publishVideo,
  getVideoById,
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

router
  .route("/:videoId")
  .get(getVideoById)
  .patch(upload.single("thumbnail"),updateVideoDetail)
  .delete(deleteVideo);

  router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router;