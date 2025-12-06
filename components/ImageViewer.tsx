
import React, { useState } from 'react';
import { base64ToFile } from '../utils';

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageViewer: React.FC<Props> = ({ src, alt, onClose }) => {
  const [scale, setScale] = useState(1);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.max(prev - 0.5, 1));
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        const file = base64ToFile(src, `image_${Date.now()}.jpg`);
        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: alt,
                text: 'Shared from AIDoc'
            });
        } else {
            // Fallback or no-op
            alert("Sharing not supported on this device/browser.");
        }
    } catch (error) {
        console.error("Error sharing image:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-4 z-50">
        <button 
          className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={handleShare}
        >
          <span className="material-symbols-outlined">share</span>
        </button>
        <a 
          href={src} 
          download={`document-${Date.now()}.jpg`}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined">download</span>
        </a>
        <button 
          className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="absolute bottom-10 flex gap-4 z-50">
        <button 
          className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={handleZoomOut}
        >
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button 
          className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={handleZoomIn}
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out"
          style={{ transform: `scale(${scale})` }}
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    </div>
  );
};

export default ImageViewer;
