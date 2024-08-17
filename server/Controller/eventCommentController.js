// server/controllers/eventCommentController.js
import eventComment from "../models/eventCommentModel.js";
import Event from "../models/eventModel.js";
import Notification from "../models/notificationModel.js";
const createComment = async (req, res) => {
  const { content, eventId } = req.body;
  const userId = req.user._id;

  try {
    const comment = await eventComment.create({
      user: userId,
      content,
      event: eventId,
    });
    await Event.findByIdAndUpdate(eventId, {
      $push: { comments: comment._id },
    });

    // Create a notification
    const event = await Event.findById(eventId);
    if (event.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: event.user,
        sender: req.user._id,
        type: "comment",
        event: event._id,
        comment: comment._id,
      });
    }
    const populatedComment = await eventComment
      .findById(comment._id)
      .populate("user", "userName");
    console.log(event._id);
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Like/Unlike a comment
const likeComment = async (req, res) => {
  try {
    const comment = await eventComment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const event = await Event.findById(comment.event);
    if (!event) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    const userId = req.user._id;
    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId); // Unlike the comment
    } else {
      comment.likes.push(userId); // Like the comment
      // Create a notification
      if (event.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: event.user,
          sender: req.user._id,
          type: "like",
          post: event._id,
        });
      }
    }

    const updatedComment = await comment.save();
    const populatedComment = await eventComment
      .findById(updatedComment._id)
      .populate("user", "userName");
    res.json(populatedComment);
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Delete a comment
const deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await eventComment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await eventComment.deleteOne({ _id: id });

    // Optionally, remove the comment ID from the event's comments array
    await Event.findByIdAndUpdate(comment.event, {
      $pull: { comments: id },
    });

    res.json({ message: "Comment removed" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit a comment
const editComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const comment = await eventComment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    comment.content = content || comment.content;

    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getCommentsByEvent = async (req, res) => {
  try {
    const comments = await eventComment
      .find({
        event: req.params.eventId,
      })
      .populate("user", "userName") // Ensure the user data is populated
      .populate("event", "title"); // Optional: Populate event data if needed

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export {
  createComment,
  getCommentsByEvent,
  deleteComment,
  editComment,
  likeComment,
};
