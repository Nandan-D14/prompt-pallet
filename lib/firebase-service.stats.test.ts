
import { firebaseService } from './firebase-service';
import { getDocs, getCountFromServer, collection, query, orderBy, limit } from 'firebase/firestore';

// Mock dependencies
jest.mock('@/firebase/client', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithRedirect: jest.fn(),
  getRedirectResult: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn(),
  getCountFromServer: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  Timestamp: {
    now: jest.fn(),
  },
}));

describe('FirebaseService.getStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use getCountFromServer for counts and getDocs for recent items', async () => {
    // Setup mocks
    (getCountFromServer as jest.Mock).mockResolvedValue({
      data: () => ({ count: 42 })
    });

    (getDocs as jest.Mock).mockResolvedValue({
      size: 2,
      docs: [
        { id: '1', data: () => ({ title: 'Item 1' }) },
        { id: '2', data: () => ({ title: 'Item 2' }) }
      ]
    });

    const stats = await firebaseService.getStats();

    // Verify optimized behavior
    expect(getCountFromServer).toHaveBeenCalledTimes(2);
    expect(getDocs).toHaveBeenCalledTimes(1);

    // Verify result structure
    expect(stats).toEqual({
      totalUsers: 42,
      totalGalleryItems: 42,
      recentItems: [
        { id: '1', title: 'Item 1' },
        { id: '2', title: 'Item 2' }
      ]
    });
  });
});
