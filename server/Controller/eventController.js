import Event from "../models/eventModel.js";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";

// Initialize GridFSBucket
const conn = mongoose.connection;
let gfsBucket;
conn.once("open", () => {
  gfsBucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
});

// Fetch all events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("user", "userName _id");
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
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

export { getEvents, createEvent, updateEvent, deleteEvent };
