
import React, { useState, useEffect } from 'react';
import { ScreenName } from './types';
import Home from './components/screens/Home';
import Documents from './components/screens/Documents';
import Medicines from './components/screens/Medicines';
import AddMedicine from './components/screens/AddMedicine';
import Profile from './components/screens/Profile';
import Notifications from './components/screens/Notifications';
import Search from './components/screens/Search';
import BottomNav from './components/BottomNav';
import ExpiringDocuments from './components/screens/ExpiringDocuments';
import DailyTracking from './components/screens/DailyTracking';
import MedicalRecords from './components/screens/MedicalRecords';
import AddMember from './components/screens/AddMember';
import Onboarding from './components/screens/Onboarding';
import { ToastProvider } from './components/Toast';
import { useAppStore } from './store';

const AppContent: React.FC = () => {
  const { state } = useAppStore();
  const [currentScreen, setScreen] = useState<ScreenName>(ScreenName.HOME);

  // Debug logging
  console.log(`[App] Render. isLoading: ${state.isLoading}, Users: ${state.users?.length}, CurrentScreen: ${currentScreen}`);

  // Loading State
  if (state.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Onboarding Check
  if (!state.users || state.users.length === 0) {
    console.log('[App] Redirecting to Onboarding');
    return <Onboarding />;
  }

  // Helper to determine if we should show the bottom nav
  const showBottomNav = [
    ScreenName.HOME,
    ScreenName.DOCUMENTS_CATEGORIES,
    ScreenName.DOCUMENT_LIST,
    ScreenName.PROFILE,
    ScreenName.DAILY_TRACKING,
    ScreenName.EXPIRING_DOCUMENTS,
    ScreenName.MEDICAL_RECORDS,
    ScreenName.MEDICINES
  ].includes(currentScreen);

  return (
    <>
        {currentScreen === ScreenName.HOME && <Home setScreen={setScreen} />}
        
        {/* Documents group */}
        {[ScreenName.DOCUMENTS_CATEGORIES, ScreenName.DOCUMENT_LIST, ScreenName.DOCUMENT_DETAIL, ScreenName.ADD_DOCUMENT].includes(currentScreen) && (
          <Documents currentScreen={currentScreen} setScreen={setScreen} />
        )}
        
        {currentScreen === ScreenName.MEDICINES && <Medicines setScreen={setScreen} />}
        {currentScreen === ScreenName.ADD_MEDICINE && <AddMedicine onBack={() => setScreen(ScreenName.MEDICINES)} />}
        
        {currentScreen === ScreenName.PROFILE && <Profile setScreen={setScreen} />}
        {currentScreen === ScreenName.ADD_MEMBER && <AddMember onBack={() => setScreen(ScreenName.PROFILE)} />}
        
        {currentScreen === ScreenName.NOTIFICATIONS && <Notifications onBack={() => setScreen(ScreenName.HOME)} />}
        {currentScreen === ScreenName.SEARCH && <Search onBack={() => setScreen(ScreenName.HOME)} />}

        {currentScreen === ScreenName.EXPIRING_DOCUMENTS && <ExpiringDocuments onBack={() => setScreen(ScreenName.HOME)} />}
        {currentScreen === ScreenName.DAILY_TRACKING && <DailyTracking onBack={() => setScreen(ScreenName.HOME)} />}
        {currentScreen === ScreenName.MEDICAL_RECORDS && <MedicalRecords onBack={() => setScreen(ScreenName.HOME)} />}

        {showBottomNav && <BottomNav currentScreen={currentScreen} setScreen={setScreen} />}
    </>
  );
}

const App: React.FC = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
        <AppContent />
      </div>
    </ToastProvider>
  );
};

export default App;
