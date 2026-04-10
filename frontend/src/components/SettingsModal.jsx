import React, { useState, useEffect } from "react";
import { FiX, FiUser, FiHardDrive, FiFile, FiTrash2 } from "react-icons/fi";

function SettingsModal({ onClose, currentUser }) {
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchStorageData();
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  const fetchStorageData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/storage/usage", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();
      setStorageData(data);
    } catch (error) {
      console.error("Error fetching storage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatStorage = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStoragePercentage = (used, limit) => {
    if (!used || !limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Settings</h3>
          <button onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="modal-content">
          <div className="settings-section">
            <h4>
              <FiUser /> Account Information
            </h4>
            {isLoggedIn && currentUser ? (
              <>
                <div className="settings-field">
                  <label>Name</label>
                  <p>{currentUser.name}</p>
                </div>
                <div className="settings-field">
                  <label>Email</label>
                  <p>{currentUser.email}</p>
                </div>
              </>
            ) : (
              <p className="no-account-info">
                No account information available. Please log in to view your
                details.
              </p>
            )}
          </div>

          <div className="settings-section">
            <h4>
              <FiHardDrive /> Storage
            </h4>
            {loading ? (
              <p>Loading storage information...</p>
            ) : storageData ? (
              <>
                <div className="storage-info">
                  <div className="storage-bar">
                    <div
                      className="storage-used"
                      style={{
                        width: `${getStoragePercentage(storageData.bytes, storageData.limit)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="storage-text">
                    {formatStorage(storageData.bytes)} /{" "}
                    {formatStorage(storageData.limit)} used
                  </span>
                  <span className="storage-files">
                    <FiFile size={12} /> {storageData.fileCount || 0} file
                    {(storageData.fileCount || 0) !== 1 ? "s" : ""}
                  </span>
                  <span className="storage-detail">
                    Available:{" "}
                    {formatStorage(storageData.limit - storageData.bytes)}
                  </span>
                </div>
              </>
            ) : (
              <p>Unable to load storage information</p>
            )}
          </div>

          <div className="settings-section danger">
            <h4>
              <FiTrash2 /> Danger Zone
            </h4>
            <p
              style={{
                color: "#718096",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <button
              className="settings-btn danger-btn"
              disabled={!isLoggedIn}
              onClick={() => {
                if (isLoggedIn) {
                  // Handle account deletion
                  console.log("Account deletion requested");
                  // Add your account deletion logic here
                }
              }}
            >
              {isLoggedIn
                ? "Delete Account"
                : "Delete Account (Login Required)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
