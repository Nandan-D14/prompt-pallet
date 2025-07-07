import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";
import { handleApiError, ErrorType } from "@/lib/utils/error-handler";

// Admin emails for authorization
const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];

// Helper function to check if user is admin
async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // First check if user has isAdmin flag set
  if (user.isAdmin === true) {
    return true;
  }
  
  // Fallback to email check
  return ADMIN_EMAILS.includes(user.email);
}

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET() {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { type: ErrorType.AUTHORIZATION, message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }
    
    // Get gallery items count
    const gallerySnapshot = await db.collection('gallery').count().get();
    const galleryCount = gallerySnapshot.data().count;
    
    // Get users count
    const usersSnapshot = await db.collection('users').count().get();
    const usersCount = usersSnapshot.data().count;
    
    // Get recent gallery items
    const recentGallerySnapshot = await db.collection('gallery')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    const recentGallery = recentGallerySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Return stats
    return NextResponse.json({
      totalGalleryItems: galleryCount,
      totalUsers: usersCount,
      recentGallery,
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}