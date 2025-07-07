/**
 * Gallery Repository
 * Handles all database operations related to gallery items
 */

import { db } from '@/firebase/admin';
import { executeDbOperation, executeBatch } from './connection';
import { FieldValue } from 'firebase-admin/firestore';

// FormData as the core data model
export interface FormData {
  id?: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  tags: string[];
  height: number;
  likes: number;
  prompt: string;
  orientation: "horizontal" | "vertical" | "square";
  color: "blue" | "green" | "red" | "yellow" | "orange" | "purple" | "brown" | "gray" | "white" | "black" | "dark";
  gridSize: "normal" | "wide" | "large" | "small" | "square";
}

// Add createdAt and updatedAt for Firestore
export interface GalleryItem extends FormData {
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

/**
 * Get all gallery items with optional filtering and pagination
 */
export async function getAllGalleryItems(options?: {
  limit?: number;
  tag?: string;
  color?: string;
  orientation?: "horizontal" | "vertical" | "square";
}): Promise<GalleryItem[]> {
  return executeDbOperation(async () => {
    let query: FirebaseFirestore.Query = db.collection('gallery');

    if (options?.tag) {
      query = query.where('tags', 'array-contains', options.tag); // match array element
    }

    if (options?.color) {
      query = query.where('color', '==', options.color);
    }

    if (options?.orientation) {
      query = query.where('orientation', '==', options.orientation);
    }

    query = query.orderBy('createdAt', 'desc');

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GalleryItem));
  });
}

/**
 * Get a gallery item by ID
 */
export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  return executeDbOperation(async () => {
    const doc = await db.collection('gallery').doc(id).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data()
    } as GalleryItem;
  });
}

/**
 * Create a new gallery item
 */
export async function createGalleryItem(
  item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GalleryItem> {
  return executeDbOperation(async () => {
    const docRef = await db.collection('gallery').add({
      ...item,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    return {
      id: docRef.id,
      ...item
    };
  });
}

/**
 * Update an existing gallery item
 */
export async function updateGalleryItem(
  id: string,
  item: Partial<Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<GalleryItem> {
  return executeDbOperation(async () => {
    const docRef = db.collection('gallery').doc(id);

    await docRef.update({
      ...item,
      updatedAt: FieldValue.serverTimestamp()
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
export async function deleteGalleryItem(id: string): Promise<boolean> {
  return executeDbOperation(async () => {
    await db.collection('gallery').doc(id).delete();
    return true;
  });
}

/**
 * Batch update multiple gallery items
 */
export async function batchUpdateGalleryItems(
  updates: Array<{ id: string; data: Partial<GalleryItem> }>
): Promise<void> {
  return executeBatch((batch) => {
    updates.forEach(({ id, data }) => {
      const docRef = db.collection('gallery').doc(id);
      batch.update(docRef, {
        ...data,
        updatedAt: FieldValue.serverTimestamp()
      });
    });
  });
}
