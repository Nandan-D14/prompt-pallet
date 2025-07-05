"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "@/firebase/client";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ChevronDown,
  Image as ImageIcon,
  Video,
  Users,
  Check,
} from "lucide-react";
import Lightbox from "./ui/Lightbox";
import { Photo, PhotoCard } from "./ui/PhotoCard";

const TrendingSlideshow = ({
  photos,
  openLightbox,
}: {
  photos: Photo[];
  openLightbox: (id: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideshowPhotos = useMemo(() => {
    return [...photos]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 10);
  }, [photos]);

  useEffect(() => {
    if (slideshowPhotos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slideshowPhotos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slideshowPhotos.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slideshowPhotos.length);
  };

  const goToPrev = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + slideshowPhotos.length) % slideshowPhotos.length
    );
  };

  if (slideshowPhotos.length === 0) {
    return null;
  }

  const currentPhoto = slideshowPhotos[currentIndex];

  return (
    <section className="relative w-full max-w-screen-xl mx-auto h-[400px] md:h-[600px] bg-neutral-900/[0.8] overflow-hidden rounded-lg shadow-xl mb-8 border border-neutral-700 backdrop-blur-lg">
      {" "}
      <AnimatePresence initial={false}>
        <motion.img
          key={currentPhoto.id}
          src={currentPhoto.src}
          alt={currentPhoto.alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          onClick={() => openLightbox(currentPhoto.id)}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/[0.5] flex flex-col justify-end p-6 md:p-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg"
        >
          Trending: {currentPhoto.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-lg text-neutral-200 mb-4 max-w-2xl drop-shadow-md"
        >
          {currentPhoto.description}
        </motion.p>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPrev}
            className="p-3 rounded-full bg-neutral-800/[0.7] text-white hover:bg-neutral-700/[0.9] transition-colors backdrop-blur-sm" /* Liquid glass button */
          >
            <ChevronLeft size={24} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNext}
            className="p-3 rounded-full bg-neutral-800/[0.7] text-white hover:bg-neutral-700/[0.9] transition-colors backdrop-blur-sm" /* Liquid glass button */
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [user, setUser] = useState<any>(null);
  const [filterTag, setFilterTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoId, setCurrentPhotoId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedOrientation, setSelectedOrientation] = useState<
    Photo["orientation"] | "All"
  >("All");

  const [selectedColor, setSelectedColor] = useState<string | "All">("All");

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore listener for gallery images
  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const images = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPhotos(images as Photo[]);
    });
    return () => unsubscribe();
  }, []);

  const allTags = useMemo(
    () => [
      "All",
      ...Array.from(new Set(photos.flatMap((photo) => photo.tags))),
    ],
    [photos]
  );

  const filteredPhotos = useMemo(
    () =>
      photos.filter((photo) => {
        const matchesTag =
          filterTag === "All" || photo.tags.includes(filterTag);
        const matchesSearch =
          searchQuery.toLowerCase() === "" ||
          photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          photo.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

        const matchesOrientation =
          selectedOrientation === "All" ||
          photo.orientation === selectedOrientation;
        const matchesColor =
          selectedColor === "All" || photo.color === selectedColor;

        return (
          matchesTag && matchesSearch && matchesOrientation && matchesColor
        );
      }),
    [photos, filterTag, searchQuery, selectedOrientation, selectedColor]
  );

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
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.id === currentPhotoId
    );
    let newIndex = currentIndex;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % filteredPhotos.length;
    } else {
      newIndex =
        (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    }
    setCurrentPhotoId(filteredPhotos[newIndex].id);
  };

  const mainTitle = useMemo(() => {
    if (searchQuery) {
      return `Results for "${searchQuery}"`;
    }
    if (filterTag !== "All") {
      return `${filterTag} Photos`;
    }
    if (selectedOrientation !== "All") {
      const orientation = selectedOrientation ?? "All";
      return `${
        orientation.charAt(0).toUpperCase() + orientation.slice(1)
      } Photos`;
    }
    if (selectedColor !== "All") {
      return `${
        selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)
      } Photos`;
    }
    return "Explore Stunning Photos";
  }, [searchQuery, filterTag, selectedOrientation, selectedColor]);

  const orientations = ["All", "horizontal", "vertical", "square"];
  const colors = [
    "All",
    "red",
    "blue",
    "green",
    "yellow",
    "orange",
    "purple",
    "brown",
    "gray",
    "dark",
    "white",
  ];

  const handleRemoveAllFilters = () => {
    setFilterTag("All");
    setSearchQuery("");
    setSelectedOrientation("All");
    setSelectedColor("All");
    setFiltersOpen(false);
  };

  return (
    <div className="min-h-screen bg-black/70 text-neutral-100 font-sans relative pb-20 overflow-x-hidden">
      <TrendingSlideshow photos={photos} openLightbox={openLightbox} />

      {/* Main Content Section */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex flex-col">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-100 mb-2">
              {mainTitle}
            </h2>
            <div className="flex flex-wrap gap-4 text-neutral-300 text-sm">
              <span className="flex items-center gap-1">
                <ImageIcon size={16} className="text-blue-400" />
                Photos{" "}
                <span className="font-semibold text-neutral-100">
                  {filteredPhotos.length}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/[0.7] text-neutral-200 text-sm hover:bg-neutral-700/[0.9] border border-neutral-700 backdrop-blur-sm transition-colors" /* Liquid glass button */
            >
              <Filter size={16} /> Filters
            </button>
            <div className="relative">
              <select className="bg-neutral-800/[0.7] text-neutral-200 rounded-full px-4 py-2 text-sm appearance-none pr-8 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm">
                {" "}
                {/* Liquid glass select */}
                <option>Popular</option>
                <option>Newest</option>
                <option>Trending</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Dynamic CSS Grid for Photos */}
        <main className="w-full">
          {filteredPhotos.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto auto-flow-dense"
            >
              <AnimatePresence>
                {filteredPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <PhotoCard photo={photo} onClick={openLightbox} />
                    <button
                      onClick={() => {
                        if (!user) {
                          window.location.href = "/sign-in";
                          return;
                        }
                        // Save photo to localStorage
                        let saved = JSON.parse(localStorage.getItem("savedPhotos") || "[]");
                        if (!saved.find((p: any) => p.id === photo.id)) {
                          saved.push(photo);
                          localStorage.setItem("savedPhotos", JSON.stringify(saved));
                        }
                        // Optionally show feedback
                        alert("Photo saved!");
                      }}
                      className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 transition-opacity opacity-80 group-hover:opacity-100"
                    >
                      Save
                    </button>
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-neutral-400 text-xl mt-12 py-20 bg-neutral-800/[0.7] rounded-lg shadow-inner backdrop-blur-md" /* Liquid glass message */
            >
              No photos found for this criteria. Try a different search or
              filter.
            </motion.div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            photos={filteredPhotos}
            currentPhotoId={currentPhotoId}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        )}
      </AnimatePresence>

      {/* Filters Sidebar/Modal */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full md:w-96 bg-neutral-900/[0.9] border-l border-neutral-800 z-50 p-6 flex flex-col shadow-2xl backdrop-blur-xl" /* Liquid glass sidebar */
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-100">Filters</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-2 rounded-full bg-neutral-800/[0.7] text-neutral-200 hover:bg-neutral-700/[0.9] transition-colors backdrop-blur-sm" /* Liquid glass button */
              >
                <X size={24} />
              </button>
            </div>

            {/* Orientation Filter */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-neutral-100 mb-3">
                Orientation
              </h4>
              <div className="flex flex-wrap gap-3">
                {orientations.map((orientation) => (
                  <button
                    key={orientation}
                    onClick={() =>
                      setSelectedOrientation(
                        orientation as Photo["orientation"] | "All"
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors backdrop-blur-sm
                      ${
                        selectedOrientation === orientation
                          ? "bg-blue-600/[0.8] text-white"
                          : "bg-neutral-700/[0.8] text-neutral-200 hover:bg-neutral-600/[0.9]"
                      }`} /* Liquid glass button */
                  >
                    {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-neutral-100 mb-3">
                Colors
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 backdrop-blur-sm
                      ${
                        selectedColor === color
                          ? "border-blue-500 scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                    style={{
                      backgroundColor: color === "All" ? "transparent" : color,
                      borderColor:
                        color === "All" && selectedColor === "All"
                          ? "#3b82f6"
                          : color === "All"
                          ? "#525252"
                          : undefined,
                    }}
                  >
                    {color === "All" ? (
                      <span className="text-xs text-neutral-300">All</span>
                    ) : (
                      selectedColor === color && (
                        <Check
                          size={20}
                          className="text-white drop-shadow-md"
                        />
                      )
                    )}
                    {color === "dark" && (
                      <div className="absolute inset-0 rounded-full border border-neutral-600"></div>
                    )}
                    {color === "white" && (
                      <div className="absolute inset-0 rounded-full border border-neutral-300"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Remove All Filters Button */}
            <button
              onClick={handleRemoveAllFilters}
              className="mt-auto px-4 py-2 rounded-full bg-red-600/[0.8] text-white font-medium hover:bg-red-700/[0.9] transition-colors backdrop-blur-sm" /* Liquid glass button */
            >
              Remove All Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Search Bar at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30
                   w-full max-w-md p-2 rounded-full
                   bg-neutral-800/[0.7] backdrop-filter backdrop-blur-xl /* Liquid glass effect */
                   border border-neutral-700 shadow-lg
                   flex items-center space-x-2"
      >
        <Search size={20} className="text-neutral-400 ml-2" />
        <input
          type="text"
          placeholder="Search photos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow bg-transparent outline-none border-none
                     text-neutral-200 placeholder-neutral-500
                     text-base py-1"
        />
        {searchQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setSearchQuery("")}
            className="p-1 rounded-full text-neutral-400 hover:bg-neutral-700 transition-colors"
          >
            <X size={28} />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
