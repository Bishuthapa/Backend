import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createTweet,
    getUserTweets, 
    updateTweet, 
    deleteTweet} from "../controllers/tweet.controller.js"

const router = Router();
router.use(verifyJWT);
router
    .route("/:userId/tweets")
    .post(createTweet)
    .get(getUserTweets);

router
    .route("/:userId/tweets/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet);

export default router;
