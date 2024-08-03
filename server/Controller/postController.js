// server/controllers/postController.js
import Post from "../models/postModel.js";
import { gfs } from "../server.js";
import Notification from "../models/notificationModel.js";
// Fetch all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "userName _id");
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a post
const createPost = async (req, res) => {
  console.log("Request Body:", req.body);
  console.log("File:", req.file);
  console.log("createPost called");

  const { content } = req.body;
  console.log("Content:", content);

  const userId = req.user._id;
  console.log("User ID:", userId);

  const image = req.file ? req.file.filename : req.body.image;
  console.log("Image:", image);

  if (!image) {
    console.error("No image found in the request");
    return res.status(400).json({ message: "Image is required" });
  }

  try {
    const newPost = await Post.create({ user: userId, content, image });
    console.log("New post created:", newPost);
    const populatedPost = await Post.findById(newPost._id).populate(
      "user",
      "userName _id"
    );
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Like a post
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
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
    const populatedPost = await Post.findById(updatedPost._id).populate(
      "user",
      "userName"
    );

    res.json(populatedPost); // Return the updated post with populated user
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await Post.deleteOne({ _id: post._id });
    res.json({ message: "Post removed" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    // Check if a new image is uploaded
    if (req.file) {
      // Delete the old image from GridFS
      if (post.image) {
        const oldImageFile = await gfs.find({ filename: post.image }).toArray();
        if (oldImageFile.length > 0) {
          await gfs.delete(oldImageFile[0]._id);
        }
      }
      post.image = req.file.filename;
    }

    // Update content if provided
    if (req.body.content !== undefined) {
      post.content = req.body.content;
    }

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id).populate(
      "user",
      "userName _id"
    );

    res.json(populatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export { getPosts, createPost, likePost, deletePost, updatePost };
