import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== FIREBASE DEBUG ENDPOINT ===");
    
    // Check environment variables
    const envCheck = {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      privateKeyStart: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50) || 'Not found',
    };
    
    console.log("Environment variables check:", envCheck);
    
    // Try to initialize Firebase Admin
    try {
      const { auth, db } = await import("@/firebase/admin");
      console.log("Firebase Admin imported successfully");
      
      // Test auth
      const testUser = await auth.getUserByEmail("test@example.com").catch(e => {
        console.log("Expected error for test user:", e.code);
        return { uid: "test-worked" };
      });
      
      console.log("Firebase Auth test:", testUser);
      
      return NextResponse.json({
        success: true,
        message: "Firebase Admin is working",
        envCheck,
        authTest: "passed"
      });
      
    } catch (firebaseError) {
      console.error("Firebase initialization error:", firebaseError);
      return NextResponse.json({
        success: false,
        message: "Firebase initialization failed",
        envCheck,
        error: firebaseError.message,
        stack: firebaseError.stack
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      success: false,
      message: "Debug endpoint failed",
      error: error.message
    }, { status: 500 });
  }
}
