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
  followUser,
  unfollowUser,
} from "../Controller/userController.js";

router.post("/login", login);
router.post("/register", registerUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUser);
router.get("/:id", protect, getUserProfile);
router.route("/change-password").put(protect, changePassword);
router.route("/follow/:id").put(protect, followUser);
router.route("/unfollow/:id").put(protect, unfollowUser);

export default router;
