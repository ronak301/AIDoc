
import React, { useState } from 'react';
import { ScreenName, Document } from '../../types';
import { useAppStore } from '../../store';
import { DOCUMENT_CATEGORIES, MEDICAL_SUB_CATEGORIES, DOCUMENT_TABS } from '../../config';
import { base64ToFile } from '../../utils';
import { useToast } from '../Toast';

interface Props {
  setScreen: (s: ScreenName) => void;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onSelectDocument: (id: string) => void;
  onBack: () => void;
}

const DocumentList: React.FC<Props> = ({ setScreen, activeCategory, onCategoryChange, onSelectDocument }) => {
  const { state } = useAppStore();
  const { showToast } = useToast();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  const currentUser = state.currentUser;

  // Filter function to check visibility based on sharing rules
  const isDocumentVisible = (doc: Document) => {
    const categoryConfig = DOCUMENT_CATEGORIES.find(c => c.id === doc.category);
    const isShared = categoryConfig?.isSharedDefault;
    const isOwner = doc.ownerId === currentUser?.id;
    return isOwner || isShared;
  };

  // 1. Get all documents visible to current user
  const visibleDocuments = state.documents.filter(isDocumentVisible);

  // 2. Filter by Active Category Tab
  const filteredDocuments = visibleDocuments.filter(doc => doc.category === activeCategory);

  // Calculate counts for each tab
  const getTabCount = (tabId: string) => {
    return visibleDocuments.filter(doc => doc.category === tabId).length;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  };

  const handleShare = async (doc: any) => {
    if (doc.frontPhoto) {
        try {
            const file = base64ToFile(doc.frontPhoto, `document_${doc.title.replace(/\s+/g, '_')}.jpg`);
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: doc.title,
                    text: `Shared document: ${doc.title}`
                });
            } else {
                showToast("Sharing not supported on this device.");
            }
        } catch (error) {
            console.error("Error sharing:", error);
            showToast("Failed to share.");
        }
    } else {
        if (navigator.share) {
            navigator.share({
                title: doc.title,
                text: `Document: ${doc.title}\nNumber: ${doc.number || 'N/A'}`
            });
        }
    }
  };

  const handlePdfShare = async (doc: any) => {
     if (doc.frontPhoto) {
        try {
            const file = base64ToFile(doc.frontPhoto, `${doc.title.replace(/\s+/g, '_')}.jpg`);
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `${doc.title} (PDF)`,
                    text: `Please find attached the document: ${doc.title}`
                });
            } else {
                window.print();
            }
        } catch (error) {
            window.print();
        }
    } else {
        window.print();
    }
  };

  const renderDocumentCard = (doc: Document) => {
    const icon = DOCUMENT_CATEGORIES.find(c => c.id === doc.category)?.icon || 'description';
    return (
        <div key={doc.id} onClick={() => onSelectDocument(doc.id)} className="flex flex-col gap-3 bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm cursor-pointer active:scale-[0.99] transition-transform border border-transparent dark:border-white/5">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{doc.title}</h3>
                    {doc.expiryDate && (
                        <p className={`text-xs ${doc.status === 'Expiring Soon' ? 'text-red-500' : 'text-slate-500 dark:text-[#8E8E93]'}`}>
                            Expires: {doc.expiryDate}
                        </p>
                    )}
                    {doc.relevantDate && (
                        <p className="text-xs text-slate-500 dark:text-[#8E8E93]">
                            Date: {doc.relevantDate}
                        </p>
                    )}
                    {doc.doctorName && (
                        <p className="text-xs text-slate-500 dark:text-[#8E8E93]">
                            Dr. {doc.doctorName}
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 size-10">
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
            </div>
            
            {doc.number && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-background-dark/50 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">
                    <p className="text-sm font-medium tracking-wider text-slate-700 dark:text-gray-300 font-mono truncate mr-2">{doc.number}</p>
                    <button className="text-primary hover:text-primary/80 shrink-0" onClick={(e) => { e.stopPropagation(); handleCopy(doc.number!); }}>
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                </div>
            )}
            
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-slate-600 dark:text-slate-300 border-t border-zinc-100 dark:border-white/5 pt-2.5 mt-1">
                <button className="flex items-center justify-center gap-1.5 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5" onClick={(e) => { e.stopPropagation(); onSelectDocument(doc.id); }}>
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    <span>View</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5" onClick={(e) => { e.stopPropagation(); handlePdfShare(doc); }}>
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    <span>PDF</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/5" onClick={(e) => { e.stopPropagation(); handleShare(doc); }}>
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
  };

  const renderMedicalRecords = () => {
    // 1. Filter by Subcategory
    let records = filteredDocuments;
    if (selectedSubCategory !== 'All') {
        records = records.filter(doc => doc.subCategory === selectedSubCategory);
    }

    // 2. Sort by Date
    records.sort((a, b) => {
        const dateA = new Date(a.relevantDate || 0).getTime();
        const dateB = new Date(b.relevantDate || 0).getTime();
        return sortAscending ? dateA - dateB : dateB - dateA;
    });

    if (records.length === 0) return renderEmptyState();

    // 3. Group by subCategory IF 'All' is selected
    if (selectedSubCategory === 'All') {
        const grouped = records.reduce((acc, doc) => {
            const sub = doc.subCategory || 'Others';
            if (!acc[sub]) acc[sub] = [];
            acc[sub].push(doc);
            return acc;
        }, {} as Record<string, Document[]>);

        const categories = Object.keys(grouped).sort();

        return (
            <div className="flex flex-col gap-6">
                {categories.map(subCat => (
                    <div key={subCat} className="flex flex-col gap-3">
                        <h3 className="px-1 text-sm font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">{subCat}</h3>
                        {grouped[subCat].map(doc => renderDocumentCard(doc))}
                    </div>
                ))}
            </div>
        );
    } else {
        // Flat list for specific category
        return (
            <div className="flex flex-col gap-3">
                {records.map(doc => renderDocumentCard(doc))}
            </div>
        );
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-center size-20 bg-zinc-200 dark:bg-card-dark rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl opacity-50">folder_open</span>
        </div>
        <p className="text-base font-semibold mb-1">No documents found</p>
        <p className="text-xs max-w-xs">Add a document to your personal vault or switch to another member.</p>
    </div>
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden pb-24">
      {/* Top Header */}
      <div className="flex items-center h-16 px-4 pt-6 pb-2 justify-center sticky top-0 z-10 bg-background-light dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center flex-1">
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">Documents</h2>
            {currentUser && <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">for {currentUser.name}</p>}
        </div>
        <div className="absolute right-4 top-4 flex items-center justify-end">
            <button onClick={() => setScreen(ScreenName.SEARCH)} className="flex items-center justify-center p-2 text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined">search</span>
            </button>
        </div>
      </div>

      <div className="px-4 pb-2 mt-2">
        {/* Main Categories - flex-wrap ensures multi-line */}
        <div className="flex w-full gap-2 flex-wrap pb-2 items-center justify-start">
          {DOCUMENT_TABS.map((tabId) => {
             const category = DOCUMENT_CATEGORIES.find(c => c.id === tabId);
             const label = category ? category.label : tabId;
             const isActive = activeCategory === tabId;
             const count = getTabCount(tabId);
             
             return (
                <button 
                    key={tabId}
                    onClick={() => {
                        onCategoryChange(tabId);
                        setSelectedSubCategory('All'); // Reset sub filter
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${isActive ? 'bg-primary border-primary text-white' : 'bg-transparent border-zinc-300 dark:border-zinc-700 text-slate-500 dark:text-[#8E8E93] hover:bg-slate-200 dark:hover:bg-card-dark'}`}
                >
                    {label} {count > 0 && <span className="opacity-80 text-xs ml-0.5">({count})</span>}
                </button>
             );
          })}
        </div>

        {/* Medical Sub Filters & Sort */}
        {activeCategory === 'Medical Records' && (
            <div className="flex items-center gap-2 pt-2 overflow-hidden">
                <div className="flex-1 overflow-x-auto no-scrollbar flex gap-2">
                    {['All', ...MEDICAL_SUB_CATEGORIES].map(sub => (
                        <button
                            key={sub}
                            onClick={() => setSelectedSubCategory(sub)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedSubCategory === sub ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-card-light dark:bg-card-dark text-slate-500 dark:text-slate-400 border border-transparent'}`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
                <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1 shrink-0"></div>
                <button 
                    onClick={() => setSortAscending(!sortAscending)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-transparent text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 shrink-0"
                >
                    <span className="material-symbols-outlined text-lg">sort</span>
                    <span className="text-xs font-medium">{sortAscending ? 'Oldest' : 'Newest'}</span>
                </button>
            </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4 pt-2">
        {activeCategory === 'Medical Records' ? (
            renderMedicalRecords()
        ) : (
            filteredDocuments.length === 0 ? renderEmptyState() : filteredDocuments.map(doc => renderDocumentCard(doc))
        )}
      </div>
       <div className="fixed bottom-24 right-6 z-20">
        <button onClick={() => setScreen(ScreenName.ADD_DOCUMENT)} className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform">
          <span className="material-symbols-outlined !text-4xl">add</span>
        </button>
      </div>
    </div>
  );
};

export default DocumentList;
