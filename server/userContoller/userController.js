// server/userController/userController.js
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc login user
// @route POST /api/users/login
// @access public

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists and validate password
    if (user && (await user.matchpassword(password))) {
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

export { login, registerUser };
