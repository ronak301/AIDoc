
import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { generateId } from '../../utils';

interface Props {
  onBack: () => void;
}

const AddMedicine: React.FC<Props> = ({ onBack }) => {
  const { dispatch } = useAppStore();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('09:00 AM');

  const handleSave = () => {
    if (!name) return;
    
    dispatch({
        type: 'ADD_MEDICINE',
        payload: {
            id: generateId('med'),
            name,
            dosage: dosage || '1 pill',
            time: time,
            taken: false
        }
    });
    onBack();
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm pt-6 pb-2">
        <div className="flex items-center p-4 pb-2 justify-between">
          <div className="flex size-10 items-center justify-center cursor-pointer" onClick={onBack}>
            <span className="material-symbols-outlined text-zinc-500 dark:text-zinc-400">arrow_back_ios_new</span>
          </div>
          <h1 className="text-zinc-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Add Medicine</h1>
          <div className="size-10 shrink-0"></div>
        </div>
      </div>

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Medicine Details Card */}
        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl space-y-4 shadow-sm">
          <h2 className="font-bold text-zinc-900 dark:text-white">Medicine Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1" htmlFor="medicine-name">Medicine Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-background-dark border-transparent focus:border-primary focus:ring-primary rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500" 
                placeholder="e.g., Paracetamol 500mg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">Dosage</label>
              <input 
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-background-dark border-transparent focus:border-primary focus:ring-primary rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500" 
                placeholder="e.g. 1 Tablet" 
              />
            </div>
          </div>
        </div>

        {/* Dosage Schedule Card */}
        <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl space-y-4 shadow-sm">
          <h2 className="font-bold text-zinc-900 dark:text-white">Dosage Schedule</h2>
          {/* Time of Day */}
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">Time of Day</label>
            <div className="grid grid-cols-3 gap-2">
              <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer ${time.includes('Morning') ? 'border-primary bg-primary/20' : 'border-zinc-200 dark:border-zinc-700'}`} onClick={() => setTime('Morning')}>
                <span className={`text-sm font-semibold ${time.includes('Morning') ? 'text-primary' : 'text-zinc-600 dark:text-zinc-300'}`}>Morning</span>
              </label>
              <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer ${time.includes('Afternoon') ? 'border-primary bg-primary/20' : 'border-zinc-200 dark:border-zinc-700'}`} onClick={() => setTime('Afternoon')}>
                <span className={`text-sm font-semibold ${time.includes('Afternoon') ? 'text-primary' : 'text-zinc-600 dark:text-zinc-300'}`}>Afternoon</span>
              </label>
              <label className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer ${time.includes('Evening') ? 'border-primary bg-primary/20' : 'border-zinc-200 dark:border-zinc-700'}`} onClick={() => setTime('Evening')}>
                <span className={`text-sm font-semibold ${time.includes('Evening') ? 'text-primary' : 'text-zinc-600 dark:text-zinc-300'}`}>Evening</span>
              </label>
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 p-4 bg-background-light dark:bg-background-dark">
        <button onClick={handleSave} disabled={!name} className={`w-full text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-primary/20 transition-colors ${name ? 'bg-primary hover:bg-primary/90' : 'bg-zinc-400 cursor-not-allowed'}`}>
          Save Medicine
        </button>
      </footer>
    </div>
  );
};

export default AddMedicine;
