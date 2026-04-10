// Test script to verify all modules are working
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking required files...\n');

const requiredFiles = [
  'server.js',
  'models/User.js',
  'models/File.js',
  'models/Folder.js',
  'models/RecentUpload.js',
  'models/ShareLink.js',
  'models/ActivityLog.js',
  'routes/authRoutes.js',
  'routes/fileRoutes.js',
  'routes/folderRoutes.js',
  'routes/summarizeRoutes.js',
  'routes/activityRoutes.js',
  'middleware/auth.js',
  'utils/upload.js'
];

let missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
    console.log(`❌ Missing: ${file}`);
  } else {
    console.log(`✅ Found: ${file}`);
  }
});

if (missingFiles.length === 0) {
  console.log('\n🎉 All files present! You can start the server.');
  console.log('\n📝 To start: npm run dev');
} else {
  console.log(`\n⚠️ Missing ${missingFiles.length} files. Please create them.`);
}

// Check node_modules
console.log('\n📦 Checking dependencies...');
const packageJson = require('./package.json');
const deps = packageJson.dependencies;
let missingDeps = [];

Object.keys(deps).forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`✅ ${dep}`);
  } catch (e) {
    missingDeps.push(dep);
    console.log(`❌ ${dep} - NOT INSTALLED`);
  }
});

if (missingDeps.length > 0) {
  console.log(`\n⚠️ Missing dependencies. Run: npm install ${missingDeps.join(' ')}`);
}