import React, { useState, useEffect } from "react";
import {
  FiHardDrive,
  FiClock,
  FiStar,
  FiTrash2,
  FiUpload,
  FiSettings,
  FiUsers,
  FiLogOut,
  FiHome,
  FiFileText,
  FiShield,
} from "react-icons/fi";
import { FileIcon } from "./Icons";

function Sidebar({
  currentView,
  setCurrentView,
  setCurrentFolder,
  onUploadClick,
  onSettingsClick,
  onLogoutClick,
  onDashboardClick,
  onCloseDashboard,
  currentUser,
}) {
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageUsedKB, setStorageUsedKB] = useState(0);
  const [storageUsedMB, setStorageUsedMB] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState("KB"); // 'KB', 'MB', or 'GB'

  // Function to calculate storage from actual files
  const calculateStorage = async () => {
    try {
      // Fetch all files from backend
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://my-drive-application.onrender.com/api/files?isDeleted=false",
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );
      const files = await response.json();

      // Make sure files is an array
      const filesArray = Array.isArray(files) ? files : [];

      // Calculate total size in bytes
      const totalBytes = filesArray.reduce(
        (sum, file) => sum + (file.size || 0),
        0,
      );

      // Convert to different units
      const totalKB = totalBytes / 1024;
      const totalMB = totalBytes / (1024 * 1024);
      const totalGB = totalBytes / (1024 * 1024 * 1024);

      // Choose appropriate unit with better thresholds
      if (totalGB >= 0.1) {
        setStorageUsed(totalGB);
        setUnit("GB");
      } else if (totalMB >= 1) {
        // Changed from 0.1 to 1
        setStorageUsedMB(totalMB);
        setUnit("MB");
      } else {
        setStorageUsedKB(totalKB);
        setUnit("KB"); // This will show 280.94 KB
      }

      setTotalFiles(filesArray.length);
      setLoading(false);

      console.log(
        `Storage: ${totalKB.toFixed(2)} KB (${totalMB.toFixed(2)} MB / ${totalGB.toFixed(4)} GB) from ${filesArray.length} files`,
      );
    } catch (error) {
      console.error("Error calculating storage:", error);
      setStorageUsed(0);
      setStorageUsedKB(0);
      setStorageUsedMB(0);
      setTotalFiles(0);
      setLoading(false);
    }
  };

  // Call calculateStorage when component mounts
  useEffect(() => {
    calculateStorage();

    // Listen for storage update events
    const handleStorageUpdate = () => {
      console.log("Storage update event received, recalculating...");
      calculateStorage();
    };

    window.addEventListener("storage-updated", handleStorageUpdate);

    // Refresh storage every 10 seconds
    const interval = setInterval(calculateStorage, 10000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage-updated", handleStorageUpdate);
    };
  }, []);

  const storageLimitGB = 5;
  const storageLimitMB = 5 * 1024;
  const storageLimitKB = 5 * 1024 * 1024;

  // Calculate total bytes for percentage
  let totalBytes = 0;
  let displayText = "";

  if (unit === "GB") {
    totalBytes = storageUsed * 1024 * 1024 * 1024;
    displayText = `${storageUsed.toFixed(2)} GB / ${storageLimitGB} GB used`;
  } else if (unit === "MB") {
    totalBytes = storageUsedMB * 1024 * 1024;
    // Round UP to 2 decimal places for better UX
    const roundedMB = storageUsedMB.toFixed(3);
    displayText = `${roundedMB} MB / ${storageLimitMB} MB used`;
  } else {
    totalBytes = storageUsedKB * 1024;
    // Round UP to 2 decimal places for better UX
    const roundedKB = Math.ceil(storageUsedKB * 100) / 100;
    displayText = `${roundedKB.toFixed(2)} KB / ${storageLimitKB} KB used`;
  }

  const limitBytes = 5 * 1024 * 1024 * 1024;
  const percentage = (totalBytes / limitBytes) * 100;

  // Get detailed size info
  const getDetailedSize = () => {
    const totalMB = totalBytes / (1024 * 1024);
    const totalKB = totalBytes / 1024;

    if (totalMB >= 1) {
      return `${totalMB.toFixed(2)} MB`;
    } else {
      return `${totalKB.toFixed(2)} KB`;
    }
  };

  return (
    <div className="sidebar">
      <button className="upload-btn-sidebar" onClick={onUploadClick}>
        <FiUpload /> New
      </button>

      <div className="sidebar-menu">
        <div
          className="sidebar-item dashboard-item"
          onClick={() => {
            onDashboardClick();
            setCurrentView("dashboard");
          }}
        >
          <FiHome /> <span>Dashboard</span>
        </div>

        <div
          className={`sidebar-item ${currentView === "my-drive" ? "active" : ""}`}
          onClick={() => {
            onCloseDashboard();
            setCurrentView("my-drive");
            setCurrentFolder(null);
          }}
        >
          <FiHardDrive /> <span>My Drive</span>
        </div>

        <div
          className={`sidebar-item ${currentView === "recent" ? "active" : ""}`}
          onClick={() => {
            onCloseDashboard();
            setCurrentView("recent");
          }}
        >
          <FiClock /> <span>Recently Uploaded</span>
        </div>

        <div
          className={`sidebar-item ${currentView === "starred" ? "active" : ""}`}
          onClick={() => {
            onCloseDashboard();
            setCurrentView("starred");
          }}
        >
          <FiStar /> <span>Starred</span>
        </div>

        <div
          className={`sidebar-item ${currentView === "bin" ? "active" : ""}`}
          onClick={() => {
            onCloseDashboard();
            setCurrentView("bin");
          }}
        >
          <FiTrash2 /> <span>Bin</span>
        </div>

        <div
          className="sidebar-item"
          onClick={() => {
            onCloseDashboard();
            setCurrentView("shared");
          }}
        >
          <FiUsers /> <span>Shared with me</span>
        </div>

        <div
          className="sidebar-item form-item"
          onClick={() => {
            onCloseDashboard();
            setCurrentView("form");
          }}
        >
          <FiFileText /> <span>Upload Form</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="storage-info">
          <div className="storage-bar">
            <div
              className="storage-used"
              style={{ width: `${Math.min(percentage, 100)}%` }}
              title={`${getDetailedSize()} used of 5 GB`}
            ></div>
          </div>

          {loading ? (
            <span>Calculating storage...</span>
          ) : (
            <>
              <span className="storage-text">{displayText}</span>
              <span className="storage-files">
                <FileIcon size={12} /> {totalFiles} file
                {totalFiles !== 1 ? "s" : ""}
              </span>
              <span className="storage-detail">Total: {getDetailedSize()}</span>
            </>
          )}
        </div>

        <div
          className="sidebar-item"
          onClick={() => {
            onCloseDashboard();
            onSettingsClick();
          }}
        >
          <FiSettings /> <span>Settings</span>
        </div>

        <div
          className="sidebar-item"
          onClick={() => {
            window.location.href =
              "https://my-drive-application.onrender.com/privacy-policy";
          }}
        >
          <FiShield /> <span>Privacy Policy</span>
        </div>

        <div
          className="sidebar-item"
          onClick={() => {
            window.location.href =
              "https://my-drive-application.onrender.com/terms";
          }}
        >
          <FiFileText /> <span>Terms of Service</span>
        </div>

        <div
          className="sidebar-item logout-btn"
          onClick={() => {
            onCloseDashboard();
            onLogoutClick();
          }}
        >
          <FiLogOut /> <span>Logout</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
