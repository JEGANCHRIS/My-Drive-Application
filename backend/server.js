const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { createProxyMiddleware } = require("http-proxy-middleware");
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
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173", // Local development
        "http://localhost:4173", // Local preview
        "https://my-drive-application-1.onrender.com", // Production frontend
        "https://my-drive-application.onrender.com", // Backend URL
      ];

      // Allow all origins in development, restrict in production
      if (
        process.env.NODE_ENV === "development" ||
        allowedOrigins.indexOf(origin) !== -1
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/drive-clone";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log(
      "⚠️  Server will continue running, but database operations will fail",
    );
  });

// Health check endpoint (before routes)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    cors: "enabled",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Root endpoint (before routes)
app.get("/", (req, res) => {
  res.json({
    message: "My Drive API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      files: "/api/files",
      folders: "/api/folders",
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/summarize", summarizeRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/form", require("./routes/formRoutes"));

// n8n reverse proxy - strips X-Frame-Options so it can be embedded in iframe
app.use("/n8n-proxy", createProxyMiddleware({
  target: "https://my-drive-n8n-backend.onrender.com",
  changeOrigin: true,
  pathRewrite: { "^/n8n-proxy": "" },
  on: {
    proxyRes: (proxyRes) => {
      delete proxyRes.headers["x-frame-options"];
      delete proxyRes.headers["content-security-policy"];
    },
  },
}));

app.use("/", policyRoutes);

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
