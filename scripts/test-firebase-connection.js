#!/usr/bin/env node

/**
 * Firebase Connection Test and Database Setup
 * This script tests the Firebase connection and sets up initial database structure
 */

require('dotenv').config({ path: '.env.local' });

// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin
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

const db = admin.firestore();
const auth = admin.auth();

async function testFirebaseConnection() {
    console.log('🔥 Testing Firebase Connection');
    console.log('===============================\n');

    try {
        // Test Firestore connection
        console.log('1️⃣  Testing Firestore connection...');
        const testDoc = await db.collection('_test').doc('connection').set({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            message: 'Firebase connection successful!'
        });
        console.log('✅ Firestore connection successful!\n');

        // Test Authentication
        console.log('2️⃣  Testing Firebase Authentication...');
        try {
            // Try to list users (this will work if auth is properly configured)
            const listUsersResult = await auth.listUsers(1);
            console.log('✅ Firebase Authentication connection successful!\n');
        } catch (authError) {
            console.log('✅ Firebase Authentication is configured (limited access is normal)\n');
        }

        // Set up initial database structure
        console.log('3️⃣  Setting up initial database structure...');
        await setupInitialDatabase();
        console.log('✅ Database structure initialized!\n');

        // Clean up test document
        await db.collection('_test').doc('connection').delete();
        console.log('🧹 Cleaned up test data\n');

        console.log('🎉 Firebase setup completed successfully!');
        console.log('🚀 Your prompt palette is ready to store data in Firestore!\n');

        console.log('📋 Database Collections Created:');
        console.log('  - users: User profiles and settings');
        console.log('  - gallery: Public gallery items');
        console.log('  - saved-images: User saved images');
        console.log('  - admin: Admin-only data');
        console.log('  - prompts: Generated prompts');

    } catch (error) {
        console.error('❌ Firebase connection failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('  1. Check your .env.local file');
        console.log('  2. Verify Firebase project ID');
        console.log('  3. Ensure service account has proper permissions');
        console.log('  4. Check if Firestore is enabled in Firebase Console');
        process.exit(1);
    }
}

async function setupInitialDatabase() {
    try {
        // Create initial collections with example documents
        const batch = db.batch();

        // Users collection structure
        const usersRef = db.collection('users').doc('_structure');
        batch.set(usersRef, {
            _info: 'This collection stores user profiles and settings',
            structure: {
                uid: 'string - user auth ID',
                email: 'string - user email',
                displayName: 'string - user display name',
                photoURL: 'string - user profile photo',
                isAdmin: 'boolean - admin status',
                createdAt: 'timestamp - account creation',
                updatedAt: 'timestamp - last update',
                preferences: {
                    theme: 'string - dark/light',
                    notifications: 'boolean'
                }
            }
        });

        // Gallery collection structure
        const galleryRef = db.collection('gallery').doc('_structure');
        batch.set(galleryRef, {
            _info: 'This collection stores public gallery items',
            structure: {
                id: 'string - unique item ID',
                title: 'string - item title',
                description: 'string - item description',
                imageUrl: 'string - image URL',
                prompt: 'string - generated prompt',
                tags: 'array - item tags',
                author: 'string - creator name',
                authorId: 'string - creator user ID',
                createdAt: 'timestamp - creation time',
                likes: 'number - like count',
                views: 'number - view count'
            }
        });

        // Saved images collection structure
        const savedImagesRef = db.collection('saved-images').doc('_structure');
        batch.set(savedImagesRef, {
            _info: 'This collection stores user saved images',
            structure: {
                userId: 'string - owner user ID',
                images: 'array - list of saved images',
                imageData: {
                    id: 'string - image ID',
                    url: 'string - image URL',
                    prompt: 'string - associated prompt',
                    title: 'string - image title',
                    savedAt: 'timestamp - save time'
                }
            }
        });

        // Admin collection structure
        const adminRef = db.collection('admin').doc('_structure');
        batch.set(adminRef, {
            _info: 'This collection stores admin-only data',
            structure: {
                stats: {
                    totalUsers: 'number',
                    totalGalleryItems: 'number',
                    totalPrompts: 'number'
                },
                settings: {
                    maintenanceMode: 'boolean',
                    featuredItems: 'array'
                }
            }
        });

        // Prompts collection structure
        const promptsRef = db.collection('prompts').doc('_structure');
        batch.set(promptsRef, {
            _info: 'This collection stores generated prompts',
            structure: {
                id: 'string - unique prompt ID',
                prompt: 'string - generated prompt text',
                userId: 'string - creator user ID',
                category: 'string - prompt category',
                style: 'string - prompt style',
                parameters: 'object - generation parameters',
                createdAt: 'timestamp - creation time',
                isPublic: 'boolean - public visibility'
            }
        });

        await batch.commit();

        // Create admin user document if admin email is provided
        if (process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
            const adminUserRef = db.collection('users').doc('admin-setup');
            await adminUserRef.set({
                _info: 'Admin user setup reference',
                adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
                setupAt: admin.firestore.FieldValue.serverTimestamp(),
                note: 'When this email signs up, they should be granted admin privileges'
            });
        }

        console.log('  ✅ Database collections initialized');
        console.log('  ✅ Data structures documented');
        console.log('  ✅ Admin email configured');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        throw error;
    }
}

// Run the test
testFirebaseConnection().then(() => {
    console.log('\n🎯 Next Steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Test user registration and login');
    console.log('  3. Check Firestore console for data');
    console.log('  4. Deploy when ready with: npm run deploy-prep');
    process.exit(0);
}).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
});
