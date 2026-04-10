// API helper functions for making authenticated requests

const API_BASE_URL = "http://localhost:5000/api";

// Helper to get the auth token
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch helper
const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
};

// File operations
export const api = {
  // Files
  getFiles: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/files?${queryString}`);
  },

  uploadFile: (formData) => {
    return fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    });
  },

  getStarred: () => fetchWithAuth("/files/starred"),

  getRecent: () => fetchWithAuth("/files/recent"),

  moveFileToBin: (fileId) =>
    fetchWithAuth(`/files/move-to-bin/${fileId}`, { method: "PATCH" }),

  restoreFile: (fileId) =>
    fetchWithAuth(`/files/restore/${fileId}`, { method: "PATCH" }),

  deleteFilePermanent: (fileId) =>
    fetchWithAuth(`/files/permanent/${fileId}`, { method: "DELETE" }),

  toggleStar: (fileId) =>
    fetchWithAuth(`/files/star/${fileId}`, { method: "PATCH" }),

  renameFile: (fileId, newName) =>
    fetchWithAuth(`/files/rename/${fileId}`, {
      method: "PATCH",
      body: JSON.stringify({ newName }),
    }),

  copyFile: (fileId) =>
    fetchWithAuth(`/files/copy/${fileId}`, { method: "POST" }),

  shareFile: (fileId, data) =>
    fetchWithAuth(`/files/share/${fileId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  emptyBin: () => fetchWithAuth("/files/bin/empty", { method: "DELETE" }),

  // Folders
  getFolders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/folders?${queryString}`);
  },

  createFolder: (data) =>
    fetchWithAuth("/folders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  moveFolderToBin: (folderId) =>
    fetchWithAuth(`/folders/move-to-bin/${folderId}`, { method: "PATCH" }),

  restoreFolder: (folderId) =>
    fetchWithAuth(`/folders/restore/${folderId}`, { method: "PATCH" }),

  deleteFolderPermanent: (folderId) =>
    fetchWithAuth(`/folders/permanent/${folderId}`, { method: "DELETE" }),

  toggleFolderStar: (folderId) =>
    fetchWithAuth(`/folders/star/${folderId}`, { method: "PATCH" }),

  // Storage
  getStorageUsage: () => fetchWithAuth("/storage/usage"),
};

export default api;
