// server/models/notificationModel.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user who will receive the notification
    type: { type: String, required: true }, // e.g., 'like', 'comment', 'follow'
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
    relatedForumPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
