#!/usr/bin/env ts-node

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import path from 'path';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = require(path.join(process.cwd(), 'service-account.json'));
  
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

// Sample gallery data
const sampleGalleryItems = [
  {
    src: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop",
    alt: "Abstract geometric patterns",
    title: "Neon Geometry",
    description: "Vibrant geometric patterns with neon lighting effects",
    tags: ["abstract", "geometric", "neon", "trending"],
    height: 600,
    likes: 142,
    prompt: "Create an abstract geometric pattern with vibrant neon colors and sharp angles",
    orientation: "landscape",
    color: "purple",
    gridSize: "medium"
  },
  {
    src: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=800&fit=crop",
    alt: "Portrait of futuristic character",
    title: "Cyber Dreams",
    description: "A futuristic portrait with cyberpunk aesthetics",
    tags: ["portrait", "cyberpunk", "futuristic", "trending"],
    height: 800,
    likes: 98,
    prompt: "Generate a cyberpunk portrait with neon highlights and futuristic elements",
    orientation: "portrait",
    color: "blue",
    gridSize: "large"
  },
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    alt: "Nature landscape with mountains",
    title: "Mountain Serenity",
    description: "Peaceful mountain landscape at sunrise",
    tags: ["nature", "landscape", "mountains", "peaceful"],
    height: 600,
    likes: 76,
    prompt: "Paint a serene mountain landscape during golden hour with soft lighting",
    orientation: "square",
    color: "orange",
    gridSize: "medium"
  },
  {
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=500&fit=crop",
    alt: "Urban cityscape at night",
    title: "City Lights",
    description: "Bustling urban cityscape with vibrant nightlife",
    tags: ["urban", "cityscape", "night", "lights"],
    height: 500,
    likes: 203,
    prompt: "Create an urban cityscape at night with glowing windows and street lights",
    orientation: "landscape",
    color: "yellow",
    gridSize: "small"
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop",
    alt: "Minimalist architectural design",
    title: "Clean Lines",
    description: "Minimalist architectural photography with clean geometric lines",
    tags: ["architecture", "minimalist", "clean", "geometric"],
    height: 900,
    likes: 134,
    prompt: "Design a minimalist architectural structure with clean lines and simple geometry",
    orientation: "portrait",
    color: "white",
    gridSize: "large"
  },
  {
    src: "https://images.unsplash.com/photo-1518709594023-6eab2859acea?w=800&h=600&fit=crop",
    alt: "Abstract fluid art",
    title: "Liquid Motion",
    description: "Flowing abstract art with fluid dynamics",
    tags: ["abstract", "fluid", "motion", "artistic", "trending"],
    height: 600,
    likes: 167,
    prompt: "Generate abstract fluid art with flowing liquid patterns and vibrant colors",
    orientation: "landscape",
    color: "pink",
    gridSize: "medium"
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop",
    alt: "Vintage retro design",
    title: "Retro Vibes",
    description: "Nostalgic design with vintage aesthetics",
    tags: ["vintage", "retro", "nostalgic", "design"],
    height: 500,
    likes: 89,
    prompt: "Create a vintage-inspired design with retro color palette and classic typography",
    orientation: "square",
    color: "brown",
    gridSize: "small"
  },
  {
    src: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=700&h=1000&fit=crop",
    alt: "Fantasy creature illustration",
    title: "Mythical Beast",
    description: "Detailed fantasy creature in an enchanted forest",
    tags: ["fantasy", "creature", "illustration", "mythical"],
    height: 1000,
    likes: 245,
    prompt: "Illustrate a majestic fantasy creature in an enchanted forest setting",
    orientation: "portrait",
    color: "green",
    gridSize: "large"
  },
  {
    src: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=900&h=600&fit=crop",
    alt: "Space exploration scene",
    title: "Cosmic Journey",
    description: "Epic space exploration with distant galaxies",
    tags: ["space", "cosmic", "exploration", "galaxy", "trending"],
    height: 600,
    likes: 312,
    prompt: "Depict an epic space exploration scene with astronauts and distant galaxies",
    orientation: "landscape",
    color: "purple",
    gridSize: "large"
  },
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    alt: "Botanical illustration",
    title: "Garden Paradise",
    description: "Detailed botanical illustration of exotic plants",
    tags: ["botanical", "plants", "garden", "nature"],
    height: 600,
    likes: 121,
    prompt: "Create a detailed botanical illustration featuring exotic tropical plants",
    orientation: "square",
    color: "green",
    gridSize: "medium"
  }
];

// Sample user data (optional)
const sampleUsers = [
  {
    uid: "admin-user-1",
    email: "admin@promptpalette.com",
    displayName: "Admin User",
    isAdmin: true,
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    preferences: {
      theme: "dark",
      emailNotifications: true,
      savedGalleryItems: []
    }
  },
  {
    uid: "demo-user-1",
    email: "demo@example.com",
    displayName: "Demo User",
    isAdmin: false,
    photoURL: "https://images.unsplash.com/photo-1494790108755-2616b68baa6a?w=100&h=100&fit=crop&crop=face",
    preferences: {
      theme: "dark",
      emailNotifications: false,
      savedGalleryItems: []
    }
  }
];

async function seedFirestore() {
  try {
    console.log('Starting Firestore seeding...');

    // Clear existing gallery data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing gallery data...');
    const existingGallery = await db.collection('gallery').get();
    const deletePromises = existingGallery.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log(`Deleted ${existingGallery.size} existing gallery items`);

    // Add sample gallery items
    console.log('Adding sample gallery items...');
    const galleryPromises = sampleGalleryItems.map(async (item, index) => {
      const docRef = db.collection('gallery').doc();
      const galleryItem = {
        ...item,
        id: docRef.id,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
      };
      
      await docRef.set(galleryItem);
      console.log(`Added gallery item ${index + 1}: ${item.title}`);
      return docRef.id;
    });

    const galleryIds = await Promise.all(galleryPromises);
    console.log(`Successfully added ${galleryIds.length} gallery items`);

    // Add sample users (optional)
    console.log('Adding sample users...');
    const userPromises = sampleUsers.map(async (user) => {
      const docRef = db.collection('users').doc(user.uid);
      const userData = {
        ...user,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      
      await docRef.set(userData, { merge: true });
      console.log(`Added user: ${user.email}`);
      return user.uid;
    });

    await Promise.all(userPromises);
    console.log(`Successfully added ${sampleUsers.length} users`);

    // Create some sample subscriber data for email notifications
    console.log('Adding sample subscribers...');
    const subscribers = [
      { email: "subscriber1@example.com", subscribed: true, subscribedAt: FieldValue.serverTimestamp() },
      { email: "subscriber2@example.com", subscribed: true, subscribedAt: FieldValue.serverTimestamp() },
      { email: "subscriber3@example.com", subscribed: true, subscribedAt: FieldValue.serverTimestamp() }
    ];

    const subscriberPromises = subscribers.map(async (subscriber) => {
      const docRef = db.collection('subscribers').doc();
      await docRef.set({
        ...subscriber,
        id: docRef.id,
        createdAt: FieldValue.serverTimestamp()
      });
      console.log(`Added subscriber: ${subscriber.email}`);
    });

    await Promise.all(subscriberPromises);
    console.log(`Successfully added ${subscribers.length} subscribers`);

    console.log('✅ Firestore seeding completed successfully!');
    
    // Print summary
    console.log('\n📊 Seeding Summary:');
    console.log(`• Gallery items: ${galleryIds.length}`);
    console.log(`• Users: ${sampleUsers.length}`);
    console.log(`• Subscribers: ${subscribers.length}`);
    console.log('\n🔥 Your Firestore database is now populated with sample data!');

  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  seedFirestore().then(() => {
    console.log('Seeding script completed. Exiting...');
    process.exit(0);
  });
}

export { seedFirestore };
