const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['upload', 'download', 'delete', 'restore', 'rename', 'move', 'star', 'share', 'copy'],
    required: true
  },
  itemId: mongoose.Schema.Types.ObjectId,
  itemType: {
    type: String,
    enum: ['file', 'folder']
  },
  itemName: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);