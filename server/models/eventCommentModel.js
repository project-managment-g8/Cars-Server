// server/models/eventCommentModel.js
import mongoose from "mongoose";

const eventCommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Add likes field
  },
  { timestamps: true }
);

const eventComment = mongoose.model("eventComment", eventCommentSchema);
export default eventComment;
