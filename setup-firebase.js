#!/usr/bin/env node

/**
 * Firebase Setup Helper Script
 * This script helps you get your Firebase configuration values
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup Helper');
console.log('========================\n');

console.log('📋 Follow these steps to get your Firebase credentials:\n');

console.log('1️⃣  Go to Firebase Console: https://console.firebase.google.com/');
console.log('2️⃣  Create a new project or select an existing one');
console.log('3️⃣  Click the gear icon ⚙️ next to "Project Overview"');
console.log('4️⃣  Select "Project settings"');
console.log('5️⃣  Scroll down to "Your apps" section');
console.log('6️⃣  Click "Add app" and select Web app (</>)');
console.log('7️⃣  Copy the configuration values from the provided config object\n');

console.log('🔑 For Admin Configuration:');
console.log('1️⃣  In Project Settings, click "Service accounts" tab');
console.log('2️⃣  Click "Generate new private key"');
console.log('3️⃣  Download the JSON file');
console.log('4️⃣  Extract the values from the JSON file\n');

console.log('📝 Replace the placeholder values in .env.local with your actual credentials\n');

console.log('✅ Your .env.local file is ready at:', path.resolve('.env.local'));
console.log('📖 Check FIREBASE_SETUP.md for detailed instructions\n');

// Check if .env.local exists
if (fs.existsSync('.env.local')) {
  console.log('🎉 .env.local file created successfully!');
} else {
  console.log('❌ .env.local file not found. Please create it manually.');
} 