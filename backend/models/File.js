const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  originalName: String,
  size: Number,
  type: String,
  extension: String,
  path: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
  isStarred: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  createdBy: {
    email: String,
    name: String,
  },
  modifiedBy: [
    {
      email: String,
      name: String,
      modifiedAt: Date,
      action: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  // Google Drive integration
  googleDriveId: {
    type: String,
    default: null,
  },
  googleDriveLink: {
    type: String,
    default: null,
  },
});

fileSchema.pre("save", async function () {
  this.lastModified = new Date();
});

module.exports = mongoose.model("File", fileSchema);
