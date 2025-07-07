"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    console.log("Attempting to sign up user:", email, "with uid:", uid);
    
    // Check if user is admin based on email
    const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];
    const isAdmin = ADMIN_EMAILS.includes(email);
    console.log("Admin check for", email, ":", isAdmin, "(Admin emails:", ADMIN_EMAILS, ")");

    // save user to db (create or update)
    const userData = {
      name,
      email,
      about: "",
      isAdmin,
      createdAt: new Date(),
      updatedAt: new Date(),
      avatarUrl: "",
      savedPhotos: 0,
      savedPhotosList: [],
      likedPhotos: []
    };
    
    console.log("Saving user data to Firestore:", userData);
    await db.collection("users").doc(uid).set(userData, { merge: true });
    
    console.log("User successfully created in Firestore:", email);
    return {
      success: true,
      message: "Account created successfully.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    return {
      success: false,
      message: error.message || "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    console.log("Attempting to sign in user:", email);
    
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      console.log("User not found in Firebase Auth:", email);
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };
    }

    console.log("User found, setting session cookie...");
    await setSessionCookie(idToken);
    
    console.log("Session cookie set successfully for:", email);
    return {
      success: true,
      message: "Successfully logged in."
    };
  } catch (error: any) {
    console.error("Sign in error:", error.message);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) {
      console.warn(`User document not found for uid: ${decodedClaims.uid}`);
      return null;
    }
    
    // Get user data
    const userData = userRecord.data();
    
    // Check if user is admin based on email or stored isAdmin field
    const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];
    const isAdmin = userData?.isAdmin === true || ADMIN_EMAILS.includes(userData?.email ?? "");
    
    console.log("Admin check details:", {
      userEmail: userData?.email,
      adminEmails: ADMIN_EMAILS,
      storedIsAdmin: userData?.isAdmin,
      finalIsAdmin: isAdmin
    });
    
    return {
      ...userData,
      id: userRecord.id,
      isAdmin,
      savedPhotos: userData?.savedPhotos || 0,
      savedPhotosList: userData?.savedPhotosList || [],
      likedPhotos: userData?.likedPhotos || [],
      about: userData?.about || "",
      avatarUrl: userData?.avatarUrl || "",
    } as User;
  } catch (error: any) {
    console.error("Session verification error:", error.message);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}