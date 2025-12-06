
import React from 'react';
import { useAppStore } from '../../store';
import { Document, ScreenName } from '../../types';
import { DOCUMENT_CATEGORIES } from '../../config';

interface Props {
  onBack: () => void;
}

const ExpiringDocuments: React.FC<Props> = ({ onBack }) => {
  const { state, dispatch } = useAppStore();
  
  // Filter for ANY expiring document (Family view)
  const expiringDocs = state.documents.filter(d => {
      if (!d.expiryDate) return false;
      const expiry = new Date(d.expiryDate);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30; // Show anything expiring in the next 30 days or expired
  });

  // Sort by expiry date (oldest/expired first)
  expiringDocs.sort((a, b) => {
      return new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime();
  });

  const getDaysRemaining = (dateStr: string) => {
      const expiry = new Date(dateStr);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const groupedDocs = expiringDocs.reduce((acc, doc) => {
      const days = getDaysRemaining(doc.expiryDate!);
      let key = '';
      if (days < 0) key = 'Expired';
      else if (days <= 7) key = 'Expiring in 7 days';
      else key = 'Expiring in 30 days';

      if (!acc[key]) acc[key] = [];
      acc[key].push(doc);
      return acc;
  }, {} as Record<string, Document[]>);

  const groupOrder = ['Expired', 'Expiring in 7 days', 'Expiring in 30 days'];

  const handleDocumentClick = (docId: string) => {
      // Need to dispatch global state change if we want to navigate to detail
      // Assuming 'setScreen' is handled by parent or we are in a context where we can switch
      // Since ExpiringDocuments is a top-level screen in App.tsx, we need a way to invoke DocumentDetail
      // But App.tsx renders Documents wrapper for DETAILS.
      // We need to set the global viewing ID, then tell App to switch to DOCUMENT_DETAIL screen which is handled by Documents.tsx
      
      // dispatch is available from useAppStore
      dispatch({ type: 'SET_VIEWING_DOCUMENT', payload: docId });
      
      // We need to trigger a screen change. 
      // The onBack prop only goes back to Home.
      // We will rely on a trick: The parent App.tsx needs to know we want to go to Detail.
      // But here we can't easily setScreen to DOCUMENT_DETAIL because it's not passed.
      // Actually, let's assume we can change the window location hash or simply use the fact that
      // we updated the store. But we need to change the 'currentScreen' in App.tsx.
      // Since we can't prop drill setScreen easily everywhere without refactoring App.tsx...
      
      // WAIT, the previous pattern in Home.tsx used `setScreen`. 
      // ExpiringDocuments is rendered in App.tsx: <ExpiringDocuments onBack={() => setScreen(ScreenName.HOME)} />
      // It doesn't receive setScreen.
      
      // FIX: I will update the App.tsx render to pass setScreen to ExpiringDocuments or handle a custom event.
      // For now, let's assume we can pass setScreen.
      // I will assume the prop definition needs update.
      
      // Actually, looking at App.tsx, it passes `onBack`.
      // I will force a re-render of App to detect the change? No.
      
      // Let's implement a poor-man's navigation: Use the global dispatch to maybe trigger a side effect?
      // No, let's just cheat and reload? No.
      
      // Best approach: Dispatch an action that App.tsx listens to? No.
      
      // I will assume I can modify App.tsx to pass `setScreen` to ExpiringDocuments.
      // But I am only editing this file.
      // Wait, I can edit multiple files. I will update App.tsx to pass setScreen.
  };
  
  // HACK: I will access the setScreen from props if I change the interface.
  // But wait, the user asked to "link expiring documents detail page".
  // I will add `setScreen` to props.

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden pb-24">
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 px-4 pt-6 pb-2 backdrop-blur-sm dark:bg-background-dark/80">
        <div className="flex w-12 items-center justify-start">
          <button onClick={onBack} className="flex h-12 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-transparent text-text-primary-light dark:text-text-primary-dark min-w-0 p-0">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
        </div>
        <h1 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-text-primary-light dark:text-text-primary-dark">Expiring Documents</h1>
        <div className="flex w-12 items-center justify-end">
           {/* 3 dots menu removed as requested */}
        </div>
      </div>
      
      <main className="flex flex-col gap-6 p-4">
        {expiringDocs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <span className="material-symbols-outlined text-6xl mb-2">check_circle</span>
                <p>No expiring documents</p>
            </div>
        )}

        {groupOrder.map(groupKey => {
            const docs = groupedDocs[groupKey];
            if (!docs || docs.length === 0) return null;

            const headerColor = groupKey === 'Expired' ? 'text-red-500' : groupKey.includes('7 days') ? 'text-amber-500' : 'text-text-secondary-dark';

            return (
                <div key={groupKey} className="flex flex-col gap-3">
                    <h2 className={`px-2 text-base font-bold ${headerColor}`}>{groupKey}</h2>
                    <div className="flex flex-col gap-4 rounded-xl bg-card-light p-4 dark:bg-card-dark shadow-sm">
                        {docs.map(doc => {
                             const icon = DOCUMENT_CATEGORIES.find(c => c.id === doc.category)?.icon || 'description';
                             return (
                                <div 
                                    key={doc.id} 
                                    className="flex w-full items-start gap-4 cursor-pointer active:opacity-70 transition-opacity"
                                    // We need to trigger navigation. Since I can't easily change App.tsx props in this block without touching App.tsx...
                                    // I'll assume the component will be updated in App.tsx to receive navigation prop.
                                    // For now, I'll use a globally accessible event or modify App.tsx.
                                    // I'll modify App.tsx in the next file block.
                                    onClick={() => {
                                        dispatch({ type: 'SET_VIEWING_DOCUMENT', payload: doc.id });
                                        // Dispatch a custom event for App.tsx to pick up if needed, 
                                        // OR relies on App.tsx passing a navigator. 
                                        // I'll add a temporary hidden button or just rely on updating App.tsx.
                                        window.dispatchEvent(new CustomEvent('NAVIGATE_TO_DOC_DETAIL'));
                                    }}
                                >
                                    <div className={`flex size-10 items-center justify-center rounded-lg ${groupKey === 'Expired' ? 'bg-red-500/10 text-red-500' : groupKey.includes('7 days') ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                                        <span className="material-symbols-outlined">{icon}</span>
                                    </div>
                                    <div className="flex flex-1 flex-col gap-1">
                                        <p className="font-semibold text-text-primary-light dark:text-text-primary-dark leading-tight">{doc.title}</p>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                            {doc.ownerName} • Expires {doc.expiryDate}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-lg">chevron_right</span>
                                </div>
                             );
                        })}
                    </div>
                </div>
            );
        })}
      </main>
    </div>
  );
};

export default ExpiringDocuments;
