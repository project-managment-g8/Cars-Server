import Post from "../models/postModel.js";

// Fetch all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "userName img");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a post
const createPost = async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;
  const image = req.file ? req.file.filename : null;

  try {
    const newPost = await Post.create({ user: userId, content, image });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export { getPosts, createPost };
