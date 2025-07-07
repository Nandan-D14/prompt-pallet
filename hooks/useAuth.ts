"use client";

import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';

interface UserData {
  id: string;
  uid: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  about?: string;
  savedPhotos?: number;
  savedPhotosList?: any[];
  likedPhotos?: any[];
}

interface AuthState {
  user: UserData | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null
  });

  const fetchUserData = useCallback(async (firebaseUser: FirebaseUser): Promise<UserData | null> => {
    try {
      console.log('useAuth: Fetching user data for:', firebaseUser.email);
      
      const res = await fetch("/api/me", { 
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('useAuth: API user data:', data);
        
        // Enhance user data with Firebase user info
        const enhancedUserData = {
          ...data,
          avatarUrl: data.avatarUrl || firebaseUser.photoURL || '',
          name: data.name || firebaseUser.displayName || data.email?.split('@')[0] || 'User'
        };
        
        return enhancedUserData;
      } else if (res.status === 401) {
        console.log('useAuth: User not authenticated on server');
        return null;
      } else {
        console.error('useAuth: API error:', res.status, res.statusText);
        // Fallback to Firebase user data
        return {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          avatarUrl: firebaseUser.photoURL || '',
          isAdmin: false
        };
      }
    } catch (error) {
      console.error('useAuth: Error fetching user data:', error);
      // Fallback to Firebase user data
      return {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        avatarUrl: firebaseUser.photoURL || '',
        isAdmin: false
      };
    }
  }, []);

  const updateUserData = useCallback((userData: UserData) => {
    console.log('useAuth: Updating user data:', userData);
    setAuthState(prev => ({
      ...prev,
      user: userData,
      loading: false
    }));
    
    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent('userDataUpdated', { detail: userData })
    );
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initAuth = async () => {
      try {
        console.log('useAuth: Initializing Firebase auth listener');
        const { auth } = await import("@/firebase/client");
        
        unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          console.log('useAuth: Auth state changed', { 
            hasUser: !!firebaseUser, 
            email: firebaseUser?.email 
          });
          
          setAuthState(prev => ({
            ...prev,
            firebaseUser,
            loading: true,
            error: null
          }));
          
          if (!firebaseUser) {
            setAuthState(prev => ({
              ...prev,
              user: null,
              firebaseUser: null,
              loading: false,
              error: null
            }));
            return;
          }
          
          try {
            const userData = await fetchUserData(firebaseUser);
            
            setAuthState(prev => ({
              ...prev,
              user: userData,
              firebaseUser,
              loading: false,
              error: null
            }));
            
            if (userData) {
              // Dispatch event for other components
              window.dispatchEvent(
                new CustomEvent('userDataUpdated', { detail: userData })
              );
            }
          } catch (error: any) {
            console.error('useAuth: Error fetching user data:', error);
            setAuthState(prev => ({
              ...prev,
              user: null,
              loading: false,
              error: error.message || 'Failed to fetch user data'
            }));
          }
        });
        
        console.log('useAuth: Auth listener setup complete');
      } catch (error: any) {
        console.error('useAuth: Error setting up auth listener:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to initialize auth'
        }));
      }
    };
    
    initAuth();
    
    return () => {
      console.log('useAuth: Cleaning up auth listener');
      if (unsubscribe) unsubscribe();
    };
  }, [fetchUserData]);

  return {
    user: authState.user,
    firebaseUser: authState.firebaseUser,
    loading: authState.loading,
    error: authState.error,
    updateUserData,
    isAuthenticated: !!authState.user && !!authState.firebaseUser
  };
}
