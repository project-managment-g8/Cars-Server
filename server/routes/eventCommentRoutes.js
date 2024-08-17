// server/routes/eventCommentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  deleteComment,
  editComment,
  createComment,
  getCommentsByEvent,
  likeComment,
} from "../Controller/eventCommentController.js";

const router = express.Router();

router.post("/:eventId/comments", protect, createComment);
router.get("/:eventId/comments", getCommentsByEvent);
router.delete("/:eventId/comments/:id", protect, deleteComment);
router.put("/:eventId/comments/:id", protect, editComment);
router.put("/:eventId/comments/:commentId/like", protect, likeComment);
export default router;
