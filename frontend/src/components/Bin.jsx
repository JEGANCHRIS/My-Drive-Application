import React, { useState, useEffect } from "react";
import {
  FiTrash2,
  FiRefreshCw,
  FiDelete,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";
import { toast } from "react-toastify";

function Bin({ onRestore, onDeletePermanently, onEmptyBin }) {
  const [deletedItems, setDeletedItems] = useState({ files: [], folders: [] });
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: token ? `Bearer ${token}` : "",
      };

      const filesRes = await fetch(
        "http://localhost:5000/api/files?isDeleted=true",
        { headers },
      );
      const foldersRes = await fetch(
        "http://localhost:5000/api/folders?isDeleted=true",
        { headers },
      );

      const files = await filesRes.json();
      const folders = await foldersRes.json();

      setDeletedItems({
        files: Array.isArray(files) ? files : [],
        folders: Array.isArray(folders) ? folders : [],
      });
    } catch (error) {
      console.error("Error fetching deleted items:", error);
      setDeletedItems({ files: [], folders: [] });
    }
  };

  const handleRestore = async (id, type) => {
    await onRestore(id, type);
    fetchDeletedItems();
  };

  const handlePermanentDelete = (item, type) => {
    setConfirmDelete({
      id: item._id,
      type,
      name: item.originalName || item.name,
    });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;

    await onDeletePermanently(confirmDelete.id, confirmDelete.type);
    fetchDeletedItems();
    setConfirmDelete(null);
  };

  return (
    <div className="bin-container">
      <div className="bin-header">
        <h2>Bin</h2>
        <button className="empty-bin-btn" onClick={onEmptyBin}>
          <FiDelete /> Empty Bin
        </button>
      </div>

      <div className="deleted-items">
        {deletedItems.files.map((file) => (
          <div key={file._id} className="deleted-item">
            <span>{file.originalName}</span>
            <span>
              Deleted: {new Date(file.deletedAt).toLocaleDateString()}
            </span>
            <div className="bin-actions">
              <button onClick={() => handleRestore(file._id, "file")}>
                <FiRefreshCw /> Restore
              </button>
              <button onClick={() => handlePermanentDelete(file, "file")}>
                <FiTrash2 /> Delete Forever
              </button>
            </div>
          </div>
        ))}

        {deletedItems.folders.map((folder) => (
          <div key={folder._id} className="deleted-item">
            <span>{folder.name}</span>
            <span>
              Deleted: {new Date(folder.deletedAt).toLocaleDateString()}
            </span>
            <div className="bin-actions">
              <button onClick={() => handleRestore(folder._id, "folder")}>
                <FiRefreshCw /> Restore
              </button>
              <button onClick={() => handlePermanentDelete(folder, "folder")}>
                <FiTrash2 /> Delete Forever
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div
            className="modal confirmation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <FiAlertTriangle className="warning-icon" />
                <h3>Confirm Deletion</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setConfirmDelete(null)}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete{" "}
                <strong>"{confirmDelete?.name}"</strong>?
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#e53e3e",
                  marginTop: "12px",
                }}
              >
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteAction}>
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bin;
