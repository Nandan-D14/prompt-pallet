import { X, ChevronLeft, ChevronRight, Heart, Share2, Bookmark, Info, Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Photo } from "./PhotoCard";

const Lightbox = ({
  photos,
  currentPhotoId,
  onClose,
  onNavigate,
}: {
  photos: Photo[];
  currentPhotoId: string | null;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
}) => {
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

  const handleLike = () => console.log(`Liked photo ${currentPhoto.id}`);
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentPhoto.title,
        text: currentPhoto.description,
        url: currentPhoto.src,
      }).then(() => console.log('Shared successfully'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      const el = document.createElement('textarea');
      el.value = currentPhoto.src;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      alert(`Link copied to clipboard: ${currentPhoto.src}`);
    }
  };
  const handleSave = () => console.log(`Saved photo ${currentPhoto.id}`);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.8] backdrop-blur-xl p-4 md:p-8" 
      onClick={onClose}
    >
      <div
        className="relative flex flex-col lg:flex-row bg-black/70 rounded-lg shadow-2xl overflow-hidden max-w-8xl w-full h-[90vh] border border-neutral-700" /* Liquid glass border */
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

        <div className="w-full lg:w-96 p-6 bg-black/70 text-neutral-200 flex flex-col overflow-y-auto backdrop-blur-md"> {/* Liquid glass sidebar */}
          <h3 className="text-2xl font-bold text-neutral-100 mb-2">{currentPhoto.title}</h3>
          <p className="text-sm text-neutral-300 mb-4">{currentPhoto.description}</p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/[0.8] text-white text-sm font-medium hover:bg-blue-700/[0.9] transition-colors backdrop-blur-sm" /* Liquid glass button */
            >
              <Heart size={18} /> {currentPhoto.likes || 0} Likes
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-700/[0.8] text-neutral-200 text-sm font-medium hover:bg-neutral-600/[0.9] transition-colors backdrop-blur-sm" /* Liquid glass button */
            >
              <Share2 size={18} /> Share
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-700/[0.8] text-neutral-200 text-sm font-medium hover:bg-neutral-600/[0.9] transition-colors backdrop-blur-sm" /* Liquid glass button */
            >
              <Bookmark size={18} /> Save
            </button>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-neutral-100 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {currentPhoto.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-neutral-700/[0.8] text-neutral-300 backdrop-blur-sm" /* Liquid glass tag */
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-neutral-100 mb-2 flex items-center gap-2">
              <Info size={18} /> Prompt Details
              {currentPhoto.prompt && (
                <motion.button
                  onClick={handleCopyPrompt}
                  className="ml-auto p-1 rounded-full bg-neutral-700/[0.8] text-neutral-300 hover:bg-neutral-600/[0.9] transition-colors flex items-center gap-1 text-xs backdrop-blur-sm" /* Liquid glass button */
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copyStatus === 'copied' ? (
                    <>
                      <Check size={14} className="text-green-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy
                    </>
                  )}
                </motion.button>
              )}
            </h4>
            <p className="text-sm text-neutral-300 bg-neutral-700/[0.8] p-3 rounded-md backdrop-blur-sm"> {/* Liquid glass prompt area */}
              {currentPhoto.prompt || "No specific prompt details available for this image."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default Lightbox;