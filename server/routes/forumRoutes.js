// server/routes/forumRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createForumPost,
  getForumPosts,
  deleteForumPost,
  editForumPost,
} from "../Controller/forumController.js";

const router = express.Router();

router.route("/").post(protect, createForumPost).get(getForumPosts);
router
  .route("/:id")
  .put(protect, editForumPost)
  .delete(protect, deleteForumPost);

export default router;
