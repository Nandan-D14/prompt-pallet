#!/usr/bin/env node

/**
 * Database Seeder for Prompt Palette
 * This script populates Firestore with sample data for testing
 */

require('dotenv').config({ path: '.env.local' });

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
    });
}

const db = admin.firestore();

async function seedDatabase() {
    console.log('🌱 Seeding Prompt Palette Database');
    console.log('==================================\n');

    try {
        // Sample gallery items
        console.log('1️⃣  Adding sample gallery items...');
        const galleryItems = [
            {
                id: 'gallery-001',
                title: 'Ethereal Forest Landscape',
                description: 'A mystical forest with glowing mushrooms and ethereal lighting',
                imageUrl: 'https://picsum.photos/800/600?random=1',
                prompt: 'A mystical forest with bioluminescent mushrooms, ethereal lighting, misty atmosphere, fantasy landscape, magical ambiance, soft color palette',
                tags: ['forest', 'mystical', 'landscape', 'fantasy', 'nature'],
                author: 'Demo User',
                authorId: 'demo-user-1',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                likes: 24,
                views: 156
            },
            {
                id: 'gallery-002',
                title: 'Cyberpunk City Night',
                description: 'Futuristic cityscape with neon lights and flying cars',
                imageUrl: 'https://picsum.photos/800/600?random=2',
                prompt: 'Cyberpunk city at night, neon lights, flying cars, futuristic architecture, rain-soaked streets, purple and blue color scheme',
                tags: ['cyberpunk', 'city', 'futuristic', 'neon', 'night'],
                author: 'Tech Artist',
                authorId: 'demo-user-2',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                likes: 18,
                views: 203
            },
            {
                id: 'gallery-003',
                title: 'Abstract Ocean Waves',
                description: 'Abstract interpretation of ocean waves in vibrant colors',
                imageUrl: 'https://picsum.photos/800/600?random=3',
                prompt: 'Abstract ocean waves, vibrant turquoise and coral colors, fluid dynamics, artistic interpretation, flowing motion, modern art style',
                tags: ['abstract', 'ocean', 'waves', 'colorful', 'art'],
                author: 'Wave Creator',
                authorId: 'demo-user-3',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                likes: 31,
                views: 128
            }
        ];

        const batch = db.batch();
        galleryItems.forEach(item => {
            const ref = db.collection('gallery').doc(item.id);
            batch.set(ref, item);
        });
        await batch.commit();
        console.log(`  ✅ Added ${galleryItems.length} gallery items\n`);

        // Sample prompts
        console.log('2️⃣  Adding sample prompts...');
        const prompts = [
            {
                id: 'prompt-001',
                prompt: 'A serene mountain lake at sunrise, mirror-like reflections, soft golden light, misty atmosphere',
                userId: 'demo-user-1',
                category: 'landscape',
                style: 'realistic',
                parameters: {
                    mood: 'serene',
                    lighting: 'golden hour',
                    setting: 'mountain lake'
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                isPublic: true
            },
            {
                id: 'prompt-002',
                prompt: 'Steampunk mechanical owl with brass gears, intricate details, vintage aesthetic, workshop setting',
                userId: 'demo-user-2',
                category: 'character',
                style: 'steampunk',
                parameters: {
                    subject: 'mechanical owl',
                    materials: 'brass',
                    style: 'steampunk'
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                isPublic: true
            },
            {
                id: 'prompt-003',
                prompt: 'Minimalist geometric patterns in pastel colors, clean design, modern art gallery wall',
                userId: 'demo-user-3',
                category: 'abstract',
                style: 'minimalist',
                parameters: {
                    style: 'minimalist',
                    colors: 'pastel',
                    pattern: 'geometric'
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                isPublic: false
            }
        ];

        const promptBatch = db.batch();
        prompts.forEach(prompt => {
            const ref = db.collection('prompts').doc(prompt.id);
            promptBatch.set(ref, prompt);
        });
        await promptBatch.commit();
        console.log(`  ✅ Added ${prompts.length} sample prompts\n`);

        // Admin stats
        console.log('3️⃣  Setting up admin statistics...');
        const adminStats = {
            totalUsers: 3,
            totalGalleryItems: galleryItems.length,
            totalPrompts: prompts.length,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('admin').doc('stats').set(adminStats);
        console.log('  ✅ Admin statistics initialized\n');

        // Sample user saved images
        console.log('4️⃣  Adding sample saved images...');
        const currentTime = new Date();
        const savedImages = {
            userId: 'demo-user-1',
            images: [
                {
                    id: 'saved-001',
                    url: 'https://picsum.photos/600/400?random=10',
                    prompt: 'Digital art of a floating island in the sky',
                    title: 'Sky Island',
                    savedAt: currentTime
                },
                {
                    id: 'saved-002',
                    url: 'https://picsum.photos/600/400?random=11',
                    prompt: 'Portrait of a wise old wizard with a long beard',
                    title: 'Wise Wizard',
                    savedAt: currentTime
                }
            ],
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('saved-images').doc('demo-user-1').set(savedImages);
        console.log('  ✅ Sample saved images added\n');

        console.log('🎉 Database seeding completed successfully!');
        console.log('📊 Sample Data Summary:');
        console.log(`  - Gallery Items: ${galleryItems.length}`);
        console.log(`  - Prompts: ${prompts.length}`);
        console.log(`  - Saved Images: ${savedImages.images.length}`);
        console.log('  - Admin Stats: Initialized');

        console.log('\n🎯 What was created:');
        console.log('  📸 Gallery with sample artworks');
        console.log('  ✨ Prompt examples for different styles');
        console.log('  💾 User saved images collection');
        console.log('  📈 Admin dashboard statistics');

        console.log('\n🚀 Ready to test:');
        console.log('  1. Start dev server: npm run dev');
        console.log('  2. Visit gallery page to see sample items');
        console.log('  3. Check admin dashboard (login as admin)');
        console.log('  4. Test prompt generation features');

    } catch (error) {
        console.error('❌ Database seeding failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('  1. Ensure Firebase connection is working');
        console.log('  2. Check Firestore security rules');
        console.log('  3. Verify service account permissions');
        process.exit(1);
    }
}

// Run the seeder
seedDatabase().then(() => {
    console.log('\n✨ Seeding complete! Your database is ready for testing.');
    process.exit(0);
}).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
});
