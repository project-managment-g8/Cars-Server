// server/models/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const defaultImagePath = "../uploads/defaultprofile.png";
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
    password: { type: String, required: true },
    is_admin: { type: Boolean, required: true, default: false },
    img: { type: String, required: false, default: defaultImagePath },
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;
