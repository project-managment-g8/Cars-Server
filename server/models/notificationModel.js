// server/models/notificationModel.js
import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: false },
  forumPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumPost",
    required: false,
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    required: false,
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
