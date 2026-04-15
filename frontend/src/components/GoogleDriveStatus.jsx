import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const GoogleDriveStatus = () => {
  const { user, token } = useAuth();
  const [googleStatus, setGoogleStatus] = useState({
    connected: false,
    googleEmail: null,
    loading: true,
  });
  const [connecting, setConnecting] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://my-drive-application.onrender.com/api";

  useEffect(() => {
    checkGoogleDriveStatus();
  }, []);

  const checkGoogleDriveStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/google/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoogleStatus({
          connected: data.connected,
          googleEmail: data.googleEmail,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error checking Google Drive status:", error);
      setGoogleStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const connectGoogleDrive = async () => {
    try {
      setConnecting(true);
      const response = await fetch(`${API_BASE_URL}/google/auth-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Google OAuth page
        window.location.href = data.authUrl;
      } else {
        console.error("Failed to get auth URL");
        setConnecting(false);
      }
    } catch (error) {
      console.error("Error connecting to Google Drive:", error);
      setConnecting(false);
    }
  };

  const disconnectGoogleDrive = async () => {
    if (!window.confirm("Are you sure you want to disconnect Google Drive?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/google/disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setGoogleStatus({
          connected: false,
          googleEmail: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error disconnecting Google Drive:", error);
    }
  };

  if (googleStatus.loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Google Drive Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8L24 8L32 24L20 24L12 8Z"
                fill="#0066DA"
              />
              <path
                d="M24 8L36 8L44 24L32 24L24 8Z"
                fill="#EA4335"
              />
              <path
                d="M4 24L12 8L24 24L16 40L4 24Z"
                fill="#FFD140"
              />
              <path
                d="M24 24L32 8L44 24L36 40L24 24Z"
                fill="#FCFCFC"
              />
              <path
                d="M4 24L16 40L24 24L12 24L4 24Z"
                fill="#00AC47"
              />
              <path
                d="M24 24L36 40L44 24L32 24L24 24Z"
                fill="#FFBA00"
              />
            </svg>
          </div>

          {/* Status Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Google Drive
            </h3>
            {googleStatus.connected && googleStatus.googleEmail ? (
              <p className="text-xs text-gray-600 mt-1">
                Connected as{" "}
                <span className="font-medium">{googleStatus.googleEmail}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Not connected</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div>
          {googleStatus.connected ? (
            <button
              onClick={disconnectGoogleDrive}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
              disabled={connecting}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectGoogleDrive}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect"}
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3">
        {googleStatus.connected ? (
          <div className="flex items-center space-x-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-md">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Auto-upload to Google Drive enabled</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-md">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Connect to automatically upload files to Google Drive</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDriveStatus;
