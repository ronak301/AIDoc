
import React, { useState } from 'react';
import { ScreenName } from '../../types';
import { useAppStore } from '../../store';
import { syncFamilyData } from '../../api';
import { useToast } from '../Toast';

interface Props {
  setScreen: (s: ScreenName) => void;
}

const Profile: React.FC<Props> = ({ setScreen }) => {
  const { state, dispatch } = useAppStore();
  const { users, settings, currentUser, familyCode } = state;
  const { showToast } = useToast();
  
  const [confirmReset, setConfirmReset] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!users || users.length === 0) return null;

  const handleReset = () => {
    if (confirmReset) {
      dispatch({ type: 'RESET_DATA' });
      // Clear absolutely everything to ensure fresh start
      localStorage.clear();
      // Reload to reset all memory states
      window.location.reload();
    } else {
      setConfirmReset(true);
      // Reset confirmation timeout after 3 seconds
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
        const code = await syncFamilyData(state);
        dispatch({ type: 'SET_FAMILY_CODE', payload: code });
        showToast('Sync successful! Family code updated.');
    } catch (error) {
        showToast('Sync failed. Please try again.');
    } finally {
        setIsSyncing(false);
    }
  };

  const copyCode = () => {
    if (familyCode) {
        navigator.clipboard.writeText(familyCode);
        showToast('Family code copied!');
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: !settings[key] } });
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-24">
      {/* Top App Bar - Increased height to match Home */}
      <div className="flex items-center h-16 px-4 pt-6 pb-2 justify-center sticky top-0 bg-background-light dark:bg-background-dark z-10">
        <div className="flex flex-col items-center justify-center">
            <h2 className="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">Settings</h2>
            {currentUser && <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">for {currentUser.name}</p>}
        </div>
      </div>

      <div className="flex flex-col p-4 gap-6">
        {/* Family Members Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Family Members</h3>
          {/* Active Member List Item */}
          <div className="flex items-center gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4">
            <div className="flex items-center gap-4 flex-1">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14" 
                style={{ backgroundImage: `url("${users[0].avatar}")` }}
              ></div>
              <div className="flex flex-col justify-center">
                <p className="text-black dark:text-white text-base font-medium leading-normal line-clamp-1">{users[0].name}</p>
                <p className="text-primary text-sm font-normal leading-normal line-clamp-2">Active</p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="material-symbols-outlined text-text-secondary-dark text-2xl">expand_more</span>
            </div>
          </div>
          
          {/* Other Members Carousel */}
          <div className="flex overflow-y-auto no-scrollbar -mx-4 px-4">
            <div className="flex items-stretch gap-4">
               {users.slice(1).map(u => (
                  <div key={u.id} className="flex h-full flex-1 flex-col gap-3 text-center rounded-lg min-w-24 pt-2">
                    <div 
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full flex flex-col self-center w-full"
                      style={{ backgroundImage: `url("${u.avatar}")` }}
                    ></div>
                    <p className="text-black dark:text-white text-sm font-medium leading-normal">{u.name}</p>
                  </div>
               ))}
            </div>
          </div>
          
          {/* Add Member Button */}
          <div className="flex">
            <button onClick={() => setScreen(ScreenName.ADD_MEMBER)} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-4 flex-1 bg-card-light dark:bg-card-dark text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-primary text-xl">add</span>
              <span className="truncate text-primary">Add a New Member</span>
            </button>
          </div>
        </div>

        {/* Family Sync & Backup Section */}
        <div className="flex flex-col gap-4">
            <h3 className="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Family Sync & Backup</h3>
            <div className="flex flex-col rounded-xl bg-card-light dark:bg-card-dark p-4 gap-4">
                <p className="text-black/70 dark:text-white/70 text-sm">Sync your family data to the cloud to access it from other devices or share with family members.</p>
                
                {familyCode ? (
                    <div className="flex flex-col items-center gap-2 p-4 bg-zinc-100 dark:bg-white/5 rounded-lg border border-dashed border-zinc-300 dark:border-white/10">
                        <p className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">Your Family Code</p>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-mono font-bold text-primary tracking-widest">{familyCode}</span>
                            <button onClick={copyCode} className="p-2 rounded-full hover:bg-white/10 text-text-secondary-light dark:text-white">
                                <span className="material-symbols-outlined">content_copy</span>
                            </button>
                        </div>
                        <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark mt-1">Share this code with your family to let them join.</p>
                    </div>
                ) : (
                    <div className="p-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark bg-zinc-100 dark:bg-white/5 rounded-lg">
                        Sync to generate a Family Code
                    </div>
                )}

                <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-4 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                    {isSyncing ? (
                        <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <span className="material-symbols-outlined text-white text-xl">cloud_sync</span>
                    )}
                    <span className="truncate">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
            </div>
        </div>

        {/* Notifications Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Notifications</h3>
          <div className="flex flex-col rounded-xl bg-card-light dark:bg-card-dark overflow-hidden divide-y divide-white/5">
            {/* Document Expiry */}
            <div className="flex items-center p-4 justify-between cursor-pointer" onClick={() => toggleSetting('documentExpiryAlerts')}>
              <div className="flex flex-col flex-1 pr-4">
                <p className="text-black dark:text-white text-base font-medium">Document Expiry</p>
                <p className="text-black/70 dark:text-white/70 text-sm">Alerts before documents expire.</p>
              </div>
               <div className={`relative inline-block w-11 h-6 cursor-pointer rounded-full transition-colors ${settings.documentExpiryAlerts ? 'bg-primary' : 'bg-zinc-600/50'}`}>
                    <div className={`absolute inset-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${settings.documentExpiryAlerts ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>
            
            {/* Water Alerts */}
            <div className="flex items-center p-4 justify-between cursor-pointer" onClick={() => toggleSetting('waterAlerts')}>
              <div className="flex flex-col flex-1 pr-4">
                <p className="text-black dark:text-white text-base font-medium">Hydration Alerts</p>
                <p className="text-black/70 dark:text-white/70 text-sm">Reminders to drink water.</p>
              </div>
               <div className={`relative inline-block w-11 h-6 cursor-pointer rounded-full transition-colors ${settings.waterAlerts ? 'bg-primary' : 'bg-zinc-600/50'}`}>
                    <div className={`absolute inset-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${settings.waterAlerts ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>

            {/* Steps Alerts */}
            <div className="flex items-center p-4 justify-between cursor-pointer" onClick={() => toggleSetting('stepsAlerts')}>
              <div className="flex flex-col flex-1 pr-4">
                <p className="text-black dark:text-white text-base font-medium">Goal Achievements</p>
                <p className="text-black/70 dark:text-white/70 text-sm">Notify when step goals are met.</p>
              </div>
               <div className={`relative inline-block w-11 h-6 cursor-pointer rounded-full transition-colors ${settings.stepsAlerts ? 'bg-primary' : 'bg-zinc-600/50'}`}>
                    <div className={`absolute inset-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${settings.stepsAlerts ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>

            {/* Medicine Alerts */}
            <div className="flex items-center p-4 justify-between cursor-pointer" onClick={() => toggleSetting('medicineAlerts')}>
              <div className="flex flex-col flex-1 pr-4">
                <p className="text-black dark:text-white text-base font-medium">Medicine Reminders</p>
                <p className="text-black/70 dark:text-white/70 text-sm">Daily reminders for medications.</p>
              </div>
               <div className={`relative inline-block w-11 h-6 cursor-pointer rounded-full transition-colors ${settings.medicineAlerts ? 'bg-primary' : 'bg-zinc-600/50'}`}>
                    <div className={`absolute inset-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${settings.medicineAlerts ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Data & Sync Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-black dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Data</h3>
          <div className="flex flex-col rounded-xl bg-card-light dark:bg-card-dark p-4 items-center gap-4">
            <p className="text-black/70 dark:text-white/70 text-sm">Manage your local data.</p>
            
            <button 
                onClick={handleReset}
                className={`flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-4 gap-2 text-sm font-bold leading-normal tracking-[0.015em] transition-all ${
                  confirmReset 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                }`}
            >
              <span className="material-symbols-outlined text-xl">{confirmReset ? 'warning' : 'delete_forever'}</span>
              <span className="truncate">{confirmReset ? 'Tap again to Confirm Reset' : 'Clear App Data & Reset'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
