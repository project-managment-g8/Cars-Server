// server/routes/postRoutes.js
import express from "express";
import {
  createPost,
  getPosts,
  likePost,
  deletePost,
} from "../Controller/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: "uploads",
      filename: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({ storage });

router.route("/").get(getPosts);
router.route("/post").post(protect, upload.single("image"), createPost);
router.route("/:id/like").put(protect, likePost);
router.route("/:id").delete(protect, deletePost);

export default router;
