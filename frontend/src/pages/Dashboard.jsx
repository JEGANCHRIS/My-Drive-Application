import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiEdit2,
  FiCalendar,
  FiHardDrive,
  FiActivity,
  FiFile,
  FiFolder,
  FiClock,
  FiStar,
  FiTrash2,
  FiShare2,
  FiLock,
  FiShield,
  FiUploadCloud,
  FiDownload,
  FiEye,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";

function Dashboard({ onEditProfile }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storageStats, setStorageStats] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [fileTypeBreakdown, setFileTypeBreakdown] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchUserProfile();
    fetchStorageStats();
    fetchActivityStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://my-drive-application.onrender.com/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://my-drive-application.onrender.com/api/storage/usage",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStorageStats(data);
        fetchFileTypeBreakdown();
      }
    } catch (error) {
      console.error("Error fetching storage stats:", error);
    }
  };

  const fetchFileTypeBreakdown = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://my-drive-application.onrender.com/api/files?isDeleted=false",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const files = await response.json();
        const breakdown = {};
        files.forEach((file) => {
          const ext = file.extension || "Unknown";
          if (!breakdown[ext]) {
            breakdown[ext] = { count: 0, size: 0 };
          }
          breakdown[ext].count++;
          breakdown[ext].size += file.size || 0;
        });
        setFileTypeBreakdown(breakdown);
      }
    } catch (error) {
      console.error("Error fetching file types:", error);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Get starred items count
      const starredRes = await fetch(
        "https://my-drive-application.onrender.com/api/files/starred",
        { headers },
      );
      const starredData = await starredRes.json();
      const starredCount =
        (starredData.files?.length || 0) + (starredData.folders?.length || 0);

      // Get bin items count
      const binFilesRes = await fetch(
        "https://my-drive-application.onrender.com/api/files?isDeleted=true",
        { headers },
      );
      const binFiles = await binFilesRes.json();

      const binFoldersRes = await fetch(
        "https://my-drive-application.onrender.com/api/folders?isDeleted=true",
        { headers },
      );
      const binFolders = await binFoldersRes.json();
      const binCount =
        (Array.isArray(binFiles) ? binFiles.length : 0) +
        (Array.isArray(binFolders) ? binFolders.length : 0);

      setActivityStats({
        starred: starredCount,
        inBin: binCount,
        totalUploads: storageStats?.fileCount || 0,
      });
    } catch (error) {
      console.error("Error fetching activity stats:", error);
    }
  };

  const formatStorage = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysAgo = (date) => {
    if (!date) return "N/A";
    const days = Math.floor(
      (new Date() - new Date(date)) / (1000 * 60 * 60 * 24),
    );
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const getFileTypeIcon = (ext) => {
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
    const docExts = [".pdf", ".doc", ".docx", ".txt", ".md"];
    const videoExts = [".mp4", ".avi", ".mov", ".mkv"];
    const audioExts = [".mp3", ".wav", ".ogg"];
    const archiveExts = [".zip", ".rar", ".7z"];

    const lowerExt = ext?.toLowerCase();
    if (imageExts.includes(lowerExt)) return "🖼️";
    if (docExts.includes(lowerExt)) return "📄";
    if (videoExts.includes(lowerExt)) return "🎥";
    if (audioExts.includes(lowerExt)) return "🎵";
    if (archiveExts.includes(lowerExt)) return "📦";
    return "📁";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {userProfile?.name || "User"}!
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="action-btn" onClick={onEditProfile}>
            <FiEdit2 /> Edit Profile
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Profile Overview Card */}
        <div className="profile-overview-card">
          <div className="profile-avatar">
            {userProfile?.avatar ? (
              <img
                src={
                  userProfile.avatar.startsWith("http")
                    ? userProfile.avatar
                    : `https://my-drive-application.onrender.com${userProfile.avatar}`
                }
                alt="Profile"
                className="avatar-img"
              />
            ) : (
              <FiUser size={48} />
            )}
          </div>
          <div className="profile-details">
            <h2>{userProfile?.name || "No Name Set"}</h2>
            <div className="profile-meta">
              <span className="meta-item">
                <FiMail /> {userProfile?.email || "No Email"}
              </span>
              {userProfile?.phone && (
                <span className="meta-item">
                  <FiPhone /> {userProfile.phone}
                </span>
              )}
            </div>
            {userProfile?.bio && (
              <p className="profile-bio">{userProfile.bio}</p>
            )}
            {(userProfile?.streetAddress ||
              userProfile?.city ||
              userProfile?.state ||
              userProfile?.country) && (
              <div className="profile-address">
                <FiMapPin />
                <span>
                  {[
                    userProfile.streetAddress,
                    userProfile.city,
                    userProfile.state,
                    userProfile.zipCode,
                    userProfile.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
            <div className="profile-stats-row">
              <div className="stat-badge">
                <FiCalendar />
                <span>Joined {getDaysAgo(userProfile?.createdAt)}</span>
              </div>
              <div className="stat-badge">
                <FiActivity />
                <span>Last login: {getDaysAgo(userProfile?.lastLogin)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon storage">
              <FiHardDrive />
            </div>
            <div className="stat-info">
              <h3>Storage Used</h3>
              <p className="stat-value">
                {storageStats ? formatStorage(storageStats.bytes) : "0 Bytes"}
              </p>
              <p className="stat-detail">
                of {storageStats ? formatStorage(storageStats.limit) : "5 GB"}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon files">
              <FiFile />
            </div>
            <div className="stat-info">
              <h3>Total Files</h3>
              <p className="stat-value">{storageStats?.fileCount || 0}</p>
              <p className="stat-detail">files uploaded</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon starred">
              <FiStar />
            </div>
            <div className="stat-info">
              <h3>Starred Items</h3>
              <p className="stat-value">{activityStats?.starred || 0}</p>
              <p className="stat-detail">favorite files & folders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bin">
              <FiTrash2 />
            </div>
            <div className="stat-info">
              <h3>In Bin</h3>
              <p className="stat-value">{activityStats?.inBin || 0}</p>
              <p className="stat-detail">items ready for deletion</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon available">
              <FiHardDrive />
            </div>
            <div className="stat-info">
              <h3>Available Space</h3>
              <p className="stat-value">
                {storageStats
                  ? formatStorage(storageStats.limit - storageStats.bytes)
                  : "5 GB"}
              </p>
              <p className="stat-detail">remaining storage</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon file-types">
              <FiFolder />
            </div>
            <div className="stat-info">
              <h3>File Types</h3>
              <p className="stat-value">
                {fileTypeBreakdown ? Object.keys(fileTypeBreakdown).length : 0}
              </p>
              <p className="stat-detail">different formats</p>
            </div>
          </div>
        </div>

        {/* Storage Progress */}
        {storageStats && (
          <div className="storage-progress-card">
            <div className="card-header">
              <h3>
                <FiUploadCloud /> Storage Usage
              </h3>
              <span className="percentage-badge">
                {((storageStats.bytes / storageStats.limit) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min((storageStats.bytes / storageStats.limit) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <div className="progress-details">
              <span>{formatStorage(storageStats.bytes)} used</span>
              <span>{formatStorage(storageStats.limit)} total</span>
              <span>
                {formatStorage(storageStats.limit - storageStats.bytes)} free
              </span>
            </div>
          </div>
        )}

        {/* File Type Breakdown */}
        {fileTypeBreakdown && Object.keys(fileTypeBreakdown).length > 0 && (
          <div className="file-breakdown-card">
            <div className="card-header">
              <h3>
                <FiFolder /> File Type Breakdown
              </h3>
              <span className="count-badge">
                {Object.keys(fileTypeBreakdown).length} types
              </span>
            </div>
            <div className="file-types-grid">
              {Object.entries(fileTypeBreakdown)
                .sort((a, b) => b[1].size - a[1].size)
                .slice(0, 8)
                .map(([ext, data]) => (
                  <div key={ext} className="file-type-item">
                    <div className="file-type-icon">{getFileTypeIcon(ext)}</div>
                    <div className="file-type-info">
                      <span className="file-type-name">
                        {ext.toUpperCase()}
                      </span>
                      <span className="file-type-detail">
                        {data.count} file{data.count !== 1 ? "s" : ""} •{" "}
                        {formatStorage(data.size)}
                      </span>
                    </div>
                    <div className="file-type-bar">
                      <div
                        className="file-type-bar-fill"
                        style={{
                          width: `${(data.size / (storageStats?.bytes || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Account Security */}
        <div className="security-card">
          <div className="card-header">
            <h3>
              <FiShield /> Account Security
            </h3>
          </div>
          <div className="security-info">
            <div className="security-item">
              <div className="security-icon success">
                <FiCheck />
              </div>
              <div className="security-details">
                <h4>Password Protection</h4>
                <p>Your account is secured with a password</p>
              </div>
            </div>
            <div className="security-item">
              <div className="security-icon success">
                <FiActivity />
              </div>
              <div className="security-details">
                <h4>Last Login</h4>
                <p>
                  {userProfile?.lastLogin
                    ? formatDate(userProfile.lastLogin)
                    : "Never"}
                </p>
              </div>
            </div>
            <div className="security-item">
              <div className="security-icon info">
                <FiShield />
              </div>
              <div className="security-details">
                <h4>Account Created</h4>
                <p>
                  {userProfile?.createdAt
                    ? formatDate(userProfile.createdAt)
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="account-details-card">
          <div className="card-header">
            <h3>
              <FiUser /> Account Details
            </h3>
          </div>
          <div className="details-grid">
            <div className="detail-item">
              <label>Full Name</label>
              <span className="detail-value">
                {userProfile?.name || "Not set"}
              </span>
            </div>
            <div className="detail-item">
              <label>Email Address</label>
              <span className="detail-value">
                {userProfile?.email || "Not set"}
              </span>
            </div>
            <div className="detail-item">
              <label>Phone Number</label>
              <span className="detail-value">
                {userProfile?.phone || "Not provided"}
              </span>
            </div>
            <div className="detail-item">
              <label>Bio</label>
              <span className="detail-value">
                {userProfile?.bio || "No bio yet"}
              </span>
            </div>
            <div className="detail-item">
              <label>Street Address</label>
              <span className="detail-value">
                {userProfile?.streetAddress || "Not provided"}
              </span>
            </div>
            <div className="detail-item">
              <label>City</label>
              <span className="detail-value">
                {userProfile?.city || "Not provided"}
              </span>
            </div>
            <div className="detail-item">
              <label>State/Province</label>
              <span className="detail-value">
                {userProfile?.state || "Not provided"}
              </span>
            </div>
            <div className="detail-item">
              <label>Country</label>
              <span className="detail-value">
                {userProfile?.country || "Not provided"}
              </span>
            </div>
            <div className="detail-item">
              <label>ZIP Code</label>
              <span className="detail-value">
                {userProfile?.zipCode || "Not provided"}
              </span>
            </div>
            <div className="detail-item">
              <label>Account Status</label>
              <span className="detail-value status-active">Active</span>
            </div>
            <div className="detail-item">
              <label>Storage Limit</label>
              <span className="detail-value">
                {userProfile?.storageLimit
                  ? formatStorage(userProfile.storageLimit)
                  : "5 GB"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
