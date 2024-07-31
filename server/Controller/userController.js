import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

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

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        userName: user.userName,
        email: user.email,
        img: user.img,
        following: user.following,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
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
};