// server/routes/userRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
import {
  login,
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  changePassword,
} from "../Controller/userController.js";

router.get("/:id", protect, getUserProfile);
router.post("/login", login);
router.post("/register", registerUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUser);

router.route("/change-password").put(protect, changePassword);

export default router;
