interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface User {
  id: string;
  name: string;
  email: string;
  about?: string;
  isAdmin?: boolean;
  createdAt?: any; // Firestore timestamp
  updatedAt?: any; // Firestore timestamp
  avatarUrl?: string;
}

interface UserProfile {
  name: string;
  email: string;
  about?: string;
  savedPhotos?: number;
  savedPhotosList?: any[];
  avatarUrl?: string;
}


