const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const File = require("../models/File");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const {
  uploadToGoogleDrive,
  hasGoogleDriveConnected,
} = require("../utils/googleDrive");

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

      let googleDriveResult = null;

      // Upload to Google Drive if checkbox is checked AND user has Google Drive connected
      if (isGoogleDriveChecked) {
        if (hasGoogleDriveConnected(user)) {
          console.log(
            "📤 User has Google Drive connected, uploading automatically...",
          );
          try {
            const googleFile = await uploadToGoogleDrive(
              req.userId,
              req.file.path,
              req.file.originalname,
              req.file.mimetype,
            );

            // Update file record with Google Drive info
            file.googleDriveId = googleFile.id;
            file.googleDriveLink = googleFile.webViewLink;
            await file.save();

            googleDriveResult = {
              success: true,
              id: googleFile.id,
              link: googleFile.webViewLink,
            };
            console.log("✅ Google Drive upload successful:", googleFile.id);
          } catch (googleError) {
            console.error(
              "⚠️ Google Drive upload failed:",
              googleError.message,
            );
            googleDriveResult = {
              success: false,
              error: googleError.message,
            };
          }
        } else {
          console.log("ℹ️ Google Drive upload skipped (user not connected)");
          googleDriveResult = {
            success: false,
            needsConnection: true,
            message: "Please connect your Google Drive in Settings first",
          };
        }
      } else {
        console.log("ℹ️ Google Drive upload skipped (checkbox unchecked)");
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
        googleDrive: googleDriveResult,
      });
    } catch (error) {
      console.error("❌ Form submission error:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
