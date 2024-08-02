//server/routes/feedbackRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createFeedback } from "../Controller/feedbackController.js";

const router = express.Router();

router.route("/").post(protect, createFeedback);

export default router;
