// server/controllers/postController.js
import Post from "../models/postModel.js";

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
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Like a post
const likePost = async (req, res) => {
  try {
    console.log("Liking post with ID:", req.params.id);
    console.log("User ID:", req.user._id);

    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log("Post not found");
      return res.status(404).json({ message: "Post not found" });
    }

    console.log("Post found:", post);

    // Check if the post has already been liked by the user
    if (post.likes.includes(req.user._id)) {
      console.log("Post already liked by user, unliking...");
      post.likes.pull(req.user._id); // Unlike the post
    } else {
      console.log("Post not liked by user, liking...");
      post.likes.push(req.user._id); // Like the post
    }

    const updatedPost = await post.save();
    console.log("Post updated:", updatedPost);

    const populatedPost = await Post.findById(updatedPost._id).populate(
      "user",
      "userName"
    );
    console.log("Updated post with populated user:", populatedPost);

    res.json(populatedPost); // Return the updated post with populated user information
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

export { getPosts, createPost, likePost, deletePost };
