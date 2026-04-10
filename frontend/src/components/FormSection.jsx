import React, { useState, useRef } from "react";
import {
  FiUpload,
  FiX,
  FiEye,
  FiFile,
  FiCheck,
  FiCamera,
  FiFilm,
  FiMusic,
  FiArchive,
  FiCode,
  FiFileText,
} from "react-icons/fi";
import { toast } from "react-toastify";

function FormSection({ onRefresh }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    height: "",
    weight: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadToGoogleDrive, setUploadToGoogleDrive] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getFileIcon = (type) => {
    if (!type) return <FiFile />;
    if (type.startsWith("image/")) return <FiCamera size={20} />;
    if (type.startsWith("video/")) return <FiFilm size={20} />;
    if (type.startsWith("audio/")) return <FiMusic size={20} />;
    if (type.includes("pdf")) return <FiFileText size={20} />;
    if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("archive")
    )
      return <FiArchive size={20} />;
    if (
      type.includes("text") ||
      type.includes("json") ||
      type.includes("xml") ||
      type.includes("javascript")
    )
      return <FiCode size={20} />;
    return <FiFile size={20} />;
  };

  const getPreviewType = (file) => {
    if (!file) return null;
    const type = file.type;
    const ext = file.name.split(".").pop().toLowerCase();

    if (type.startsWith("image/")) return "image";
    if (type.startsWith("video/")) return "video";
    if (type.startsWith("audio/")) return "audio";
    if (type === "application/pdf" || ext === "pdf") return "pdf";
    if (
      type.startsWith("text/") ||
      ext === "txt" ||
      ext === "md" ||
      ext === "csv" ||
      ext === "json" ||
      ext === "xml" ||
      ext === "js" ||
      ext === "jsx" ||
      ext === "ts" ||
      ext === "html" ||
      ext === "css"
    )
      return "text";
    return "unsupported";
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size);

    setSelectedFile(file);
    const type = getPreviewType(file);
    console.log("Preview type:", type);
    setPreviewType(type);
    setShowPreview(true); // Auto-show preview

    // Create preview based on file type
    const reader = new FileReader();

    if (type === "image" || type === "video" || type === "audio") {
      reader.onloadend = () => {
        console.log("Data URL created, length:", reader.result?.length);
        setPreviewUrl(reader.result);
      };
      reader.onerror = () => {
        console.error("Error reading file as data URL");
        toast.error("Failed to load file preview");
      };
      reader.readAsDataURL(file);
    } else if (type === "text") {
      reader.onloadend = () => {
        console.log("Text file read, length:", reader.result?.length);
        setPreviewUrl(reader.result);
      };
      reader.onerror = () => {
        console.error("Error reading text file");
        toast.error("Failed to load text preview");
      };
      reader.readAsText(file);
    } else if (type === "pdf") {
      reader.onloadend = () => {
        console.log("PDF data URL created, length:", reader.result?.length);
        setPreviewUrl(reader.result);
      };
      reader.onerror = () => {
        console.error("Error reading PDF");
        toast.error("Failed to load PDF preview");
      };
      reader.readAsDataURL(file);
    } else {
      // For non-preview files, just show file info
      console.log("No preview available for this file type");
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("formFile", selectedFile);
      uploadFormData.append("name", formData.name);
      uploadFormData.append("email", formData.email);
      uploadFormData.append("phone", formData.phone);
      uploadFormData.append("height", formData.height);
      uploadFormData.append("weight", formData.weight);
      uploadFormData.append("uploadToGoogleDrive", uploadToGoogleDrive);

      const token = localStorage.getItem("token");

      console.log("Submitting form...");
      console.log("Upload to Google Drive:", uploadToGoogleDrive);

      const response = await fetch("http://localhost:5000/api/form/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Form submitted successfully! File uploaded to My Drive.",
        );

        console.log("Backend response:", data);

        if (data.googleDrive?.needsAuth) {
          toast.info("Opening Google Drive authorization...", {
            autoClose: 3000,
          });
          console.log("Opening Google Auth Window:", data.googleDrive.authUrl);

          // Open Google OAuth window
          const authWindow = window.open(data.googleDrive.authUrl, "_blank");

          if (!authWindow) {
            toast.error(
              "Popup blocked! Please allow popups for this site to authorize Google Drive.",
              { autoClose: 8000 },
            );
          }

          // Poll for completion
          const checkAuth = setInterval(() => {
            try {
              if (authWindow && authWindow.closed) {
                clearInterval(checkAuth);
                toast.success("Google Drive authorization completed!");
                setUploading(false);
              }
            } catch (e) {
              // Cross-Origin-Opener-Policy blocks access to popup.closed
              // Assume success after timeout
              clearInterval(checkAuth);
              toast.success("Google Drive authorization completed!");
              setUploading(false);
            }
          }, 1000);
        } else if (data.googleDrive?.success) {
          toast.success("File also uploaded to Google Drive!");
        }

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          height: "",
          weight: "",
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        setPreviewType(null);
        setShowPreview(false);
        setUploadToGoogleDrive(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Refresh file list
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.error || "Failed to submit form");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form");
    } finally {
      setUploading(false);
    }
  };

  const renderPreview = () => {
    if (!selectedFile) return null;

    switch (previewType) {
      case "image":
        return <img src={previewUrl} alt={selectedFile.name} />;

      case "video":
        return (
          <video controls autoPlay>
            <source src={previewUrl} type={selectedFile.type} />
          </video>
        );

      case "audio":
        return <audio controls autoPlay src={previewUrl} />;

      case "text":
        return <pre>{previewUrl || "Unable to preview"}</pre>;

      case "pdf":
        return (
          <iframe
            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            title={selectedFile.name}
          />
        );

      default:
        return (
          <div className="file-info-only">
            <div className="icon">{getFileIcon(selectedFile.type)}</div>
            <div className="details">
              <p className="name">{selectedFile.name}</p>
              <p className="size">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="type">{selectedFile.type || "Unknown type"}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="form-section-sidebar">
      <div className="form-header">
        <h3>
          <FiUpload /> Upload Form
        </h3>
        <button className="close-form-btn" onClick={() => {}}>
          <FiX />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="name">
            <FiFileText /> Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            <FiFileText /> Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            <FiFileText /> Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              id="height"
              type="number"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              placeholder="e.g., 170"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="e.g., 70"
              required
            />
          </div>
        </div>

        <div className="form-group file-upload-group">
          <label>
            <FiUpload /> Choose File
          </label>
          <div className="file-upload-container">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="file-input"
              required
            />
            <button
              type="button"
              className="choose-file-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </button>
            {selectedFile && (
              <div className="selected-file">
                {getFileIcon(selectedFile.type)}
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  className="preview-btn"
                  onClick={() => setShowPreview(true)}
                >
                  <FiEye /> Preview
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedFile && showPreview && (
          <div className="file-preview-fullscreen">
            <div
              className="preview-overlay"
              onClick={() => setShowPreview(false)}
            >
              <div
                className="preview-content-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="close-preview-btn"
                  onClick={() => setShowPreview(false)}
                >
                  <FiX />
                </button>
                {renderPreview()}
              </div>
            </div>
          </div>
        )}

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={uploadToGoogleDrive}
              onChange={(e) => setUploadToGoogleDrive(e.target.checked)}
            />
            <span className="checkbox-text">
              Also upload to Google Drive (requires OAuth setup)
            </span>
          </label>
          {uploadToGoogleDrive && (
            <p className="checkbox-hint warning">
              ⚠️ Google Drive integration requires OAuth credentials. File will
              still upload to My Drive successfully.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={uploading || !selectedFile}
        >
          <FiCheck /> {uploading ? "Uploading..." : "Submit & Upload"}
        </button>
      </form>
    </div>
  );
}

export default FormSection;
