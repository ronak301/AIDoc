
import { ScreenName } from "./types";

export const APP_CONFIG = {
  localStorageKey: 'family_health_docs_data_v3', // Increment version to force fresh start
};

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  isSharedDefault: boolean; // If true, defaults to shared with family
  isSystem?: boolean; // If true, might have special handling
}

export const DOCUMENT_CATEGORIES: CategoryConfig[] = [
  { id: 'Identity', label: 'Personal', icon: 'badge', isSharedDefault: false },
  { id: 'Active Medicines', label: 'Medicines', icon: 'pill', isSharedDefault: false },
  { id: 'Medical Records', label: 'Medical Records', icon: 'medical_services', isSharedDefault: false },
  { id: 'Bank Accounts', label: 'Bank Acc', icon: 'account_balance', isSharedDefault: false },
  { id: 'Education', label: 'Education', icon: 'school', isSharedDefault: false },
  { id: 'Vehicles', label: 'Vehicles', icon: 'directions_car', isSharedDefault: true },
];

export const DOCUMENT_TABS = [...DOCUMENT_CATEGORIES.map(c => c.id)];

export const MEDICAL_SUB_CATEGORIES = [
  'General', 
  'Skin', 
  'Gastric', 
  'Diabetes', 
  'Heart', 
  'Asthma', 
  'Surgery/Major', 
  'Others'
];
