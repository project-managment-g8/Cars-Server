// server/controllers/notificationController.js
import Notification from "../models/notificationModel.js";

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "userName")
      .populate("post", "content")
      .populate("forumPost", "title")
      .populate("comment", "content")
      .sort({ createdAt: -1 });
    console.log(notifications);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getNotifications, markNotificationsAsRead };
