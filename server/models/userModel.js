// server/models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
    },
    email: { type: String, required: true },
    password: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    img: { type: String, required: false },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    category: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchpassword = async function (entered_password) {
  return await bcrypt.compare(entered_password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
