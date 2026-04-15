const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const jwt = require("jsonwebtoken");
const File = require("../models/File");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { google } = require("googleapis");

const router = express.Router();

// Configure multer for form file upload
const formStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/form-files");
    await fs.ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "form-" +
        req.userId +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname),
    );
  },
});

const uploadFormFile = multer({
  storage: formStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Google Drive OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "https://my-drive-application.onrender.com/api/form/google/callback";

// Temporary storage for file metadata during OAuth flow
const pendingUploads = new Map();

// Route to handle Google OAuth Callback
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const token = state;

    if (!token) {
      return res
        .status(401)
        .json({ error: "No authentication token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const userId = decoded.userId;

    const uploadData = pendingUploads.get(userId);

    if (!uploadData) {
      return res.status(400).json({ error: "No pending upload found." });
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI,
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const file = await File.findById(uploadData.fileId);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    console.log("📤 Uploading to Google Drive...");
    const response = await drive.files.create({
      resource: {
        name: file.originalName,
        mimeType: file.type,
        parents: ["root"],
        description: `Uploaded from My Drive Form - ${uploadData.formData?.name}`,
      },
      media: {
        mimeType: file.type,
        body: fs.createReadStream(file.path),
      },
      fields: "id, name, webViewLink",
    });

    pendingUploads.delete(userId);
    console.log("Google Drive Upload Success:", response.data.id);

    res.send(`
      <html>
        <head><title>Upload Successful</title></head>
        <body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f0f2f5;">
          <div style="background:white;padding:40px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);text-align:center;">
            <h2 style="color:#38a169;">Success!</h2>
            <p>Your file has been uploaded to Google Drive.</p>
            <p>You can close this window.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Google Drive OAuth callback error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Submit form with file upload
router.post(
  "/submit",
  authMiddleware,
  uploadFormFile.single("formFile"),
  async (req, res) => {
    try {
      const { name, email, phone, height, weight, uploadToGoogleDrive } =
        req.body;

      console.log("📦 Form submission received:");
      console.log("   Name:", name);
      console.log("   Email:", email);
      console.log("   Google Drive Checkbox Value:", uploadToGoogleDrive);
      console.log("   File:", req.file ? req.file.originalname : "No file");

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Save file to local drive (My Drive)
      const file = new File({
        name: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        extension: path.extname(req.file.originalname),
        path: req.file.path,
        userId: req.userId,
        folderId: null,
        isStarred: false,
        isDeleted: false,
        createdBy: {
          email: email || user.email,
          name: name || user.name,
        },
        modifiedBy: [
          {
            email: email || user.email,
            name: name || user.name,
            modifiedAt: new Date(),
            action: "uploaded via form",
          },
        ],
      });

      await file.save();
      console.log("✅ File saved to local drive:", file._id);

      // Create recent upload record
      const RecentUpload = require("../models/RecentUpload");
      const recentUpload = new RecentUpload({
        userId: req.userId,
        itemId: file._id,
        itemType: "file",
        uploadedAt: new Date(),
      });
      await recentUpload.save();

      // Update user storage used
      user.storageUsed += req.file.size;
      await user.save();

      // Check for string "true", boolean true, or string "on" (default HTML checkbox value)
      const isGoogleDriveChecked =
        uploadToGoogleDrive === "true" ||
        uploadToGoogleDrive === true ||
        uploadToGoogleDrive === "on";

      if (isGoogleDriveChecked && email) {
        console.log("🚀 Starting Google Drive OAuth flow...");

        const formData = { name, email, phone, height, weight };

        // Extract your Auth Token and add it as state to the Google URL
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (token) {
          pendingUploads.set(req.userId, {
            email,
            formData,
            fileId: file._id,
            token,
          });

          const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            GOOGLE_REDIRECT_URI,
          );

          const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: [
              "https://www.googleapis.com/auth/drive.file",
              "https://www.googleapis.com/auth/drive",
              "email",
              "profile",
            ],
            state: token, // Pass the token here
            prompt: "consent",
          });

          console.log("🔗 Google Auth URL generated");

          return res.json({
            message: "Form submitted successfully!",
            file: {
              id: file._id,
              name: file.originalName,
              size: file.size,
            },
            googleDrive: {
              needsAuth: true,
              authUrl: authUrl,
            },
          });
        } else {
          console.error("❌ No auth token found in request headers");
        }
      } else {
        console.log(
          "ℹ️ Google Drive upload skipped (Checkbox unchecked or missing email)",
        );
      }

      res.json({
        message: "Form submitted successfully! File uploaded to My Drive.",
        file: {
          id: file._id,
          name: file.originalName,
          size: file.size,
          type: file.type,
          previewUrl: `https://my-drive-application.onrender.com/api/files/preview/${file._id}`,
        },
        googleDrive: null,
      });
    } catch (error) {
      console.error("❌ Form submission error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
