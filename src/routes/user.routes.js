import { Router } from "express";
import { loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getChannelProfile,
  getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: 'avatar', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,logoutUser);

router.route("/refreshToken").post(refreshAccessToken);

router.route("/changePassword").post(verifyJWT, changeCurrentPassword);

router.route("/currentUser").get(verifyJWT, getCurrentUser);

router.route("/updateAccount").patch(updateAccountDetails);

router.route("/Avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router.route("/coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage );

router.route("/c/:username").get(verifyJWT, getChannelProfile );

router.route("/history").get(verifyJWT, getWatchHistory);


export default router; 