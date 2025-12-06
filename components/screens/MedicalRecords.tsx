
import React, { useEffect, useState } from 'react';
import { getMedicalRecords } from '../../api';

interface Props {
  onBack: () => void;
}

const MedicalRecords: React.FC<Props> = ({ onBack }) => {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    getMedicalRecords().then(setRecords);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden pb-24 bg-background-light dark:bg-background-dark">
       {/* Top App Bar */}
        <div className="flex items-center gap-4 bg-background-light dark:bg-background-dark p-4 pt-6 pb-2 justify-between sticky top-0 z-10">
            <div className="flex size-10 shrink-0 items-center justify-center text-slate-700 dark:text-white cursor-pointer" onClick={onBack}>
                <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </div>
            <div className="flex flex-col flex-1 items-center">
                <h2 className="text-slate-800 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Medical Records</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Anna's Records</p>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center"></div>
        </div>

        {/* Chips */}
        <div className="px-4 py-2 sticky top-[76px] z-10 bg-background-light dark:bg-background-dark">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Normal Checkups', 'Surgeries', 'Lab Results', 'Vaccinations'].map((chip, i) => (
                <div key={chip} className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 ${i===0 ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-card-dark text-slate-600 dark:text-slate-300'}`}>
                    <p className="text-sm font-medium leading-normal">{chip}</p>
                </div>
            ))}
            </div>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto px-4 pt-2 space-y-3">
             {records.map((record, index) => (
                <div key={index} className="flex items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl min-h-[72px] justify-between shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-4">
                        <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-12">
                            <span className="material-symbols-outlined">{record.icon}</span>
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-slate-800 dark:text-white text-base font-semibold leading-normal line-clamp-1">{record.title}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal line-clamp-2">{record.date}</p>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <div className="text-slate-400 dark:text-slate-500 flex size-7 items-center justify-center">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </div>
                    </div>
                </div>
             ))}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 right-6 z-20">
            <button className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                <span className="material-symbols-outlined !text-3xl">add</span>
            </button>
        </div>
    </div>
  );
};

export default MedicalRecords;
