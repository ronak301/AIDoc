
import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store';
import { fileToBase64 } from '../../utils';
import ImageCropper from '../ImageCropper';

interface Props {
  onBack: () => void;
}

const AddMember: React.FC<Props> = ({ onBack }) => {
  const { dispatch } = useAppStore();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setTempImage(base64);
      } catch (e) {
        console.error("Failed to process image", e);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = (croppedBase64: string) => {
    setAvatar(croppedBase64);
    setTempImage(null);
  };

  const handleSave = () => {
    if (name.trim()) {
      // Use uploaded avatar or a default placeholder if none selected
      const finalAvatar = avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnBszT6MBQHbth2k1TvcuQ9zf6erZlb3e7ElT9H0_N0IgXqCT56UBLyA3t9xZkYQO0x6X3fns5B5zEtwIdOJZJs5tolUA3jnCHwtbz9TPahlcRcDSAeCZy74Z7DRPi6u06RBLk1aQaWHlK_HouY2IuzWy8C1t5xzMvdTxoDh35JgvNQjt0ueAK1L6uiGCP4gk-mmkWGOCYuFHmNu9LHRzs9IE6OeBy455dUQsiONVcvHMDGDtNh33Zlm0bOnlVxgd9BKxGXylUhXQ';
      
      dispatch({ type: 'ADD_MEMBER', payload: { name, avatar: finalAvatar } });
      onBack();
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <div className="flex items-center p-4 pt-6 pb-2 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm z-10">
        <div className="flex size-12 shrink-0 items-center justify-start text-zinc-900 dark:text-white cursor-pointer" onClick={onBack}>
          <span className="material-symbols-outlined !text-3xl">close</span>
        </div>
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-zinc-900 dark:text-white">Add Member</h2>
        <div className="flex w-12 items-center justify-end cursor-pointer">
          {/* Placeholder for future delete functionality */}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="flex flex-col">
          {tempImage && (
            <ImageCropper 
                src={tempImage} 
                onCrop={handleCropComplete} 
                onCancel={() => setTempImage(null)} 
                circular={true}
            />
          )}

          {/* Profile Header */}
          <div className="flex w-full flex-col items-center gap-6 py-4">
            <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 bg-zinc-200 dark:bg-zinc-800 border-4 border-background-light dark:border-background-dark shadow-xl flex items-center justify-center overflow-hidden"
                style={avatar ? { backgroundImage: `url("${avatar}")` } : {}}
              >
                 {!avatar && <span className="material-symbols-outlined text-6xl text-zinc-400 dark:text-zinc-500">person</span>}
              </div>
              <div className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background-light dark:border-background-dark bg-primary">
                <span className="material-symbols-outlined !text-lg text-background-dark">edit</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <p className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-center text-zinc-900 dark:text-white">Add Photo</p>
              <p className="text-base font-normal leading-normal text-center text-text-secondary-light dark:text-text-secondary-dark">Upload a picture for the new member</p>
            </div>
          </div>
          <div className="h-8"></div>
          {/* Text Fields */}
          <div className="flex flex-col gap-4">
            <label className="flex flex-1 flex-col">
              <p className="pb-2 text-base font-medium leading-normal text-text-secondary-light dark:text-text-secondary-dark">Full Name</p>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="flex h-14 min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:border-none focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                placeholder="e.g. Laura Smith" 
              />
            </label>
          </div>
        </div>
        {/* Single Button */}
        <div className="py-3">
          <button 
            onClick={handleSave} 
            disabled={!name.trim()}
            className={`flex h-14 min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl px-5 text-base font-bold leading-normal tracking-[0.015em] text-white shadow-lg transition-colors ${name.trim() ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-zinc-300 dark:bg-zinc-800 cursor-not-allowed'}`}
          >
            <span className="truncate">Add Member</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMember;
