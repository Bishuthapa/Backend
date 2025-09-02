import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middelware.js";

import {
    getVideoComment, 
    addComment, 
    updateComment, 
    deleteComment } from "../controllers/comment.controller.js";

const router = Router()

router.use(verifyJWT);

router.route("/videos/:videoId/comments")
    .get(getVideoComment)
    .post(addComment);


router.route("/comments/:commentId")
    .patch(updateComment)
    .delete(deleteComment);

export default router;



