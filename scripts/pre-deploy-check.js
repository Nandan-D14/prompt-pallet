#!/usr/bin/env node

/**
 * Pre-deployment checks for Prompt Palette
 * This script validates environment, dependencies, and builds the project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n${colors.bold}${colors.blue}[${step}]${colors.reset} ${description}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Required environment variables
const requiredEnvVars = [
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

// Optional environment variables
const optionalEnvVars = [
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_GEMINI_API_KEY',
  'NOTIFICATION_EMAIL_1',
  'NOTIFICATION_EMAIL_2',
  'NOTIFICATION_EMAIL_3'
];

function checkEnvironmentVariables() {
  logStep('1', 'Checking Environment Variables');
  
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    logError('.env.local file not found!');
    logWarning('Copy .env.example to .env.local and configure your environment variables');
    return false;
  }
  
  // Load environment variables
  require('dotenv').config({ path: envPath });
  
  let allRequired = true;
  
  // Check required variables
  log('\nRequired variables:');
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      logSuccess(`${envVar} ✓`);
    } else {
      logError(`${envVar} is missing!`);
      allRequired = false;
    }
  }
  
  // Check optional variables
  log('\nOptional variables:');
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      logSuccess(`${envVar} ✓`);
    } else {
      logWarning(`${envVar} (optional)`);
    }
  }
  
  return allRequired;
}

function checkDependencies() {
  logStep('2', 'Checking Dependencies');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const lockFile = fs.existsSync('package-lock.json') ? 'package-lock.json' : 
                    fs.existsSync('yarn.lock') ? 'yarn.lock' : null;
    
    if (!lockFile) {
      logWarning('No lock file found. Run npm install or yarn install first.');
    } else {
      logSuccess(`Lock file found: ${lockFile}`);
    }
    
    // Check critical dependencies
    const criticalDeps = [
      'next',
      'react',
      'firebase',
      'firebase-admin',
      'motion'
    ];
    
    for (const dep of criticalDeps) {
      if (packageJson.dependencies[dep]) {
        logSuccess(`${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        logError(`Critical dependency missing: ${dep}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logError(`Error checking dependencies: ${error.message}`);
    return false;
  }
}

function checkFirebaseConfig() {
  logStep('3', 'Validating Firebase Configuration');
  
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const adminProjectId = process.env.FIREBASE_PROJECT_ID;
  
  if (projectId !== adminProjectId) {
    logError('Firebase project IDs do not match between client and admin configs!');
    return false;
  }
  
  // Check if private key is properly formatted
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    logError('Firebase private key appears to be malformed');
    return false;
  }
  
  logSuccess('Firebase configuration appears valid');
  return true;
}

function runLinting() {
  logStep('4', 'Running Linter');
  
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    logSuccess('Linting passed');
    return true;
  } catch (error) {
    logError('Linting failed');
    return false;
  }
}

function runBuild() {
  logStep('5', 'Building Application');
  
  try {
    log('This may take a few minutes...');
    execSync('npm run build', { stdio: 'inherit' });
    logSuccess('Build completed successfully');
    return true;
  } catch (error) {
    logError('Build failed');
    return false;
  }
}

function checkProjectStructure() {
  logStep('6', 'Checking Project Structure');
  
  const requiredPaths = [
    'app',
    'components',
    'lib',
    'firebase',
    'types',
    'middleware.ts',
    'next.config.ts',
    'package.json'
  ];
  
  let allExist = true;
  
  for (const requiredPath of requiredPaths) {
    if (fs.existsSync(requiredPath)) {
      logSuccess(`${requiredPath} ✓`);
    } else {
      logError(`Missing: ${requiredPath}`);
      allExist = false;
    }
  }
  
  return allExist;
}

function main() {
  log(`${colors.bold}${colors.blue}🚀 Prompt Palette Pre-Deployment Check${colors.reset}\n`);
  
  const checks = [
    checkProjectStructure,
    checkEnvironmentVariables,
    checkDependencies,
    checkFirebaseConfig,
    runLinting,
    runBuild
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    if (!check()) {
      allPassed = false;
      break;
    }
  }
  
  log('\n' + '='.repeat(50));
  
  if (allPassed) {
    logSuccess(`${colors.bold}🎉 All checks passed! Your app is ready for deployment.${colors.reset}`);
    log('\nNext steps:');
    log('1. Deploy to Vercel: npx vercel --prod');
    log('2. Or deploy to your preferred platform');
    log('3. Configure environment variables in your deployment platform');
    log('4. Update Firebase security rules');
    process.exit(0);
  } else {
    logError(`${colors.bold}🚨 Some checks failed. Please fix the issues above before deploying.${colors.reset}`);
    process.exit(1);
  }
}

// Run the script
main();
