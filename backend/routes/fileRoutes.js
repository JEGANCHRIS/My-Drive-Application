const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const archiver = require("archiver");
const File = require("../models/File");
const Folder = require("../models/Folder");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

console.log("✅ fileRoutes module loaded");

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "File routes are working" });
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    await fs.ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Upload file
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("Upload request received:", req.file?.originalname);
      console.log("Request body:", req.body);
      console.log("User ID from token:", req.userId);

      if (!req.file) {
        console.log("❌ No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { folderId } = req.body;

      // Get user info from token
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log("Creating file record...");
      const file = new File({
        name: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        extension: path.extname(req.file.originalname),
        path: req.file.path,
        folderId: folderId || null,
        userId: req.userId,
        createdBy: {
          email: user.email,
          name: user.name,
        },
        modifiedBy: [
          {
            email: user.email,
            name: user.name,
            modifiedAt: new Date(),
            action: "uploaded",
          },
        ],
      });

      console.log("Saving file to database...");
      await file.save();
      console.log("✅ File saved:", file._id);

      // Update user storage used
      user.storageUsed += req.file.size;
      await user.save();

      // Create recent upload record
      console.log("Creating recent upload record...");
      const RecentUpload = require("../models/RecentUpload");
      const recentUpload = new RecentUpload({
        userId: req.userId,
        itemId: file._id,
        itemType: "file",
        uploadedAt: new Date(),
      });
      await recentUpload.save();
      console.log("✅ Recent upload record saved");

      console.log("Sending success response...");
      return res.status(201).json(file);
    } catch (error) {
      console.error("❌ Upload error:", error);
      console.error("Error stack:", error.stack);
      return res.status(500).json({ error: error.message });
    }
  },
);

// Get all files
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { folderId, isDeleted, isStarred } = req.query;
    const query = { userId: req.userId };

    if (folderId !== undefined)
      query.folderId = folderId === "null" ? null : folderId;
    if (isDeleted !== undefined) query.isDeleted = isDeleted === "true";
    if (isStarred !== undefined) query.isStarred = isStarred === "true";

    const files = await File.find(query).sort({ createdAt: -1 });

    // If fetching deleted files, filter out files that are inside deleted folders
    if (isDeleted === "true") {
      const deletedFolderIds = await Folder.find({
        userId: req.userId,
        isDeleted: true,
      }).distinct("_id");

      // Only return files that are deleted AND not inside a deleted folder
      const filteredFiles = files.filter(
        (file) =>
          !file.folderId ||
          !deletedFolderIds.includes(file.folderId.toString()),
      );

      res.json(filteredFiles);
    } else {
      // Always return an array, even if empty
      res.json(files || []);
    }
  } catch (error) {
    console.error("Error fetching files:", error);
    // Return empty array on error instead of error object
    res.json([]);
  }
});

// Download file as zip
router.get("/download/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${file.originalName}.zip`,
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      throw err;
    });
    archive.pipe(res);
    archive.file(file.path, { name: file.originalName });
    await archive.finalize();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move to bin
router.patch("/move-to-bin/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!file) return res.status(404).json({ error: "File not found" });

    // Remove from recent uploads
    const RecentUpload = require("../models/RecentUpload");
    await RecentUpload.deleteOne({ itemId: file._id, itemType: "file" });

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore from bin
router.patch("/restore/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDeleted: false, deletedAt: null },
      { new: true },
    );
    if (!file) return res.status(404).json({ error: "File not found" });
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete permanently
router.delete("/permanent/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!file) return res.status(404).json({ error: "File not found" });
    if (file.path) {
      await fs.remove(file.path);
    }
    res.json({ message: "File deleted permanently" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle star
router.patch("/star/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, userId: req.userId });
    if (!file) return res.status(404).json({ error: "File not found" });
    file.isStarred = !file.isStarred;
    await file.save();
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get file info
router.get("/info/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Preview file content
router.get("/preview/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // Check if file exists
    const fileExists = await fs.pathExists(file.path);
    if (!fileExists) {
      console.warn("⚠️ File not found on disk:", file.path);
      return res.status(404).json({
        error: "File not found on disk",
        message:
          "The file has been deleted or is not available on this server.",
        originalName: file.originalName,
      });
    }

    const fileType = file.type || "";
    const fileExt = file.extension?.toLowerCase() || "";

    console.log("Preview request for:", file.originalName);
    console.log("File type:", fileType);
    console.log("File extension:", fileExt);

    // Text-based files
    const textExtensions = [
      ".txt",
      ".md",
      ".csv",
      ".log",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".html",
      ".css",
      ".json",
      ".xml",
      ".yaml",
      ".yml",
      ".sql",
      ".sh",
      ".bat",
      ".php",
      ".rb",
      ".go",
      ".rs",
      ".c",
      ".cpp",
    ];

    if (fileType.startsWith("text/") || textExtensions.includes(fileExt)) {
      const content = await fs.readFile(file.path, "utf8");
      res.json({
        content,
        type: file.type,
        name: file.originalName,
        previewType: "text",
        size: file.size,
      });
    }
    // Images
    else if (fileType.startsWith("image/")) {
      const fileBuffer = await fs.readFile(file.path);
      const base64Content = fileBuffer.toString("base64");
      res.json({
        content: base64Content,
        type: file.type,
        name: file.originalName,
        previewType: "image",
        size: file.size,
      });
    }
    // Videos
    else if (fileType.startsWith("video/")) {
      const fileBuffer = await fs.readFile(file.path);
      const base64Content = fileBuffer.toString("base64");
      res.json({
        content: base64Content,
        type: file.type,
        name: file.originalName,
        previewType: "video",
        size: file.size,
      });
    }
    // Audio
    else if (fileType.startsWith("audio/")) {
      const fileBuffer = await fs.readFile(file.path);
      const base64Content = fileBuffer.toString("base64");
      res.json({
        content: base64Content,
        type: file.type,
        name: file.originalName,
        previewType: "audio",
        size: file.size,
      });
    }
    // PDF
    else if (fileType === "application/pdf" || fileExt === ".pdf") {
      const fileBuffer = await fs.readFile(file.path);
      const base64Content = fileBuffer.toString("base64");
      res.json({
        content: base64Content,
        type: file.type,
        name: file.originalName,
        previewType: "pdf",
        size: file.size,
      });
    }
    // Office documents (DOCX only - mammoth doesn't support old .doc format)
    else if (
      (fileType.includes("word") && fileType.includes("openxmlformats")) ||
      fileExt === ".docx"
    ) {
      try {
        const mammoth = require("mammoth");
        const result = await mammoth.convertToHtml(
          { path: file.path },
          {
            convertImage: mammoth.images.imgElement(function (image) {
              return image.read("base64").then(function (imageBuffer) {
                return {
                  src: "data:" + image.contentType + ";base64," + imageBuffer,
                };
              });
            }),
            styleMap: [
              "p[style-name='Title'] => h1.title",
              "p[style-name='Subtitle'] => h2.subtitle",
              "p[style-name='Heading 1'] => h1",
              "p[style-name='Heading 2'] => h2",
              "p[style-name='Heading 3'] => h3",
              "p[style-name='Heading 4'] => h4",
              "p[style-name='Heading 5'] => h5",
              "p[style-name='Heading 6'] => h6",
              "p[style-name='Normal'] => p",
              "r[style-name='Strong'] => strong",
              "r[style-name='Emphasis'] => em",
            ],
            includeDefaultStyleMap: true,
          },
        );
        res.json({
          content: result.value,
          type: file.type,
          name: file.originalName,
          previewType: "docx",
          size: file.size,
          messages: result.messages,
        });
      } catch (error) {
        console.error("DOCX conversion error:", error.message);
        res.json({
          type: file.type,
          name: file.originalName,
          previewType: "office",
          size: file.size,
          message:
            "Preview not available for this document. Please download to view.",
        });
      }
    }
    // Old .doc files and other Office documents - show download message
    else if (
      fileType.includes("word") ||
      fileType.includes("excel") ||
      fileType.includes("presentation") ||
      fileType.includes("spreadsheet") ||
      fileType.includes("document") ||
      [".doc", ".xls", ".xlsx", ".ppt", ".pptx"].includes(fileExt)
    ) {
      res.json({
        type: file.type,
        name: file.originalName,
        previewType: "office",
        size: file.size,
        message:
          "Preview not available for this Office document format. Please download to view.",
      });
    }
    // Other files
    else {
      res.json({
        type: file.type,
        name: file.originalName,
        previewType: "unsupported",
        size: file.size,
        message:
          "Preview not available for this file type. Please download to view.",
      });
    }
  } catch (error) {
    console.error("Preview error:", error);
    res.status(500).json({ error: "Failed to load preview" });
  }
});

// Rename file
router.patch("/rename/:id", authMiddleware, async (req, res) => {
  try {
    const { newName } = req.body;
    const file = await File.findOne({ _id: req.params.id, userId: req.userId });

    if (!file) return res.status(404).json({ error: "File not found" });

    const user = await User.findById(req.userId);
    const oldName = file.originalName;
    file.originalName = newName;
    file.modifiedBy.push({
      email: user.email,
      name: user.name,
      modifiedAt: new Date(),
      action: `renamed from "${oldName}" to "${newName}"`,
    });
    file.lastModified = Date.now();

    await file.save();
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make a copy
router.post("/copy/:id", authMiddleware, async (req, res) => {
  try {
    const originalFile = await File.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!originalFile) return res.status(404).json({ error: "File not found" });

    const user = await User.findById(req.userId);
    const newFileName = `Copy of ${originalFile.originalName}`;
    const newFilePath = path.join(
      __dirname,
      "../uploads",
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        originalFile.extension,
    );

    // Copy the actual file
    await fs.copy(originalFile.path, newFilePath);

    const newFile = new File({
      name: path.basename(newFilePath),
      originalName: newFileName,
      size: originalFile.size,
      type: originalFile.type,
      extension: originalFile.extension,
      path: newFilePath,
      folderId: originalFile.folderId,
      userId: req.userId,
      createdBy: originalFile.createdBy,
      modifiedBy: [
        {
          email: user.email,
          name: user.name,
          modifiedAt: new Date(),
          action: "created copy",
        },
      ],
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Share file
router.post("/share/:id", authMiddleware, async (req, res) => {
  try {
    const { sharedWithEmail, permissions } = req.body;
    const file = await File.findOne({ _id: req.params.id, userId: req.userId });

    if (!file) return res.status(404).json({ error: "File not found" });

    // Generate share token
    const ShareLink = require("../models/ShareLink");
    const crypto = require("crypto");
    const shareToken = crypto.randomBytes(32).toString("hex");

    const shareLink = new ShareLink({
      itemId: file._id,
      itemType: "file",
      sharedBy: req.body.userId,
      shareToken: shareToken,
      expiresAt:
        req.body.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    });

    await shareLink.save();

    // Log sharing activity
    const user = await User.findById(req.userId);
    file.modifiedBy.push({
      email: user.email,
      name: user.name,
      modifiedAt: new Date(),
      action: `shared with ${sharedWithEmail || "public"}`,
    });
    await file.save();

    res.json({
      shareUrl: `http://localhost:5000/api/share/${shareToken}`,
      shareToken: shareToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recently uploaded
router.get("/recent", authMiddleware, async (req, res) => {
  try {
    const RecentUpload = require("../models/RecentUpload");
    const recent = await RecentUpload.find({ userId: req.userId })
      .sort({ uploadedAt: -1 })
      .limit(50);

    const items = [];
    const deletedFolderIds = await Folder.find({
      userId: req.userId,
      isDeleted: true,
    }).distinct("_id");

    for (const item of recent) {
      if (item.itemType === "file") {
        const file = await File.findById(item.itemId);
        // Only show standalone files (not inside any folder) that are not deleted
        if (file && !file.isDeleted && !file.folderId) {
          items.push({ ...file.toObject(), itemType: "file" });
        }
      } else {
        const folder = await Folder.findById(item.itemId);
        // Skip if folder is deleted
        if (folder && !folder.isDeleted) {
          // Calculate contents count
          const fileCount = await File.countDocuments({
            folderId: folder._id,
            isDeleted: false,
          });
          const folderCount = await Folder.countDocuments({
            parentFolderId: folder._id,
            isDeleted: false,
          });
          items.push({
            ...folder.toObject(),
            itemType: "folder",
            contentsCount: fileCount + folderCount,
          });
        }
      }
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get starred items
router.get("/starred", authMiddleware, async (req, res) => {
  try {
    const files = await File.find({
      userId: req.userId,
      isStarred: true,
      isDeleted: false,
    });
    const folders = await Folder.find({
      userId: req.userId,
      isStarred: true,
      isDeleted: false,
    });

    // Add contents count to folders
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const fileCount = await File.countDocuments({
          folderId: folder._id,
          isDeleted: false,
        });
        const folderCount = await Folder.countDocuments({
          parentFolderId: folder._id,
          isDeleted: false,
        });
        return {
          ...folder.toObject(),
          contentsCount: fileCount + folderCount,
        };
      }),
    );

    res.json({ files, folders: foldersWithCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filter by type
router.get("/filter/type", authMiddleware, async (req, res) => {
  try {
    const { type, folderId } = req.query;
    let query = {
      userId: req.userId,
      folderId: folderId || null,
      isDeleted: false,
    };

    if (type && type !== "all") {
      query.extension = type;
    }

    const files = await File.find(query);
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filter by people
router.get("/filter/people", authMiddleware, async (req, res) => {
  try {
    const { email } = req.query;
    const files = await File.find({
      userId: req.userId,
      "createdBy.email": email,
      isDeleted: false,
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filter by modified date
router.get("/filter/date", authMiddleware, async (req, res) => {
  try {
    const { range } = req.query;
    let dateFilter = {};
    const now = new Date();

    switch (range) {
      case "today":
        dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case "week":
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case "month":
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case "year":
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
      case "before-year":
        dateFilter = { $lt: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
      default:
        dateFilter = {};
    }

    const files = await File.find({
      userId: req.userId,
      lastModified: dateFilter,
      isDeleted: false,
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk delete from bin
router.delete("/bin/empty", authMiddleware, async (req, res) => {
  try {
    const files = await File.find({ userId: req.userId, isDeleted: true });
    for (const file of files) {
      if (file.path) await fs.remove(file.path);
      await File.findByIdAndDelete(file._id);
    }

    const folders = await Folder.find({ userId: req.userId, isDeleted: true });
    for (const folder of folders) {
      await Folder.findByIdAndDelete(folder._id);
    }

    res.json({ message: "Bin emptied successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
