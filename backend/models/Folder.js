const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentFolderId: {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

folderSchema.virtual("contents", {
  ref: "File",
  localField: "_id",
  foreignField: "folderId",
});

folderSchema.virtual("subFolders", {
  ref: "Folder",
  localField: "_id",
  foreignField: "parentFolderId",
});

module.exports = mongoose.model("Folder", folderSchema);
