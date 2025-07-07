import { X, ChevronLeft, ChevronRight, Heart, Share2, Bookmark, Info, Check, Copy, Download } from "lucide-react";
import { FiHeart, FiDownload, FiShare2, FiCopy, FiSave } from "react-icons/fi";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Photo } from "./PhotoCard";

interface LightboxProps {
  photos: Photo[];
  currentPhotoId: string | null;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  user?: any;
  onLike?: (photoId: string) => void;
  onSave?: (photo: Photo) => void;
  onShare?: (photo: Photo) => void;
  onDownload?: (photo: Photo) => void;
  likedPhotos?: Set<string>;
  savedPhotos?: Set<string>;
}

const Lightbox = ({
  photos,
  currentPhotoId,
  onClose,
  onNavigate,
  user,
  onLike,
  onSave,
  onShare,
  onDownload,
  likedPhotos = new Set(),
  savedPhotos = new Set(),
}: LightboxProps) => {
  const currentPhoto = photos.find((p) => p.id === currentPhotoId);
  const currentIndex = photos.findIndex((p) => p.id === currentPhotoId);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") onNavigate("prev");
    if (e.key === "ArrowRight") onNavigate("next");
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPhotoId, onNavigate, onClose]);

  if (!currentPhoto) return null;

  const isLiked = likedPhotos.has(currentPhoto.id);
  const isSaved = savedPhotos.has(currentPhoto.id);

  const handleCopyPrompt = () => {
    if (currentPhoto.prompt) {
      const el = document.createElement('textarea');
      el.value = currentPhoto.prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xl p-4 md:p-8" 
      onClick={onClose}
    >
      <div
        className="relative flex flex-col lg:flex-row bg-white/10 dark:bg-black/10 backdrop-blur-2xl 
                   rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl 
                   overflow-hidden max-w-8xl w-full h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-800/[0.7] text-neutral-200 hover:bg-neutral-700/[0.9] transition-colors backdrop-blur-md" /* Liquid glass button */
        >
          <X size={24} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate("prev")}
          disabled={currentIndex === 0}
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-neutral-800/[0.7] text-neutral-200 hover:bg-neutral-700/[0.9] transition-colors backdrop-blur-md ${
            currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate("next")}
          disabled={currentIndex === photos.length - 1}
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-neutral-800/[0.7] text-neutral-200 hover:bg-neutral-700/[0.9] transition-colors backdrop-blur-md ${
            currentIndex === photos.length - 1
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <ChevronRight size={24} />
        </motion.button>

        <motion.div
          key={currentPhoto.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex justify-center items-center p-4 lg:p-6 bg-neutral-950/[0.8] rounded-l-lg border-r border-neutral-700" /* Liquid glass image area */
        >
          <img
            src={currentPhoto.src}
            alt={currentPhoto.alt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
          />
        </motion.div>

        <div className="w-full lg:w-96 p-6 bg-white/5 dark:bg-black/5 backdrop-blur-xl 
                      text-gray-900 dark:text-white flex flex-col overflow-y-auto border-l border-white/10 dark:border-white/5">
          <h3 className="text-2xl font-bold mb-2">{currentPhoto.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{currentPhoto.description}</p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Like Button */}
            <button
              onClick={() => onLike?.(currentPhoto.id)}
              disabled={!user}
              className={`liquid-btn flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                        backdrop-blur-xl transition-all duration-300 font-medium text-sm
                        ${isLiked 
                          ? 'bg-red-500/80 text-white' 
                          : 'bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 hover:bg-red-500/20'
                        }
                        ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            >
              <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </button>
            
            {/* Save Button */}
            <button
              onClick={() => onSave?.(currentPhoto)}
              disabled={!user}
              className={`liquid-btn flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                        backdrop-blur-xl transition-all duration-300 font-medium text-sm
                        ${isSaved 
                          ? 'bg-blue-500/80 text-white' 
                          : 'bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 hover:bg-blue-500/20'
                        }
                        ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
            >
              <FiSave className="w-4 h-4" />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            
            {/* Share Button */}
            <button
              onClick={() => onShare?.(currentPhoto)}
              className="liquid-btn flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                       bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10
                       hover:bg-green-500/20 backdrop-blur-xl transition-all duration-300 
                       font-medium text-sm hover:scale-105"
            >
              <FiShare2 className="w-4 h-4" />
              Share
            </button>
            
            {/* Download Button */}
            <button
              onClick={() => onDownload?.(currentPhoto)}
              className="liquid-btn flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                       bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10
                       hover:bg-purple-500/20 backdrop-blur-xl transition-all duration-300 
                       font-medium text-sm hover:scale-105"
            >
              <FiDownload className="w-4 h-4" />
              Download
            </button>
          </div>
          
          {!user && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 text-center">
                Sign in to like and save photos
              </p>
            </div>
          )}

          {/* Tags Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {currentPhoto.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-2 rounded-full bg-white/10 dark:bg-black/10 
                           border border-white/20 dark:border-white/10 backdrop-blur-xl
                           text-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Prompt Details Section */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Info size={18} /> Prompt Details
              {currentPhoto.prompt && (
                <motion.button
                  onClick={handleCopyPrompt}
                  className="ml-auto p-2 rounded-xl bg-white/10 dark:bg-black/10 
                           border border-white/20 dark:border-white/10 backdrop-blur-xl
                           hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300 
                           flex items-center gap-2 text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copyStatus === 'copied' ? (
                    <>
                      <Check size={14} className="text-green-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy size={14} /> Copy
                    </>
                  )}
                </motion.button>
              )}
            </h4>
            <div className="bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 
                          rounded-xl p-4 backdrop-blur-xl">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {currentPhoto.prompt || "No specific prompt details available for this image."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default Lightbox;