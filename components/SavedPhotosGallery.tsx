"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "@/firebase/client";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import Lightbox from "./ui/Lightbox";
import { Photo, PhotoCard } from "./ui/PhotoCard";
import { Heart, ImageIcon } from "lucide-react";

const SavedPhotosGallery = () => {
  const [savedPhotos, setSavedPhotos] = useState<Photo[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [savedPhotoIds, setSavedPhotoIds] = useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoId, setCurrentPhotoId] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch saved photos using new API
        await fetchSavedPhotos();
      } else {
        setSavedPhotos([]);
        setSavedPhotoIds(new Set());
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch saved photos from Firestore using new API
  const fetchSavedPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/saved-photos');
      
      if (response.ok) {
        const data = await response.json();
        setSavedPhotos(data.savedPhotos);
        setSavedPhotoIds(new Set(data.savedPhotos.map((photo: any) => photo.id)));
      } else {
        throw new Error('Failed to fetch saved photos');
      }
    } catch (error) {
      console.error('Error fetching saved photos:', error);
      setError('Failed to load saved photos');
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (id: string) => {
    setCurrentPhotoId(id);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentPhotoId(null);
  };

  const navigateLightbox = (direction: "prev" | "next") => {
    if (!currentPhotoId) return;
    const currentIndex = savedPhotos.findIndex((p) => p.id === currentPhotoId);
    let newIndex = currentIndex;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % savedPhotos.length;
    } else {
      newIndex = (currentIndex - 1 + savedPhotos.length) % savedPhotos.length;
    }
    setCurrentPhotoId(savedPhotos[newIndex].id);
  };

  // Handle removing photo from saved list
  const handleRemoveFromSaved = async (photo: Photo) => {
    if (!user) return;
    
    try {
      // Optimistically update UI
      const newSavedPhotoIds = new Set(savedPhotoIds);
      newSavedPhotoIds.delete(photo.id);
      setSavedPhotoIds(newSavedPhotoIds);
      setSavedPhotos(prev => prev.filter(p => p.id !== photo.id));
      
      // Update server using new API
      const response = await fetch('/api/user/saved-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: photo.id,
          isSaved: false
        })
      });
      
      if (!response.ok) {
        // Revert on error
        setSavedPhotoIds(savedPhotoIds);
        setSavedPhotos(prev => [...prev, photo]);
        throw new Error('Failed to remove photo from saved');
      }
      
      const result = await response.json();
      // Update with server response to ensure consistency
      setSavedPhotoIds(new Set(result.savedPhotosList));
    } catch (error) {
      console.error('Error removing photo from saved:', error);
      setError('Failed to remove photo from saved');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSharePhoto = async (photo: Photo) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: photo.title,
          text: photo.description,
          url: photo.src,
        });
      } else {
        await navigator.clipboard.writeText(photo.src);
        alert('Photo URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing photo:', error);
    }
  };

  const handleDownloadPhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${photo.title}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black/70 text-neutral-100 font-sans relative pb-20 overflow-x-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sign in Required</h2>
          <p className="text-gray-300 mb-6">Please sign in to view your saved photos.</p>
          <button
            onClick={() => window.location.href = '/sign-in'}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/70 text-neutral-100 font-sans relative pb-20 overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                Your Saved Photos
              </h1>
              <p className="text-gray-300 mt-1">Manage and view your saved photo collection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-neutral-300 text-sm">
            <span className="flex items-center gap-2">
              <ImageIcon size={16} className="text-blue-400" />
              Saved Photos <span className="font-semibold text-neutral-100">{savedPhotos.length}</span>
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 backdrop-blur-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your saved photos...</p>
          </div>
        )}
        
        {/* Photos Grid */}
        {!loading && (
          savedPhotos.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-auto"
            >
              <AnimatePresence>
                {savedPhotos.map((photo) => (
                  <PhotoCard 
                    key={photo.id}
                    photo={photo} 
                    onClick={openLightbox}
                    onSave={handleRemoveFromSaved}
                    onShare={handleSharePhoto}
                    onDownload={handleDownloadPhoto}
                    isSaved={true}
                    user={user}
                    showActions={true}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-neutral-400 text-xl mt-12 py-20 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20"
            >
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No saved photos yet</h3>
              <p className="text-gray-300 mb-6">Start exploring the gallery and save photos you like!</p>
              <button
                onClick={() => window.location.href = '/gallery'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
              >
                Explore Gallery
              </button>
            </motion.div>
          )
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            photos={savedPhotos}
            currentPhotoId={currentPhotoId}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
            user={user}
            onSave={handleRemoveFromSaved}
            onShare={handleSharePhoto}
            onDownload={handleDownloadPhoto}
            savedPhotos={savedPhotoIds}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedPhotosGallery;
