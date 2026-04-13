import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "my-drive-application-1.onrender.com",
      "localhost",
      "127.0.0.1",
    ],
  },
  preview: {
    allowedHosts: [
      "my-drive-application-1.onrender.com",
      "localhost",
      "127.0.0.1",
    ],
  },
});
