#!/usr/bin/env node

/**
 * Deployment Preparation Script
 * This script helps prepare your prompt palette for deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Prompt Palette Deployment Preparation');
console.log('========================================\n');

// Step 1: Check if .env.local exists
console.log('1️⃣  Checking environment configuration...');
if (!fs.existsSync('.env.local')) {
    console.log('❌ .env.local file not found!');
    console.log('📋 Creating .env.local from template...');
    
    try {
        fs.copyFileSync('.env.example', '.env.local');
        console.log('✅ Created .env.local file');
        console.log('📝 Please update the values in .env.local with your Firebase credentials');
        console.log('📖 See SETUP.md for detailed instructions\n');
    } catch (error) {
        console.log('❌ Failed to create .env.local file');
        console.log('💡 Please create it manually by copying .env.example\n');
    }
} else {
    console.log('✅ .env.local file exists\n');
}

// Step 2: Check dependencies
console.log('2️⃣  Checking dependencies...');
try {
    if (!fs.existsSync('node_modules')) {
        console.log('📦 Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed\n');
    } else {
        console.log('✅ Dependencies already installed\n');
    }
} catch (error) {
    console.log('❌ Failed to install dependencies');
    console.log('💡 Please run: npm install\n');
}

// Step 3: Run environment check
console.log('3️⃣  Running environment check...');
try {
    execSync('npm run env-check', { stdio: 'inherit' });
    console.log('✅ Environment check passed\n');
} catch (error) {
    console.log('❌ Environment check failed');
    console.log('💡 Please configure your .env.local file properly\n');
}

// Step 4: Run lint check
console.log('4️⃣  Running lint check...');
try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Lint check passed\n');
} catch (error) {
    console.log('❌ Lint check failed');
    console.log('💡 Please fix the linting errors before deployment\n');
}

// Step 5: Test build
console.log('5️⃣  Testing build...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful\n');
} catch (error) {
    console.log('❌ Build failed');
    console.log('💡 Please fix the build errors before deployment\n');
}

// Step 6: Git status check
console.log('6️⃣  Checking Git status...');
try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
        console.log('📝 Uncommitted changes found:');
        console.log(gitStatus);
        console.log('💡 Consider committing changes before deployment\n');
    } else {
        console.log('✅ No uncommitted changes\n');
    }
} catch (error) {
    console.log('❌ Git status check failed');
    console.log('💡 Make sure this is a Git repository\n');
}

// Step 7: Deployment checklist
console.log('7️⃣  Deployment Checklist:');
console.log('========================\n');

console.log('📋 Before deploying to Vercel:');
console.log('  □ Firebase project created and configured');
console.log('  □ Authentication providers enabled (Email/Password, Google)');
console.log('  □ Firestore database created');
console.log('  □ Service account key generated');
console.log('  □ All environment variables set in .env.local');
console.log('  □ Environment variables will be set in Vercel dashboard');
console.log('  □ Firebase security rules configured');
console.log('  □ Authorized domains updated in Firebase console\n');

console.log('🚀 Deployment Commands:');
console.log('=======================\n');

console.log('Option 1: Deploy with Vercel CLI');
console.log('  npm install -g vercel');
console.log('  vercel --prod\n');

console.log('Option 2: Deploy via GitHub + Vercel');
console.log('  git add .');
console.log('  git commit -m "Ready for deployment"');
console.log('  git push origin main');
console.log('  # Then connect repository in Vercel dashboard\n');

console.log('🔧 Post-deployment tasks:');
console.log('  1. Add production domain to Firebase authorized domains');
console.log('  2. Update Firestore security rules');
console.log('  3. Test all functionality in production');
console.log('  4. Monitor logs for any issues\n');

console.log('📖 For detailed instructions, see DEPLOYMENT.md\n');

console.log('✨ Deployment preparation complete!');
console.log('🎉 Your prompt palette is ready for deployment!');
