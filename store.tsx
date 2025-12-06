import React, { createContext, useReducer, useEffect, useContext, ReactNode } from 'react';
import { Document, User, Medicine, Settings, DailyStats } from './types';
import { APP_CONFIG } from './config';
import { generateId, getTodayKey } from './utils';

// --- State Definition ---
interface AppState {
  documents: Document[];
  users: User[];
  medicines: Medicine[];
  currentUser: User | null;
  settings: Settings;
  dailyStats: Record<string, DailyStats>; // Key: userId_YYYY-MM-DD
  medicineIntake: Record<string, boolean>; // Key: YYYY-MM-DD_docId_timeSlot
  isLoading: boolean;
  viewingDocumentId: string | null;
  familyCode: string | null; // Code to share with family members
}

const initialState: AppState = {
  documents: [],
  users: [],
  medicines: [],
  currentUser: null,
  settings: {
    documentExpiryAlerts: true,
    waterAlerts: true,
    stepsAlerts: false,
    medicineAlerts: true
  },
  dailyStats: {},
  medicineIntake: {},
  isLoading: true,
  viewingDocumentId: null,
  familyCode: null,
};

// --- Actions ---
type Action =
  | { type: 'INIT_DATA'; payload: AppState }
  | { type: 'CREATE_PROFILE'; payload: { name: string; avatar?: string } }
  | { type: 'ADD_MEMBER'; payload: { name: string; avatar?: string } }
  | { type: 'SWITCH_USER'; payload: string } // userId
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'SET_VIEWING_DOCUMENT'; payload: string | null }
  | { type: 'ADD_MEDICINE'; payload: Medicine }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'RESET_DATA' }
  | { type: 'JOIN_FAMILY'; payload: AppState } // Replace state with cloud data
  | { type: 'SET_FAMILY_CODE'; payload: string }
  | { type: 'UPDATE_DAILY_STATS'; payload: { userId: string, stats: Partial<DailyStats> } }
  | { type: 'TOGGLE_MEDICINE_INTAKE'; payload: { key: string } };

// --- Reducer ---
const appReducer = (state: AppState, action: Action): AppState => {
  let newState: AppState;

  switch (action.type) {
    case 'INIT_DATA':
      return { ...action.payload, isLoading: false };
    
    case 'CREATE_PROFILE': {
      const newUser: User = {
        id: generateId('user'),
        name: action.payload.name,
        avatar: action.payload.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuALiAVe606MGkgesiYbPF7k29ogi2pp9nfdS6MhZd2wQt9BwJSbbHh5mXlGsdQuwGqiLQsu91IfLSXEUDrvYA1NxIS-Nvfi-_cwXsXkWFtfEXVZKxnsbRgigyrqBbbOvgD65uvdOBLXiXHzTVn53RwfBSf31a_PGZDASncpB2Ieu1hLmcmitvS2G_MUC85qRFwmTPVqFr6qVKVdj5hQCRtSehRs4hONrlX9t1g3KL_rNFOsWuyuc7e2raOymHo4CuDjjPoXYdRR_5E',
        isAdmin: true
      };
      newState = { ...state, users: [newUser], currentUser: newUser };
      break;
    }

    case 'ADD_MEMBER': {
      const defaultAvatars = [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBx-X3PpqXEsKK1QwO0NRA3Vtau0prlV5fynBjO_snBxcAp1HLaW_VIMybxQyZznVT5fkcYEFFH3VlvFZDg1ghg2Zsk8U_pjRFrXqF6hYFUcPm5HrQJg96GVmoaLNf4DYiwnItuIHONbG2xP-afysmjugxxAzmG-e1kG7wx2NK-0Ml_88RKGd8B4yuEw76lHcUGy11H25MyLxJ6-r8nWRFF_uCWNsqerp4h-8CQIsxtVrBCvrLFuyqdtaTAwld5mQJ_ntQb4fitD6g',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCVnay32a_jPo1w_YPKRqk_uO6_OR9cjFnW5A8Vs_wxF651eB6eaCas7byGgLN2jnUqjLO05BYhY0QHjqzV7yZ0HUQipqf5qboEKTLJd8ZjUUrGxalPTETw859ziJevjGDTuczz19hocmJv3Jmim3jJZFYNTq084oXfXylbxcxYcZ9eQF1XHIizhhJb9ouCuqNrwlGy2tPxMoIwqAqF-8z8mkjPCHFHHkrwiAwLFhdQ3sR7PltEpljR_wec3UM4TTsYv5KtwV5I_M4',
      ];
      const fallbackAvatar = defaultAvatars[state.users.length % defaultAvatars.length];
      
      const newMember: User = {
        id: generateId('user'),
        name: action.payload.name,
        avatar: action.payload.avatar || fallbackAvatar
      };
      newState = { ...state, users: [...state.users, newMember] };
      break;
    }

    case 'SWITCH_USER': {
      const user = state.users.find(u => u.id === action.payload);
      newState = { ...state, currentUser: user || state.currentUser };
      break;
    }

    case 'ADD_DOCUMENT':
      newState = { ...state, documents: [action.payload, ...state.documents] };
      break;

    case 'UPDATE_DOCUMENT':
      newState = { 
        ...state, 
        documents: state.documents.map(doc => doc.id === action.payload.id ? action.payload : doc) 
      };
      break;

    case 'DELETE_DOCUMENT':
      newState = { ...state, documents: state.documents.filter(d => d.id !== action.payload) };
      break;

    case 'SET_VIEWING_DOCUMENT':
      newState = { ...state, viewingDocumentId: action.payload };
      break;

    case 'ADD_MEDICINE':
      newState = { ...state, medicines: [action.payload, ...state.medicines] };
      break;

    case 'UPDATE_SETTINGS':
      newState = { ...state, settings: { ...state.settings, ...action.payload } };
      break;

    case 'UPDATE_DAILY_STATS': {
        const { userId, stats } = action.payload;
        const key = getTodayKey(userId);
        const currentStats = state.dailyStats[key] || { water: 0, steps: 0 };
        
        newState = {
            ...state,
            dailyStats: {
                ...state.dailyStats,
                [key]: { ...currentStats, ...stats }
            }
        };
        break;
    }

    case 'TOGGLE_MEDICINE_INTAKE': {
        const { key } = action.payload;
        newState = {
            ...state,
            medicineIntake: {
                ...state.medicineIntake,
                [key]: !state.medicineIntake[key]
            }
        };
        break;
    }

    case 'RESET_DATA':
      try {
        localStorage.removeItem(APP_CONFIG.localStorageKey);
      } catch(e) {}
      newState = {
        documents: [],
        users: [],
        medicines: [],
        currentUser: null,
        settings: initialState.settings,
        dailyStats: {},
        medicineIntake: {},
        isLoading: false,
        viewingDocumentId: null,
        familyCode: null,
      };
      break;

    case 'JOIN_FAMILY':
        // Replace current state with the downloaded state
        // Ensure we set isLoading to false
        newState = { ...action.payload, isLoading: false };
        // If the downloaded state has users, set the first one as current if not set
        if (newState.users.length > 0 && !newState.currentUser) {
            newState.currentUser = newState.users[0];
        }
        // Force the currentUser to be the first user if the ID doesn't match (e.g. from different session)
        if (newState.users.length > 0) {
             const exists = newState.users.find(u => u.id === newState.currentUser?.id);
             if (!exists) newState.currentUser = newState.users[0];
        }
        break;

    case 'SET_FAMILY_CODE':
        newState = { ...state, familyCode: action.payload };
        break;

    default:
      return state;
  }

  // Persist changes
  saveToStorage(newState);
  return newState;
};

// --- Helpers ---
const saveToStorage = (state: Partial<AppState>) => {
  try {
    const { isLoading, ...toSave } = state as AppState;
    localStorage.setItem(APP_CONFIG.localStorageKey, JSON.stringify(toSave));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }
};

const loadFromStorage = (): AppState | null => {
  try {
    const stored = localStorage.getItem(APP_CONFIG.localStorageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // SANITIZE & MERGE DEFAULTS: Crucial for preventing crashes with old data
      if (!parsed.users) parsed.users = [];
      if (!parsed.documents) parsed.documents = [];
      if (!parsed.medicines) parsed.medicines = [];
      if (!parsed.dailyStats) parsed.dailyStats = {};
      if (!parsed.medicineIntake) parsed.medicineIntake = {};
      
      // Merge with default settings
      parsed.settings = { ...initialState.settings, ...(parsed.settings || {}) };

      // Ensure currentUser is valid
      if (parsed.users.length > 0 && !parsed.currentUser) {
          parsed.currentUser = parsed.users[0];
      }
      // If persisted currentUser doesn't exist in users array (data corruption), reset to first user
      if (parsed.currentUser && parsed.users.length > 0) {
          const exists = parsed.users.find((u: User) => u.id === parsed.currentUser?.id);
          if (!exists) parsed.currentUser = parsed.users[0];
      }

      return parsed;
    }
  } catch (e) {
    console.error("Failed to load from local storage", e);
    return null;
  }
  return null;
};

// --- Context ---
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadedData = loadFromStorage();
    if (loadedData) {
      dispatch({ type: 'INIT_DATA', payload: loadedData });
    } else {
      // Start fresh, no dummy data
      dispatch({ type: 'INIT_DATA', payload: { ...initialState, isLoading: false } });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => useContext(AppContext);
