const express = require("express");
const { google } = require("googleapis");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// Helper function to create a new OAuth2 client instance per request
function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI ||
      "http://localhost:5000/api/google/callback",
  );
}

// Scopes needed for Google Drive access
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

// Public client config for browser-side Google auth
router.get("/client-config", (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID || null,
  });
});

// Generate Google Auth URL
router.get("/auth-url", authMiddleware, async (req, res) => {
  try {
    const oauth2Client = createOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
      state: req.userId,
    });

    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: "Failed to generate authentication URL" });
  }
});

// Google OAuth callback
router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code || !userId) {
      return res.status(400).json({ error: "Missing code or state parameter" });
    }

    // Create a new OAuth2 client for this request
    const oauth2Client = createOAuth2Client();

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Get user info from Google
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Update user with Google Drive tokens
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.googleDrive = {
      connected: true,
      googleEmail: userInfo.data.email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || user.googleDrive?.refreshToken,
      tokenExpiry: new Date(Date.now() + (tokens.expiry_date || 3600000)),
      connectedAt: new Date(),
    };

    await user.save();

    // Redirect to frontend success page (without email in URL for privacy)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/google-drive-connected?success=true`);
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/google-drive-connected?success=false`);
  }
});

// Check Google Drive connection status
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("googleDrive email");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      connected: user.googleDrive?.connected || false,
      googleEmail: user.googleDrive?.googleEmail || null,
      userEmail: user.email,
      connectedAt: user.googleDrive?.connectedAt || null,
    });
  } catch (error) {
    console.error("Error checking Google Drive status:", error);
    res.status(500).json({ error: "Failed to check connection status" });
  }
});

// Disconnect Google Drive
router.post("/disconnect", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.googleDrive = {
      connected: false,
      googleEmail: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      connectedAt: null,
    };

    await user.save();

    res.json({ message: "Google Drive disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting Google Drive:", error);
    res.status(500).json({ error: "Failed to disconnect Google Drive" });
  }
});

// Refresh Google access token if expired
router.post("/refresh-token", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || !user.googleDrive?.connected) {
      return res.status(400).json({ error: "Google Drive not connected" });
    }

    if (!user.googleDrive.refreshToken) {
      return res.status(400).json({ error: "No refresh token available" });
    }

    // Create a new OAuth2 client for this request
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: user.googleDrive.refreshToken,
    });

    // Get new tokens
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update user with new tokens
    user.googleDrive.accessToken = credentials.access_token;
    user.googleDrive.tokenExpiry = new Date(
      Date.now() + (credentials.expiry_date || 3600000),
    );

    await user.save();

    res.json({
      message: "Token refreshed successfully",
      expiry: user.googleDrive.tokenExpiry,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Get authenticated Google OAuth2 client
async function getGoogleAuthClient(userId) {
  const user = await User.findById(userId);

  if (!user || !user.googleDrive?.connected) {
    throw new Error("Google Drive not connected");
  }

  // Create a new OAuth2 client for this operation
  const oauth2Client = createOAuth2Client();

  // Check if token is expired or about to expire (within 5 minutes)
  const isExpired =
    !user.googleDrive.tokenExpiry ||
    new Date(user.googleDrive.tokenExpiry) <=
      new Date(Date.now() + 5 * 60 * 1000);

  if (isExpired && user.googleDrive.refreshToken) {
    // Refresh the token
    oauth2Client.setCredentials({
      refresh_token: user.googleDrive.refreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    user.googleDrive.accessToken = credentials.access_token;
    user.googleDrive.tokenExpiry = new Date(
      Date.now() + (credentials.expiry_date || 3600000),
    );

    await user.save();

    oauth2Client.setCredentials({
      access_token: user.googleDrive.accessToken,
      refresh_token: user.googleDrive.refreshToken,
    });
  } else {
    oauth2Client.setCredentials({
      access_token: user.googleDrive.accessToken,
      refresh_token: user.googleDrive.refreshToken,
    });
  }

  return { auth: oauth2Client, user };
}

module.exports = {
  router,
  getGoogleAuthClient,
};
