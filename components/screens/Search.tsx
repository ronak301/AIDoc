
import React, { useState } from 'react';
import { ScreenName } from '../../types';
import { useAppStore } from '../../store';
import { DOCUMENT_CATEGORIES } from '../../config';

interface Props {
  onBack: () => void;
}

const Search: React.FC<Props> = ({ onBack }) => {
  const { state, dispatch } = useAppStore();
  const [query, setQuery] = useState('');

  const documents = state.documents;
  
  const results = documents.filter(d => {
    const q = query.toLowerCase();
    return (
        d.title.toLowerCase().includes(q) || 
        d.category.toLowerCase().includes(q) ||
        (d.number && d.number.toLowerCase().includes(q)) ||
        (d.doctorName && d.doctorName.toLowerCase().includes(q)) ||
        (d.subCategory && d.subCategory.toLowerCase().includes(q)) ||
        (d.accountNumber && d.accountNumber.toLowerCase().includes(q)) ||
        (d.rcNumber && d.rcNumber.toLowerCase().includes(q)) ||
        (d.notes && d.notes.toLowerCase().includes(q))
    );
  });

  const groupedResults = results.reduce((acc, doc) => {
      const cat = doc.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(doc);
      return acc;
  }, {} as Record<string, typeof documents>);

  const handleResultClick = (docId: string) => {
      dispatch({ type: 'SET_VIEWING_DOCUMENT', payload: docId });
      window.dispatchEvent(new CustomEvent('NAVIGATE_TO_DOC_DETAIL'));
  };

  const renderInitialState = () => (
    <>
      {/* Browse by Category Section */}
      <h3 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-8">Browse by Category</h3>
      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-4 px-4 pt-2">
        {DOCUMENT_CATEGORIES.map(cat => (
          <div key={cat.label} className="flex flex-col items-center justify-center gap-2 rounded-lg bg-card-light dark:bg-card-dark p-4 aspect-square cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setQuery(cat.label)}>
            <div className="flex items-center justify-center size-12 rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
            </div>
            <p className="text-text-primary-light dark:text-text-primary-dark text-base font-semibold">{cat.label}</p>
          </div>
        ))}
      </div>
    </>
  );

  const renderResults = () => (
    <>
      <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal pb-3 pt-1 px-4">Found {results.length} results for '{query}'</p>
      
      <div className="flex flex-col gap-6 px-4 pb-10">
        {Object.keys(groupedResults).map(category => (
            <div key={category} className="flex flex-col gap-2">
                <h3 className="text-text-primary-light dark:text-text-primary-dark text-sm font-bold uppercase tracking-wider">{category}</h3>
                {groupedResults[category].map(doc => {
                    const icon = DOCUMENT_CATEGORIES.find(c => c.id === doc.category)?.icon || 'description';
                    const ownerText = doc.ownerName ? `${doc.ownerName} • ` : '';
                    const secondaryText = doc.subtitle || doc.number || doc.relevantDate || '';
                    
                    return (
                        <div key={doc.id} onClick={() => handleResultClick(doc.id)} className="flex items-center gap-4 bg-card-light dark:bg-card-dark rounded-lg p-3 min-h-[72px] justify-between shadow-sm cursor-pointer border border-transparent dark:border-white/5 active:bg-zinc-100 dark:active:bg-white/10">
                            <div className="flex items-center gap-4">
                                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-12">
                                    <span className="material-symbols-outlined">{icon}</span>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-text-primary-light dark:text-text-primary-dark text-base font-medium leading-normal line-clamp-1">{doc.title}</p>
                                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal line-clamp-2">
                                        {ownerText}{secondaryText}
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <div className="text-text-secondary-light dark:text-text-secondary-dark flex size-7 items-center justify-center">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
      {/* Top App Bar */}
      <div className="flex items-center p-4 pt-6 pb-2 justify-between bg-background-light dark:bg-background-dark">
        <div className="text-text-primary-light dark:text-text-primary-dark flex size-12 shrink-0 items-center justify-start cursor-pointer" onClick={onBack}>
          <span className="material-symbols-outlined text-3xl">arrow_back_ios_new</span>
        </div>
        <h2 className="text-text-primary-light dark:text-text-primary-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Search</h2>
        <div className="flex size-12 shrink-0 items-center"></div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 sticky top-0 z-10 bg-background-light dark:bg-background-dark">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-text-secondary-light dark:text-text-secondary-dark flex border-none bg-card-light dark:bg-card-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input 
              className="w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary-light dark:text-text-primary-dark focus:outline-0 focus:ring-0 border-none bg-card-light dark:bg-card-dark focus:border-none h-full placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" 
              placeholder="Search by name, category, number, doctor..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
             {query && (
                 <div className="flex items-center justify-center rounded-r-lg border-l-0 border-none bg-card-light dark:bg-card-dark pr-4">
                  <button onClick={() => setQuery('')} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-transparent text-text-primary-light dark:text-text-primary-dark gap-2 text-base font-bold leading-normal tracking-[0.015em] h-auto min-w-0 px-0">
                    <div className="text-text-secondary-light dark:text-text-secondary-dark">
                    <span className="material-symbols-outlined">cancel</span>
                    </div>
                  </button>
                </div>
             )}
          </div>
        </label>
      </div>

      <div className="flex-1">
        {query ? renderResults() : renderInitialState()}
      </div>
    </div>
  );
};

export default Search;
