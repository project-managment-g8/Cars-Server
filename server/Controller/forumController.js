// server/controllers/forumController.js
import ForumPost from "../models/forumPostModel.js";
import Comment from "../models/commentModel.js";

const createForumPost = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user._id;

  try {
    const forumPost = await ForumPost.create({
      user: userId,
      title,
      content,
    });
    res.status(201).json(forumPost);
  } catch (error) {
    console.error("Error creating forum post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getForumPosts = async (req, res) => {
  try {
    const forumPosts = await ForumPost.find()
      .populate("user", "userName")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "userName",
        },
      });
    res.json(forumPosts);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const editForumPost = async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = await ForumPost.findById(req.params.id);

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to edit this post" });
    }

    post.title = title || post.title;
    post.content = content || post.content;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    console.error("Error editing forum post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteForumPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this post" });
    }

    await Comment.deleteMany({ forumPost: post._id });
    await post.deleteOne();
    res.json({ message: "Post removed" });
  } catch (error) {
    console.error("Error deleting forum post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { createForumPost, getForumPosts, editForumPost, deleteForumPost };
