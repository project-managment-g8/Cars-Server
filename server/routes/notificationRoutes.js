// server/routes/notificationRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markNotificationAsRead,
} from "../Controller/notificationController.js";

const router = express.Router();

router.route("/").get(protect, getNotifications);
router.route("/:id/read").put(protect, markNotificationAsRead);

export default router;
