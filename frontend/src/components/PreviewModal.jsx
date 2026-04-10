import React, { useState, useEffect } from "react";
import {
  FiX,
  FiDownload,
  FiShare,
  FiAlertCircle,
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiFileText,
} from "react-icons/fi";

function PreviewModal({ file, onClose, onDownload, onShare }) {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    if (file && file.type === "file") {
      fetchContent();
    }
  }, [file]);

  const fetchContent = async () => {
    try {
      setMediaError(false);
      const response = await fetch(
        `http://localhost:5000/api/files/preview/${file._id}`,
      );
      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error("Error fetching preview:", error);
      setPreviewData({
        previewType: "error",
        message: "Failed to load preview",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMediaError = () => {
    setMediaError(true);
  };

  const getPreviewContent = () => {
    if (loading)
      return <div className="loading-preview">Loading preview...</div>;
    if (!previewData)
      return <div className="loading-preview">No preview available</div>;

    const { content, type, previewType, name, message } = previewData;

    // Error state
    if (previewType === "error") {
      return (
        <div className="error-preview">
          <FiAlertCircle size={48} color="#e53e3e" />
          <h3>Preview Error</h3>
          <p>{message || "Failed to load preview"}</p>
        </div>
      );
    }

    // Text-based files (code)
    if (previewType === "text") {
      const lines = content.split("\n");
      return (
        <pre className="text-preview">
          {lines.map((line, index) => (
            <div key={index} className="line">
              <span className="line-number">{index + 1}</span>
              <span className="line-content">{line}</span>
            </div>
          ))}
        </pre>
      );
    }

    // Image files
    if (previewType === "image") {
      if (mediaError) {
        return (
          <div className="error-preview">
            <FiAlertCircle size={48} color="#e53e3e" />
            <h3>File Corrupted or Broken</h3>
            <p>
              This image file appears to be corrupted or broken and cannot be
              displayed.
            </p>
          </div>
        );
      }
      return (
        <div className="image-preview">
          <img
            src={`data:${type};base64,${content}`}
            alt={name}
            onError={handleMediaError}
          />
        </div>
      );
    }

    // Video files
    if (previewType === "video") {
      if (mediaError) {
        return (
          <div className="error-preview">
            <FiAlertCircle size={48} color="#e53e3e" />
            <h3>File Corrupted or Broken</h3>
            <p>
              This video file appears to be corrupted or broken and cannot be
              played.
            </p>
          </div>
        );
      }
      return (
        <div className="video-preview">
          <video
            controls
            src={`data:${type};base64,${content}`}
            onError={handleMediaError}
          />
        </div>
      );
    }

    // Audio files
    if (previewType === "audio") {
      if (mediaError) {
        return (
          <div className="error-preview">
            <FiAlertCircle size={48} color="#e53e3e" />
            <h3>File Corrupted or Broken</h3>
            <p>
              This audio file appears to be corrupted or broken and cannot be
              played.
            </p>
          </div>
        );
      }
      return (
        <div className="audio-preview">
          <audio
            controls
            src={`data:${type};base64,${content}`}
            onError={handleMediaError}
          />
        </div>
      );
    }

    // DOCX files (converted to HTML)
    if (previewType === "docx") {
      return (
        <div
          className="docx-preview"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    // PDF files
    if (previewType === "pdf") {
      if (mediaError) {
        return (
          <div className="error-preview">
            <FiAlertCircle size={48} color="#e53e3e" />
            <h3>File Corrupted or Broken</h3>
            <p>
              This PDF file appears to be corrupted or broken and cannot be
              displayed.
            </p>
          </div>
        );
      }
      return (
        <div className="pdf-preview" style={{ width: "100%", height: "80vh" }}>
          <iframe
            src={`data:application/pdf;base64,${content}#toolbar=0&navpanes=0&scrollbar=0`}
            title={name}
            onError={handleMediaError}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
      );
    }

    // Office documents
    if (previewType === "office") {
      return (
        <div className="office-preview">
          <FiFile size={64} color="#4a5568" />
          <h3>{name}</h3>
          <p>{message}</p>
        </div>
      );
    }

    // Unsupported files
    return (
      <div className="unsupported-preview">
        <FiFile size={64} color="#a0aec0" />
        <h3>{name}</h3>
        <p>{message || "Preview not available for this file type."}</p>
      </div>
    );
  };

  const getFileTypeIcon = () => {
    if (!previewData) return <FiFile size={20} />;
    const { previewType } = previewData;

    switch (previewType) {
      case "image":
        return <FiImage size={20} />;
      case "video":
        return <FiVideo size={20} />;
      case "audio":
        return <FiMusic size={20} />;
      case "text":
        return <FiFileText size={20} />;
      case "pdf":
        return <FiFileText size={20} />;
      case "docx":
        return <FiFileText size={20} />;
      default:
        return <FiFile size={20} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="file-info-wrapper">
            {getFileTypeIcon()}
            <h3>{file.originalName || file.name}</h3>
          </div>
          <div className="modal-actions">
            <button onClick={() => onDownload(file, file.type)}>
              <FiDownload />
            </button>
            <button onClick={() => onShare(file, file.type)}>
              <FiShare />
            </button>
            <button onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>
        <div className="modal-content">{getPreviewContent()}</div>
      </div>
    </div>
  );
}

export default PreviewModal;
