// Script to update admin status for the user
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
if (!require('firebase-admin').apps.length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

async function updateAdminStatus() {
  try {
    // Find user by email and update admin status
    const usersSnapshot = await db.collection('users').where('email', '==', 'nandnad14@gmail.com').get();
    
    if (usersSnapshot.empty) {
      console.log('No user found with email: nandnad14@gmail.com');
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    console.log('Found user:', userDoc.id);
    
    await userDoc.ref.update({
      isAdmin: true,
      name: 'Nandan D',
      updatedAt: new Date()
    });
    
    console.log('✅ Successfully updated admin status for user: nandnad14@gmail.com');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin status:', error);
    process.exit(1);
  }
}

updateAdminStatus();
