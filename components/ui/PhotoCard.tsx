import { motion } from "motion/react";

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
  gridSize?: 'normal' | 'wide' | 'large';
}

export const PhotoCard = ({
  photo,
  onClick,
}: {
  photo: Photo;
  onClick: (id: string) => void;
}) => {
  let gridClasses = '';
  if (photo.gridSize === 'wide') {
    gridClasses = 'md:col-span-2';
  } else if (photo.gridSize === 'large') {
    gridClasses = 'md:col-span-2 md:row-span-2';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      className={`relative group cursor-pointer rounded-xl overflow-hidden shadow-xl bg-neutral-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${gridClasses}`}
      onClick={() => onClick(photo.id)}
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          e.currentTarget.src = `https://placehold.co/${e.currentTarget.width}x${e.currentTarget.height}/6B7280/FFFFFF?text=Image+Error`;
        }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/[0.7] to-transparent
                   flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div className="text-white">
          <h3 className="text-lg font-semibold">{photo.title}</h3>
          <p className="text-sm opacity-80">{photo.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

