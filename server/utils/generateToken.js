import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Set default value for NODE_ENV if not set
const nodeEnv = process.env.NODE_ENV || "development";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: nodeEnv === "production", // Use secure cookies in production
    sameSite: nodeEnv === "production" ? "none" : "strict", // Adjust SameSite policy
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
