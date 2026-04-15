const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from dist directory with correct MIME types
const distPath = path.join(__dirname, "dist");

// Set up static file serving with proper MIME types
app.use(
  express.static(distPath, {
    index: false,
    setHeaders: function (res, path) {
      if (path.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css; charset=utf-8");
      } else if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      } else if (path.endsWith(".html")) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
      }
    },
  }),
);

// Handle client-side routing - serve index.html for all non-file routes
app.get("*", function (req, res) {
  res.sendFile(path.join(distPath, "index.html"));
});

// Bind to 0.0.0.0 for Render deployment
app.listen(PORT, "0.0.0.0", function () {
  console.log("✅ Frontend server running on port " + PORT);
  console.log("📁 Serving files from: " + distPath);
});

module.exports = app;
