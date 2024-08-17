// server/Controller/eventController.js
import Event from "../models/eventModel.js";
import { GridFSBucket } from "mongodb";
import Notification from "../models/notificationModel.js";
import mongoose from "mongoose";

// Initialize GridFSBucket
const conn = mongoose.connection;
let gfsBucket;
conn.once("open", () => {
  gfsBucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
});

const getEvents = async (req, res) => {
  try {
    let events = await Event.find()
      .populate("user", "userName _id")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "userName",
        },
      })
      .populate({
        path: "rsvps",
        select: "userName _id", // Populating RSVPs with user info
      });
    events = events.sort((a, b) => b.rsvps.length - a.rsvps.length);

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.params.userId })
      .populate("user", "userName _id")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "userName",
        },
      })
      .populate({
        path: "rsvps",
        select: "userName _id", // Populating RSVPs with user info
      });
    res.json(events);
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Create an event
const createEvent = async (req, res) => {
  const { title, description, date } = req.body;
  const userId = req.user._id;
  const image = req.file ? req.file.filename : req.body.image;

  if (!image) {
    return res.status(400).json({ message: "Image is required" });
  }

  try {
    const newEvent = await Event.create({
      title,
      description,
      date,
      user: userId,
      image,
    });
    const populatedEvent = await Event.findById(newEvent._id).populate(
      "user",
      "userName _id"
    );
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    if (req.file) {
      if (event.image) {
        const oldImageFile = await gfsBucket
          .find({ filename: event.image })
          .toArray();
        if (oldImageFile.length > 0) {
          await gfsBucket.delete(oldImageFile[0]._id);
        }
      }
      event.image = req.file.filename;
    }

    if (req.body.title !== undefined) {
      event.title = req.body.title;
    }
    if (req.body.description !== undefined) {
      event.description = req.body.description;
    }
    if (req.body.date !== undefined) {
      event.date = req.body.date;
    }

    const updatedEvent = await event.save();
    const populatedEvent = await Event.findById(updatedEvent._id).populate(
      "user",
      "userName _id"
    );

    res.json(populatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "User not authorized" });
    }

    if (event.image) {
      const oldImageFile = await gfsBucket
        .find({ filename: event.image })
        .toArray();
      if (oldImageFile.length > 0) {
        await gfsBucket.delete(oldImageFile[0]._id);
      }
    }

    await Event.deleteOne({ _id: event._id });
    res.json({ message: "Event removed" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const rsvpEvent = async (req, res) => {
  try {
    console.log("Received RSVP request for event ID:", req.params.id);
    console.log("User making the request:", req.user);

    const event = await Event.findById(req.params.id);
    console.log("Event found:", event);

    if (!event) {
      console.error("Event not found");
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.rsvps.includes(req.user._id)) {
      console.warn("User has already RSVPed to this event");
      return res
        .status(400)
        .json({ message: "You've already RSVP'd to this event" });
    }

    event.rsvps.push(req.user._id);
    await event.save();

    console.log("RSVP successful, creating notification...");

    const notification = await Notification.create({
      recipient: req.user._id, // The user RSVPing is the recipient
      sender: event.user, // The event creator is the sender
      type: "eventRsvp",
      event: event._id,
      message: `You have RSVP'd to the event: ${event.title}. We'll notify you closer to the event date.`,
    });

    console.log("Notification created successfully:", notification);

    res.status(200).json({ message: "RSVP successful", rsvps: event.rsvps });
  } catch (error) {
    console.error("Error RSVPing to event:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const unrsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const rsvpIndex = event.rsvps.indexOf(req.user._id);
    if (rsvpIndex === -1) {
      return res
        .status(400)
        .json({ message: "You have not RSVP'd to this event" });
    }

    event.rsvps.splice(rsvpIndex, 1);
    await event.save();

    res.status(200).json({ message: "RSVP removed", rsvps: event.rsvps });
  } catch (error) {
    console.error("Error removing RSVP from event:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getUserEvents,
  rsvpEvent,
  unrsvpEvent,
};
