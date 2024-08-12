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
  makeModerator,
  unmakeModerator,
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
router.route("/make-moderator/:id").put(protect, makeModerator);
router.route("/unmake-moderator/:id").put(protect, unmakeModerator);

export default router;
