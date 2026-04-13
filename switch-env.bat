@echo off
echo ================================
echo   My Drive - Environment Switcher
echo ================================
echo.
echo Choose environment:
echo.
echo 1. LOCAL (MongoDB Compass + Local Backend)
echo 2. PRODUCTION (MongoDB Atlas + Deployed Backend)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" goto local
if "%choice%"=="2" goto production
echo Invalid choice! Please enter 1 or 2.
pause
exit

:local
echo.
echo Switching to LOCAL environment...
echo.

REM Update frontend .env
echo VITE_API_URL=http://localhost:5000/api > ..\frontend\.env
echo ✅ Frontend: Set to local backend (http://localhost:5000/api)

REM Remind user about backend .env
echo.
echo ⚠️  Make sure your backend .env has:
echo    MONGODB_URI=mongodb://localhost:27017/drive-clone
echo.
echo To run locally:
echo   1. Start MongoDB
echo   2. cd backend ^&^& npm start
echo   3. cd frontend ^&^& npm run dev
echo.
pause
exit

:production
echo.
echo Switching to PRODUCTION environment...
echo.

REM Update frontend .env
echo VITE_API_URL=https://my-drive-application.onrender.com/api > ..\frontend\.env
echo ✅ Frontend: Set to production backend

echo.
echo ⚠️  Make sure your backend .env has:
echo    MONGODB_URI=mongodb+srv://chris:Casper@2000@chris.ywb0p2u.mongodb.net/drive-clone
echo.
echo Access your app at:
echo   https://my-drive-application-1.onrender.com
echo.
pause
exit
