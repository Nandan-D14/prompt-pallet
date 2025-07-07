import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function POST() {
  try {
    // Find user by email and update admin status
    const usersSnapshot = await db.collection('users').where('email', '==', 'nandnad14@gmail.com').get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json({ error: 'No user found with email: nandnad14@gmail.com' }, { status: 404 });
    }
    
    const userDoc = usersSnapshot.docs[0];
    console.log('Found user:', userDoc.id);
    
    await userDoc.ref.update({
      isAdmin: true,
      name: 'Nandan D',
      updatedAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully updated admin status for user: nandnad14@gmail.com',
      userId: userDoc.id
    });
  } catch (error) {
    console.error('Error updating admin status:', error);
    return NextResponse.json({ error: 'Failed to update admin status' }, { status: 500 });
  }
}
