// server/models/forumPostModel.js
import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Add this line
  },

  { timestamps: true }
);

const ForumPost = mongoose.model("ForumPost", forumPostSchema);
export default ForumPost;
