
import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store';
import { fileToBase64 } from '../../utils';
import ImageCropper from '../ImageCropper';
import { joinFamily } from '../../api';
import { useToast } from '../Toast';

const Onboarding: React.FC = () => {
  const { dispatch } = useAppStore();
  const { showToast } = useToast();
  
  // 'landing' | 'create' | 'join'
  const [step, setStep] = useState<'landing' | 'create' | 'join'>('landing');
  
  // Create State
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Join State
  const [familyCode, setFamilyCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

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

  const handleCreate = () => {
    if (name.trim()) {
      dispatch({ type: 'CREATE_PROFILE', payload: { name, avatar: avatar || undefined } });
    }
  };

  const handleJoin = async () => {
    if (!familyCode.trim()) return;
    setIsJoining(true);
    try {
        const data = await joinFamily(familyCode);
        dispatch({ type: 'JOIN_FAMILY', payload: data });
        dispatch({ type: 'SET_FAMILY_CODE', payload: familyCode });
        showToast('Joined family successfully!');
    } catch (error: any) {
        showToast(error.message || 'Failed to join family');
        setIsJoining(false);
    }
  };

  const renderLanding = () => (
    <div className="flex flex-col flex-1 px-6 pt-10 pb-6 gap-6">
        <div className="flex flex-col items-center text-center mb-4">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Welcome to AIDoc</h1>
            <p className="text-zinc-600 dark:text-text-secondary-dark">Manage your family's documents and health in one secure place.</p>
        </div>

        <div 
            onClick={() => setStep('create')}
            className="flex flex-col items-center justify-center p-8 rounded-2xl bg-card-light dark:bg-card-dark border-2 border-transparent hover:border-primary cursor-pointer shadow-lg transition-all active:scale-[0.98]"
        >
            <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                <span className="material-symbols-outlined text-3xl">add_home</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Create New Family</h3>
            <p className="text-sm text-center text-zinc-500 dark:text-text-secondary-dark mt-2">Start a new secure space for you and your family.</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="h-px bg-zinc-300 dark:bg-white/10 flex-1"></div>
            <span className="text-zinc-400 text-sm">OR</span>
            <div className="h-px bg-zinc-300 dark:bg-white/10 flex-1"></div>
        </div>

        <div 
            onClick={() => setStep('join')}
            className="flex flex-col items-center justify-center p-8 rounded-2xl bg-card-light dark:bg-card-dark border-2 border-transparent hover:border-primary cursor-pointer shadow-lg transition-all active:scale-[0.98]"
        >
            <div className="size-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-500">
                <span className="material-symbols-outlined text-3xl">group_add</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Join Existing Family</h3>
            <p className="text-sm text-center text-zinc-500 dark:text-text-secondary-dark mt-2">Have a family code? Enter it to sync data instantly.</p>
        </div>
    </div>
  );

  const renderCreate = () => (
    <div className="flex flex-col flex-1 px-6 pt-8 pb-6">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Setup Admin Profile</h2>
          <p className="text-zinc-600 dark:text-text-secondary-dark mt-2 max-w-xs">This will be the primary member of your secure space.</p>
        </div>

        {/* Profile Picture Placeholder */}
        <div className="flex justify-center mb-10">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />
            <div 
                className="w-32 h-32 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden bg-cover bg-center border-4 border-transparent hover:border-primary/50 transition-colors"
                style={avatar ? { backgroundImage: `url("${avatar}")` } : {}}
            >
                {!avatar && <span className="material-symbols-outlined text-5xl text-zinc-400 dark:text-zinc-500">person</span>}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                <span className="text-white text-sm mt-1">Edit</span>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-text-secondary-dark mb-2" htmlFor="full-name">Full Name</label>
            <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border-transparent bg-zinc-200 dark:bg-card-dark text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-500 focus:border-primary focus:ring-primary py-3 px-4 shadow-sm" 
                id="full-name" 
                placeholder="e.g. Alex Doe" 
                type="text"
            />
          </div>
        </div>

        <div className="flex-grow"></div>

        <div className="mt-12 flex gap-4">
          <button 
            onClick={() => setStep('landing')}
            className="flex-1 font-bold py-4 px-4 rounded-xl bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-white"
          >
            Back
          </button>
          <button 
            onClick={handleCreate}
            disabled={!name.trim()}
            className={`flex-[2] font-bold py-4 px-4 rounded-xl shadow-lg transition-colors ${name.trim() ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20' : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          >
            Create Profile
          </button>
        </div>
    </div>
  );

  const renderJoin = () => (
    <div className="flex flex-col flex-1 px-6 pt-8 pb-6">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Join Family</h2>
          <p className="text-zinc-600 dark:text-text-secondary-dark mt-2 max-w-xs">Enter the 7-character code shared by your family admin.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-text-secondary-dark mb-2" htmlFor="family-code">Family Code</label>
            <input 
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
                className="block w-full rounded-xl border-transparent bg-zinc-200 dark:bg-card-dark text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-500 focus:border-primary focus:ring-primary py-4 px-4 shadow-sm text-center text-2xl font-mono tracking-widest uppercase" 
                id="family-code" 
                placeholder="XXX-XXX" 
                type="text"
                maxLength={7}
            />
          </div>
        </div>

        <div className="flex-grow"></div>

        <div className="mt-12 flex gap-4">
          <button 
            onClick={() => setStep('landing')}
            className="flex-1 font-bold py-4 px-4 rounded-xl bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-white"
          >
            Back
          </button>
          <button 
            onClick={handleJoin}
            disabled={!familyCode.trim() || isJoining}
            className={`flex-[2] font-bold py-4 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 ${familyCode.trim() ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20' : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
          >
            {isJoining ? (
                <>
                    <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Joining...</span>
                </>
            ) : (
                'Join Family'
            )}
          </button>
        </div>
    </div>
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
      {/* Top App Bar */}
      {step !== 'landing' && (
        <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between">
            <div className="flex size-12 shrink-0 items-center justify-center">
            </div>
            <h1 className="text-zinc-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                {step === 'create' ? 'Create Profile' : 'Join Family'}
            </h1>
            <div className="size-12"></div>
        </div>
      )}

      {tempImage && (
        <ImageCropper 
            src={tempImage} 
            onCrop={handleCropComplete} 
            onCancel={() => setTempImage(null)} 
            circular={true}
        />
      )}

      {step === 'landing' && renderLanding()}
      {step === 'create' && renderCreate()}
      {step === 'join' && renderJoin()}
    </div>
  );
};

export default Onboarding;
