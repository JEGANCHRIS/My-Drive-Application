import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import FileGrid from "./components/FileGrid";
import UploadButton from "./components/UploadButton";
import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";
import ContextMenu from "./components/ContextMenu";
import PreviewModal from "./components/PreviewModal";
import InfoModal from "./components/InfoModal";
import Bin from "./components/Bin";
import SettingsModal from "./components/SettingsModal";
import ToastConfig from "./components/ToastConfig";
import ConfirmationModal from "./components/ConfirmationModal";
import InputModal from "./components/InputModal";
import Dashboard from "./pages/Dashboard";
import EditProfileModal from "./components/EditProfileModal";
import FormSection from "./components/FormSection";
import Workflow from "./components/Workflow";
import "./App.css";

// Helper to get auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function App() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState("my-drive");
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]); // Track folder navigation path
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [infoItem, setInfoItem] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [showBin, setShowBin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [binRefreshKey, setBinRefreshKey] = useState(0);

  // Modal states
  const [confirmModal, setConfirmModal] = useState(null);
  const [renameModal, setRenameModal] = useState(null);
  const [shareEmailModal, setShareEmailModal] = useState(null);
  const [shareDaysModal, setShareDaysModal] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const handleDashboardClick = () => {
    setShowDashboard(true);
  };

  const handleEditProfileClick = () => {
    setShowEditProfile(true);
  };

  const handleProfileUpdate = (updatedUser) => {
    // Update localStorage with new user data
    localStorage.setItem("user", JSON.stringify(updatedUser));
    // Force re-render by updating state
    setCurrentView(currentView);
  };

  const currentUser = user || {
    id: "anonymous",
    email: "anonymous@example.com",
    name: "Anonymous User",
  };

  // Navigate into a folder
  const navigateToFolder = (folder) => {
    setCurrentFolder(folder._id);
    setFolderPath((prev) => [...prev, { id: folder._id, name: folder.name }]);
    setSelectMode(false);
    setSelectedItems([]);
  };

  // Navigate back to a specific folder in the path
  const navigateToPath = (index) => {
    if (index === -1) {
      // Go to root
      setCurrentFolder(null);
      setFolderPath([]);
    } else {
      // Go to specific folder in path
      const targetFolder = folderPath[index];
      setCurrentFolder(targetFolder.id);
      setFolderPath((prev) => prev.slice(0, index + 1));
    }
    setSelectMode(false);
    setSelectedItems([]);
  };

  // Reset folder navigation (called when clicking sidebar items)
  const resetFolderNavigation = () => {
    setCurrentFolder(null);
    setFolderPath([]);
    setSelectMode(false);
    setSelectedItems([]);
  };

  const fetchContents = async () => {
    setLoading(true);
    try {
      // If we're inside a folder, fetch its contents regardless of currentView
      if (currentFolder) {
        const filesResponse = await fetch(
          `https://my-drive-application.onrender.com/api/files?folderId=${currentFolder}&isDeleted=false`,
          { headers: getAuthHeaders() },
        );
        const filesData = await filesResponse.json();
        setFiles(Array.isArray(filesData) ? filesData : []);
        setAllFiles(Array.isArray(filesData) ? filesData : []);

        const foldersResponse = await fetch(
          `https://my-drive-application.onrender.com/api/folders?parentFolderId=${currentFolder}&isDeleted=false`,
          { headers: getAuthHeaders() },
        );
        const foldersData = await foldersResponse.json();
        setFolders(Array.isArray(foldersData) ? foldersData : []);
      } else if (currentView === "bin") {
        // Fetch deleted items for bin
        const filesResponse = await fetch(
          `https://my-drive-application.onrender.com/api/files?isDeleted=true`,
          { headers: getAuthHeaders() },
        );
        const filesData = await filesResponse.json();
        // Ensure data is an array
        setFiles(Array.isArray(filesData) ? filesData : []);

        const foldersResponse = await fetch(
          `https://my-drive-application.onrender.com/api/folders?isDeleted=true`,
          { headers: getAuthHeaders() },
        );
        const foldersData = await foldersResponse.json();
        setFolders(Array.isArray(foldersData) ? foldersData : []);
      } else if (currentView === "starred") {
        // Fetch starred items
        const response = await fetch(
          `https://my-drive-application.onrender.com/api/files/starred`,
          {
            headers: getAuthHeaders(),
          },
        );
        const data = await response.json();
        setFiles(Array.isArray(data.files) ? data.files : []);
        setFolders(Array.isArray(data.folders) ? data.folders : []);
      } else if (currentView === "recent") {
        // Fetch recent uploads
        const response = await fetch(
          `https://my-drive-application.onrender.com/api/files/recent`,
          {
            headers: getAuthHeaders(),
          },
        );
        const data = await response.json();
        const recentFiles = Array.isArray(data)
          ? data.filter((item) => item.itemType === "file")
          : [];
        const recentFolders = Array.isArray(data)
          ? data.filter((item) => item.itemType === "folder")
          : [];
        setFiles(recentFiles);
        setFolders(recentFolders);
      } else {
        // Fetch normal drive contents
        const filesResponse = await fetch(
          `https://my-drive-application.onrender.com/api/files?folderId=${currentFolder || "null"}&isDeleted=false`,
          { headers: getAuthHeaders() },
        );
        const filesData = await filesResponse.json();
        setFiles(Array.isArray(filesData) ? filesData : []);
        setAllFiles(Array.isArray(filesData) ? filesData : []);

        const foldersResponse = await fetch(
          `https://my-drive-application.onrender.com/api/folders?parentFolderId=${currentFolder || "null"}&isDeleted=false`,
          { headers: getAuthHeaders() },
        );
        const foldersData = await foldersResponse.json();
        setFolders(Array.isArray(foldersData) ? foldersData : []);
      }
    } catch (error) {
      console.error("Error fetching contents:", error);
      // Set empty arrays on error
      setFiles([]);
      setFolders([]);
      setAllFiles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContents();
  }, [currentFolder, currentView]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    if (results) {
      // Show search results
      const searchFiles = results.filter((item) => item.type === "file");
      const searchFolders = results.filter((item) => item.type === "folder");
      setFiles(searchFiles);
      setFolders(searchFolders);
    } else {
      // Reset to normal view
      fetchContents();
    }
  };

  const handleRightClick = (e, item, type) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item, type });
  };

  const handlePreview = async (item, type) => {
    try {
      const response = await fetch(
        `https://my-drive-application.onrender.com/api/${type}s/preview/${item._id}`,
        { headers: getAuthHeaders() },
      );
      const data = await response.json();
      setPreviewFile({
        ...data,
        _id: item._id,
        type: type,
        originalName: item.originalName || item.name,
      });
    } catch (error) {
      console.error("Error previewing:", error);
      toast.error("Preview not available for this file type");
    }
  };

  const handleDownload = async (item, type) => {
    window.open(
      `https://my-drive-application.onrender.com/api/${type}s/download/${item._id}`,
      "_blank",
    );
  };

  const handleMoveToBin = (item, type) => {
    setConfirmModal({
      title: "Move to Bin",
      message: `Are you sure you want to move "${item.originalName || item.name}" to bin?`,
      danger: false,
      confirmText: "Move to Bin",
      onConfirm: async () => {
        try {
          await fetch(
            `https://my-drive-application.onrender.com/api/${type}s/move-to-bin/${item._id}`,
            { method: "PATCH", headers: getAuthHeaders() },
          );
          fetchContents();
          toast.success(`${item.originalName || item.name} moved to bin`);
        } catch (error) {
          console.error("Error moving to bin:", error);
          toast.error("Failed to move to bin");
        }
      },
    });
  };

  const handleStarToggle = async (item, type) => {
    try {
      await fetch(
        `https://my-drive-application.onrender.com/api/${type}s/star/${item._id}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );
      fetchContents();
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  const handleRename = (item, type) => {
    setRenameModal({ item, type });
  };

  const handleRenameSubmit = async (newName) => {
    if (!renameModal) return;

    const { item, type } = renameModal;

    if (newName && newName !== (item.originalName || item.name)) {
      try {
        await fetch(
          `https://my-drive-application.onrender.com/api/${type}s/rename/${item._id}`,
          {
            method: "PATCH",
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              newName,
              userEmail: currentUser.email,
              userName: currentUser.name,
            }),
          },
        );
        fetchContents();
        toast.success("Renamed successfully!");
      } catch (error) {
        console.error("Error renaming:", error);
        toast.error("Failed to rename");
      }
    }
  };

  const handleCopy = async (item, type) => {
    try {
      await fetch(
        `https://my-drive-application.onrender.com/api/${type}s/copy/${item._id}`,
        {
          method: "POST",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: currentUser.email,
            userName: currentUser.name,
          }),
        },
      );
      fetchContents();
      toast.success("Copy created successfully!");
    } catch (error) {
      console.error("Error copying:", error);
      toast.error("Failed to create copy");
    }
  };

  const handleSummarize = async (item, type) => {
    if (type === "folder") {
      toast.warning("Summarization is only available for files");
      return;
    }

    try {
      const response = await fetch(
        `https://my-drive-application.onrender.com/api/summarize/summarize/${item._id}`,
        { headers: getAuthHeaders() },
      );
      const data = await response.json();

      toast.success(
        <div>
          <strong>Summary of {data.fileName}</strong>
          <p style={{ marginTop: "8px" }}>
            {data.summary.substring(0, 500)}
            {data.summary.length > 500 ? "..." : ""}
          </p>
          <p style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
            Word count: {data.wordCount} | Character count: {data.charCount}
          </p>
        </div>,
        { autoClose: 8000 },
      );
    } catch (error) {
      console.error("Error summarizing:", error);
      toast.error("Failed to summarize file");
    }
  };

  const handleShare = (item, type) => {
    setShareEmailModal({ item, type });
  };

  const handleShareEmailSubmit = (email) => {
    if (!shareEmailModal) return;

    const { item, type } = shareEmailModal;
    setShareDaysModal({ item, type, email });
  };

  const handleShareDaysSubmit = async (days) => {
    if (!shareDaysModal) return;

    const { item, type, email } = shareDaysModal;
    const daysNum = parseInt(days) || 7;

    try {
      const response = await fetch(
        `https://my-drive-application.onrender.com/api/${type}s/share/${item._id}`,
        {
          method: "POST",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            sharedWithEmail: email,
            expiresAt: new Date(Date.now() + daysNum * 24 * 60 * 60 * 1000),
            userEmail: currentUser.email,
            userName: currentUser.name,
            userId: currentUser.id,
          }),
        },
      );
      const data = await response.json();

      navigator.clipboard.writeText(data.shareUrl);
      toast.success(
        <div>
          <p>Share link created and copied to clipboard!</p>
          <p
            style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "#666",
              wordBreak: "break-all",
            }}
          >
            Link: {data.shareUrl}
          </p>
        </div>,
        { autoClose: 6000 },
      );
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to create share link");
    }
  };

  const handleShowInfo = (item, type) => {
    setInfoItem({ item, type });
  };

  const handleRestoreFromBin = async (id, type) => {
    try {
      await fetch(
        `https://my-drive-application.onrender.com/api/${type}s/restore/${id}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );
      setBinRefreshKey((prev) => prev + 1);
      fetchContents();
      toast.success("Item restored successfully!");
    } catch (error) {
      console.error("Error restoring:", error);
      toast.error("Failed to restore");
    }
  };

  const handlePermanentDelete = async (id, type) => {
    try {
      await fetch(
        `https://my-drive-application.onrender.com/api/${type}s/permanent/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );
      setBinRefreshKey((prev) => prev + 1);
      fetchContents();
      toast.success("Item permanently deleted");
    } catch (error) {
      console.error("Error deleting permanently:", error);
      toast.error("Failed to delete permanently");
    }
  };

  const handleEmptyBin = () => {
    setConfirmModal({
      title: "Empty Bin",
      message:
        "Are you sure you want to permanently delete all items in bin? This action cannot be undone!",
      danger: true,
      confirmText: "Empty Bin",
      onConfirm: async () => {
        try {
          await fetch(
            `https://my-drive-application.onrender.com/api/files/bin/empty`,
            {
              method: "DELETE",
              headers: getAuthHeaders(),
            },
          );
          setBinRefreshKey((prev) => prev + 1);
          fetchContents();
          toast.success("Bin emptied successfully");
        } catch (error) {
          console.error("Error emptying bin:", error);
          toast.error("Failed to empty bin");
        }
      },
    });
  };

  const handleUploadClick = () => {
    // Trigger upload button click
    const uploadBtn = document.querySelector(".upload-btn");
    if (uploadBtn) uploadBtn.click();
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedItems([]);
  };

  const toggleItemSelection = (item, type) => {
    const key = `${type}-${item._id}`;
    setSelectedItems((prev) => {
      const newSelection = prev.includes(key)
        ? prev.filter((i) => i !== key)
        : [...prev, key];

      // Auto-enable select mode when first item is selected
      if (!selectMode && newSelection.length > 0) {
        setSelectMode(true);
      }
      // Auto-disable select mode when last item is deselected
      if (selectMode && newSelection.length === 0) {
        setSelectMode(false);
      }

      return newSelection;
    });
  };

  const selectAllItems = () => {
    const allKeys = [
      ...files.map((f) => `file-${f._id}`),
      ...folders.map((f) => `folder-${f._id}`),
    ];
    setSelectedItems(allKeys);
  };

  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.warning("No items selected");
      return;
    }

    setConfirmModal({
      title: "Delete Selected Items",
      message: `Are you sure you want to move ${selectedItems.length} item${selectedItems.length > 1 ? "s" : ""} to bin?`,
      danger: true,
      confirmText: "Delete Selected",
      onConfirm: async () => {
        let successCount = 0;
        let errorCount = 0;

        for (const key of selectedItems) {
          const [type, id] = key.split("-");
          try {
            await fetch(
              `https://my-drive-application.onrender.com/api/${type}s/move-to-bin/${id}`,
              { method: "PATCH", headers: getAuthHeaders() },
            );
            successCount++;
          } catch (error) {
            console.error(`Error moving ${key} to bin:`, error);
            errorCount++;
          }
        }

        fetchContents();
        setSelectMode(false);
        setSelectedItems([]);

        if (errorCount === 0) {
          toast.success(
            `${successCount} item${successCount > 1 ? "s" : ""} moved to bin`,
          );
        } else {
          toast.warning(`${successCount} moved, ${errorCount} failed`);
        }
      },
    });
  };

  // Render different views
  const renderContent = () => {
    if (showDashboard) {
      return <Dashboard onEditProfile={handleEditProfileClick} />;
    }

    if (currentView === "form") {
      return <FormSection onRefresh={fetchContents} />;
    }

    if (currentView === "workflow") {
      return <Workflow />;
    }

    if (currentView === "bin") {
      return (
        <Bin
          key={binRefreshKey}
          files={files}
          folders={folders}
          onRestore={handleRestoreFromBin}
          onDeletePermanently={handlePermanentDelete}
          onEmptyBin={handleEmptyBin}
        />
      );
    }

    return (
      <>
        <div className="header">
          <SearchBar
            files={allFiles}
            folders={folders}
            onSearchResult={handleSearchResults}
          />
          <FilterBar files={allFiles} setFiles={setFiles} allFiles={allFiles} />
          {selectMode && selectedItems.length > 0 && (
            <button
              className="delete-selected-btn"
              onClick={handleDeleteSelected}
            >
              Delete Selected ({selectedItems.length})
            </button>
          )}
          <UploadButton
            currentFolder={currentFolder}
            currentUser={currentUser}
            onUploadComplete={fetchContents}
          />
        </div>

        {/* Breadcrumb Navigation */}
        {folderPath.length > 0 && (
          <div className="breadcrumb-nav">
            <button
              className="breadcrumb-item root"
              onClick={() => navigateToPath(-1)}
            >
              {currentView === "recent"
                ? "Recently Uploaded"
                : currentView === "starred"
                  ? "Starred"
                  : currentView === "shared"
                    ? "Shared with me"
                    : "My Drive"}
            </button>
            <span className="breadcrumb-separator">/</span>
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <button
                  className="breadcrumb-item"
                  onClick={() => navigateToPath(index)}
                >
                  {folder.name}
                </button>
                {index < folderPath.length - 1 && (
                  <span className="breadcrumb-separator">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <FileGrid
          files={files}
          folders={folders}
          loading={loading}
          currentView={currentView}
          selectMode={selectMode}
          selectedItems={selectedItems}
          onRightClick={handleRightClick}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onMoveToBin={handleMoveToBin}
          onRefresh={fetchContents}
          onStarToggle={handleStarToggle}
          onRename={handleRename}
          onCopy={handleCopy}
          onSummarize={handleSummarize}
          onShare={handleShare}
          onShowInfo={handleShowInfo}
          onSelectToggle={toggleItemSelection}
          onSelectAll={selectAllItems}
          onDeselectAll={deselectAllItems}
          onNavigateToFolder={navigateToFolder}
        />
      </>
    );
  };

  return (
    <div className="app">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setCurrentFolder={setCurrentFolder}
        onResetFolderNavigation={resetFolderNavigation}
        onUploadClick={handleUploadClick}
        onSettingsClick={handleSettingsClick}
        onLogoutClick={handleLogout}
        onDashboardClick={handleDashboardClick}
        onCloseDashboard={() => setShowDashboard(false)}
      />
      <div className="main-content">{renderContent()}</div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          type={contextMenu.type}
          onClose={() => setContextMenu(null)}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onMoveToBin={handleMoveToBin}
          onRename={handleRename}
          onCopy={handleCopy}
          onSummarize={handleSummarize}
          onShare={handleShare}
          onShowInfo={handleShowInfo}
        />
      )}

      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      )}

      {infoItem && (
        <InfoModal
          item={infoItem.item}
          type={infoItem.type}
          onClose={() => setInfoItem(null)}
        />
      )}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          currentUser={currentUser}
        />
      )}

      <ToastConfig />

      <ConfirmationModal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={confirmModal?.onConfirm || (() => {})}
        title={confirmModal?.title || ""}
        message={confirmModal?.message || ""}
        confirmText={confirmModal?.confirmText || "Confirm"}
        danger={confirmModal?.danger || false}
      />

      <InputModal
        isOpen={!!renameModal}
        onClose={() => setRenameModal(null)}
        onSubmit={handleRenameSubmit}
        title="Rename Item"
        label="Enter new name:"
        defaultValue={
          renameModal?.item?.originalName || renameModal?.item?.name || ""
        }
        submitText="Rename"
      />

      <InputModal
        isOpen={!!shareEmailModal}
        onClose={() => setShareEmailModal(null)}
        onSubmit={handleShareEmailSubmit}
        title="Share Item"
        label="Enter email to share with (optional):"
        placeholder="email@example.com"
        submitText="Next"
      />

      <InputModal
        isOpen={!!shareDaysModal}
        onClose={() => setShareDaysModal(null)}
        onSubmit={handleShareDaysSubmit}
        title="Share Expiration"
        label="Expires in (days):"
        defaultValue="7"
        submitText="Share"
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentUser={user}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}

export default App;
