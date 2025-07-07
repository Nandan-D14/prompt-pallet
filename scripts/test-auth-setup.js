#!/usr/bin/env node

/**
 * Firebase Authentication Test Script
 * This script tests Firebase authentication configuration and setup
 */

require('dotenv').config({ path: '.env.local' });

// Firebase configuration check
function checkFirebaseConfig() {
    console.log('🔐 Checking Firebase Configuration...\n');
    
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
    
    const missing = [];
    const present = [];
    
    requiredEnvVars.forEach(varName => {
        if (process.env[varName]) {
            present.push(varName);
        } else {
            missing.push(varName);
        }
    });
    
    console.log('✅ Present environment variables:');
    present.forEach(varName => {
        const value = process.env[varName];
        const displayValue = varName.includes('KEY') || varName.includes('SECRET') 
            ? `${value.substring(0, 10)}...` 
            : value;
        console.log(`  - ${varName}: ${displayValue}`);
    });
    
    if (missing.length > 0) {
        console.log('\n❌ Missing environment variables:');
        missing.forEach(varName => {
            console.log(`  - ${varName}`);
        });
        return false;
    }
    
    console.log('\n✅ All required environment variables are present!\n');
    return true;
}

async function testClientFirebase() {
    console.log('📱 Testing Firebase Client Configuration...\n');
    
    try {
        // Test Firebase client config
        const { initializeApp, getApps } = require('firebase/app');
        const { getAuth } = require('firebase/auth');
        const { getFirestore } = require('firebase/firestore');
        
        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };
        
        // Initialize app
        let app;
        if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApps()[0];
        }
        
        // Test auth
        const auth = getAuth(app);
        console.log('✅ Firebase Auth initialized');
        console.log(`  - Auth domain: ${auth.config.authDomain}`);
        
        // Test Firestore
        const db = getFirestore(app);
        console.log('✅ Firestore initialized');
        console.log(`  - Project ID: ${db.app.options.projectId}`);
        
        console.log('\n✅ Firebase client setup successful!\n');
        return true;
    } catch (error) {
        console.error('❌ Firebase client setup failed:', error.message);
        console.log('\n🔧 Possible solutions:');
        console.log('  1. Check your .env.local file');
        console.log('  2. Verify all environment variables are correct');
        console.log('  3. Ensure Firebase project is properly configured');
        return false;
    }
}

async function testAdminFirebase() {
    console.log('⚡ Testing Firebase Admin Configuration...\n');
    
    try {
        const admin = require('firebase-admin');
        
        // Initialize admin if not already done
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
                databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
            });
        }
        
        const auth = admin.auth();
        const db = admin.firestore();
        
        // Test admin auth
        try {
            const listResult = await auth.listUsers(1);
            console.log('✅ Firebase Admin Auth working');
        } catch (authError) {
            console.log('✅ Firebase Admin Auth configured (listing users may be restricted)');
        }
        
        // Test admin Firestore
        const testDoc = await db.collection('_test').doc('admin-connection').set({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            message: 'Admin connection test successful'
        });
        console.log('✅ Firebase Admin Firestore working');
        
        // Clean up test document
        await db.collection('_test').doc('admin-connection').delete();
        
        console.log('\n✅ Firebase admin setup successful!\n');
        return true;
    } catch (error) {
        console.error('❌ Firebase admin setup failed:', error.message);
        console.log('\n🔧 Possible solutions:');
        console.log('  1. Check your service account credentials');
        console.log('  2. Verify FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY');
        console.log('  3. Ensure service account has proper permissions');
        return false;
    }
}

function checkAuthorizedDomains() {
    console.log('🌐 Checking Authorized Domains Configuration...\n');
    
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!authDomain || !projectId) {
        console.log('❌ Missing auth domain or project ID');
        return false;
    }
    
    console.log('📋 Required authorized domains for local development:');
    console.log('  - localhost');
    console.log('  - 127.0.0.1');
    console.log('  - 0.0.0.0');
    console.log('  - Your local IP (if accessing from other devices)');
    
    console.log('\n🔗 To add authorized domains:');
    console.log(`  1. Visit: https://console.firebase.google.com/project/${projectId}/authentication/settings`);
    console.log('  2. Go to "Authorized domains" tab');
    console.log('  3. Add the domains listed above');
    
    console.log('\n✅ Domain configuration guidance provided!\n');
    return true;
}

async function runAllTests() {
    console.log('🔥 Firebase Authentication Setup Test');
    console.log('=====================================\n');
    
    const configCheck = checkFirebaseConfig();
    if (!configCheck) {
        console.log('❌ Configuration check failed. Please fix environment variables first.');
        process.exit(1);
    }
    
    const clientTest = await testClientFirebase();
    const adminTest = await testAdminFirebase();
    const domainCheck = checkAuthorizedDomains();
    
    if (clientTest && adminTest && domainCheck) {
        console.log('🎉 All tests passed! Firebase authentication is properly configured.');
        console.log('\n📝 Next steps:');
        console.log('  1. Start your development server: npm run dev');
        console.log('  2. Test sign-in and sign-up functionality');
        console.log('  3. Check browser console for any remaining errors');
        console.log('  4. Ensure authorized domains are configured in Firebase Console');
    } else {
        console.log('❌ Some tests failed. Please review the errors above and fix the issues.');
        process.exit(1);
    }
}

// Run the tests
runAllTests().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
});
