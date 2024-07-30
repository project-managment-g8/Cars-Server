//server/utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  // create a new token object and passes in the user id as tha payload.
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Set JWT as HTTP-Only cookie / set the token and give him the name jwt
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 60 * 60 * 24 * 1000, // 30 days
  });
};

export default generateToken;
