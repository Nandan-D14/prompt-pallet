"use client"; // This directive is typically used in Next.js App Router for client components

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "./ui/Lightbox";
import { Photo, PhotoCard } from "./ui/PhotoCard";


// --- SavedPhotosGallery Component ---
const SavedPhotosGallery = () => {
  const [savedPhotos, setSavedPhotos] = useState<Photo[]>([]);

  React.useEffect(() => {
    // Load saved photos from localStorage
    const saved = JSON.parse(localStorage.getItem("savedPhotos") || "[]");
    setSavedPhotos(saved);
    // Listen for changes in localStorage (from other tabs/windows)
    const onStorage = () => {
      const updated = JSON.parse(localStorage.getItem("savedPhotos") || "[]");
      setSavedPhotos(updated);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoId, setCurrentPhotoId] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans relative pb-20 overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-100 mb-6">Your Saved Photos</h2>
        
        {savedPhotos.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto auto-flow-dense"
          >
            <AnimatePresence>
              {savedPhotos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} onClick={openLightbox} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-neutral-400 text-xl mt-12 py-20 bg-neutral-800/[0.7] rounded-lg shadow-inner backdrop-blur-md"
          >
            You haven't saved any photos yet.
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            photos={savedPhotos} // Pass savedPhotos to the Lightbox
            currentPhotoId={currentPhotoId}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedPhotosGallery;
