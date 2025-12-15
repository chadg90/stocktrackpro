import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  altText: string;
}

export default function ImageViewerModal({ isOpen, onClose, imageUrl, altText }: ImageViewerModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 p-2 rounded-full transition-colors z-50"
      >
        <X className="h-8 w-8" />
      </button>
      
      <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {/* We use a regular img tag here for simplicity with external URLs, or we can use Next.js Image if domains are configured */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt={altText} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-primary/20"
        />
      </div>
    </div>
  );
}
