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
  const { category } = req.query;

  try {
    const query = category ? { title: category } : {};
    const forumPosts = await ForumPost.find(query)
      .populate("user", "userName")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "userName",
        },
      })
      .sort({ is_sticky: -1, createdAt: -1 }); // Sort sticky posts first
    res.json(forumPosts);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const likeForumPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the post has already been liked by the user
    if (post.likes.includes(req.user._id)) {
      post.likes.pull(req.user._id); // Unlike the post
    } else {
      post.likes.push(req.user._id); // Like the post
      // Create a notification
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: "like",
          post: post._id,
        });
      }
    }

    const updatedPost = await post.save();
    const populatedPost = await ForumPost.findById(updatedPost._id)
      .populate("user", "userName")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "userName",
        },
      });

    res.json(populatedPost); // Return the updated post with populated user and comments
  } catch (error) {
    console.error("Error liking forum post:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const editForumPost = async (req, res) => {
  const { title, content, is_sticky } = req.body;

  try {
    const post = await ForumPost.findById(req.params.id);

    if (
      post.user.toString() !== req.user._id.toString() &&
      !req.user.is_admin
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to edit this post" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    if (typeof is_sticky !== "undefined") post.is_sticky = is_sticky;

    const updatedPost = await post.save();
    const populatedPost = await ForumPost.findById(updatedPost._id)
      .populate("user", "userName")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "userName",
        },
      });

    res.json(populatedPost);
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

export {
  createForumPost,
  getForumPosts,
  editForumPost,
  deleteForumPost,
  likeForumPost,
};
