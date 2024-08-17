import cron from "node-cron";
import Event from "../models/eventModel.js";
import Notification from "../models/notificationModel.js";
import mongoose from "mongoose";
import winston from "winston"; // Optional: If you want to use a logging library

// Configure logger (optional)
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "event-reminder.log" }),
  ],
});

const sendEventReminders = async () => {
  try {
    logger.info("Starting event reminder job"); // Log job start

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999));

    const events = await Event.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("rsvps", "userName");

    if (events.length > 0) {
      logger.info(`Found ${events.length} event(s) happening tomorrow`);
    } else {
      logger.info("No events found for tomorrow");
    }

    for (const event of events) {
      for (const user of event.rsvps) {
        await Notification.create({
          recipient: user._id,
          sender: event.user,
          type: "eventReminder",
          event: event._id,
          message: `Reminder: The event "${event.title}" is happening tomorrow!`,
        });
        logger.info(
          `Notification sent to user ${user.userName} for event "${event.title}"`
        );
      }
    }
  } catch (error) {
    logger.error("Error sending event reminders:", error);
  }
};

cron.schedule("0 8 * * *", () => {
  logger.info("Running daily event reminder job");
  sendEventReminders();
});

sendEventReminders();
