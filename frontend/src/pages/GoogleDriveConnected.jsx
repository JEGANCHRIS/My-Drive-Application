import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  clearStoredGoogleDriveAuth,
  ensureGoogleDriveAccessToken,
  hasValidStoredGoogleDriveAuth,
  readStoredGoogleDriveAuth,
} from "../utils/googleDriveAuth";

const GoogleDriveConnected = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState("idle");
  const [googleEmail, setGoogleEmail] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (hasValidStoredGoogleDriveAuth()) {
      const auth = readStoredGoogleDriveAuth();
      setStatus("success");
      setGoogleEmail(auth?.email || "");
    }
  }, [loading, navigate, user]);

  const handleAuthorize = async () => {
    setStatus("loading");

    try {
      const auth = await ensureGoogleDriveAccessToken({ interactive: true });
      setGoogleEmail(auth?.email || "");
      setStatus("success");
    } catch (error) {
      console.error("Google Drive authorization error:", error);
      setStatus("error");
    }
  };

  const handleDisconnect = () => {
    clearStoredGoogleDriveAuth();
    setGoogleEmail("");
    setStatus("idle");
  };

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Connecting to Google Drive
            </h2>
            <p className="text-gray-600">
              Finish the Google authorization in this tab. Your token will be
              stored locally in this browser.
            </p>
          </div>
        )}

        {status !== "loading" && (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className={`w-20 h-20 mx-auto ${status === "error" ? "text-red-500" : "text-green-500"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {status === "error" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {status === "success"
                ? "Google Drive Ready"
                : status === "error"
                  ? "Authorization Failed"
                  : "Authorize Google Drive"}
            </h2>

            <p className="text-gray-600 mb-4">
              {status === "success"
                ? "This browser now has a local Google Drive token. Uploads from the sidebar form can use it without opening another sign-in flow."
                : status === "error"
                  ? "We could not get a browser-side Google Drive token. Please try again."
                  : "Open this page in another tab once, authorize Google Drive, then return to My Drive and upload normally."}
            </p>

            {googleEmail && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Google Account:</span>{" "}
                  {googleEmail}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {status !== "success" && (
                <button
                  onClick={handleAuthorize}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Authorize in This Tab
                </button>
              )}

              {status === "success" && (
                <button
                  onClick={() => navigate("/drive")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Back to My Drive
                </button>
              )}

              {status === "success" && (
                <button
                  onClick={handleDisconnect}
                  className="w-full bg-white hover:bg-gray-50 text-red-600 font-semibold py-3 px-6 rounded-lg border border-red-200 transition-colors"
                >
                  Remove Local Google Token
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDriveConnected;
