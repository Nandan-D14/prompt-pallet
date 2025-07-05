/**
 * Error handling utilities
 * This file provides utilities for standardized error handling across the application
 */

import { FirebaseError } from 'firebase-admin';

// Define standard error types
export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  DATABASE = 'DATABASE',
  STORAGE = 'STORAGE',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

// Define standard error response structure
export interface ErrorResponse {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
}

/**
 * Map Firebase error codes to our standard error types
 */
function mapFirebaseErrorType(error: FirebaseError): ErrorType {
  const code = error.code;
  
  if (code.startsWith('auth/')) {
    return code.includes('permission') ? ErrorType.AUTHORIZATION : ErrorType.AUTHENTICATION;
  }
  
  if (code.startsWith('firestore/')) {
    return ErrorType.DATABASE;
  }
  
  if (code.startsWith('storage/')) {
    return ErrorType.STORAGE;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * Format an error into our standard error response structure
 */
export function formatError(error: any): ErrorResponse {
  // Handle Firebase errors
  if ('code' in error && typeof error.code === 'string') {
    return {
      type: mapFirebaseErrorType(error),
      message: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  // Handle standard errors
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'An unknown error occurred'
    };
  }
  
  // Handle unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unknown error occurred',
    details: error
  };
}

/**
 * Log an error with standardized format
 */
export function logError(error: any, context?: string): void {
  const formattedError = formatError(error);
  const contextPrefix = context ? `[${context}] ` : '';
  
  console.error(`${contextPrefix}Error [${formattedError.type}]: ${formattedError.message}`);
  
  if (formattedError.code) {
    console.error(`Error code: ${formattedError.code}`);
  }
  
  if (formattedError.details) {
    console.error('Error details:', formattedError.details);
  }
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: any): { status: number; body: ErrorResponse } {
  const formattedError = formatError(error);
  
  // Map error types to HTTP status codes
  let status: number;
  switch (formattedError.type) {
    case ErrorType.AUTHENTICATION:
      status = 401; // Unauthorized
      break;
    case ErrorType.AUTHORIZATION:
      status = 403; // Forbidden
      break;
    case ErrorType.VALIDATION:
      status = 400; // Bad Request
      break;
    case ErrorType.NOT_FOUND:
      status = 404; // Not Found
      break;
    case ErrorType.DATABASE:
    case ErrorType.STORAGE:
      status = 500; // Internal Server Error
      break;
    case ErrorType.NETWORK:
      status = 503; // Service Unavailable
      break;
    default:
      status = 500; // Internal Server Error
  }
  
  return {
    status,
    body: formattedError
  };
}