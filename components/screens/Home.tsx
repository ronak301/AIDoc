
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { ScreenName } from '../../types';
import { getTodayKey, formatDate, getLocalDateStr } from '../../utils';

interface HomeProps {
  setScreen: (screen: ScreenName) => void;
}

const Home: React.FC<HomeProps> = ({ setScreen }) => {
  const { state, dispatch } = useAppStore();
  const [showMemberSwitch, setShowMemberSwitch] = useState(false);

  const currentUser = state.currentUser;
  const users = state.users;
  const documents = state.documents;

  // Fail-safe: If users exist but currentUser is null (e.g. data corruption), fallback to first user
  useEffect(() => {
    if (users.length > 0 && !currentUser) {
        dispatch({ type: 'SWITCH_USER', payload: users[0].id });
    }
  }, [users, currentUser, dispatch]);

  // --- Daily Stats Logic ---
  const todayKey = currentUser ? getTodayKey(currentUser.id) : '';
  const dailyStats = state.dailyStats[todayKey] || { water: 0, steps: 0 };
  const waterGlasses = Math.floor(dailyStats.water / 250); // 1 glass = 250ml

  // --- Family Updates Logic ---
  // 1. Expiring Documents: Check ALL documents in the store (entire family)
  const expiringDocs = documents.filter(d => {
      if (!d.expiryDate) return false;
      const expiry = new Date(d.expiryDate);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30; // 30 days threshold
  });

  // 2. Medicines Schedule Generation
  const getTodaySchedule = () => {
    // Get ALL Active Medicines (Family)
    const activeMedicines = documents.filter(d => d.category === 'Active Medicines');
    
    // Flatten logic: 1 Doc -> Multiple Time Slots
    const flatList: Array<{
        docId: string;
        title: string;
        ownerId: string;
        ownerName?: string;
        timeSlot: string;
        instruction: string;
        key: string;
        sortOrder: number;
    }> = [];

    const todayStr = getLocalDateStr();
    const timeSortOrder: Record<string, number> = { 'Morning': 1, 'Afternoon': 2, 'Evening': 3, 'Night': 4 };

    activeMedicines.forEach(med => {
        const times = med.medicineTimes || [];
        
        times.forEach(time => {
            flatList.push({
                docId: med.id,
                title: med.title,
                ownerId: med.ownerId,
                ownerName: med.ownerName,
                timeSlot: time,
                instruction: med.mealInstruction || '',
                key: `${todayStr}_${med.id}_${time}`, // Unique key for today's check status
                sortOrder: timeSortOrder[time] || 99
            });
        });
    });

    // Sort chronologically
    return flatList.sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const medicineSchedule = getTodaySchedule();
  const todayDateDisplay = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // --- Navigation Listener for Expiring Documents Screen ---
  useEffect(() => {
      const handleNav = () => setScreen(ScreenName.DOCUMENT_DETAIL);
      window.addEventListener('NAVIGATE_TO_DOC_DETAIL', handleNav);
      return () => window.removeEventListener('NAVIGATE_TO_DOC_DETAIL', handleNav);
  }, [setScreen]);

  if (!currentUser) return null;

  const handleSwitchUser = (userId: string) => {
    dispatch({ type: 'SWITCH_USER', payload: userId });
    setShowMemberSwitch(false);
  };

  const addWaterGlass = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent navigating to detail if we just want to quick add
      if (waterGlasses < 8) {
          dispatch({ 
              type: 'UPDATE_DAILY_STATS', 
              payload: { 
                  userId: currentUser.id, 
                  stats: { water: dailyStats.water + 250 } 
              } 
          });
      }
  };

  const toggleMedicine = (key: string) => {
      dispatch({ type: 'TOGGLE_MEDICINE_INTAKE', payload: { key } });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex flex-col bg-background-light/80 px-4 pt-4 backdrop-blur-sm dark:bg-background-dark/80">
        <div className="flex items-center pb-2">
          <div className="flex size-12 shrink-0 items-center">
            <div 
              className="aspect-square size-10 rounded-full bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: `url("${currentUser.avatar}")` }}
              onClick={() => setScreen(ScreenName.PROFILE)}
            ></div>
          </div>
          <div className="flex-1 text-center cursor-pointer" onClick={() => setShowMemberSwitch(!showMemberSwitch)}>
            <p className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">Viewing Dashboard for</p>
            <h1 className="flex items-center justify-center gap-2 text-xl font-bold leading-tight tracking-[-0.015em] text-text-primary-light dark:text-text-primary-dark">
              <span>{currentUser.name}</span>
              <span className="material-symbols-outlined text-base">expand_more</span>
            </h1>
          </div>
          <div className="flex w-12 items-center justify-end">
            <button 
              onClick={() => setScreen(ScreenName.NOTIFICATIONS)}
              className="flex h-12 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-transparent text-text-primary-light dark:text-text-primary-dark min-w-0 p-0"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </button>
          </div>
        </div>
        
        {/* Family Horizontal Scroll */}
        <div className="w-full">
          <div className="flex flex-row items-start justify-start gap-4 overflow-x-auto px-4 py-2 no-scrollbar">
            {users.map((user) => {
              const isActive = user.id === currentUser.id;
              return (
                <div key={user.id} className="flex w-16 shrink-0 flex-col items-center justify-center gap-2 text-center cursor-pointer" onClick={() => handleSwitchUser(user.id)}>
                  <div className="relative w-full">
                    <div 
                      className={`aspect-square w-full rounded-full bg-cover bg-center transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background-dark' : 'opacity-70'}`}
                      style={{ backgroundImage: `url("${user.avatar}")` }}
                    ></div>
                  </div>
                  <p className={`text-[13px] font-semibold leading-normal truncate w-full ${isActive ? 'text-primary' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                    {user.name}
                  </p>
                </div>
              );
            })}
            <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-2 text-center opacity-70 cursor-pointer" onClick={() => setScreen(ScreenName.ADD_MEMBER)}>
              <div className="flex aspect-square w-full items-center justify-center rounded-full border-2 border-dashed border-text-secondary-light dark:border-text-secondary-dark bg-card-light dark:bg-card-dark">
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">add</span>
              </div>
              <p className="text-[13px] font-normal leading-normal text-text-secondary-light dark:text-text-secondary-dark">Add</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex flex-col gap-6 p-4">
        
        {/* FAMILY SECTION */}
        <div className="flex flex-col gap-3">
            <h2 className="px-1 text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Family Updates</h2>
            
            {/* Expiring Soon */}
            {expiringDocs.length > 0 ? (
                <div className="rounded-2xl bg-card-light p-4 dark:bg-card-dark cursor-pointer shadow-sm border border-red-500/20" onClick={() => setScreen(ScreenName.EXPIRING_DOCUMENTS)}>
                <div className="flex flex-row items-center justify-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                    <span className="material-symbols-outlined text-3xl">notification_important</span>
                    </div>
                    <div className="flex grow flex-col items-stretch justify-center gap-0">
                    <p className="text-sm font-normal leading-normal text-red-500">Action Required</p>
                    <p className="text-lg font-bold leading-tight tracking-[-0.015em] text-text-primary-light dark:text-text-primary-dark">{expiringDocs.length} Documents Expiring</p>
                    </div>
                    <button className="flex cursor-pointer items-center justify-center">
                    <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">arrow_forward_ios</span>
                    </button>
                </div>
                </div>
            ) : (
                <div className="rounded-2xl bg-card-light p-4 dark:bg-card-dark shadow-sm flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                        <span className="material-symbols-outlined text-2xl">check_circle</span>
                    </div>
                    <p className="text-base font-medium text-text-primary-light dark:text-text-primary-dark">No expiring documents</p>
                </div>
            )}

            {/* Medicines Schedule */}
            <div className="rounded-2xl bg-card-light p-4 dark:bg-card-dark shadow-sm">
                <div className="flex flex-col items-stretch justify-start gap-4">
                    <div className="flex w-full items-center justify-between">
                        <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] text-text-primary-light dark:text-text-primary-dark">Today's Medicines • {todayDateDisplay}</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                        {medicineSchedule.length > 0 ? (
                            medicineSchedule.map(item => {
                                const isTaken = state.medicineIntake[item.key] || false;
                                return (
                                    <div key={item.key} className={`flex items-center gap-4 cursor-pointer transition-opacity ${isTaken ? 'opacity-50' : 'opacity-100'}`} onClick={() => toggleMedicine(item.key)}>
                                        <div className={`flex size-6 items-center justify-center rounded-full border-2 transition-colors shrink-0 ${isTaken ? 'border-primary bg-primary' : 'border-text-secondary-dark bg-transparent'}`}>
                                            {isTaken && <span className="material-symbols-outlined text-sm text-background-dark font-bold">check</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-base font-medium text-text-primary-light dark:text-text-primary-dark truncate ${isTaken ? 'line-through' : ''}`}>{item.title}</p>
                                            <div className="flex items-center gap-1 flex-wrap text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                <span className="font-semibold text-primary">
                                                    {users.find(u => u.id === item.ownerId)?.name || item.ownerName || 'Shared'}
                                                </span>
                                                <span>•</span>
                                                <span className="font-medium">{item.timeSlot}</span>
                                                {item.instruction && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{item.instruction}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center py-4 text-text-secondary-light dark:text-text-secondary-dark text-sm">
                                No scheduled medicines for today
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* PERSONAL SECTION */}
        <div className="flex flex-col gap-3">
            <h2 className="px-1 text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">My Health</h2>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 rounded-2xl bg-card-light p-4 dark:bg-card-dark cursor-pointer shadow-sm" onClick={() => setScreen(ScreenName.DAILY_TRACKING)}>
                    <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">water_drop</span>
                    <p className="text-base font-medium leading-normal text-text-primary-light dark:text-text-primary-dark">Today's Water</p>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                        <p className="text-2xl font-bold leading-tight tracking-tight text-text-primary-light dark:text-text-primary-dark">{waterGlasses}/8</p>
                        <p className="text-sm font-normal leading-normal text-text-secondary-light dark:text-text-secondary-dark">glasses</p>
                        </div>
                        <button onClick={addWaterGlass} className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-background-dark shadow-sm">
                        <span className="material-symbols-outlined text-2xl">add</span>
                        </button>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-primary/20">
                        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${Math.min((waterGlasses / 8) * 100, 100)}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
      </main>
      
      {/* FAB */}
      <div className="fixed bottom-24 right-6 z-20">
        <button className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary text-background-dark shadow-lg shadow-primary/30 transition-transform active:scale-95" onClick={() => setScreen(ScreenName.ADD_DOCUMENT)}>
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      {/* Switch Member Modal */}
      {showMemberSwitch && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowMemberSwitch(false)}>
          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-t-xl bg-card-dark shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 pb-2">
              <h3 className="text-lg font-bold text-text-primary-dark">Switch Family Member</h3>
              <button onClick={() => setShowMemberSwitch(false)} className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-text-secondary-dark">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2 p-4 pt-2">
              {users.map((user) => {
                const isActive = user.id === currentUser.id;
                return (
                    <div key={user.id} onClick={() => handleSwitchUser(user.id)} className={`flex items-center gap-4 rounded-lg p-3 cursor-pointer ${isActive ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-white/10'}`}>
                    <div 
                        className="aspect-square size-12 flex-shrink-0 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${user.avatar}")` }}
                        ></div>
                        <div className="flex-1">
                        <p className="font-bold text-text-primary-dark">{user.name}</p>
                        {isActive && <p className="text-sm text-text-secondary-dark">Currently viewing</p>}
                        </div>
                        {isActive && <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                    </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
