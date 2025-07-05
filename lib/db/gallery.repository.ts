/**
 * Gallery Repository
 * Handles all database operations related to gallery items
 */

import { db } from '@/firebase/admin';
import { executeDbOperation, executeBatch } from './connection';
import { serverTimestamp } from 'firebase-admin/firestore';

// Define the GalleryItem interface
export interface GalleryItem {
  id?: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  tags: string[];
  height: number;
  likes: number;
  prompt: string;
  orientation: 'horizontal' | 'vertical' | 'square';
  color: string;
  gridSize: 'normal' | 'large' | 'wide';
  createdAt?: any; // Firestore timestamp
  updatedAt?: any; // Firestore timestamp
}

/**
 * Get all gallery items with optional filtering and pagination
 */
export async function getAllGalleryItems(options?: {
  limit?: number;
  tag?: string;
  color?: string;
  orientation?: string;
}) {
  return executeDbOperation(async () => {
    let query = db.collection('gallery');
    
    // Apply filters if provided
    if (options?.tag) {
      query = query.where('tags', 'array-contains', options.tag) as any;
    }
    if (options?.color) {
      query = query.where('color', '==', options.color) as any;
    }
    
    if (options?.orientation) {
      query = query.where('orientation', '==', options.orientation) as any;
    }
    
    // Apply sorting and pagination
    query = query.orderBy('createdAt', 'desc') as any;
    
    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GalleryItem[];
  });
}

/**
 * Get a gallery item by ID
 */
export async function getGalleryItemById(id: string) {
  return executeDbOperation(async () => {
    const doc = await db.collection('gallery').doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return {
      id: doc.id,
      ...doc.data()
    } as GalleryItem;
  });
}

/**
 * Create a new gallery item
 */
export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>) {
  return executeDbOperation(async () => {
    const docRef = await db.collection('gallery').add({
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...item
    } as GalleryItem;
  });
}

/**
 * Update an existing gallery item
 */
export async function updateGalleryItem(id: string, item: Partial<Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>>) {
  return executeDbOperation(async () => {
    const docRef = db.collection('gallery').doc(id);
    
    await docRef.update({
      ...item,
      updatedAt: serverTimestamp()
    });
    
    const updatedDoc = await docRef.get();
    
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as GalleryItem;
  });
}

/**
 * Delete a gallery item
 */
export async function deleteGalleryItem(id: string) {
  return executeDbOperation(async () => {
    await db.collection('gallery').doc(id).delete();
    return true;
  });
}

/**
 * Batch update multiple gallery items
 */
export async function batchUpdateGalleryItems(updates: Array<{ id: string, data: Partial<GalleryItem> }>) {
  return executeBatch((batch) => {
    updates.forEach(({ id, data }) => {
      const docRef = db.collection('gallery').doc(id);
      batch.update(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    });
  });
}