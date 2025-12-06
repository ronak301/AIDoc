
import React, { useEffect, useState } from 'react';
import { ScreenName, Notification } from '../../types';
import { getNotifications } from '../../api';

interface Props {
  onBack: () => void;
}

const Notifications: React.FC<Props> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background-light/80 px-4 pt-6 pb-3 backdrop-blur-sm dark:bg-background-dark/80">
        <div className="flex size-10 shrink-0 items-center justify-start cursor-pointer" onClick={onBack}>
             <span className="material-symbols-outlined text-2xl text-zinc-900 dark:text-white">arrow_back</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-text-primary-dark">Notifications</h1>
        <div className="flex w-10 items-center justify-end">
          <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-600 hover:bg-slate-200 dark:text-text-secondary-dark dark:hover:bg-card-dark">
            <span className="material-symbols-outlined text-2xl">done_all</span>
          </button>
        </div>
      </div>
      {/* Segmented Controls */}
      <div className="px-4 py-3">
        <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-slate-200 p-1 dark:bg-card-dark">
          {['All', 'Unread', 'Alerts'].map((filter, idx) => (
             <label key={filter} className={`flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal ${idx === 0 ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-text-primary-dark' : 'text-slate-500 dark:text-text-secondary-dark'}`}>
                <span className="truncate">{filter}</span>
                <input className="invisible w-0" name="notification-filter" type="radio" value={filter} defaultChecked={idx===0} />
             </label>
          ))}
        </div>
      </div>
      
      {/* Notification List */}
      <div className="flex flex-col gap-2 px-4 pb-4">
         {['Today', 'Yesterday', 'June 10'].map(group => {
            const groupNotes = notifications.filter(n => n.dateGroup === group);
            if (groupNotes.length === 0) return null;

            return (
                <React.Fragment key={group}>
                    <h3 className="px-2 pt-4 pb-2 text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-text-primary-dark">{group}</h3>
                    {groupNotes.map(note => (
                         <div key={note.id} className="relative flex items-center gap-4 overflow-hidden rounded-lg bg-card-light p-4 shadow-sm dark:bg-card-dark hover:bg-slate-200 dark:hover:bg-[#252528] transition-colors cursor-pointer">
                            {note.priority && <div className={`absolute left-0 top-0 h-full w-1 ${note.priority === 'p1' ? 'bg-priority-p1' : 'bg-priority-p0'}`}></div>}
                            {!note.priority && <div className="absolute left-0 top-0 h-full w-1 bg-primary/50"></div>}
                            
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${note.priority === 'p1' ? 'bg-priority-p1/20 text-priority-p1' : note.priority === 'p0' ? 'bg-priority-p0/20 text-priority-p0' : 'bg-primary/20 text-primary'}`}>
                                <span className="material-symbols-outlined">
                                    {note.type === 'medicine' ? 'pill' : note.type === 'finance' ? 'credit_card' : note.type === 'document' ? 'drafts' : 'notifications'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-text-primary-dark">{note.title}</p>
                                <p className="text-sm text-slate-500 dark:text-text-secondary-dark">{note.message}</p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5 self-start">
                                <p className="text-xs text-slate-400 dark:text-text-secondary-dark">{note.time}</p>
                                {!note.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                            </div>
                         </div>
                    ))}
                </React.Fragment>
            )
         })}
      </div>
    </div>
  );
};

export default Notifications;
