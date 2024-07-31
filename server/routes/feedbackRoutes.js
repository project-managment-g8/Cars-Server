//server/routes/feedbackRoutes.js
import express from "express";
import { submitFeedback } from "../Controller/feedbackController.js";

const router = express.Router();

router.post("/", submitFeedback); // Submit feedback

export default router;
