// server/userController/userController.js
import User from "../models/userModel.js";
const users = [
  {
    name: "John",
    id: 1,
    email: "test@example.com",
    password: "Password1!", // Ensure the password meets validation criteria
  },
];

// @desc login user
// @route POST /api/users/login
// @access public

const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  // Find the user by email
  const user = users.find((user) => user.email === email);

  // Validate user credentials
  if (user && user.password === password) {
    res.json({
      success: true,
      userName: user.name,
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
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
      console.log("create new user");
      res.status(200).json({
        success: true,
        userName: user.userName,
        email: user.email,
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { login, registerUser };
