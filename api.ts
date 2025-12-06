
import { USERS, MEDICINES, DOCUMENTS, NOTIFICATIONS } from './constants';
import { User, Medicine, Document, Notification } from './types';
import { APP_CONFIG } from './config';

// These functions now serve as simple data retrievers if needed outside the React Context,
// or to simulate fetching fresh data. The primary state is now in store.tsx.

export const getUsers = async (): Promise<User[]> => {
  const stored = localStorage.getItem(APP_CONFIG.localStorageKey);
  if (stored) {
      return JSON.parse(stored).users;
  }
  return Promise.resolve([]);
};

export const getMedicines = async (): Promise<Medicine[]> => {
  const stored = localStorage.getItem(APP_CONFIG.localStorageKey);
  if (stored) {
      return JSON.parse(stored).medicines;
  }
  return Promise.resolve([]);
};

export const getDocuments = async (): Promise<Document[]> => {
  const stored = localStorage.getItem(APP_CONFIG.localStorageKey);
  if (stored) {
      return JSON.parse(stored).documents;
  }
  return Promise.resolve([]);
};

export const getNotifications = async (): Promise<Notification[]> => {
  return Promise.resolve([]);
};

export const getMedicalRecords = async () => {
  return Promise.resolve([]);
};

export const getDailyTracking = async () => {
  return Promise.resolve({
    water: { current: 0, goal: 2000 },
    steps: { current: 0, goal: 10000 }
  });
};

// --- Cloud Simulation ---
const CLOUD_PREFIX = 'aidoc_cloud_';

export const syncFamilyData = async (state: any): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  let code = state.familyCode;
  if (!code) {
    // Generate new unique code: 3 chars - 3 chars (e.g., A7B-9X2)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let part1 = '';
    let part2 = '';
    for (let i = 0; i < 3; i++) part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 3; i++) part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    code = `${part1}-${part2}`;
  }

  try {
    // Save the entire state snapshot to "cloud" storage
    // In a real app, this would POST to a server
    localStorage.setItem(CLOUD_PREFIX + code, JSON.stringify(state));
    return code;
  } catch (e) {
    console.error("Sync failed", e);
    throw new Error("Failed to sync data. Storage might be full.");
  }
};

export const joinFamily = async (code: string): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const formattedCode = code.toUpperCase().trim();
  const data = localStorage.getItem(CLOUD_PREFIX + formattedCode);
  
  if (!data) {
    throw new Error("Family code not found. Please check and try again.");
  }
  
  return JSON.parse(data);
};
