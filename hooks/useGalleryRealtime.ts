import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where, QueryConstraint } from 'firebase/firestore';
import { db } from '@/firebase/client';

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  tags: string[];
  height: number;
  likes: number;
  prompt: string;
  orientation: 'portrait' | 'landscape' | 'square';
  color: string;
  gridSize: 'small' | 'medium' | 'large';
  createdAt: any;
  updatedAt: any;
  views: number;
}

interface UseGalleryRealtimeOptions {
  limitCount?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  filterByTags?: string[];
  filterByColor?: string;
  filterByOrientation?: string;
  filterByGridSize?: string;
}

interface UseGalleryRealtimeReturn {
  gallery: GalleryItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

export const useGalleryRealtime = (options: UseGalleryRealtimeOptions = {}): UseGalleryRealtimeReturn => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const {
    limitCount = 50,
    orderByField = 'createdAt',
    orderDirection = 'desc',
    filterByTags,
    filterByColor,
    filterByOrientation,
    filterByGridSize
  } = options;

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Build query constraints
      const constraints: QueryConstraint[] = [];
      
      // Add ordering
      constraints.push(orderBy(orderByField, orderDirection));
      
      // Add filters
      if (filterByTags && filterByTags.length > 0) {
        // For multiple tags, we'll filter client-side as Firestore has limitations
        // For single tag, we can use array-contains
        if (filterByTags.length === 1) {
          constraints.push(where('tags', 'array-contains', filterByTags[0]));
        }
      }
      
      if (filterByColor) {
        constraints.push(where('color', '==', filterByColor));
      }
      
      if (filterByOrientation) {
        constraints.push(where('orientation', '==', filterByOrientation));
      }
      
      if (filterByGridSize) {
        constraints.push(where('gridSize', '==', filterByGridSize));
      }
      
      // Add limit
      constraints.push(limit(limitCount));

      // Create the query
      const galleryQuery = query(collection(db, 'gallery'), ...constraints);

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        galleryQuery,
        (snapshot) => {
          const galleryData: GalleryItem[] = [];
          
          snapshot.forEach((doc) => {
            galleryData.push({
              id: doc.id,
              ...doc.data()
            } as GalleryItem);
          });

          // Client-side filtering for multiple tags if needed
          let filteredGallery = galleryData;
          if (filterByTags && filterByTags.length > 1) {
            filteredGallery = galleryData.filter(item => 
              filterByTags.every(tag => item.tags.includes(tag))
            );
          }

          setGallery(filteredGallery);
          setTotalCount(filteredGallery.length);
          setLoading(false);
        },
        (err) => {
          console.error('Gallery real-time listener error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      // Cleanup function
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Gallery real-time setup error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [
    limitCount,
    orderByField,
    orderDirection,
    JSON.stringify(filterByTags),
    filterByColor,
    filterByOrientation,
    filterByGridSize
  ]);

  return {
    gallery,
    loading,
    error,
    totalCount
  };
};

// Hook for trending gallery items specifically
export const useTrendingGallery = (limitCount: number = 10) => {
  return useGalleryRealtime({
    limitCount,
    filterByTags: ['trending'],
    orderByField: 'likes',
    orderDirection: 'desc'
  });
};

// Hook for recent gallery items
export const useRecentGallery = (limitCount: number = 20) => {
  return useGalleryRealtime({
    limitCount,
    orderByField: 'createdAt',
    orderDirection: 'desc'
  });
};

// Hook for popular gallery items
export const usePopularGallery = (limitCount: number = 20) => {
  return useGalleryRealtime({
    limitCount,
    orderByField: 'likes',
    orderDirection: 'desc'
  });
};
