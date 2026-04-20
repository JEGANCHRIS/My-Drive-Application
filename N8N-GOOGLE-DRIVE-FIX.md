# Fix: n8n Google Drive OAuth Redirect Issue

## Problem

When users submit the form, they're redirected to a Google sign-in page even though Google Drive is already authenticated in n8n.

## Root Cause

Your n8n Google Drive node is likely configured to **prompt for authentication on each request** rather than using **stored/persistent credentials**.

## Solution

### Step 1: Check Your n8n Google Drive Node Configuration

1. Open your n8n workflow at `https://my-drive-n8n-backend.onrender.com/`
2. Find the **Google Drive** node in your workflow
3. Look at the **Authentication** section

### Step 2: Use Service Account Credentials (Recommended)

**Option A: Service Account (Best for automated workflows)**

1. In the Google Drive node, select **Credentials** from the dropdown
2. Choose **Create new credential**
3. Select **Google Service Account** (NOT "Google OAuth2")
4. Upload your service account JSON key file
5. This will store the credentials persistently - no OAuth redirect needed

**Option B: Persistent OAuth (Alternative)**

1. Select **Google OAuth2** credentials
2. In the n8n credentials panel, ensure the credentials are saved
3. Check **"Persistent"** or **"Save credentials permanently"** option if available
4. This way, the same credentials are reused for all requests

### Step 3: Update Your n8n Webhook Response

Make sure your n8n webhook endpoint is configured to:

1. **NOT redirect** the user to any OAuth URLs
2. Return a **JSON response** instead of an HTML redirect
3. **Handle file upload asynchronously** if it takes time

Example n8n webhook response structure:

```json
{
  "message": "Form submitted successfully! File sent to Google Drive.",
  "file": {
    "id": "file_id_here",
    "name": "filename.pdf",
    "googleDriveId": "gdrive_file_id"
  },
  "success": true
}
```

### Step 4: Verify the Frontend Changes

The form now has protection against redirects. If the webhook tries to redirect (HTTP 301/302), the user will see an error message explaining to fix the n8n configuration.

### Step 5: Test the Form

1. Fill out the form
2. Select a file
3. Check the checkbox: **"Save to Google Drive through n8n"**
4. Click **Submit & Upload**
5. You should see a success message without any Google sign-in redirects

## Troubleshooting

### Still getting redirected?

- Check the browser console (F12 → Network tab) to see what URL is being redirected to
- If it's a Google OAuth URL, your n8n Google Drive node is using OAuth instead of service account
- Switch to **Service Account** credentials in n8n

### n8n webhook returns an error?

- Check your n8n workflow logs
- Ensure the Google Drive node has proper file upload permissions
- Test the n8n workflow manually first before submitting from the form

### File not appearing in Google Drive?

- Check that your Google Drive service account has write permissions
- Verify the target folder exists and is accessible
- Check n8n workflow execution history for errors

## n8n Workflow Best Practices

For form submissions with automatic Google Drive upload:

1. **Use Service Account** - More reliable for automated processes
2. **No user interaction** - Service account credentials don't require OAuth redirects
3. **Error handling** - Return proper error responses instead of redirecting
4. **Async processing** - If upload takes time, return success and process in background

## Files Modified

- `frontend/src/components/FormSection.jsx` - Added redirect detection
- `backend/routes/formRoutes.js` - Added n8n source detection to skip OAuth

## Next Steps

1. Reconfigure your n8n Google Drive credentials
2. Test the form submission
3. If issues persist, check n8n workflow logs at: `https://my-drive-n8n-backend.onrender.com/`
