import React, { useRef, useState } from "react";
import {
  FiArchive,
  FiCamera,
  FiCheck,
  FiCode,
  FiEye,
  FiFile,
  FiFileText,
  FiFilm,
  FiMusic,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL?.trim();

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
  const [uploadToGoogleDrive, setUploadToGoogleDrive] = useState(true);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    ) {
      return <FiArchive size={20} />;
    }
    if (
      type.includes("text") ||
      type.includes("json") ||
      type.includes("xml") ||
      type.includes("javascript")
    ) {
      return <FiCode size={20} />;
    }
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
    ) {
      return "text";
    }

    return "unsupported";
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size);

    setSelectedFile(file);
    const type = getPreviewType(file);
    setPreviewType(type);
    setShowPreview(true);

    const reader = new FileReader();

    if (type === "image" || type === "video" || type === "audio") {
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.onerror = () => {
        console.error("Error reading file as data URL");
        toast.error("Failed to load file preview");
      };
      reader.readAsDataURL(file);
      return;
    }

    if (type === "text") {
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.onerror = () => {
        console.error("Error reading text file");
        toast.error("Failed to load text preview");
      };
      reader.readAsText(file);
      return;
    }

    if (type === "pdf") {
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.onerror = () => {
        console.error("Error reading PDF");
        toast.error("Failed to load PDF preview");
      };
      reader.readAsDataURL(file);
      return;
    }

    setPreviewUrl(null);
  };

  const resetForm = () => {
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
    setUploadToGoogleDrive(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!uploadToGoogleDrive) {
      toast.error("Enable Google Drive upload to send this form to n8n.");
      return;
    }

    if (!N8N_WEBHOOK_URL) {
      toast.error("n8n webhook URL is missing. Check VITE_N8N_WEBHOOK_URL.");
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("formFile", selectedFile);
      uploadFormData.append("name", formData.name);
      uploadFormData.append("email", formData.email);
      uploadFormData.append("phone", formData.phone);
      uploadFormData.append("height", formData.height);
      uploadFormData.append("weight", formData.weight);
      uploadFormData.append("uploadToGoogleDrive", "true");
      uploadFormData.append("source", "frontend-form");
      uploadFormData.append("fileName", selectedFile.name);
      uploadFormData.append("fileType", selectedFile.type || "");
      uploadFormData.append("fileSize", String(selectedFile.size));

      console.log("Submitting form to n8n webhook:", N8N_WEBHOOK_URL);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        body: uploadFormData,
      });

      // Handle redirect responses from n8n (e.g., OAuth callbacks)
      if (response.status === 302 || response.status === 301) {
        const redirectLocation = response.headers.get("location");
        console.log("⚠️ n8n is attempting to redirect:", redirectLocation);
        toast.error(
          "The n8n workflow is redirecting to Google OAuth. " +
            "Please ensure your n8n Google Drive node is configured with stored credentials, " +
            "not OAuth. Check your n8n workflow settings.",
        );
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      if (!response.ok) {
        toast.error(data.error || data.message || "Failed to submit form");
        return;
      }

      console.log("n8n response:", data);
      toast.success(
        data.message ||
          "Form submitted successfully! File sent to n8n and saved to Google Drive.",
      );

      resetForm();

      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to send the file to the n8n webhook");
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
              Save to Google Drive through n8n
            </span>
          </label>
          {uploadToGoogleDrive && (
            <p className="checkbox-hint warning">
              The form will send this upload to your configured n8n webhook so
              the workflow can store it in Google Drive.
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
