interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
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
  savedPhotos?: number;
  savedPhotosList?: string[];
  likedPhotos?: string[];
}

interface UserProfile {
  name: string;
  email: string;
  about?: string;
  savedPhotos?: number;
  savedPhotosList?: string[];
  likedPhotos?: string[];
  avatarUrl?: string;
}


interface FormData {
  id?: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  tags: string;
  height: number;
  likes: number;
  prompt: string;
  orientation: "horizontal" | "vertical" | "square";
  color: "blue" | "green" | "red" | "yellow" | "orange" | "purple" | "brown" | "gray" | "white" | "black" | "dark";
  gridSize: "normal" | "wide" | "large" | "small" | "square";
}
