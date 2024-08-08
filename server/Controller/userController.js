import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import ForumPost from "../models/forumPostModel.js";
import Comment from "../models/commentModel.js";
import { gfs } from "../server.js";
// Register user
const registerUser = async (req, res, next) => {
  const { userName, email, password } = req.body;
  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    // Create a new user
    const user = await User.create({
      userName,
      email,
      password: password,
    });

    if (user) {
      generateToken(res, user._id);
      console.log(res);
      res.status(200).json({
        success: true,
        userName: user.userName,
        email: user.email,
        _id: user._id,
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    // Check if user exists and validate password
    if (user && password === user.password) {
      generateToken(res, user._id);
      console.log("user is admin : ", user.is_admin);
      res.json({
        success: true,
        userName: user.userName,
        is_admin: user.is_admin,
        email: user.email,
        _id: user._id,
        following: user.following,
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Change password
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = oldPassword === user.password;
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid old password" });
    }

    // Debugging log for the hashed password
    user.password = newPassword;
    await user.save();

    // Confirm password is saved correctly
    const updatedUser = await User.findById(req.user._id);
    console.log("Updated user password:", updatedUser.password);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user and log out
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      await ForumPost.deleteMany({ user: req.user._id });

      await Post.deleteMany({ user: req.user._id });

      await Comment.deleteMany({ user: req.user._id });

      const gfs = req.app.locals.bucket;
      const uploads = await gfs
        .find({ "metadata.user": req.user._id })
        .toArray();

      for (let file of uploads) {
        await gfs.delete(file._id);
      }
      // Delete the user
      await User.deleteOne({ _id: req.user._id });

      // Clear the token from cookies
      res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
      });

      res.json({ success: true, message: "User removed and logged out" });
    } else {
      console.error("User not found for deletion.");
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error during user deletion:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow || !loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (loggedInUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    loggedInUser.following.push(userToFollow._id);
    await loggedInUser.save();

    // Create a notification
    if (userToFollow._id.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: userToFollow._id,
        sender: req.user._id,
        type: "follow",
      });
    }

    const updatedUser = await loggedInUser.populate("following", "userName");

    res.status(200).json({ following: updatedUser.following });
  } catch (error) {
    console.error("Error in followUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    console.log("User to unfollow:", userToUnfollow);
    console.log("Logged in user:", loggedInUser);

    if (!userToUnfollow || !loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = loggedInUser.following.indexOf(userToUnfollow._id);
    console.log("Index of user to unfollow:", index);

    if (index === -1) {
      return res.status(400).json({ message: "Not following this user" });
    }

    loggedInUser.following.splice(index, 1);
    await loggedInUser.save();

    const updatedUser = await loggedInUser.populate("following", "userName");

    res.status(200).json({ following: updatedUser.following });
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || (req.user && req.user._id);
    const user = await User.findById(userId).populate("following", "userName");
    if (user) {
      res.json({
        _id: user._id,
        userName: user.userName,
        email: user.email,
        img: user.img,
        role: user.role,
        following: user.following.map((followedUser) => ({
          _id: followedUser._id,
          userName: followedUser.userName,
        })),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const { userName, email, img } = req.body;

  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.userName = userName || user.userName;
      user.email = email || user.email;
      user.img = img || user.img;

      const updatedUser = await user.save();

      res.json({
        userName: updatedUser.userName,
        email: updatedUser.email,
        _id: updatedUser._id,
        img: updatedUser.img,
        following: updatedUser.following,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export {
  login,
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  changePassword,
  followUser,
  unfollowUser,
};
