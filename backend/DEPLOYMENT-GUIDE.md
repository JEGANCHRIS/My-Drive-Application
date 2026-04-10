# DEPLOYMENT GUIDE: Privacy Policy & Terms of Service
# For Google OAuth Verification

========================================================================
TABLE OF CONTENTS
========================================================================
1. Current Setup Status
2. Deployment Options (Render vs Railway)
3. Deploy to Render (RECOMMENDED - FREE)
4. Deploy to Railway (ALTERNATIVE - FREE TRIAL)
5. Environment Variables Setup
6. MongoDB Atlas Setup (FREE)
7. Testing Your Deployed Routes
8. Google OAuth Verification Requirements
9. Troubleshooting

========================================================================
1. CURRENT SETUP STATUS
========================================================================

Your policy routes are ALREADY configured:
  ✓ GET /privacy-policy  → Returns full HTML
  ✓ GET /terms           → Returns full HTML
  ✓ Routes registered in server.js
  ✓ Production-ready with proper exports

These routes DO NOT require:
  ✗ Database connection
  ✗ Authentication
  ✗ File uploads
  ✗ Google API access

They are STATIC public pages that work immediately on deployment.

========================================================================
2. DEPLOYMENT OPTIONS
========================================================================

Option A: Render (RECOMMENDED)
  ✓ Completely FREE (always free tier)
  ✓ Easy setup, no credit card required
  ✓ Auto-deploys from GitHub
  ✓ Free custom domain support
  ✗ Free tier spins down after 15 min inactivity (~30s cold start)
  ✓ Perfect for policy pages that need to be publicly accessible

Option B: Railway
  ✓ Easy setup with GitHub integration
  ✓ Faster than Render free tier
  ✗ $5 trial credit, then pay-as-you-go
  ✗ Requires credit card for continued use
  ✓ Good if you plan to scale later

RECOMMENDATION: Use Render for free, permanent hosting.

========================================================================
3. DEPLOY TO RENDER (STEP-BY-STEP)
========================================================================

STEP 1: Push Backend to GitHub
──────────────────────────────
1. Open terminal in your backend folder:
   cd "e:\Front-End\internship 2\my-drive\backend"

2. Initialize git (if not already done):
   git init

3. Create .gitignore (ALREADY CREATED):
   - node_modules/
   - .env
   - .env.google
   - uploads/

4. Commit your code:
   git add .
   git commit -m "Initial backend with policy routes"

5. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Repository name: my-drive-backend
   - Public (required for free Render tier)
   - Click "Create repository"

6. Push to GitHub:
   git remote add origin https://github.com/YOUR_USERNAME/my-drive-backend.git
   git branch -M main
   git push -u origin main

STEP 2: Deploy on Render
─────────────────────────
1. Go to https://render.com
2. Sign up with GitHub (free)
3. Click "New +" → "Web Service"
4. Connect your repository: "my-drive-backend"
5. Configure:
   - Name: my-drive-backend
   - Region: Oregon (or closest to you)
   - Branch: main
   - Root Directory: (leave blank)
   - Runtime: Node
   - Build Command: npm install --production
   - Start Command: node server.js
   - Instance Type: Free

6. DO NOT add environment variables yet (do it in next section)

7. Click "Create Web Service"

8. Wait 3-5 minutes for deployment

STEP 3: Get Your Public URL
────────────────────────────
After deployment, Render gives you a URL like:
  https://my-drive-backend.onrender.com

This is your BASE URL. Your policy pages will be at:
  https://my-drive-backend.onrender.com/privacy-policy
  https://my-drive-backend.onrender.com/terms

========================================================================
4. DEPLOY TO RAILWAY (ALTERNATIVE)
========================================================================

STEP 1: Push to GitHub (SAME AS RENDER STEP 1)

STEP 2: Deploy on Railway
──────────────────────────
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select "my-drive-backend"
5. Railway auto-detects Node.js and configures build/start
6. Click "Deploy"

STEP 3: Generate Public URL
────────────────────────────
1. Go to your project dashboard
2. Click "Settings" → "Networking"
3. Click "Generate Domain"
4. You'll get: https://my-drive-backend-production-xxxx.up.railway.app

Your policy pages:
  https://my-drive-backend-production-xxxx.up.railway.app/privacy-policy
  https://my-drive-backend-production-xxxx.up.railway.app/terms

========================================================================
5. ENVIRONMENT VARIABLES SETUP
========================================================================

You need to add these in Render/Railway dashboard:

REQUIRED VARIABLES:
───────────────────
1. MONGODB_URI
   - Get from MongoDB Atlas (see section 6)
   - Format: mongodb+srv://username:password@cluster.mongodb.net/drive-clone

2. JWT_SECRET
   - Generate a secure random string:
     - Use: https://generate-secret.vercel.app/64
   - Example: a3f8b2c9d1e7f4a5b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0

3. NODE_ENV
   - Value: production

OPTIONAL (For Google Drive feature):
─────────────────────────────────────
4. GOOGLE_CLIENT_ID
   - From Google Cloud Console

5. GOOGLE_CLIENT_SECRET
   - From Google Cloud Console

6. GOOGLE_REDIRECT_URI
   - Example: https://my-drive-backend.onrender.com/api/auth/google/callback
   - IMPORTANT: Update this in Google Cloud Console OAuth settings too!

How to Add in Render:
  1. Go to your service dashboard
  2. Click "Environment" tab
  3. Click "Add Environment Variable"
  4. Add each variable above
  5. Click "Save Changes"
  6. Service will auto-redeploy

How to Add in Railway:
  1. Go to your project
  2. Click "Variables" tab
  3. Add each variable as Raw Variable
  4. Service auto-redeploys

========================================================================
6. MONGODB ATLAS SETUP (FREE)
========================================================================

If you don't have MongoDB Atlas yet:

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free, no credit card)
3. Create a FREE M0 cluster:
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Select region closest to your users
   - Cluster Name: MyDrive (default)
   - Click "Create"

4. Create Database User:
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Authentication: Password
   - Username: (create one, e.g., mydrive-admin)
   - Password: (generate secure one, SAVE IT)
   - Database User Privileges: Read and write to any database
   - Click "Add User"

5. Allow Network Access:
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. Get Connection String:
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy connection string (looks like):
     mongodb+srv://mydrive-admin:<password>@mydrive.xxxxx.mongodb.net/?retryWrites=true&w=majority

   - Replace <password> with your actual password
   - Append database name: /drive-clone
   - Final format:
     mongodb+srv://mydrive-admin:YOUR_PASSWORD@mydrive.xxxxx.mongodb.net/drive-clone?retryWrites=true&w=majority

7. Add this as MONGODB_URI in Render/Railway environment variables

========================================================================
7. TESTING YOUR DEPLOYED ROUTES
========================================================================

METHOD 1: Browser Testing (EASIEST)
────────────────────────────────────
After deployment, open these URLs in your browser:

1. Privacy Policy:
   https://your-app-url.onrender.com/privacy-policy

2. Terms of Service:
   https://your-app-url.onrender.com/terms

Expected Result:
  ✓ Fully rendered HTML pages with proper styling
  ✓ No authentication required
  ✓ Loads like any normal website page
  ✓ Mobile responsive

METHOD 2: Curl Testing (FOR VERIFICATION)
──────────────────────────────────────────
Open terminal and run:

curl -I https://your-app-url.onrender.com/privacy-policy

Expected Response:
  HTTP/2 200
  content-type: text/html; charset=utf-8
  x-powered-by: Express

curl -I https://your-app-url.onrender.com/terms

Expected Response:
  HTTP/2 200
  content-type: text/html; charset=utf-8

METHOD 3: Online Tools
───────────────────────
Use these to verify from different locations:
  - https://www.isitdownrightnow.com/
  - https://downforeveryoneorjustme.com/

METHOD 4: API Health Check
───────────────────────────
Test if your server is running:
  https://your-app-url.onrender.com/api/health

Expected Response:
  {"status":"OK","message":"Server is running"}

========================================================================
8. GOOGLE OAUTH VERIFICATION REQUIREMENTS
========================================================================

When submitting your app for Google OAuth verification, you MUST provide:

1. Privacy Policy URL:
   https://your-app-url.onrender.com/privacy-policy

2. Terms of Service URL:
   https://your-app-url.onrender.com/terms

3. Application Homepage:
   Your main app URL (frontend or backend)

Google's Review Process:
  - They will visit your policy URLs to verify they exist
  - Pages must be publicly accessible (NO login required)
  - Pages must contain how you handle Google user data
  - Pages must be complete (not placeholder text)

Your Policy Pages Include:
  ✓ How Google user data is collected (OAuth flow)
  ✓ How it's used (file uploads only)
  ✓ Reference to Google API Services User Data Policy
  ✓ Data security measures
  ✓ User rights (access, deletion, revocation)
  ✓ No selling/sharing of Google data
  ✓ Compliance with Google's policies

CHECKLIST BEFORE SUBMITTING TO GOOGLE:
──────────────────────────────────────
  □ Replace [your-email@domain.com] with your real email in policyRoutes.js
  □ Deploy updated code to Render/Railway
  □ Test both policy URLs load correctly
  □ Verify no placeholder text remains
  □ Ensure pages are mobile-friendly (they are)
  □ Submit OAuth consent screen in Google Cloud Console with policy URLs

How to Update Contact Email:
  1. Open: backend/routes/policyRoutes.js
  2. Find: [your-email@domain.com] (appears in both routes)
  3. Replace with your actual email
  4. Commit and push to redeploy:
     git add .
     git commit -m "Update contact email in policy pages"
     git push

========================================================================
9. TROUBLESHOOTING
========================================================================

PROBLEM: 502 Bad Gateway
────────────────────────
Solution:
  - Check Render logs for errors
  - Verify MONGODB_URI is correct
  - Ensure all environment variables are set
  - Check MongoDB Atlas network access allows 0.0.0.0/0

PROBLEM: Pages Not Loading
──────────────────────────
Solution:
  - Wait 5 minutes after deployment (cold starts)
  - Check Render service status = "Live"
  - Verify routes are registered in server.js:
    app.use("/", require("./routes/policyRoutes"));
  - Test health endpoint first: /api/health

PROBLEM: MongoDB Connection Error
──────────────────────────────────
Solution:
  - Verify MONGODB_URI format
  - Check password has no URL-encoded characters
  - Ensure IP whitelist includes 0.0.0.0/0
  - Test connection string locally first

PROBLEM: Google OAuth Redirect Mismatch
─────────────────────────────────────────
Solution:
  - Update .env.google:
    GOOGLE_REDIRECT_URI=https://your-app-url.onrender.com/api/auth/google/callback
  - Update Google Cloud Console:
    OAuth 2.0 Client IDs → Authorized redirect URIs
    Add: https://your-app-url.onrender.com/api/auth/google/callback

PROBLEM: Free Tier Spins Down
──────────────────────────────
Solution (Render):
  - Free services sleep after 15 min of inactivity
  - First request after sleep takes ~30 seconds
  - This is NORMAL and doesn't affect functionality
  - Policy pages load instantly once server is awake

PROBLEM: CORS Issues
────────────────────
Solution:
  - Your server.js already has: app.use(cors());
  - This allows all origins (fine for public pages)
  - Policy pages don't make API calls, so CORS doesn't apply

========================================================================
QUICK REFERENCE: YOUR ROUTES
========================================================================

After deployment, these routes are publicly accessible:

  GET /privacy-policy  → Full Privacy Policy HTML page
  GET /terms           → Full Terms of Service HTML page
  GET /api/health      → Health check endpoint

NO authentication, database, or API keys required for policy pages.
They will work IMMEDIATELY after deployment.

========================================================================
DEPLOYMENT COMMANDS SUMMARY
========================================================================

# Navigate to backend
cd "e:\Front-End\internship 2\my-drive\backend"

# Commit and push to GitHub
git add .
git commit -m "Deploy policy pages"
git push

# Your deployed URLs will be:
# Privacy Policy: https://your-app.onrender.com/privacy-policy
# Terms of Service: https://your-app.onrender.com/terms

========================================================================
END OF DEPLOYMENT GUIDE
========================================================================
