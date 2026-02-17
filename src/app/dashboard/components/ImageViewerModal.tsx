import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import AuthenticatedImage from './AuthenticatedImage';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  altText: string;
  images?: string[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

export default function ImageViewerModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  altText,
  images,
  currentIndex = 0,
  onIndexChange
}: ImageViewerModalProps) {
  if (!isOpen || !imageUrl) return null;

  const hasMultipleImages = images && images.length > 1;
  const currentIdx = currentIndex || 0;
  const canGoPrevious = hasMultipleImages && currentIdx > 0;
  const canGoNext = hasMultipleImages && currentIdx < images.length - 1;

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoPrevious && onIndexChange) {
      onIndexChange(currentIdx - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoNext && onIndexChange) {
      onIndexChange(currentIdx + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && canGoPrevious && onIndexChange) {
      onIndexChange(currentIdx - 1);
    } else if (e.key === 'ArrowRight' && canGoNext && onIndexChange) {
      onIndexChange(currentIdx + 1);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 p-2 rounded-full transition-colors z-[120]"
        aria-label="Close"
      >
        <X className="h-8 w-8" />
      </button>
      
      {hasMultipleImages && canGoPrevious && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 p-3 rounded-full transition-colors z-[120] hover:bg-black/70"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {hasMultipleImages && canGoNext && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 p-3 rounded-full transition-colors z-[120] hover:bg-black/70"
          aria-label="Next image"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {hasMultipleImages && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 bg-black/50 px-4 py-2 rounded-full text-sm z-[120]">
          {currentIdx + 1} / {images.length}
        </div>
      )}
      
      <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <AuthenticatedImage
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-blue-500/20"
        />
      </div>
    </div>
  );
}
