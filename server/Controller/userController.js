// server/Controller/userController.js
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    // Check if user exists and validate password
    if (user && (await user.matchpassword(password))) {
      console.log("JWT Secret Key:", process.env.JWT_SECRET);
      generateToken(res, user._id);
      res.json({
        success: true,
        userName: user.userName,
        email: user.email,
        _id: user._id,
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" + error });
  }
};
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
      password,
    });
    console.log("user details" + email + userName + password);

    if (user) {
      generateToken(res, user._id);
      console.log("create new user");
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
const getUserProfile = async (req, res) => {
  try {
    console.log("User from token:", req.user); // Log user from token
    const user = await User.findById(req.user._id);
    if (user) {
      console.log("User profile:", user); // Log user profile
      res.json({
        _id: user._id,
        userName: user.userName,
        email: user.email,
        img: user.img,
        following: user.following,
      });
    } else {
      console.log("User not found"); // Log if user not found
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Server error:", error); // Log server error
    res.status(500).json({ message: "Server error" });
  }
};
const updateUserProfile = async (req, res) => {
  const { userName, email, img } = req.body;

  console.log("User from token:", req.user); // Check if req.user is set

  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(req.user._id); // Correctly find user by ID

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
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { login, registerUser, getUserProfile, updateUserProfile };
