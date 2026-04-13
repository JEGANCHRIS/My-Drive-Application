const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const storageRoutes = require("./routes/storageRoutes");

// Load environment variables
dotenv.config();

// Import routes
const fileRoutes = require("./routes/fileRoutes");
const folderRoutes = require("./routes/folderRoutes");
const authRoutes = require("./routes/authRoutes");
const summarizeRoutes = require("./routes/summarizeRoutes");
const activityRoutes = require("./routes/activityRoutes");
const policyRoutes = require("./routes/policyRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development
      "https://my-drive-application-1.onrender.com", // Production frontend
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/drive-clone";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/summarize", summarizeRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/form", require("./routes/formRoutes"));
app.use("/", policyRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, "uploads")}`);
});
