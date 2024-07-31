// server/Contoller/feedbackController.js
const submitFeedback = async (req, res) => {
  const { feedback } = req.body;
  // Handle feedback submission logic (e.g., save to database)
  try {
    // Save feedback to database
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export { submitFeedback };
