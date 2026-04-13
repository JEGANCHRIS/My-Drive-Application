# 🚀 Quick Start - My Drive

## Run Locally (For Demos)

### Step 1: Start MongoDB
```bash
net start MongoDB
```

### Step 2: Start Backend
```bash
cd backend
npm install  # First time only
npm start
```

### Step 3: Start Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
```

### Step 4: Open in Browser
🌐 http://localhost:5173

### View Database
📊 Open MongoDB Compass and connect to `mongodb://localhost:27017`

---

## Access Deployed Version

Just visit: https://my-drive-application-1.onrender.com

---

## Switch Between Local/Production

### Easy Way (Windows):
Double-click `switch-env.bat` or run:
```bash
switch-env.bat
```

### Manual Way:

**For Local:**
- Frontend `.env`: `VITE_API_URL=http://localhost:5000/api`
- Backend `.env`: `MONGODB_URI=mongodb://localhost:27017/drive-clone`

**For Production:**
- Frontend `.env`: `VITE_API_URL=https://my-drive-application.onrender.com/api`
- Backend `.env`: `MONGODB_URI=mongodb+srv://chris:Casper@2000@chris.ywb0p2u.mongodb.net/drive-clone`

---

📖 **Full Setup Guide:** See [SETUP-GUIDE.md](SETUP-GUIDE.md)
