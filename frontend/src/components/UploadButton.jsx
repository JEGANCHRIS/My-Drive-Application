import React, { useEffect, useRef, useState } from "react";
import { FiUpload, FiX, FiFolder, FiFile } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ensureGoogleDriveAccessToken,
  GOOGLE_DRIVE_AUTH_EVENT,
  hasValidStoredGoogleDriveAuth,
  readStoredGoogleDriveAuth,
  uploadFileToGoogleDrive,
} from "../utils/googleDriveAuth";

function UploadButton({ currentFolder, onUploadComplete }) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [showUploadTypeModal, setShowUploadTypeModal] = useState(false);
  const [googleDriveConnected, setGoogleDriveConnected] = useState(
    hasValidStoredGoogleDriveAuth(),
  );
  const [googleEmail, setGoogleEmail] = useState(
    readStoredGoogleDriveAuth()?.email || null,
  );

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://my-drive-application.onrender.com/api";

  useEffect(() => {
    const syncGoogleDriveStatus = () => {
      setGoogleDriveConnected(hasValidStoredGoogleDriveAuth());
      setGoogleEmail(readStoredGoogleDriveAuth()?.email || null);
    };

    window.addEventListener(GOOGLE_DRIVE_AUTH_EVENT, syncGoogleDriveStatus);
    return () => {
      window.removeEventListener(
        GOOGLE_DRIVE_AUTH_EVENT,
        syncGoogleDriveStatus,
      );
    };
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleUpload = async (files, isFolder = false) => {
    let targetFolderId = currentFolder || "";

    if (isFolder && files.length > 0) {
      try {
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

    for (let file of files) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 500MB limit and was not uploaded`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", targetFolderId);
      formData.append("uploadToGoogle", "false");

      try {
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

        let uploadedToGoogleDrive = false;

        if (response.status === 201 || response.status === 200) {
          if (googleDriveConnected) {
            try {
              const googleAuth = await ensureGoogleDriveAccessToken({
                interactive: false,
              });
              await uploadFileToGoogleDrive(file, googleAuth.accessToken);
              uploadedToGoogleDrive = true;
            } catch (googleError) {
              console.error("Google Drive upload error:", googleError);
              toast.warning(
                `${file.name} reached My Drive, but Google Drive upload failed.`,
              );
            }
          }

          toast.success(
            uploadedToGoogleDrive
              ? `Uploaded: ${file.name} (also saved to Google Drive)`
              : `Uploaded: ${file.name}`,
          );

          if (onUploadComplete) {
            onUploadComplete();
          }

          window.dispatchEvent(new Event("storage-updated"));
        }
      } catch (error) {
        console.error("Upload error:", error);
        if (error.response) {
          toast.error(
            `Failed to upload ${file.name}: ${error.response.data.error || error.message}`,
          );
        } else if (error.request) {
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
    e.target.value = "";
  };

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    handleUpload(files, true);
    e.target.value = "";
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
          {googleDriveConnected && (
            <span
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              title={
                googleEmail
                  ? `Google Drive ready for ${googleEmail}`
                  : "Google Drive ready"
              }
            ></span>
          )}
        </button>
        {googleDriveConnected && (
          <div className="absolute top-full left-0 mt-1 text-xs text-green-600 whitespace-nowrap">
            Google Drive ready
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
