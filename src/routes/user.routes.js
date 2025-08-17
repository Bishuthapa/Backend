import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middelware.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";

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


export default router;