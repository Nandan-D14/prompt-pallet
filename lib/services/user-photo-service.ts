/**
 * User Photo Management Service
 * Handles liked photos and saved photos for users in Firestore
 */

import { db } from '@/firebase/admin';
import { executeDbOperation } from '@/lib/db/connection';
import { FieldValue } from 'firebase-admin/firestore';

export interface UserPhotoData {
  userId: string;
  likedPhotos: string[];
  savedPhotosList: string[];
  savedPhotos: number;
  updatedAt?: FirebaseFirestore.Timestamp;
}

/**
 * Get user's photo preferences (liked and saved photos)
 */
export async function getUserPhotoData(userId: string): Promise<UserPhotoData | null> {
  return executeDbOperation(async () => {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    
    return {
      userId,
      likedPhotos: userData?.likedPhotos || [],
      savedPhotosList: userData?.savedPhotosList || [],
      savedPhotos: userData?.savedPhotos || 0,
      updatedAt: userData?.updatedAt,
    };
  });
}

/**
 * Update user's liked photos
 */
export async function updateUserLikedPhotos(
  userId: string, 
  photoId: string, 
  isLiked: boolean
): Promise<string[]> {
  return executeDbOperation(async () => {
    const userRef = db.collection('users').doc(userId);
    
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (isLiked) {
      // Add to liked photos
      updateData.likedPhotos = FieldValue.arrayUnion(photoId);
    } else {
      // Remove from liked photos
      updateData.likedPhotos = FieldValue.arrayRemove(photoId);
    }

    await userRef.update(updateData);

    // Also update the photo's like count
    await updatePhotoLikeCount(photoId, isLiked);

    // Return updated liked photos list
    const updatedUser = await userRef.get();
    return updatedUser.data()?.likedPhotos || [];
  });
}

/**
 * Update user's saved photos
 */
export async function updateUserSavedPhotos(
  userId: string, 
  photoId: string, 
  isSaved: boolean
): Promise<{ savedPhotosList: string[]; savedPhotos: number }> {
  return executeDbOperation(async () => {
    const userRef = db.collection('users').doc(userId);
    
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (isSaved) {
      // Add to saved photos
      updateData.savedPhotosList = FieldValue.arrayUnion(photoId);
      updateData.savedPhotos = FieldValue.increment(1);
    } else {
      // Remove from saved photos
      updateData.savedPhotosList = FieldValue.arrayRemove(photoId);
      updateData.savedPhotos = FieldValue.increment(-1);
    }

    await userRef.update(updateData);

    // Return updated data
    const updatedUser = await userRef.get();
    const userData = updatedUser.data();
    
    return {
      savedPhotosList: userData?.savedPhotosList || [],
      savedPhotos: Math.max(0, userData?.savedPhotos || 0) // Ensure non-negative
    };
  });
}

/**
 * Update photo's like count in the gallery collection
 */
async function updatePhotoLikeCount(photoId: string, increment: boolean): Promise<void> {
  return executeDbOperation(async () => {
    const photoRef = db.collection('gallery').doc(photoId);
    
    await photoRef.update({
      likes: FieldValue.increment(increment ? 1 : -1),
      updatedAt: FieldValue.serverTimestamp()
    });
  });
}

/**
 * Get photos liked by a user
 */
export async function getUserLikedPhotos(userId: string): Promise<any[]> {
  return executeDbOperation(async () => {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return [];
    }

    const userData = userDoc.data();
    const likedPhotoIds = userData?.likedPhotos || [];

    if (likedPhotoIds.length === 0) {
      return [];
    }

    // Fetch the actual photos from gallery
    const photoPromises = likedPhotoIds.map(async (photoId: string) => {
      const photoDoc = await db.collection('gallery').doc(photoId).get();
      if (photoDoc.exists) {
        return {
          id: photoDoc.id,
          ...photoDoc.data()
        };
      }
      return null;
    });

    const photos = await Promise.all(photoPromises);
    return photos.filter(photo => photo !== null);
  });
}

/**
 * Get photos saved by a user
 */
export async function getUserSavedPhotos(userId: string): Promise<any[]> {
  return executeDbOperation(async () => {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return [];
    }

    const userData = userDoc.data();
    const savedPhotoIds = userData?.savedPhotosList || [];

    if (savedPhotoIds.length === 0) {
      return [];
    }

    // Fetch the actual photos from gallery
    const photoPromises = savedPhotoIds.map(async (photoId: string) => {
      const photoDoc = await db.collection('gallery').doc(photoId).get();
      if (photoDoc.exists) {
        return {
          id: photoDoc.id,
          ...photoDoc.data()
        };
      }
      return null;
    });

    const photos = await Promise.all(photoPromises);
    return photos.filter(photo => photo !== null);
  });
}

/**
 * Clean up orphaned photo references
 * Remove photo IDs from user collections if the photo no longer exists
 */
export async function cleanupOrphanedPhotoReferences(userId: string): Promise<void> {
  return executeDbOperation(async () => {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return;
    }

    const userData = userDoc.data();
    const likedPhotos = userData?.likedPhotos || [];
    const savedPhotosList = userData?.savedPhotosList || [];

    const allPhotoIds = [...new Set([...likedPhotos, ...savedPhotosList])];
    
    if (allPhotoIds.length === 0) {
      return;
    }

    // Check which photos still exist
    const existingPhotoIds: string[] = [];
    
    for (const photoId of allPhotoIds) {
      const photoDoc = await db.collection('gallery').doc(photoId).get();
      if (photoDoc.exists) {
        existingPhotoIds.push(photoId);
      }
    }

    // Update user document with only existing photos
    const cleanedLikedPhotos = likedPhotos.filter((id: string) => existingPhotoIds.includes(id));
    const cleanedSavedPhotos = savedPhotosList.filter((id: string) => existingPhotoIds.includes(id));

    if (cleanedLikedPhotos.length !== likedPhotos.length || 
        cleanedSavedPhotos.length !== savedPhotosList.length) {
      
      await db.collection('users').doc(userId).update({
        likedPhotos: cleanedLikedPhotos,
        savedPhotosList: cleanedSavedPhotos,
        savedPhotos: cleanedSavedPhotos.length,
        updatedAt: FieldValue.serverTimestamp()
      });
    }
  });
}

/**
 * Initialize user photo data on first signup
 */
export async function initializeUserPhotoData(userId: string): Promise<void> {
  return executeDbOperation(async () => {
    const userRef = db.collection('users').doc(userId);
    
    await userRef.update({
      likedPhotos: [],
      savedPhotosList: [],
      savedPhotos: 0,
      updatedAt: FieldValue.serverTimestamp()
    });
  });
}

/**
 * Get user statistics
 */
export async function getUserPhotoStats(userId: string): Promise<{
  totalLiked: number;
  totalSaved: number;
  lastActivity?: FirebaseFirestore.Timestamp;
}> {
  return executeDbOperation(async () => {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return {
        totalLiked: 0,
        totalSaved: 0
      };
    }

    const userData = userDoc.data();
    
    return {
      totalLiked: (userData?.likedPhotos || []).length,
      totalSaved: userData?.savedPhotos || 0,
      lastActivity: userData?.updatedAt
    };
  });
}
