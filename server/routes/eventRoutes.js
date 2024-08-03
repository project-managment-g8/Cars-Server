import express from "express";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} from "../Controller/eventController.js";
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

router
  .route("/")
  .get(getEvents)
  .post(protect, upload.single("image"), createEvent);
router
  .route("/:id")
  .put(protect, upload.single("image"), updateEvent)
  .delete(protect, deleteEvent);

export default router;
