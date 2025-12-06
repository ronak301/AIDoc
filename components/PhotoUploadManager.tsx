
import React, { useRef, useState, useEffect } from 'react';
import { fileToBase64 } from '../utils';
import ImageCropper from './ImageCropper';

interface Props {
  label: string;
  onImageSelected: (base64: string | null) => void;
  existingImage?: string;
  circular?: boolean;
}

const PhotoUploadManager: React.FC<Props> = ({ label, onImageSelected, existingImage, circular = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingImage || null);
  const [tempImage, setTempImage] = useState<string | null>(null); // Image loaded but not cropped yet
  const [error, setError] = useState<string | null>(null);

  // Sync preview if existingImage changes (e.g. during edit load)
  useEffect(() => {
    setPreview(existingImage || null);
  }, [existingImage]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Increased limit to 5MB for better source quality before crop
        setError("File too large. Max 5MB.");
        return;
      }
      
      try {
        const base64 = await fileToBase64(file);
        setTempImage(base64); // Open Cropper
        setError(null);
      } catch (e) {
        setError("Failed to process image.");
      }
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = (croppedBase64: string) => {
    setPreview(croppedBase64);
    onImageSelected(croppedBase64);
    setTempImage(null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelected(null);
  };

  return (
    <>
      {tempImage && (
        <ImageCropper 
            src={tempImage} 
            onCrop={handleCropComplete} 
            onCancel={() => setTempImage(null)} 
            circular={circular}
        />
      )}

      <div 
        className={`relative flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-colors overflow-hidden
          ${error ? 'border-red-500 bg-red-500/10' : 'border-zinc-300 dark:border-zinc-700 bg-card-light dark:bg-card-dark hover:border-primary/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />

        {preview ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <span className="material-symbols-outlined text-white text-3xl">edit</span>
            </div>
            <button 
              onClick={handleClear}
              className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-4xl text-text-secondary-light dark:text-text-secondary-dark">add_photo_alternate</span>
            <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{label}</p>
            {error && <p className="text-xs text-red-500 text-center px-2">{error}</p>}
          </>
        )}
      </div>
    </>
  );
};

export default PhotoUploadManager;
