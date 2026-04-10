import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FiFile,
  FiFolder,
  FiStar,
  FiMoreVertical,
  FiImage,
  FiVideo,
  FiMusic,
  FiFileText,
  FiArchive,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

function FileGrid({
  files,
  folders,
  loading,
  currentView,
  selectMode,
  selectedItems,
  onRightClick,
  onPreview,
  onDownload,
  onMoveToBin,
  onRefresh,
  onStarToggle,
  onRename,
  onCopy,
  onSummarize,
  onShare,
  onShowInfo,
  onSelectToggle,
  onSelectAll,
  onDeselectAll,
  onNavigateToFolder,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) return <FiImage size={40} />;
    if (fileType?.startsWith("video/")) return <FiVideo size={40} />;
    if (fileType?.startsWith("audio/")) return <FiMusic size={40} />;
    if (fileType?.includes("pdf") || fileType?.includes("text"))
      return <FiFileText size={40} />;
    if (fileType?.includes("zip") || fileType?.includes("rar"))
      return <FiArchive size={40} />;
    return <FiFile size={40} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const DropdownMenu = ({ item, type, onClose, position }) => {
    const dropdownContent = (
      <div
        className="dropdown-menu"
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div
          className="dropdown-item"
          onClick={() => {
            onSelectToggle(item, type);
            onClose();
          }}
        >
          Select
        </div>
        <div
          className="dropdown-item"
          onClick={() => {
            onRename(item, type);
            onClose();
          }}
        >
          Rename
        </div>
        <div
          className="dropdown-item"
          onClick={() => {
            onDownload(item, type);
            onClose();
          }}
        >
          Download
        </div>
        <div
          className="dropdown-item"
          onClick={() => {
            onCopy(item, type);
            onClose();
          }}
        >
          Make a copy
        </div>
        <div
          className="dropdown-item"
          onClick={() => {
            onSummarize(item, type);
            onClose();
          }}
        >
          Summarize
        </div>
        <div
          className="dropdown-item"
          onClick={() => {
            onShare(item, type);
            onClose();
          }}
        >
          Share
        </div>
        <div
          className="dropdown-item"
          onClick={() => {
            onShowInfo(item, type);
            onClose();
          }}
        >
          Info
        </div>
        <div
          className="dropdown-item danger"
          onClick={() => {
            onMoveToBin(item, type);
            onClose();
          }}
        >
          Move to bin
        </div>
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="file-grid">
      {selectMode && (
        <div className="selection-bar">
          <button className="select-all-btn" onClick={onSelectAll}>
            <FiCheckSquare size={16} /> Select All
          </button>
          <button className="deselect-all-btn" onClick={onDeselectAll}>
            <FiSquare size={16} /> Deselect All
          </button>
        </div>
      )}

      {folders.map((folder) => {
        const isSelected = selectedItems.includes(`folder-${folder._id}`);
        return (
          <div
            key={folder._id}
            className={`file-card ${selectMode ? "selectable" : ""} ${isSelected ? "selected" : ""}`}
            onContextMenu={(e) => onRightClick(e, folder, "folder")}
            onDoubleClick={() => onNavigateToFolder(folder)}
            onClick={
              selectMode
                ? (e) => {
                    e.stopPropagation();
                    onSelectToggle(folder, "folder");
                  }
                : undefined
            }
          >
            {selectMode && (
              <div className="selection-checkbox">
                {isSelected ? (
                  <FiCheckSquare size={20} color="#1E90FF" />
                ) : (
                  <FiSquare size={20} />
                )}
              </div>
            )}

            <button
              className="star-button"
              onClick={(e) => {
                e.stopPropagation();
                onStarToggle(folder, "folder");
              }}
            >
              <FiStar
                size={20}
                fill={folder.isStarred ? "#FFD700" : "none"}
                color={folder.isStarred ? "#FFD700" : "#999"}
              />
            </button>

            <div className="file-icon">
              <FiFolder size={48} color="#FFD700" />
            </div>
            <div className="file-name">{folder.name}</div>

            <div className="file-info">
              <span>{folder.contentsCount || 0} items</span>
              <span>
                {formatDistanceToNow(new Date(folder.lastModified))} ago
              </span>
            </div>

            {!selectMode && (
              <button
                className="three-dots"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const menuWidth = 200;
                  // Keep menu within viewport bounds
                  let leftPos = rect.right - menuWidth;
                  if (leftPos < 10) leftPos = 10; // Prevent going off left edge
                  if (leftPos + menuWidth > window.innerWidth) {
                    leftPos = window.innerWidth - menuWidth - 10;
                  }
                  setMenuPosition({
                    top: rect.bottom + 8,
                    left: leftPos,
                  });
                  setOpenMenuId(openMenuId === folder._id ? null : folder._id);
                }}
              >
                <FiMoreVertical />
              </button>
            )}

            {openMenuId === folder._id && (
              <DropdownMenu
                item={folder}
                type="folder"
                onClose={() => setOpenMenuId(null)}
                position={menuPosition}
              />
            )}
          </div>
        );
      })}

      {files.map((file) => {
        const isSelected = selectedItems.includes(`file-${file._id}`);
        return (
          <div
            key={file._id}
            className={`file-card ${selectMode ? "selectable" : ""} ${isSelected ? "selected" : ""}`}
            onContextMenu={(e) => onRightClick(e, file, "file")}
            onDoubleClick={
              selectMode ? undefined : () => onPreview(file, "file")
            }
            onClick={
              selectMode
                ? (e) => {
                    e.stopPropagation();
                    onSelectToggle(file, "file");
                  }
                : undefined
            }
          >
            {selectMode && (
              <div className="selection-checkbox">
                {isSelected ? (
                  <FiCheckSquare size={20} color="#1E90FF" />
                ) : (
                  <FiSquare size={20} />
                )}
              </div>
            )}

            <button
              className="star-button"
              onClick={(e) => {
                e.stopPropagation();
                onStarToggle(file, "file");
              }}
            >
              <FiStar
                size={20}
                fill={file.isStarred ? "#FFD700" : "none"}
                color={file.isStarred ? "#FFD700" : "#999"}
              />
            </button>

            <div className="file-icon">{getFileIcon(file.type)}</div>
            <div className="file-name">{file.originalName}</div>

            <div className="file-info">
              <span>{formatFileSize(file.size)}</span>
              <span>
                Modified {formatDistanceToNow(new Date(file.lastModified))} ago
              </span>
            </div>

            {!selectMode && (
              <button
                className="three-dots"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const menuWidth = 200;
                  // Keep menu within viewport bounds
                  let leftPos = rect.right - menuWidth;
                  if (leftPos < 10) leftPos = 10; // Prevent going off left edge
                  if (leftPos + menuWidth > window.innerWidth) {
                    leftPos = window.innerWidth - menuWidth - 10;
                  }
                  setMenuPosition({
                    top: rect.bottom + 8,
                    left: leftPos,
                  });
                  setOpenMenuId(openMenuId === file._id ? null : file._id);
                }}
              >
                <FiMoreVertical />
              </button>
            )}

            {openMenuId === file._id && (
              <DropdownMenu
                item={file}
                type="file"
                onClose={() => setOpenMenuId(null)}
                position={menuPosition}
              />
            )}
          </div>
        );
      })}

      {files.length === 0 && folders.length === 0 && (
        <div className="empty-state">
          <p>No files or folders found</p>
        </div>
      )}
    </div>
  );
}

export default FileGrid;
