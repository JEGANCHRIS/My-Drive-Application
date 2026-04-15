const GOOGLE_DRIVE_SCOPE = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";
const GOOGLE_DRIVE_AUTH_EVENT = "google-drive-auth-changed";

const getGoogleDriveStorageKey = () => {
  try {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = parsedUser?.id || parsedUser?._id || "anonymous";
    return `google-drive-auth:${userId}`;
  } catch {
    return "google-drive-auth:anonymous";
  }
};

const getGoogleClientId = () => import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const notifyGoogleDriveAuthChanged = () => {
  window.dispatchEvent(new Event(GOOGLE_DRIVE_AUTH_EVENT));
};

export const readStoredGoogleDriveAuth = () => {
  try {
    const rawValue = localStorage.getItem(getGoogleDriveStorageKey());
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

export const hasValidStoredGoogleDriveAuth = () => {
  const auth = readStoredGoogleDriveAuth();
  return Boolean(
    auth?.accessToken &&
      auth?.expiresAt &&
      Number(auth.expiresAt) > Date.now() + 60 * 1000,
  );
};

export const clearStoredGoogleDriveAuth = () => {
  localStorage.removeItem(getGoogleDriveStorageKey());
  notifyGoogleDriveAuthChanged();
};

const saveGoogleDriveAuth = (auth) => {
  localStorage.setItem(getGoogleDriveStorageKey(), JSON.stringify(auth));
  notifyGoogleDriveAuthChanged();
};

export const loadGoogleIdentityScript = async () => {
  if (window.google?.accounts?.oauth2) {
    return window.google;
  }

  const existingScript = document.querySelector(
    `script[src="${GOOGLE_IDENTITY_SCRIPT}"]`,
  );

  if (existingScript) {
    await new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services")),
        { once: true },
      );
    });
    return window.google;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });

  return window.google;
};

const fetchGoogleAccountEmail = async (accessToken) => {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.email || null;
  } catch {
    return null;
  }
};

const requestGoogleDriveAccessToken = async ({ interactive, prompt = "" }) => {
  await loadGoogleIdentityScript();

  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("Missing VITE_GOOGLE_CLIENT_ID");
  }

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_DRIVE_SCOPE,
      callback: async (response) => {
        if (!response?.access_token) {
          reject(
            new Error(
              response?.error || "Unable to get a Google Drive access token",
            ),
          );
          return;
        }

        const expiresInSeconds = Number(response.expires_in || 3600);
        const auth = {
          accessToken: response.access_token,
          tokenType: response.token_type || "Bearer",
          scope: response.scope || GOOGLE_DRIVE_SCOPE,
          expiresAt: Date.now() + expiresInSeconds * 1000,
          email: await fetchGoogleAccountEmail(response.access_token),
        };

        saveGoogleDriveAuth(auth);
        resolve(auth);
      },
      error_callback: (error) => {
        reject(
          new Error(error?.type || error?.message || "google_auth_failed"),
        );
      },
    });

    tokenClient.requestAccessToken({
      prompt: interactive ? prompt : "",
    });
  });
};

export const ensureGoogleDriveAccessToken = async ({
  interactive = false,
  prompt = "",
} = {}) => {
  if (hasValidStoredGoogleDriveAuth()) {
    return readStoredGoogleDriveAuth();
  }

  try {
    return await requestGoogleDriveAccessToken({ interactive, prompt });
  } catch (error) {
    if (!interactive) {
      throw new Error("GOOGLE_DRIVE_AUTH_REQUIRED");
    }

    throw error;
  }
};

export const uploadFileToGoogleDrive = async (file, accessToken) => {
  const boundary = `mydrive_${Date.now()}`;
  const metadata = {
    name: file.name,
  };

  const requestBody = new Blob(
    [
      `--${boundary}\r\n`,
      "Content-Type: application/json; charset=UTF-8\r\n\r\n",
      JSON.stringify(metadata),
      "\r\n",
      `--${boundary}\r\n`,
      `Content-Type: ${file.type || "application/octet-stream"}\r\n\r\n`,
      file,
      "\r\n",
      `--${boundary}--`,
    ],
    { type: `multipart/related; boundary=${boundary}` },
  );

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: requestBody,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Google Drive upload failed");
  }

  return data;
};

export { GOOGLE_DRIVE_AUTH_EVENT };
