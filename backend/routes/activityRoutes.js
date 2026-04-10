const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const router = express.Router();

// Get user activities
router.get('/:userId', async (req, res) => {
  try {
    const activities = await ActivityLog.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log activity (internal use)
router.post('/', async (req, res) => {
  try {
    const activity = new ActivityLog(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;