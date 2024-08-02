// server/routes/commentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  deleteComment,
  editComment,
  createComment,
  getCommentsByPost,
} from "../Controller/commentController.js";

const router = express.Router();

router.post("/:forumPostId/comments", protect, createComment);
router.get("/:forumPostId/comments", getCommentsByPost);
router.delete("/comments/:id", protect, deleteComment);
router.put("/comments/:id", protect, editComment);

export default router;
