// server/routes/forumRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createForumPost,
  getForumPosts,
  deleteForumPost,
  editForumPost,
  likeForumPost,
} from "../Controller/forumController.js";

const router = express.Router();

router.route("/").post(protect, createForumPost).get(getForumPosts);
router
  .route("/:id")
  .put(protect, editForumPost)
  .delete(protect, deleteForumPost);
router.route("/:id/like").put(protect, likeForumPost); // Add this route

export default router;
