// server/Contoller/feedbackController.js
import feedback from "../models/feedbackModel.js";
const createFeedback = async (req, res) => {
  console.log("Request Body:", req.body);
  console.log("createPost called");

  const { content } = req.body;
  console.log("Content:", content);

  const userId = req.user._id;
  console.log("User ID:", userId);

  try {
    const newFeedback = await feedback.create({ user: userId, content });
    console.log("New feedback created:", newFeedback);
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { createFeedback };
