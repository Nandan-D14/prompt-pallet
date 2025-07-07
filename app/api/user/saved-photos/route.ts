import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { updateUserSavedPhotos, getUserSavedPhotos } from "@/lib/services/user-photo-service";
import { handleApiError } from "@/lib/utils/error-handler";

// GET /api/user/saved-photos - Get user's saved photos
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const savedPhotos = await getUserSavedPhotos(user.id);
    
    return NextResponse.json({
      savedPhotos,
      count: savedPhotos.length
    });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}

// POST /api/user/saved-photos - Update user's saved photos
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

    const { photoId, isSaved } = await request.json();

    if (!photoId || typeof isSaved !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid request data. photoId and isSaved are required." },
        { status: 400 }
      );
    }

    const result = await updateUserSavedPhotos(
      user.id,
      photoId,
      isSaved
    );

    return NextResponse.json({
      success: true,
      savedPhotosList: result.savedPhotosList,
      savedPhotos: result.savedPhotos,
      action: isSaved ? 'saved' : 'unsaved'
    });
  } catch (error) {
    console.error('Error in saved-photos API:', error);
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}
