@echo off
echo Creating frontend structure...

if not exist public mkdir public
if not exist src mkdir src
if not exist src\components mkdir src\components
if not exist src\styles mkdir src\styles

echo Creating public/index.html...
(
echo ^<!DOCTYPE html^>
echo ^<html lang="en"^>
echo   ^<head^>
echo     ^<meta charset="utf-8" /^>
echo     ^<link rel="icon" href="%%PUBLIC_URL%%/favicon.ico" /^>
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1" /^>
echo     ^<meta name="theme-color" content="#000000" /^>
echo     ^<title^>My Drive - File Storage^</title^>
echo   ^</head^>
echo   ^<body^>
echo     ^<noscript^>You need to enable JavaScript to run this app.^</noscript^>
echo     ^<div id="root"^>^</div^>
echo   ^</body^>
echo ^</html^>
) > public\index.html

echo Creating public/manifest.json...
(
echo {
echo   "short_name": "My Drive",
echo   "name": "My Drive - File Storage",
echo   "icons": [],
echo   "start_url": ".",
echo   "display": "standalone",
echo   "theme_color": "#000000",
echo   "background_color": "#ffffff"
echo }
) > public\manifest.json

echo Creating src/index.js...
(
echo import React from 'react';
echo import ReactDOM from 'react-dom/client';
echo import './styles/App.css';
echo import App from './App';
echo.
echo const root = ReactDOM.createRoot(document.getElementById('root'^)^);
echo root.render(
echo   ^<React.StrictMode^>
echo     ^<App /^>
echo   ^</React.StrictMode^>
echo );
) > src\index.js

echo.
echo ✅ Frontend structure created!
echo.
echo Now run: npm start
pause