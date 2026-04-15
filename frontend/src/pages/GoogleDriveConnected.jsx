import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GoogleDriveConnected = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState("loading");
  const [googleEmail, setGoogleEmail] = useState("");

  useEffect(() => {
    const success = searchParams.get("success");
    const email = searchParams.get("email");

    if (success === "true") {
      setStatus("success");
      setGoogleEmail(email || "");
      // Auto-redirect after 3 seconds if logged in
      if (user) {
        setTimeout(() => {
          navigate("/drive");
        }, 3000);
      }
    } else {
      setStatus("error");
    }
  }, [searchParams, navigate, user]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Processing Google Drive Connection
            </h2>
            <p className="text-gray-600">
              Please wait while we complete the connection...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user && status === "success") {
    // User successfully connected but session expired during OAuth
    // Redirect to login with success message
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg
              className="w-20 h-20 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Google Drive Connected!
          </h2>
          <p className="text-gray-600 mb-6">
            Your Google Drive account has been successfully connected. Please
            log in to start uploading files automatically.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
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
              Please wait while we complete the connection...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="w-20 h-20 mx-auto text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Connected Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Your Google Drive account is now connected to My Drive.
            </p>
            {googleEmail && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Google Account:</span>{" "}
                  {googleEmail}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to dashboard in 3 seconds...
            </p>
            <button
              onClick={() => navigate("/drive")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard Now
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="w-20 h-20 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't connect to your Google Drive account. Please try
              again.
            </p>
            <button
              onClick={() => (user ? navigate("/drive") : navigate("/login"))}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {user ? "Back to Dashboard" : "Go to Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleDriveConnected;
