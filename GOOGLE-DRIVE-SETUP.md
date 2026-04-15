# Google Drive Integration Setup Guide

This guide will walk you through setting up automatic Google Drive uploads for your My Drive application.

## Overview

With this integration:
- **Users log in once** with their Google Drive account
- **Tokens are stored securely** in the backend database
- **Future uploads happen automatically** to both local storage AND Google Drive
- **No popup appears again** after initial login
- **Files go directly** to the connected user's Google Drive

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**

### 1.2 Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the **OAuth consent screen**:
   - Choose **External** user type
   - Fill in required app information
   - Add scopes: `.../auth/drive.file`, `.../auth/drive.readonly`, `.../auth/userinfo.email`
   - Add test users (if in testing mode)

4. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: My Drive Backend
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (development)
     - `http://localhost:5000` (backend)
     - `https://your-production-domain.com` (production)
   
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/google/callback` (development)
     - `https://your-backend-url.onrender.com/api/google/callback` (production)

5. Click **Create** and note down:
   - **Client ID**
   - **Client Secret**

### 1.3 Publish the App (Optional)

If you want to use this in production:
1. Go to **OAuth consent screen**
2. Click **Publish App**
3. This removes the "Testing" limitation

## Step 2: Backend Configuration

### 2.1 Update Environment Variables

In your backend `.env` file (create from `.env.example`):

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/google/callback

# Frontend URL (for OAuth callback redirect)
FRONTEND_URL=http://localhost:5173
```

For production:
```env
GOOGLE_REDIRECT_URI=https://your-backend-url.onrender.com/api/google/callback
FRONTEND_URL=https://your-frontend-url.com
```

### 2.2 Install Dependencies

The backend already has `googleapis` installed. If you need to reinstall:

```bash
cd backend
npm install
```

### 2.3 Restart Backend

```bash
cd backend
npm run dev
```

## Step 3: Frontend Configuration

The frontend is already configured to work with Google Drive. Just ensure:

1. The backend URL is correct in your environment
2. Users are logged in to your My Drive application

## Step 4: Testing the Integration

### 4.1 Connect Google Drive

1. **Log in** to your My Drive application
2. Open **Settings** (click on your profile/settings icon)
3. Find the **Google Drive Integration** section
4. Click **Connect** button
5. You'll be redirected to Google's OAuth consent screen
6. **Sign in** with your Google account and grant permissions
7. You'll be redirected back with a success message

### 4.2 Verify Connection

After connecting:
- The Settings modal will show **"Connected as your@email.com"**
- A green badge will appear: **"Auto-upload to Google Drive enabled"**
- The Upload button will show a **green dot** indicator

### 4.3 Test Automatic Upload

1. Click the **Upload** button
2. Select a file to upload
3. The file will be uploaded to:
   - **Local storage** (your backend server)
   - **Google Drive** (automatically, no popup)
4. Success message will show: **"Uploaded: filename (also saved to Google Drive)"**

### 4.4 Verify in Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Look for the uploaded file
3. It should appear in **"My Drive"** or the root folder

## Step 5: Production Deployment

### 5.1 Backend (Render/Heroku/etc.)

1. Add environment variables in your hosting platform:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=https://your-backend-url.onrender.com/api/google/callback
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. Deploy the backend

### 12.2 Frontend (Vercel/Netlify/etc.)

No special configuration needed. Just ensure:
- The frontend can reach the backend API
- The backend's CORS allows your frontend domain

## How It Works

### First Time Connection Flow

```
User clicks "Connect" in Settings
  ↓
Backend generates Google OAuth URL
  ↓
User redirected to Google sign-in page
  ↓
User grants permissions
  ↓
Google redirects back with authorization code
  ↓
Backend exchanges code for access & refresh tokens
  ↓
Tokens stored in User model (encrypted in database)
  ↓
User redirected back to My Drive dashboard
```

### Subsequent Upload Flow

```
User uploads file through My Drive
  ↓
Frontend checks Google Drive connection status
  ↓
If connected: sends uploadToGoogle=true flag
  ↓
Backend checks for valid Google tokens
  ↓
If token expired: automatically refreshes using refresh token
  ↓
File uploaded to Google Drive using stored tokens
  ↓
File ALSO saved to local storage (backup)
  ↓
Success response sent to frontend
  ↓
NO popup appears - completely automatic
```

## API Endpoints

### Google Drive Routes

- `GET /api/google/auth-url` - Get Google OAuth URL
- `GET /api/google/callback` - Handle OAuth callback (stores tokens)
- `GET /api/google/status` - Check connection status
- `POST /api/google/disconnect` - Disconnect Google Drive
- `POST /api/google/refresh-token` - Manually refresh access token

## Troubleshooting

### "Google Drive not connected" after clicking Connect

**Possible causes:**
1. Incorrect redirect URI in Google Cloud Console
2. Frontend URL mismatch in backend `.env`
3. OAuth app not published (if in production)

**Solution:**
- Check backend logs for OAuth callback errors
- Verify redirect URI exactly matches: `http://localhost:5000/api/google/callback`

### Files not uploading to Google Drive

**Check:**
1. Is Google Drive shown as "Connected" in Settings?
2. Check backend logs for token refresh errors
3. Verify Google Drive API is enabled in Cloud Console
4. Check if refresh token is still valid

**Solution:**
- Disconnect and reconnect Google Drive
- Check `googleDrive` field in User model in MongoDB

### Token expired errors

The system automatically refreshes tokens using the refresh token. If you see persistent expiry errors:
1. Disconnect Google Drive in Settings
2. Reconnect it
3. This will generate new refresh token

## Security Notes

- **Refresh tokens** are stored in the database
- **Access tokens** are automatically refreshed before expiry
- **Tokens are user-specific** - each user connects their own Google Drive
- **Disconnect clears tokens** from the database
- **Google scopes** are limited to Drive file operations only

## Database Schema Changes

### User Model
```javascript
googleDrive: {
  connected: Boolean,
  googleEmail: String,
  accessToken: String,
  refreshToken: String,
  tokenExpiry: Date,
  connectedAt: Date
}
```

### File Model
```javascript
googleDriveId: String,    // Google Drive file ID
googleDriveLink: String   // URL to view file in Google Drive
```

## Support

If you encounter issues:
1. Check backend console logs
2. Verify all environment variables are set
3. Ensure Google Cloud Console configuration is correct
4. Try disconnecting and reconnecting Google Drive
