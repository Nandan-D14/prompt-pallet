import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";

// Helper function to check if user is admin
async function isAdmin() {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    // Check if user has admin flag
    if (user.isAdmin) return true;
    
    // Fallback to check against admin emails
    const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];
    return ADMIN_EMAILS.includes(user.email);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function GET() {
  try {
    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all users from Firestore
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}