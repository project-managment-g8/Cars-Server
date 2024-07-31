// server/routes/imageRoutes.js
import express from "express";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const router = express.Router();

const mongoURI = process.env.MONGODB_URI;

let gfs;
const connect = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connect.once("open", () => {
  console.log("Connected to MongoDB for GridFS");
  gfs = new GridFSBucket(connect.db, {
    bucketName: "uploads",
  });
});

router.get("/:filename", async (req, res) => {
  console.log(`Received request to fetch file: ${req.params.filename}`);

  try {
    const files = await gfs.find({ filename: req.params.filename }).toArray();
    if (!files || files.length === 0) {
      console.log("No file found");
      return res.status(404).json({ message: "No file exists" });
    }

    console.log(`Found file: ${files[0].filename}`);
    const readStream = gfs.openDownloadStreamByName(req.params.filename);
    readStream.pipe(res).on("error", (err) => {
      console.error("Error in streaming file:", err);
      res.status(500).json({ message: "Error in streaming file" });
    });

    readStream.on("end", () => {
      console.log(`Finished streaming file: ${req.params.filename}`);
    });
  } catch (error) {
    console.error("Error fetching or streaming file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
