// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // Adjust the import based on your file structure

const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const moderator = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "moderator" || req.user.role === "admin")
  ) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as a moderator" });
  }
};

export { protect, moderator };
