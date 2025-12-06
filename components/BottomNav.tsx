
import React from 'react';
import { ScreenName } from '../types';

interface BottomNavProps {
  currentScreen: ScreenName;
  setScreen: (screen: ScreenName) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setScreen }) => {
  const isActive = (screen: ScreenName) => {
    // Group related screens under main tabs
    if (screen === ScreenName.HOME && [ScreenName.HOME, ScreenName.DAILY_TRACKING, ScreenName.EXPIRING_DOCUMENTS, ScreenName.MEDICAL_RECORDS, ScreenName.MEDICINES, ScreenName.ADD_MEDICINE].includes(currentScreen)) return true;
    if (screen === ScreenName.DOCUMENTS_CATEGORIES && [ScreenName.DOCUMENTS_CATEGORIES, ScreenName.DOCUMENT_LIST, ScreenName.DOCUMENT_DETAIL, ScreenName.ADD_DOCUMENT, ScreenName.SEARCH].includes(currentScreen)) return true;
    if (screen === ScreenName.PROFILE && [ScreenName.PROFILE, ScreenName.ADD_MEMBER].includes(currentScreen)) return true;
    
    return currentScreen === screen;
  };

  const handleSetScreen = (screen: ScreenName) => {
    setScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getItemClass = (screen: ScreenName) => 
    `flex flex-col items-center justify-center gap-1 ${isActive(screen) ? 'text-primary' : 'text-text-secondary-light dark:text-text-secondary-dark'}`;

  const getIconClass = (screen: ScreenName) =>
    `material-symbols-outlined ${isActive(screen) ? 'fill' : ''}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80">
      <div className="mx-auto flex h-20 max-w-md items-center justify-around px-2">
        <button onClick={() => handleSetScreen(ScreenName.HOME)} className={getItemClass(ScreenName.HOME)}>
          <span className={getIconClass(ScreenName.HOME)}>home</span>
          <p className="text-xs font-bold">Home</p>
        </button>
        <button onClick={() => handleSetScreen(ScreenName.DOCUMENTS_CATEGORIES)} className={getItemClass(ScreenName.DOCUMENTS_CATEGORIES)}>
          <span className={getIconClass(ScreenName.DOCUMENTS_CATEGORIES)}>folder</span>
          <p className="text-xs font-medium">Documents</p>
        </button>
        <button onClick={() => handleSetScreen(ScreenName.PROFILE)} className={getItemClass(ScreenName.PROFILE)}>
          <span className={getIconClass(ScreenName.PROFILE)}>settings</span>
          <p className="text-xs font-medium">Settings</p>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
