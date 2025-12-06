
import React from 'react';
import { useAppStore } from '../../store';
import { getTodayKey, formatDate } from '../../utils';

interface Props {
  onBack: () => void;
}

const DailyTracking: React.FC<Props> = ({ onBack }) => {
  const { state, dispatch } = useAppStore();
  const currentUser = state.currentUser;

  if (!currentUser) return null;

  const todayKey = getTodayKey(currentUser.id);
  const dailyStats = state.dailyStats[todayKey] || { water: 0, steps: 0 };
  const waterIntake = dailyStats.water;
  const goal = 2000; // ml
  
  const percentage = Math.min((waterIntake / goal) * 100, 100);
  
  // Circle geometry for progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const updateWater = (amount: number) => {
    const newValue = Math.max(0, waterIntake + amount);
    dispatch({ 
        type: 'UPDATE_DAILY_STATS', 
        payload: { 
            userId: currentUser.id, 
            stats: { water: newValue } 
        } 
    });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col dark overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pt-6 pb-2 justify-between sticky top-0 z-10">
        <div className="flex size-12 shrink-0 items-center justify-start text-zinc-900 dark:text-white cursor-pointer" onClick={onBack}>
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
        </div>
        <h2 className="text-zinc-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center -ml-6">Daily Tracking</h2>
        <div className="size-12"></div>
      </div>
      
      {/* Date Navigator */}
      <div className="flex items-center justify-between px-4 py-3">
        <button className="text-zinc-500 dark:text-white/80 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20">
          <span className="material-symbols-outlined text-2xl">chevron_left</span>
        </button>
        <h4 className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-bold leading-normal tracking-[0.015em]">{formatDate(new Date().toISOString())}</h4>
        <button className="text-zinc-500 dark:text-white/80 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20">
          <span className="material-symbols-outlined text-2xl">chevron_right</span>
        </button>
      </div>

      <div className="p-4 pt-2 space-y-4">
         {/* Water Intake Card */}
        <div className="flex flex-col items-stretch justify-start rounded-xl shadow-sm bg-card-light dark:bg-card-dark p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-2xl">water_drop</span>
            </div>
            <div className="flex-grow">
              <p className="text-zinc-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Water Intake</p>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">Goal: 2L</p>
            </div>
            <button className="flex min-w-[40px] h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700">
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <div className="relative flex items-center justify-center mb-6 mt-2">
             <svg className="h-40 w-40 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-zinc-200 dark:text-zinc-800"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="text-primary transition-all duration-500 ease-out"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
               <div className="absolute flex flex-col items-center">
                  <span className="text-zinc-900 dark:text-white text-3xl font-bold">{(waterIntake / 1000).toFixed(1).replace('.0', '')}L</span>
                  <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">{Math.round(percentage)}%</span>
               </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button onClick={() => updateWater(250)} className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-zinc-300 dark:hover:bg-zinc-700 active:scale-95 transition-transform">
                <span className="truncate">+250ml</span>
              </button>
              <button onClick={() => updateWater(500)} className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-zinc-300 dark:hover:bg-zinc-700 active:scale-95 transition-transform">
                <span className="truncate">+500ml</span>
              </button>
              <button onClick={() => updateWater(1000)} className="flex flex-1 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-zinc-300 dark:hover:bg-zinc-700 active:scale-95 transition-transform">
                <span className="truncate">+1L</span>
              </button>
            </div>
            <button onClick={() => updateWater(-250)} className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-transparent border border-zinc-300 dark:border-zinc-700 text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium leading-normal tracking-[0.015em] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-transform">
              <span className="truncate">-250ml</span>
            </button>
          </div>
        </div>

         {/* Steps Card */}
         <div className="flex flex-col items-stretch justify-start rounded-xl shadow-sm bg-card-light dark:bg-card-dark p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-2xl">footprint</span>
            </div>
            <div className="flex-grow">
              <p className="text-zinc-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Steps</p>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">Synced from Apple Health</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <p className="text-zinc-900 dark:text-white font-semibold">7,520</p>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">10,000 steps</p>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTracking;
