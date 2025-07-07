import { motion } from "motion/react";
import { Heart, Download, Share2, Eye, Copy } from "lucide-react";
import { useState } from "react";

export interface Photo {
  id: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  tags: string[];
  height: number;
  likes?: number;
  prompt?: string;
  orientation?: 'horizontal' | 'vertical' | 'square';
  color?: string;
  gridSize?: 'normal' | 'wide' | 'large' | 'small' | 'square';
  createdAt?: any;
  updatedAt?: any;
}

export const PhotoCard = ({
  photo,
  onClick,
  onLike,
  onSave,
  onShare,
  onDownload,
  onCopyPrompt,
  isLiked = false,
  isSaved = false,
  showActions = true,
  user,
}: {
  photo: Photo;
  onClick: (id: string) => void;
  onLike?: (photoId: string) => void;
  onSave?: (photo: Photo) => void;
  onShare?: (photo: Photo) => void;
  onDownload?: (photo: Photo) => void;
  onCopyPrompt?: (photo: Photo) => void;
  isLiked?: boolean;
  isSaved?: boolean;
  showActions?: boolean;
  user?: any;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  let gridClasses = '';
  if (photo.gridSize === 'wide') {
    gridClasses = 'md:col-span-2';
  } else if (photo.gridSize === 'large') {
    gridClasses = 'md:col-span-2 md:row-span-2';
  } else if (photo.gridSize === 'small') {
    gridClasses = 'md:col-span-1';
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger onClick if not clicking on action buttons
    const target = e.target as HTMLElement;
    if (!target.closest('.action-button')) {
      onClick(photo.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative group cursor-pointer rounded-xl overflow-hidden shadow-xl 
                 bg-white/10 backdrop-blur-xl border border-white/20 
                 hover:shadow-2xl transition-all duration-300 ${gridClasses}`}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative aspect-auto overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110
                     ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/400x600/6B7280/FFFFFF?text=${encodeURIComponent(photo.title)}`;
            setImageLoaded(true);
          }}
          style={{ height: `${photo.height}px` }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Action buttons - only show if user is authenticated and showActions is true */}
        {showActions && user && (
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 
                          transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            {/* Like button */}
            <button
              className={`action-button p-2 rounded-xl backdrop-blur-xl transition-all duration-300 
                        border border-white/20 shadow-lg hover:scale-110
                        ${isLiked 
                          ? 'bg-red-500/80 text-white border-red-500/50' 
                          : 'bg-white/20 text-white  hover:text-white'
                        }`}
              onClick={(e) => handleActionClick(e, () => onLike?.(photo.id))}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            
            {/* Copy AI Prompt button */}
            {photo.prompt && (
              <button
                className="action-button p-2 rounded-xl bg-white/20 text-white backdrop-blur-xl 
                         transition-all duration-300 border border-white/20 shadow-lg 
                         hover:scale-110"
                onClick={(e) => handleActionClick(e, () => onCopyPrompt?.(photo))}
                title="Copy AI Prompt"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            
            {/* View in lightbox button */}
            <button
              className="action-button p-2 rounded-xl bg-white/20 text-white backdrop-blur-xl 
                       transition-all duration-300 border border-white/20 shadow-lg 
                       hover:bg-yellow-500/60 hover:scale-110"
              onClick={(e) => handleActionClick(e, () => onClick(photo.id))}
              title="View full size"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Photo info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
          <h3 className="text-white font-semibold text-sm mb-1 truncate">{photo.title}</h3>
          <p className="text-white/80 text-xs truncate mb-2">{photo.description}</p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {photo.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="bg-white/20 text-white text-xs px-2 py-1 rounded-full border border-white/30"
              >
                {tag}
              </span>
            ))}
            {photo.tags.length > 3 && (
              <span className="bg-white/20 text-white/70 text-xs px-2 py-1 rounded-full border border-white/30">
                +{photo.tags.length - 3}
              </span>
            )}
          </div>
          
          {/* Likes count */}
          {photo.likes !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-white/70 text-xs">{photo.likes}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

