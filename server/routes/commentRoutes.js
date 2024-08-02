// server/routes/commentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  deleteComment,
  editComment,
  createComment,
  getCommentsByPost,
  likeComment,
} from "../Controller/commentController.js";

const router = express.Router();

router.post("/:forumPostId/comments", protect, createComment);
router.get("/:forumPostId/comments", getCommentsByPost);
router.delete("/:forumPostId/comments/:id", protect, deleteComment);
router.put("/:forumPostId/comments/:id", protect, editComment);
router.put("/:forumPostId/comments/:commentId/like", protect, likeComment);
export default router;
