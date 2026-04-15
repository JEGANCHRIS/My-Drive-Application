const { google } = require("googleapis");
const fs = require("fs-extra");
const path = require("path");

/**
 * Upload a file to Google Drive
 * @param {string} userId - The user's ID from the database
 * @param {string} filePath - Local path to the file
 * @param {string} fileName - Name of the file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<Object>} - Google Drive file metadata
 */
async function uploadToGoogleDrive(userId, filePath, fileName, mimeType) {
  try {
    const { getGoogleAuthClient } = require("../routes/googleDriveRoutes");
    const { auth } = await getGoogleAuthClient(userId);
    const drive = google.drive({ version: "v3", auth });

    const fileMetadata = {
      name: fileName,
    };

    const media = {
      mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields:
        "id, name, mimeType, webViewLink, webContentLink, size, createdTime",
    });

    console.log(
      `✅ File uploaded to Google Drive: ${response.data.name} (${response.data.id})`,
    );
    return response.data;
  } catch (error) {
    console.error("❌ Google Drive upload error:", error);
    throw error;
  }
}

/**
 * Check if user has Google Drive connected
 * @param {Object} user - Mongoose user object
 * @returns {boolean}
 */
function hasGoogleDriveConnected(user) {
  return (
    user.googleDrive?.connected === true &&
    user.googleDrive?.accessToken &&
    user.googleDrive?.tokenExpiry &&
    new Date(user.googleDrive.tokenExpiry) > new Date()
  );
}

/**
 * Check and refresh Google token if needed
 * @param {Object} user - Mongoose user object
 * @returns {Promise<boolean>} - Whether the token is valid
 */
async function ensureGoogleTokenValid(user) {
  if (!user.googleDrive?.connected || !user.googleDrive?.refreshToken) {
    return false;
  }

  const isExpired =
    !user.googleDrive.tokenExpiry ||
    new Date(user.googleDrive.tokenExpiry) <=
      new Date(Date.now() + 5 * 60 * 1000);

  if (isExpired) {
    try {
      const { getGoogleAuthClient } = require("../routes/googleDriveRoutes");
      await getGoogleAuthClient(user._id.toString());
      return true;
    } catch (error) {
      console.error("Failed to refresh Google token:", error);
      return false;
    }
  }

  return true;
}

module.exports = {
  uploadToGoogleDrive,
  hasGoogleDriveConnected,
  ensureGoogleTokenValid,
};
