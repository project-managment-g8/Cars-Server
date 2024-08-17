// server/routes/forumRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createForumPost,
  getForumPosts,
  deleteForumPost,
  editForumPost,
  likeForumPost,
  getUserForumPosts,
  getLikedForumPosts,
  rateForumPost,
} from "../Controller/forumController.js";

const router = express.Router();

router.route("/").post(protect, createForumPost).get(getForumPosts);
router
  .route("/:id")
  .put(protect, editForumPost)
  .delete(protect, deleteForumPost);
router.route("/:id/like").put(protect, likeForumPost); // Add this route
router.route("/:id/rate").put(protect, rateForumPost); // Add this route
router.get("/user/:userId", getUserForumPosts);
router.get("/liked/:userId", getLikedForumPosts);
export default router;
