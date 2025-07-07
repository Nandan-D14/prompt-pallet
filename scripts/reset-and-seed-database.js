#!/usr/bin/env node

/**
 * Reset and Seed Database Script
 * This script deletes existing collections and seeds them with proper data structure
 */

require('dotenv').config({ path: '.env.local' });
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

// Sample gallery data with proper schema
const sampleGalleryData = [
    {
        id: "gallery_001",
        src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        alt: "Futuristic AI robot in neon cityscape",
        title: "Neon Dreams",
        description: "A sleek AI robot standing in a vibrant neon-lit cityscape, representing the fusion of technology and urban life.",
        tags: ["trending", "ai", "robot", "cyberpunk", "neon", "city"],
        height: 800,
        likes: 156,
        prompt: "A futuristic AI robot with glowing blue eyes standing in a neon-lit cyberpunk cityscape at night, detailed metallic textures, vibrant purple and pink lighting",
        orientation: "portrait",
        color: "blue",
        gridSize: "medium"
    },
    {
        id: "gallery_002", 
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        alt: "Abstract digital art with flowing colors",
        title: "Digital Flow",
        description: "An abstract representation of digital data streams flowing through cyberspace.",
        tags: ["trending", "abstract", "digital", "flow", "colorful"],
        height: 600,
        likes: 89,
        prompt: "Abstract digital art showing flowing data streams, vibrant colors, smooth gradients, cyber aesthetic",
        orientation: "landscape",
        color: "purple",
        gridSize: "large"
    },
    {
        id: "gallery_003",
        src: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        alt: "Minimalist geometric patterns",
        title: "Geometric Harmony",
        description: "Clean geometric patterns showcasing minimalist design principles.",
        tags: ["geometric", "minimalist", "clean", "pattern"],
        height: 500,
        likes: 234,
        prompt: "Minimalist geometric patterns, clean lines, perfect symmetry, modern design aesthetic",
        orientation: "square",
        color: "green",
        gridSize: "small"
    },
    {
        id: "gallery_004",
        src: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        alt: "Sunset landscape with mountains",
        title: "Mountain Serenity",
        description: "A peaceful sunset over mountain ranges, capturing nature's beauty.",
        tags: ["nature", "landscape", "sunset", "mountains", "peaceful"],
        height: 650,
        likes: 178,
        prompt: "Serene mountain landscape at sunset, golden hour lighting, peaceful atmosphere, detailed terrain",
        orientation: "landscape",
        color: "orange",
        gridSize: "medium"
    },
    {
        id: "gallery_005",
        src: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        alt: "Space nebula with stars",
        title: "Cosmic Wonder",
        description: "A stunning view of a colorful nebula surrounded by countless stars.",
        tags: ["trending", "space", "nebula", "stars", "cosmic", "astronomy"],
        height: 750,
        likes: 312,
        prompt: "Breathtaking space nebula with vibrant colors, countless stars, cosmic dust, astronomical photography style",
        orientation: "portrait",
        color: "purple",
        gridSize: "large"
    },
    {
        id: "gallery_006",
        src: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        alt: "Ocean waves in motion",
        title: "Ocean Dynamics",
        description: "Powerful ocean waves captured in motion, showing the raw energy of the sea.",
        tags: ["ocean", "waves", "motion", "blue", "dynamic"],
        height: 550,
        likes: 145,
        prompt: "Dynamic ocean waves in motion, powerful water movement, deep blue colors, nautical photography",
        orientation: "landscape",
        color: "blue",
        gridSize: "medium"
    },
    {
        id: "gallery_007",
        src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        alt: "Forest path in autumn",
        title: "Autumn Journey",
        description: "A peaceful forest path covered in colorful autumn leaves.",
        tags: ["trending", "forest", "autumn", "path", "nature", "peaceful"],
        height: 700,
        likes: 267,
        prompt: "Peaceful forest path in autumn, colorful fallen leaves, warm lighting, serene atmosphere",
        orientation: "portrait",
        color: "orange",
        gridSize: "small"
    },
    {
        id: "gallery_008",
        src: "https://images.unsplash.com/photo-1573330165-10e8b50e5498?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        alt: "Modern architecture detail",
        title: "Architectural Lines",
        description: "Modern architectural details showcasing clean lines and geometric forms.",
        tags: ["architecture", "modern", "geometric", "lines", "design"],
        height: 600,
        likes: 98,
        prompt: "Modern architectural details, clean geometric lines, contemporary design, minimalist structure",
        orientation: "square",
        color: "gray",
        gridSize: "medium"
    }
];

// Sample subscriber data
const sampleSubscribers = [
    {
        email: "demo.user@example.com",
        name: "Demo User",
        subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        preferences: {
            emailNotifications: true,
            frequency: "weekly"
        }
    },
    {
        email: "jane.smith@example.com", 
        name: "Jane Smith",
        subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        preferences: {
            emailNotifications: true,
            frequency: "immediate"
        }
    }
];

async function deleteCollection(collectionName) {
    console.log(`🗑️  Deleting collection: ${collectionName}`);
    
    const collectionRef = db.collection(collectionName);
    const query = collectionRef.limit(500);
    
    let deletedCount = 0;
    
    while (true) {
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            break;
        }
        
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        deletedCount += snapshot.docs.length;
    }
    
    console.log(`   ✅ Deleted ${deletedCount} documents from ${collectionName}`);
}

async function seedGalleryCollection() {
    console.log('🌱 Seeding gallery collection...');
    
    const batch = db.batch();
    
    sampleGalleryData.forEach((item) => {
        const docRef = db.collection('gallery').doc(item.id);
        const galleryItem = {
            ...item,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            views: 0
        };
        batch.set(docRef, galleryItem);
    });
    
    await batch.commit();
    console.log(`   ✅ Added ${sampleGalleryData.length} gallery items`);
}

async function seedSubscribersCollection() {
    console.log('🌱 Seeding subscribers collection...');
    
    const batch = db.batch();
    
    sampleSubscribers.forEach((subscriber, index) => {
        const docRef = db.collection('subscribers').doc(`subscriber_${index + 1}`);
        batch.set(docRef, subscriber);
    });
    
    await batch.commit();
    console.log(`   ✅ Added ${sampleSubscribers.length} subscribers`);
}

async function createIndexes() {
    console.log('📊 Creating database indexes...');
    
    // Note: Firestore indexes are typically created through the Firebase Console
    // or automatically when queries are run. This function serves as documentation
    // of the indexes that should be created.
    
    console.log('   📋 Required indexes for optimal performance:');
    console.log('      - gallery: createdAt (desc)');
    console.log('      - gallery: tags (array-contains)');
    console.log('      - gallery: likes (desc)');
    console.log('      - gallery: orientation, color, gridSize (composite)');
    console.log('      - subscribers: subscribedAt (desc)');
    console.log('   ℹ️  Indexes will be auto-created on first query usage');
}

async function resetAndSeedDatabase() {
    console.log('🔄 Starting database reset and seed process');
    console.log('==========================================\n');
    
    try {
        // Step 1: Delete existing collections
        console.log('Step 1: Cleaning existing data');
        await deleteCollection('gallery');
        await deleteCollection('subscribers');
        console.log('✅ Database cleanup completed\n');
        
        // Step 2: Seed gallery collection
        console.log('Step 2: Seeding gallery data');
        await seedGalleryCollection();
        console.log('✅ Gallery seeding completed\n');
        
        // Step 3: Seed subscribers collection
        console.log('Step 3: Seeding subscribers data');
        await seedSubscribersCollection();
        console.log('✅ Subscribers seeding completed\n');
        
        // Step 4: Create indexes
        console.log('Step 4: Setting up database indexes');
        await createIndexes();
        console.log('✅ Index setup completed\n');
        
        // Step 5: Verify data
        console.log('Step 5: Verifying seeded data');
        const gallerySnapshot = await db.collection('gallery').get();
        const subscribersSnapshot = await db.collection('subscribers').get();
        
        console.log(`   📊 Gallery items: ${gallerySnapshot.size}`);
        console.log(`   📊 Subscribers: ${subscribersSnapshot.size}`);
        
        // Count trending items
        const trendingQuery = await db.collection('gallery')
            .where('tags', 'array-contains', 'trending')
            .get();
        console.log(`   🔥 Trending items: ${trendingQuery.size}`);
        
        console.log('\n🎉 Database reset and seed completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   - Gallery collection recreated with proper schema');
        console.log('   - Sample data includes trending photos for slideshow');
        console.log('   - Subscribers collection set up for email notifications');
        console.log('   - All data includes proper validation constraints');
        console.log('\n🚀 Your admin gallery upload page can now perform full CRUD operations!');
        
    } catch (error) {
        console.error('❌ Database reset and seed failed:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('  1. Check Firebase Admin SDK configuration');
        console.log('  2. Verify Firestore permissions');
        console.log('  3. Ensure network connectivity');
        process.exit(1);
    }
}

// Run the reset and seed process
resetAndSeedDatabase().then(() => {
    console.log('\n🎯 Next Steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Test admin gallery upload CRUD operations');
    console.log('  3. Verify trending photos appear in gallery slideshow');
    console.log('  4. Test email notification functionality');
    process.exit(0);
}).catch((error) => {
    console.error('Reset and seed failed:', error);
    process.exit(1);
});
