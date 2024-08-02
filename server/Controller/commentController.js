// server/controllers/commentController.js
import Comment from "../models/commentModel.js";
import ForumPost from "../models/forumPostModel.js";

const createComment = async (req, res) => {
  const { content, forumPostId } = req.body;
  const userId = req.user._id;

  try {
    const comment = await Comment.create({
      user: userId,
      content,
      forumPost: forumPostId,
    });
    await ForumPost.findByIdAndUpdate(forumPostId, {
      $push: { comments: comment._id },
    });
    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "userName"
    );
    console.log("Create Comment - Populated Comment:", populatedComment); // Add this log for debugging
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Error creating comment:", error); // Log the error
    res.status(500).json({ message: "Server error" });
  }
};
// Like/Unlike a comment
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.user._id;
    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId); // Unlike the comment
    } else {
      comment.likes.push(userId); // Like the comment
    }

    const updatedComment = await comment.save();
    const populatedComment = await Comment.findById(
      updatedComment._id
    ).populate("user", "userName");
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
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await Comment.deleteOne({ _id: id });
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
    const comment = await Comment.findById(id);

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
const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({
      forumPost: req.params.forumPostId,
    }).populate("user", "userName");

    console.log("Fetched Comments:", comments); // Add this log for debugging

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error); // Log the error
    res.status(500).json({ message: "Server error" });
  }
};
export {
  createComment,
  getCommentsByPost,
  deleteComment,
  editComment,
  likeComment,
};
