import React, { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiFileText,
  FiMapPin,
  FiCamera,
} from "react-icons/fi";
import { toast } from "react-toastify";

function EditProfileModal({ isOpen, onClose, currentUser, onUpdate }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
        bio: currentUser?.bio || "",
        avatar: currentUser?.avatar || "",
        streetAddress: currentUser?.streetAddress || "",
        city: currentUser?.city || "",
        state: currentUser?.state || "",
        country: currentUser?.country || "",
        zipCode: currentUser?.zipCode || "",
      });
      // Set preview image if avatar exists
      if (currentUser?.avatar) {
        const imageUrl = currentUser.avatar.startsWith("http")
          ? currentUser.avatar
          : `https://my-drive-application.onrender.com${currentUser.avatar}`;
        setPreviewImage(imageUrl);
      } else {
        setPreviewImage("");
      }
    }
  }, [currentUser, isOpen]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploadingPicture(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("profilePicture", file);

      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://my-drive-application.onrender.com/api/auth/upload-profile-picture",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        const newAvatarPath = data.avatar;
        // Update form data with new avatar path
        setFormData({ ...formData, avatar: newAvatarPath });

        // Update localStorage with new avatar immediately
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (storedUser) {
          storedUser.avatar = newAvatarPath;
          localStorage.setItem("user", JSON.stringify(storedUser));
        }

        // Notify parent component about the avatar update
        if (onUpdate) {
          onUpdate({
            ...storedUser,
            avatar: newAvatarPath,
          });
        }

        toast.success("Profile picture uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
        setPreviewImage("");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setPreviewImage("");
    } finally {
      setUploadingPicture(false);
      e.target.value = ""; // Reset file input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://my-drive-application.onrender.com/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile updated successfully!");
        onUpdate(data.user);
        onClose();
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal edit-profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Profile Picture Upload */}
          <div className="form-group">
            <label>Profile Picture</label>
            <div className="avatar-upload-container">
              <div className="avatar-preview-large">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    <FiUser size={48} />
                  </div>
                )}
                {uploadingPicture && (
                  <div className="upload-overlay">
                    <div className="upload-spinner"></div>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="upload-avatar-btn"
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingPicture}
              >
                <FiCamera />{" "}
                {uploadingPicture ? "Uploading..." : "Upload Photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
            </div>
            <p className="form-hint">
              Click to upload. Max size: 5MB. Formats: JPG, PNG, GIF, WebP
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="name">
              <FiUser /> Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <FiMail /> Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              <FiPhone /> Phone (optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Enter your phone number"
            />
          </div>

          {/* Address Section */}
          <div className="form-section">
            <h4>
              <FiMapPin /> Address
            </h4>
            <div className="form-group">
              <label htmlFor="streetAddress">Street Address</label>
              <input
                id="streetAddress"
                type="text"
                value={formData.streetAddress}
                onChange={(e) =>
                  setFormData({ ...formData, streetAddress: e.target.value })
                }
                placeholder="123 Main Street"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="New York"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State/Province</label>
                <input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="United States"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  id="zipCode"
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">
              <FiFileText /> Bio (optional)
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about yourself..."
              rows="4"
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
