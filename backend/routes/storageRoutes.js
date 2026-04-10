const express = require("express");
const File = require("../models/File");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/usage", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const files = await File.find({ userId: req.userId, isDeleted: false });
    const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);

    res.json({
      bytes: totalBytes,
      limit: user.storageLimit || 5 * 1024 * 1024 * 1024, // 5GB default
      fileCount: files.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
