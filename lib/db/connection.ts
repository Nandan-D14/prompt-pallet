/**
 * Database connection management utilities
 * This file provides utilities for managing database connections and transactions
 */

import { db } from '@/firebase/admin';
import { FirebaseError } from 'firebase/app';

/**
 * Executes a database operation with proper error handling and connection management
 * @param operation - The database operation to execute
 * @returns A promise that resolves with the operation result or rejects with an error
 */
export async function executeDbOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    // Execute the database operation
    const result = await operation();
    return result;
  } catch (error) {
    // Handle Firebase-specific errors
    if (error instanceof FirebaseError) {
      console.error(`Firebase error (${error.code}): ${error.message}`);
      // You could implement specific handling for different error codes here
    } else {
      console.error('Database operation error:', error);
    }
    throw error; // Re-throw the error for the caller to handle
  }
}

/**
 * Executes a Firestore transaction with proper error handling
 * @param transactionOperation - The transaction operation to execute
 * @returns A promise that resolves with the transaction result or rejects with an error
 */
export async function executeTransaction<T>(transactionOperation: (transaction: FirebaseFirestore.Transaction) => Promise<T>): Promise<T> {
  try {
    return await db.runTransaction(transactionOperation);
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

/**
 * Executes a batch write operation with proper error handling
 * @param batchOperation - Function that receives a batch object and adds operations to it
 * @returns A promise that resolves when the batch is committed
 */
export async function executeBatch(batchOperation: (batch: FirebaseFirestore.WriteBatch) => void): Promise<void> {
  const batch = db.batch();
  
  try {
    // Let the caller add operations to the batch
    batchOperation(batch);
    
    // Commit the batch
    await batch.commit();
  } catch (error) {
    console.error('Batch operation error:', error);
    throw error;
  }
}