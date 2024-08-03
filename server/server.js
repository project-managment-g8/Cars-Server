// server/server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import forumRoutes from "./routes/forumRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import multer from "multer";
import { protect } from "./middleware/authMiddleware.js";
import { GridFsStorage } from "multer-gridfs-storage";

dotenv.config();
const corsOptions = {
  origin: "https://cars-client.onrender.com", // Your client URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const port = process.env.PORT || 5001;
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  console.log("Connected to MongoDB");
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  app.locals.bucket = gfs;
});

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: "uploads",
      filename: `${Date.now()}-${file.originalname}`,
      metadata: { user: req.user._id },
    };
  },
});

const upload = multer({ storage });

// Route to handle image uploads
app.post("/upload", protect, upload.single("image"), (req, res) => {
  console.log(`File uploaded: ${req.file.filename}`);
  res.json({ filePath: req.file.filename });
});

// Route to fetch images from GridFS
app.use("/api/uploads", imageRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notification", notificationRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the Vehicle Social Platform API!");
});
app.post("/api/users/logout", (req, res) => {
  res.clearCookie("token"); // Assuming token is stored in cookies
  res.status(200).send({ message: "Logged out successfully" });
});
app.get("/ping", (req, res) => {
  res.send("pong <G8>");
});

app.get("/about", (req, res) => {
  res.send(
    "A platform that connects vehicle enthusiasts and people interested in the automotive world. Users can share photos of vehicles, discuss repairs and upgrades, receive maintenance tips, and organize meetings and events in the automotive field. Any user will be able to post reviews on spare parts, recommend garages, and share travel experiences."
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Export the app for testing
export { app, gfs };
