import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Adjust the import based on your file structure

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); // Log decoded token

      // Find the user from the token
      const user = await User.findById(decoded.userId).select("-password");
      console.log("User:", user); // Log user from DB

      if (!user) {
        console.log("User not found");
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Token validation failed:", error.message); // Log the specific error message
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log("No token found");
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
