# My Drive - Setup Guide

## 🚀 Quick Start Options

You can run this project in **two ways**:

### Option 1: Local Development (MongoDB Compass)
Perfect for demos, testing, and development.

### Option 2: Production Deployment (MongoDB Atlas)
Deployed and accessible online.

---

## 📋 Option 1: Local Development Setup

### Prerequisites
- Node.js installed
- MongoDB installed and running locally
- MongoDB Compass (optional, for visual database management)

### Step 1: Start MongoDB Locally
Make sure MongoDB is running on your machine:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

### Step 2: Configure Backend Environment

1. Navigate to the `backend` folder:
```bash
cd backend
```

2. Create a `.env` file (or rename `.env.example` if available):
```env
# Backend Local Environment
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drive-clone
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development

# Google OAuth (Optional - only needed for Google Drive integration)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/form/google/callback
```

3. Install dependencies:
```bash
npm install
```

4. Start the backend server:
```bash
npm start
```

The backend will run at: `http://localhost:5000`

### Step 3: Configure Frontend Environment

1. Navigate to the `frontend` folder:
```bash
cd frontend
```

2. The `.env.local` file is already created with:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run at: `http://localhost:5173`

### Step 4: Access MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. You'll see the `drive-clone` database with all your collections

---

## 🌐 Option 2: Production Deployment (MongoDB Atlas)

### Current Production URLs
- **Frontend:** https://my-drive-application-1.onrender.com
- **Backend:** https://my-drive-application.onrender.com
- **Database:** MongoDB Atlas (mongodb+srv://chris:****@chris.ywb0p2u.mongodb.net/drive-clone)

### Already Deployed! ✅
Both frontend and backend are already deployed and working.

---

## 🔄 Switching Between Local and Production

### For Frontend:

**Use Local Backend:**
```env
# frontend/.env.local
VITE_API_URL=http://localhost:5000/api
```

**Use Production Backend:**
```env
# frontend/.env.production
VITE_API_URL=https://my-drive-application.onrender.com/api
```

### For Backend:

**Use Local MongoDB:**
```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/drive-clone
```

**Use MongoDB Atlas:**
```env
# backend/.env
MONGODB_URI=mongodb+srv://chris:Casper@2000@chris.ywb0p2u.mongodb.net/drive-clone
```

---

## 📝 Environment Files Summary

### Frontend (`/frontend`)
| File | Purpose | When to Use |
|------|---------|-------------|
| `.env.local` | Local development | Running `npm run dev` locally |
| `.env.production` | Production deployment | Deploying to Render |
| `.env.example` | Template | Reference for creating new env files |

### Backend (`/backend`)
| File | Purpose |
|------|---------|
| `.env` | Contains MongoDB connection, JWT secret, Google OAuth |

---

## 🧪 Testing Local Setup

1. **Start MongoDB** locally
2. **Start backend:** `cd backend && npm start`
3. **Start frontend:** `cd frontend && npm run dev`
4. Open browser: `http://localhost:5173`
5. Register a new account or login
6. Upload files, create folders, test all features!

---

## 🔧 Troubleshooting

### Frontend can't connect to backend
- Check `.env.local` has correct `VITE_API_URL`
- Ensure backend is running on port 5000
- Check browser console for CORS errors

### MongoDB connection failed
- Verify MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For local: `mongodb://localhost:27017/drive-clone`
- For Atlas: Use your Atlas connection string

### Port already in use
- Backend: Change `PORT=5000` to another port in `.env`
- Frontend: Vite will auto-select a port if 5173 is busy

---

## 📦 Deployment Checklist

Before deploying to Render:

- [ ] Update `backend/.env` with MongoDB Atlas URI
- [ ] Update `frontend/.env.production` with deployed backend URL
- [ ] Set environment variables in Render dashboard
- [ ] Test CORS configuration
- [ ] Verify all API endpoints work
- [ ] Test registration/login flow

---

## 🔐 Security Notes

⚠️ **NEVER commit `.env` files to Git!**

Sensitive information in `.env` files:
- MongoDB passwords
- JWT secrets
- Google OAuth credentials

For production, set these in Render's Environment Variables dashboard.

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check backend terminal for server errors
3. Verify MongoDB is running
4. Check `.env` files have correct values
