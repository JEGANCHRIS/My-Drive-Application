// Test MongoDB connection string
require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n🔍 Testing MongoDB Connection...\n');

// Get the URI from environment
const uri = process.env.MONGODB_URI;

console.log('Connection String (masked):');
if (uri) {
  // Mask password for security
  const masked = uri.replace(/:([^@]+)@/, ':****@');
  console.log(masked);
  console.log('\n⚠️  Check: Does the password look correct above?');
} else {
  console.log('❌ MONGODB_URI is not set in environment variables!');
  process.exit(1);
}

// Try to connect
mongoose.connect(uri)
  .then(() => {
    console.log('\n✅ MongoDB connection successful!');
    console.log('   Database:', mongoose.connection.name);
    process.exit(0);
  })
  .catch(err => {
    console.log('\n❌ MongoDB connection failed:');
    console.log('   Error:', err.message);
    console.log('\n💡 Common fixes:');
    console.log('   1. URL-encode special characters in password:');
    console.log('      @ → %40');
    console.log('      : → %3A');
    console.log('      / → %2F');
    console.log('   2. Check MongoDB Atlas Network Access (allow 0.0.0.0/0)');
    console.log('   3. Verify username and password are correct');
    process.exit(1);
  });
