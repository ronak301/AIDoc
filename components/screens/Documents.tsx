
import React, { useState } from 'react';
import { ScreenName } from '../../types';
import DocumentList from './DocumentList';
import AddDocument from './AddDocument';
import DocumentDetail from './DocumentDetail';
import { useAppStore } from '../../store';
import { DOCUMENT_TABS } from '../../config';

interface DocumentsProps {
  currentScreen: ScreenName;
  setScreen: (screen: ScreenName) => void;
}

const Documents: React.FC<DocumentsProps> = ({ currentScreen, setScreen }) => {
  const { state, dispatch } = useAppStore();
  const [editDocumentId, setEditDocumentId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Identity'); // Defaults to Identity

  if (currentScreen === ScreenName.ADD_DOCUMENT) {
    return (
      <AddDocument 
        initialCategory={activeCategory} 
        editDocumentId={editDocumentId || undefined}
        onBack={() => {
          setEditDocumentId(null);
          setScreen(ScreenName.DOCUMENTS_CATEGORIES);
        }} 
      />
    );
  }

  if (currentScreen === ScreenName.DOCUMENT_DETAIL) {
    const selectedDoc = state.documents.find(d => d.id === state.viewingDocumentId);
    if (!selectedDoc) {
        // Fallback if document not found
        setScreen(ScreenName.DOCUMENTS_CATEGORIES);
        return null;
    }
    return (
      <DocumentDetail 
        document={selectedDoc} 
        onBack={() => {
            dispatch({ type: 'SET_VIEWING_DOCUMENT', payload: null });
            setScreen(ScreenName.DOCUMENTS_CATEGORIES);
        }}
        onEdit={() => {
          setEditDocumentId(selectedDoc.id);
          setScreen(ScreenName.ADD_DOCUMENT);
        }}
      />
    );
  }
  
  // Default to DocumentList directly
  return (
    <DocumentList 
        setScreen={setScreen} 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onSelectDocument={(id) => {
            dispatch({ type: 'SET_VIEWING_DOCUMENT', payload: id });
            setScreen(ScreenName.DOCUMENT_DETAIL);
        }}
        onBack={() => setScreen(ScreenName.HOME)} 
    />
  );
};

export default Documents;
