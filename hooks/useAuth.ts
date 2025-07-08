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
          uid: firebaseUser.uid, // Ensure uid is set
          avatarUrl: data.avatarUrl || firebaseUser.photoURL || '',
          name: data.name || firebaseUser.displayName || data.email?.split('@')[0] || 'User'
        };
        
        return enhancedUserData;
      } else if (res.status === 401) {
        console.log('useAuth: User not authenticated on server, attempting to create session...');
        
        // Try to create a session for the existing Firebase user
        try {
          const idToken = await firebaseUser.getIdToken();
          
          // First try to sign in (in case user already exists)
          const signInRes = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: firebaseUser.email,
              idToken 
            }),
          });
          
          if (signInRes.ok) {
            console.log('useAuth: Session created successfully, retrying user data fetch...');
            
            // Retry fetching user data now that session is set
            const retryRes = await fetch("/api/me", { 
              credentials: 'include',
              headers: {
                'Cache-Control': 'no-cache'
              }
            });
            
            if (retryRes.ok) {
              const data = await retryRes.json();
              const enhancedUserData = {
                ...data,
                uid: firebaseUser.uid,
                avatarUrl: data.avatarUrl || firebaseUser.photoURL || '',
                name: data.name || firebaseUser.displayName || data.email?.split('@')[0] || 'User'
              };
              return enhancedUserData;
            }
          } else if (signInRes.status === 401) {
            // User doesn't exist, try to create account
            console.log('useAuth: User not found, attempting to create account...');
            
            const signUpRes = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                idToken 
              }),
            });
            
            if (signUpRes.ok) {
              console.log('useAuth: Account created and session set, retrying user data fetch...');
              
              // Retry fetching user data
              const retryRes = await fetch("/api/me", { 
                credentials: 'include',
                headers: {
                  'Cache-Control': 'no-cache'
                }
              });
              
              if (retryRes.ok) {
                const data = await retryRes.json();
                const enhancedUserData = {
                  ...data,
                  uid: firebaseUser.uid,
                  avatarUrl: data.avatarUrl || firebaseUser.photoURL || '',
                  name: data.name || firebaseUser.displayName || data.email?.split('@')[0] || 'User'
                };
                return enhancedUserData;
              }
            }
          }
        } catch (sessionError) {
          console.error('useAuth: Failed to create session:', sessionError);
        }
        
        // If all attempts fail, return null
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

  const refreshUserData = useCallback(async () => {
    const { firebaseUser } = authState;
    if (!firebaseUser) {
      console.log('useAuth: No firebase user to refresh data for');
      return;
    }

    console.log('useAuth: Manually refreshing user data');
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const userData = await fetchUserData(firebaseUser);
      if (userData) {
        setAuthState(prev => ({
          ...prev,
          user: userData,
          loading: false,
          error: null
        }));
        
        // Dispatch event for other components
        window.dispatchEvent(
          new CustomEvent('userDataUpdated', { detail: userData })
        );
        
        console.log('useAuth: Successfully refreshed user data:', userData);
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to refresh user data'
        }));
      }
    } catch (error: any) {
      console.error('useAuth: Error refreshing user data:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to refresh user data'
      }));
    }
  }, [authState.firebaseUser, fetchUserData]);

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
            console.log('useAuth: User signed out');
            setAuthState(prev => ({
              ...prev,
              user: null,
              firebaseUser: null,
              loading: false,
              error: null
            }));
            return;
          }
          
          // Retry logic for fetching user data
          const fetchWithRetry = async (retries = 3, delay = 2000) => {
            for (let i = 0; i < retries; i++) {
              try {
                console.log(`useAuth: Attempting to fetch user data (attempt ${i + 1}/${retries})`);
                const userData = await fetchUserData(firebaseUser);
                
                if (userData) {
                  setAuthState(prev => ({
                    ...prev,
                    user: userData,
                    firebaseUser,
                    loading: false,
                    error: null
                  }));
                  
                  // Dispatch event for other components
                  window.dispatchEvent(
                    new CustomEvent('userDataUpdated', { detail: userData })
                  );
                  
                  console.log('useAuth: Successfully fetched and set user data:', userData);
                  return;
                } else {
                  // userData is null, but don't treat this as an error on first attempts
                  // as session might be created in fetchUserData
                  if (i < retries - 1) {
                    console.log('useAuth: No user data returned, will retry...');
                  }
                }
              } catch (error: any) {
                console.error(`useAuth: Fetch attempt ${i + 1} failed:`, error);
                
                if (i === retries - 1) {
                  // Last attempt failed
                  console.error('useAuth: All fetch attempts failed');
                  setAuthState(prev => ({
                    ...prev,
                    user: null,
                    loading: false,
                    error: error.message || 'Failed to fetch user data after multiple attempts'
                  }));
                  return;
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
              }
            }
          };
          
          await fetchWithRetry();
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
    refreshUserData,
    isAuthenticated: !!authState.user && !!authState.firebaseUser
  };
}
