#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

console.log("🔧 Environment Configuration Check");
console.log("=====================================");

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'NEXT_PUBLIC_ADMIN_EMAIL'
];

let allSet = true;

console.log("\n📋 Firebase Configuration:");
requiredVars.forEach(varName => {
  const isSet = !!process.env[varName];
  const status = isSet ? "✅ Set" : "❌ Missing";
  console.log(`  ${varName}: ${status}`);
  if (!isSet) allSet = false;
});

console.log("\n" + "=".repeat(40));

if (allSet) {
  console.log("🎉 All environment variables are configured!");
  console.log("🚀 Ready for deployment!");
} else {
  console.log("⚠️  Some environment variables are missing.");
  console.log("📝 Please check your .env.local file.");
  console.log("📖 See SETUP.md for detailed instructions.");
  process.exit(1);
}

// Additional Firebase validation
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID) {
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== process.env.FIREBASE_PROJECT_ID) {
    console.log("\n⚠️  Warning: Client and Admin Firebase project IDs don't match!");
  }
}

console.log("\n🔐 Security Check:");
console.log(`  Admin Email: ${process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Not set'}`);
console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);

console.log("\n✨ Environment check complete!");
