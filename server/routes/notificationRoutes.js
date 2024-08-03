// server/routes/notificationRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markNotificationsAsRead,
} from "../Controller/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/mark-read", protect, markNotificationsAsRead);

export default router;
