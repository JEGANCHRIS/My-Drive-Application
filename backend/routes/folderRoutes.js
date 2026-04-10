const express = require("express");
const Folder = require("../models/Folder");
const File = require("../models/File");
const User = require("../models/User");
const fs = require("fs-extra");
const archiver = require("archiver");
const path = require("path");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Create folder
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, parentFolderId } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const folder = new Folder({
      name,
      parentFolderId: parentFolderId || null,
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
          action: "created",
        },
      ],
    });

    await folder.save();

    // Create recent upload record for folder
    const RecentUpload = require("../models/RecentUpload");
    const recentUpload = new RecentUpload({
      userId: req.userId,
      itemId: folder._id,
      itemType: "folder",
      uploadedAt: new Date(),
    });
    await recentUpload.save();

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all folders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { parentFolderId, isDeleted, isStarred } = req.query;
    const query = { userId: req.userId };

    if (parentFolderId !== undefined)
      query.parentFolderId = parentFolderId === "null" ? null : parentFolderId;
    if (isDeleted) query.isDeleted = isDeleted === "true";
    if (isStarred) query.isStarred = isStarred === "true";

    const folders = await Folder.find(query).sort({ createdAt: -1 });

    // Get contents count for each folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const fileCount = await File.countDocuments({
          folderId: folder._id,
          userId: req.userId,
          isDeleted: false,
        });
        const folderCount = await Folder.countDocuments({
          parentFolderId: folder._id,
          userId: req.userId,
          isDeleted: false,
        });
        return {
          ...folder.toObject(),
          contentsCount: fileCount + folderCount,
        };
      }),
    );

    res.json(foldersWithCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move folder to bin
router.patch("/move-to-bin/:id", authMiddleware, async (req, res) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    // Remove from recent uploads
    const RecentUpload = require("../models/RecentUpload");
    await RecentUpload.deleteOne({ itemId: folder._id, itemType: "folder" });

    // Don't mark files inside as deleted - they stay with the folder
    // When folder is restored, files will still be accessible

    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore folder
router.patch("/restore/:id", authMiddleware, async (req, res) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDeleted: false, deletedAt: null },
      { new: true },
    );
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete folder permanently
router.delete("/permanent/:id", authMiddleware, async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    // Delete all files in folder
    const files = await File.find({
      folderId: req.params.id,
      userId: req.userId,
    });
    for (const file of files) {
      if (file.path) await fs.remove(file.path);
      await File.findByIdAndDelete(file._id);
    }

    res.json({ message: "Folder deleted permanently" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle star
router.patch("/star/:id", authMiddleware, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!folder) return res.status(404).json({ error: "Folder not found" });
    folder.isStarred = !folder.isStarred;
    await folder.save();
    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get folder info
router.get("/info/:id", async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    const files = await File.find({ folderId: folder._id, isDeleted: false });
    const subFolders = await Folder.find({
      parentFolderId: folder._id,
      isDeleted: false,
    });

    res.json({
      ...folder.toObject(),
      files,
      subFolders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download folder as zip
router.get("/download/:id", async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ error: "Folder not found" });

    const files = await File.find({ folderId: folder._id, isDeleted: false });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${folder.name}.zip`,
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      throw err;
    });
    archive.pipe(res);

    for (const file of files) {
      archive.file(file.path, { name: file.originalName });
    }

    await archive.finalize();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
