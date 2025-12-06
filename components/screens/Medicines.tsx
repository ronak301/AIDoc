
import React from 'react';
import { ScreenName } from '../../types';
import { useAppStore } from '../../store';

interface Props {
  setScreen: (s: ScreenName) => void;
}

const Medicines: React.FC<Props> = ({ setScreen }) => {
  const { state } = useAppStore();
  const medicines = state.medicines;

  return (
    <div className="relative min-h-screen w-full flex flex-col pb-24 bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <header className="flex items-center p-4 pb-2 bg-background-light dark:bg-background-dark sticky top-0 z-10">
        <div className="flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={() => setScreen(ScreenName.HOME)}>
           <span className="material-symbols-outlined text-zinc-800 dark:text-white text-2xl">arrow_back_ios_new</span>
        </div>
        <h1 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-zinc-800 dark:text-white">Medicines</h1>
        <div className="flex w-12 items-center justify-end">
            <button className="flex items-center justify-center rounded-full h-12 bg-transparent text-zinc-800 dark:text-white min-w-0 p-0">
                <span className="material-symbols-outlined text-2xl">tune</span>
            </button>
        </div>
      </header>

      {/* Chips for Filtering */}
      <div className="flex gap-3 px-4 py-2 overflow-x-auto no-scrollbar">
        {['All', 'Me', 'Spouse', 'Child'].map((filter, i) => (
             <button key={filter} className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-4 ${i===0 ? 'bg-primary' : 'bg-zinc-200 dark:bg-card-dark'}`}>
                <p className={`text-sm font-medium leading-normal ${i===0 ? 'text-white' : 'text-zinc-800 dark:text-white'}`}>{filter}</p>
             </button>
        ))}
      </div>

      <main className="flex-grow p-4 space-y-4">
        {medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-center size-20 bg-zinc-200 dark:bg-card-dark rounded-full mb-4">
                    <span className="material-symbols-outlined text-4xl opacity-50">medication</span>
                </div>
                <p className="text-base font-semibold mb-1">No medicines added</p>
                <p className="text-xs max-w-xs">Tap + to add your first medicine.</p>
            </div>
        ) : (
            medicines.map((med) => (
                <div key={med.id} className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                            <span className="material-symbols-outlined text-primary text-3xl">pill</span>
                        </div>
                        <div className="flex-grow">
                            <p className="text-lg font-bold leading-tight tracking-[-0.015em] text-zinc-800 dark:text-white">{med.name}</p>
                            <p className="text-sm font-normal leading-normal text-zinc-500 dark:text-text-secondary-dark mt-1">{med.dosage}</p>
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex h-6 shrink-0 items-center justify-center gap-x-1 rounded-full bg-zinc-100 dark:bg-background-dark px-3">
                                    <p className="text-xs font-medium text-zinc-600 dark:text-text-secondary-dark">{med.time.split(' - ')[0]}</p>
                                </div>
                            </div>
                        </div>
                        <button className="flex items-center justify-center h-8 w-8 text-primary">
                            <span className="material-symbols-outlined text-2xl fill">notifications_active</span>
                        </button>
                    </div>
                </div>
            ))
        )}
      </main>

      <div className="fixed bottom-24 right-6 z-20">
        <button onClick={() => setScreen(ScreenName.ADD_MEDICINE)} className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform active:scale-95">
            <span className="material-symbols-outlined text-4xl">add</span>
        </button>
      </div>
    </div>
  );
};

export default Medicines;
