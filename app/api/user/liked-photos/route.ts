import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { updateUserLikedPhotos, getUserLikedPhotos } from "@/lib/services/user-photo-service";
import { handleApiError } from "@/lib/utils/error-handler";

// GET /api/user/liked-photos - Get user's liked photos
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const likedPhotos = await getUserLikedPhotos(user.id);
    
    return NextResponse.json({
      likedPhotos,
      count: likedPhotos.length
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}

// POST /api/user/liked-photos - Update user's liked photos
export async function POST(request: NextRequest) {
  try {
    // Try to get user from session first, then from authorization header
    let user = await getCurrentUser();
    
    if (!user) {
      // Try to get from authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.substring(7);
        try {
          const { auth } = await import('@/firebase/admin');
          const decodedToken = await auth.verifyIdToken(idToken);
          // Get user data from database
          const { db } = await import('@/firebase/admin');
          const userDoc = await db.collection('users').doc(decodedToken.uid).get();
          if (userDoc.exists) {
            user = {
              id: userDoc.id,
              ...userDoc.data()
            };
          }
        } catch (authError) {
          console.error('Error verifying token:', authError);
        }
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { photoId, isLiked } = await request.json();

    if (!photoId || typeof isLiked !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid request data. photoId and isLiked are required." },
        { status: 400 }
      );
    }

    const updatedLikedPhotos = await updateUserLikedPhotos(
      user.id,
      photoId,
      isLiked
    );

    return NextResponse.json({
      success: true,
      likedPhotos: updatedLikedPhotos,
      action: isLiked ? 'liked' : 'unliked'
    });
  } catch (error) {
    console.error('Error in liked-photos API:', error);
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}
