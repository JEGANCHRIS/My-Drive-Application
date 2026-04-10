@echo off
echo Creating missing backend files...

REM Create routes folder if not exists
if not exist routes mkdir routes

REM Create authRoutes.js
echo Creating authRoutes.js...
(
echo const express = require('express'^);
echo const jwt = require('jsonwebtoken'^);
echo const User = require('../models/User'^);
echo const router = express.Router(^);
echo.
echo router.post('/register', async (req, res^) => ^{
echo   try ^{
echo     const { name, email, password } = req.body;
echo     const existingUser = await User.findOne({ email }^);
echo     if (existingUser^) return res.status(400^).json({ error: 'User exists' }^);
echo     const user = new User({ name, email, password }^);
echo     await user.save(^);
echo     const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '7d' }^);
echo     res.status(201^).json({ token, user: { id: user._id, name, email } }^);
echo   } catch (error^) ^{
echo     res.status(500^).json({ error: error.message }^);
echo   ^}
echo }^);
echo.
echo router.post('/login', async (req, res^) => ^{
echo   try ^{
echo     const { email, password } = req.body;
echo     const user = await User.findOne({ email }^);
echo     if (!user^) return res.status(401^).json({ error: 'Invalid credentials' }^);
echo     const isMatch = await user.comparePassword(password^);
echo     if (!isMatch^) return res.status(401^).json({ error: 'Invalid credentials' }^);
echo     const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '7d' }^);
echo     res.json({ token, user: { id: user._id, name: user.name, email } }^);
echo   } catch (error^) ^{
echo     res.status(500^).json({ error: error.message }^);
echo   ^}
echo }^);
echo.
echo module.exports = router;
) > routes\authRoutes.js

REM Create activityRoutes.js
echo Creating activityRoutes.js...
(
echo const express = require('express'^);
echo const ActivityLog = require('../models/ActivityLog'^);
echo const router = express.Router(^);
echo.
echo router.get('/:userId', async (req, res^) => ^{
echo   try ^{
echo     const activities = await ActivityLog.find({ userId: req.params.userId }^).sort({ timestamp: -1 }^).limit(50^);
echo     res.json(activities^);
echo   } catch (error^) ^{
echo     res.status(500^).json({ error: error.message }^);
echo   ^}
echo }^);
echo.
echo module.exports = router;
) > routes\activityRoutes.js

REM Create middleware folder and auth.js
if not exist middleware mkdir middleware
(
echo const jwt = require('jsonwebtoken'^);
echo.
echo const authMiddleware = async (req, res, next^) => ^{
echo   try ^{
echo     const token = req.header('Authorization'^)?.replace('Bearer ', ''^);
echo     if (!token^) throw new Error(^);
echo     const decoded = jwt.verify(token, process.env.JWT_SECRET ^|^| 'secretkey'^);
echo     req.userId = decoded.userId;
echo     next(^);
echo   } catch (error^) ^{
echo     res.status(401^).json({ error: 'Please authenticate' }^);
echo   ^}
echo };
echo.
echo module.exports = authMiddleware;
) > middleware\auth.js

REM Create utils folder and upload.js
if not exist utils mkdir utils
(
echo const multer = require('multer'^);
echo const path = require('path'^);
echo const fs = require('fs-extra'^);
echo.
echo const uploadDir = path.join(__dirname, '../uploads'^);
echo fs.ensureDirSync(uploadDir^);
echo.
echo const storage = multer.diskStorage({
echo   destination: async (req, file, cb^) => ^{
echo     cb(null, uploadDir^);
echo   ^},
echo   filename: (req, file, cb^) => ^{
echo     const uniqueSuffix = Date.now(^) + '-' + Math.round(Math.random(^) * 1E9^);
echo     cb(null, uniqueSuffix + path.extname(file.originalname)^);
echo   ^}
echo });
echo.
echo const upload = multer({
echo   storage: storage,
echo   limits: { fileSize: 500 * 1024 * 1024 },
echo   fileFilter: (req, file, cb^) => cb(null, true^)
echo });
echo.
echo module.exports = upload;
) > utils\upload.js

echo.
echo Missing files created successfully!
echo.
echo Now run: npm install
echo Then: npm run dev
pause