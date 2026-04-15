import React, { useRef, useState, useEffect } from "react";
import { FiUpload, FiX, FiFolder, FiFile } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";

function UploadButton({ currentFolder, currentUser, onUploadComplete }) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [showUploadTypeModal, setShowUploadTypeModal] = useState(false);
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(null);
  const [checkingGoogleDrive, setCheckingGoogleDrive] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://my-drive-application.onrender.com/api";

  useEffect(() => {
    checkGoogleDriveStatus();
  }, []);

  const checkGoogleDriveStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCheckingGoogleDrive(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/google/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoogleDriveConnected(data.connected);
        setGoogleEmail(data.googleEmail);
      }
    } catch (error) {
      console.error("Error checking Google Drive status:", error);
    } finally {
      setCheckingGoogleDrive(false);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleUpload = async (files, isFolder = false) => {
    let targetFolderId = currentFolder || "";

    // If uploading a folder, create it first
    if (isFolder && files.length > 0) {
      try {
        // Get folder name from the first file's webkitRelativePath
        const folderPath = files[0].webkitRelativePath;
        const folderName = folderPath.split("/")[0];

        const folderResponse = await fetch(`${API_BASE_URL}/folders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            name: folderName,
            parentFolderId: currentFolder || null,
          }),
        });

        if (!folderResponse.ok) {
          const errorData = await folderResponse.json();
          throw new Error(errorData.error || "Failed to create folder");
        }

        const createdFolder = await folderResponse.json();
        targetFolderId = createdFolder._id;

        toast.success(`Folder "${folderName}" created`);
      } catch (error) {
        console.error("Error creating folder:", error);
        toast.error(`Failed to create folder: ${error.message}`);
        return;
      }
    }

    // Upload all files
    for (let file of files) {
      // Check file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 500MB limit and was not uploaded`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", targetFolderId);
      formData.append(
        "uploadToGoogle",
        googleDriveConnected ? "true" : "false",
      );

      try {
        console.log(
          `Uploading: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        );
        if (googleDriveConnected) {
          console.log("📤 Google Drive upload enabled");
        }

        const response = await axios.post(
          `${API_BASE_URL}/files/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...getAuthHeaders(),
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              console.log(`${file.name}: ${percentCompleted}% uploaded`);
            },
          },
        );

        if (response.status === 201 || response.status === 200) {
          const successMessage = googleDriveConnected
            ? `Uploaded: ${file.name} (also saved to Google Drive)`
            : `Uploaded: ${file.name}`;
          toast.success(successMessage);

          // Refresh the file list (calls fetchContents in App.jsx)
          if (onUploadComplete) {
            onUploadComplete();
          }

          // Dispatch a custom event to refresh storage in sidebar
          window.dispatchEvent(new Event("storage-updated"));
        }
      } catch (error) {
        console.error("Upload error:", error);
        if (error.response) {
          console.error("Server response:", error.response.data);
          toast.error(
            `Failed to upload ${file.name}: ${error.response.data.error || error.message}`,
          );
        } else if (error.request) {
          console.error("No response from server");
          toast.error(
            `Failed to upload ${file.name}. Server not responding. Make sure backend is running on port 5000`,
          );
        } else {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
        }
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    handleUpload(files, false);
    e.target.value = ""; // Reset input
  };

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    handleUpload(files, true);
    e.target.value = ""; // Reset input
  };

  const handleUploadTypeSelect = (isFolder) => {
    setShowUploadTypeModal(false);
    if (isFolder) {
      folderInputRef.current.click();
    } else {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div className="relative">
        <button
          className="upload-btn"
          onClick={() => setShowUploadTypeModal(true)}
        >
          <FiUpload /> Upload
          {googleDriveConnected && !checkingGoogleDrive && (
            <span
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              title="Google Drive connected"
            ></span>
          )}
        </button>
        {googleDriveConnected && !checkingGoogleDrive && (
          <div className="absolute top-full left-0 mt-1 text-xs text-green-600 whitespace-nowrap">
            ✓ Google Drive
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        multiple
        onChange={handleFileSelect}
      />

      <input
        type="file"
        ref={folderInputRef}
        style={{ display: "none" }}
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderSelect}
      />

      {showUploadTypeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowUploadTypeModal(false)}
        >
          <div
            className="modal upload-type-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Choose Upload Type</h3>
              <button
                className="close-btn"
                onClick={() => setShowUploadTypeModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>What would you like to upload?</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-upload-type"
                onClick={() => handleUploadTypeSelect(false)}
              >
                <FiFile /> Files
              </button>
              <button
                className="btn btn-upload-type primary"
                onClick={() => handleUploadTypeSelect(true)}
              >
                <FiFolder /> Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UploadButton;
