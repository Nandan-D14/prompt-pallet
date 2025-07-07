"use client";

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
import { auth, db } from "@/firebase/client";

export interface UserData {
  uid: string;
  name: string;
  email: string;
  about?: string;
  isAdmin?: boolean;
  avatarUrl?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  savedPhotos?: number;
  savedPhotosList?: any[];
}

export class FirebaseService {
  private static instance: FirebaseService;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // Authentication Methods
  async signUpWithEmail(email: string, password: string, name: string): Promise<{ success: boolean; message: string; user?: FirebaseUser }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      if (name) {
        await updateProfile(user, { displayName: name });
      }

      // Store user data in Firestore
      await this.createUserDocument(user.uid, name, email);

      // Call server action to create user session
      await this.setServerSignUpSession(user.uid, name, email);
      
      // Set server session
      const idToken = await user.getIdToken();
      await this.setServerSession(user.uid, name, email, idToken);

      return {
        success: true,
        message: "Account created successfully!",
        user
      };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; message: string; user?: FirebaseUser }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Call server action for session
      const idToken = await user.getIdToken();
      await this.setServerSession(user.uid, user.displayName || "", email, idToken);

      return {
        success: true,
        message: "Signed in successfully!",
        user
      };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  async signInWithGoogle(): Promise<{ success: boolean; message: string; user?: FirebaseUser }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Use popup instead of redirect for better UX
      const { signInWithPopup } = await import('firebase/auth');
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        const user = result.user;
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

        console.log('Google sign-in user:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          isNewUser
        });

        if (isNewUser) {
          // Create user document for new Google users
          await this.createUserDocument(
            user.uid,
            user.displayName || user.email?.split('@')[0] || 'User',
            user.email || '',
            user.photoURL || undefined
          );
          
          // Call server action to create user
          await this.setServerSignUpSession(
            user.uid,
            user.displayName || user.email?.split('@')[0] || 'User',
            user.email || ''
          );
        } else {
          // For existing users, ensure their data is up to date
          const existingUserData = await this.getUserData(user.uid);
          if (existingUserData) {
            // Update any missing fields from Google profile
            const updateData: Partial<UserData> = {};
            if (!existingUserData.name && user.displayName) {
              updateData.name = user.displayName;
            }
            if (!existingUserData.avatarUrl && user.photoURL) {
              updateData.avatarUrl = user.photoURL;
            }
            
            if (Object.keys(updateData).length > 0) {
              await this.updateUserData(user.uid, updateData);
            }
          }
        }

        // Set server session
        const idToken = await user.getIdToken();
        await this.setServerSession(
          user.uid,
          user.displayName || user.email?.split('@')[0] || 'User',
          user.email || '',
          idToken
        );

        return {
          success: true,
          message: "Google sign in successful!",
          user
        };
      } else {
        return {
          success: false,
          message: "Google sign in was cancelled"
        };
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      
      // Handle specific Google Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        return {
          success: false,
          message: "Sign in was cancelled"
        };
      } else if (error.code === 'auth/popup-blocked') {
        return {
          success: false,
          message: "Popup was blocked by browser. Please allow popups and try again."
        };
      }
      
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  async handleGoogleRedirect(): Promise<{ success: boolean; message: string; user?: FirebaseUser }> {
    try {
      const result = await getRedirectResult(auth);
      if (!result) {
        return { success: false, message: "No redirect result" };
      }

      const user = result.user;
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

      if (isNewUser) {
        // Create user document for new Google users
        await this.createUserDocument(
          user.uid,
          user.displayName || user.email?.split('@')[0] || 'User',
          user.email || '',
          user.photoURL || undefined
        );
      }

      // Set server session
      const idToken = await user.getIdToken();
      await this.setServerSession(
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'User',
        user.email || '',
        idToken
      );

      return {
        success: true,
        message: "Google sign in successful!",
        user
      };
    } catch (error: any) {
      console.error("Google redirect error:", error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  async signOut(): Promise<{ success: boolean; message: string }> {
    try {
      await firebaseSignOut(auth);
      
      // Clear server session
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        success: true,
        message: "Signed out successfully!"
      };
    } catch (error: any) {
      console.error("Sign out error:", error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/sign-in`,
        handleCodeInApp: false
      });
      return {
        success: true,
        message: "Password reset email sent! Check your inbox."
      };
    } catch (error: any) {
      console.error("Password reset error:", error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  // User Data Methods
  async createUserDocument(uid: string, name: string, email: string, photoURL?: string): Promise<void> {
    const adminEmails = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];
    const isAdmin = adminEmails.includes(email);

    const userData: UserData = {
      uid,
      name,
      email,
      about: "",
      isAdmin,
      avatarUrl: photoURL || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      savedPhotos: 0,
      savedPhotosList: []
    };

    await setDoc(doc(db, "users", uid), userData);
    console.log('User document created:', userData);
  }

  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  async updateUserData(uid: string, data: Partial<UserData>): Promise<{ success: boolean; message: string }> {
    try {
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(doc(db, "users", uid), updateData);
      
      return {
        success: true,
        message: "Profile updated successfully!"
      };
    } catch (error: any) {
      console.error("Error updating user data:", error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  // Gallery Methods
  async addGalleryItem(data: {
    title: string;
    description: string;
    imageUrl: string;
    prompt: string;
    tags: string[];
  }): Promise<{ success: boolean; message: string; id?: string }> {
    try {
      const galleryData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        likes: 0,
        views: 0
      };

      const docRef = await addDoc(collection(db, "gallery"), galleryData);
      
      return {
        success: true,
        message: "Gallery item added successfully!",
        id: docRef.id
      };
    } catch (error: any) {
      console.error("Error adding gallery item:", error);
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  async getGalleryItems(limitCount: number = 20): Promise<any[]> {
    try {
      const q = query(
        collection(db, "gallery"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return items;
    } catch (error) {
      console.error("Error getting gallery items:", error);
      return [];
    }
  }

  // Admin Methods
  async getStats(): Promise<{ totalUsers: number; totalGalleryItems: number; recentItems: any[] }> {
    try {
      const [usersSnapshot, gallerySnapshot, recentItemsSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "gallery")),
        getDocs(query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(5)))
      ]);

      return {
        totalUsers: usersSnapshot.size,
        totalGalleryItems: gallerySnapshot.size,
        recentItems: recentItemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      return {
        totalUsers: 0,
        totalGalleryItems: 0,
        recentItems: []
      };
    }
  }

  // Helper Methods
  private async setServerSession(uid: string, name: string, email: string, idToken: string): Promise<void> {
    try {
      const { signIn } = await import("@/lib/actions/auth.action");
      
      // Call signIn to set the server session
      const result = await signIn({ email, idToken });
      
      if (!result.success) {
        console.error("Failed to set server session:", result.message);
        throw new Error(result.message);
      }
      
      console.log("Server session set successfully for:", email);
    } catch (error) {
      console.error("Error setting server session:", error);
      throw error;
    }
  }

  private async setServerSignUpSession(uid: string, name: string, email: string): Promise<void> {
    try {
      const { signUp } = await import("@/lib/actions/auth.action");
      
      // Call signUp to create user in server
      const result = await signUp({ uid, name, email, password: "" });
      
      if (!result.success) {
        console.error("Failed to create user on server:", result.message);
        throw new Error(result.message);
      }
      
      console.log("User created on server successfully:", email);
    } catch (error) {
      console.error("Error creating user on server:", error);
      throw error;
    }
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Email is already registered. Please sign in instead.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
        return "No account found with this email. Please sign up first.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please try again.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled. Please contact support.";
      case "auth/popup-closed-by-user":
        return "Sign in was cancelled.";
      case "auth/popup-blocked":
        return "Popup was blocked. Please allow popups and try again.";
      default:
        return error.message || "An unexpected error occurred.";
    }
  }

  // Auth State Listener
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
}

export const firebaseService = FirebaseService.getInstance();
