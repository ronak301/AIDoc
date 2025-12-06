
export enum ScreenName {
  HOME = 'HOME',
  DOCUMENTS_CATEGORIES = 'DOCUMENTS_CATEGORIES',
  DOCUMENT_LIST = 'DOCUMENT_LIST',
  DOCUMENT_DETAIL = 'DOCUMENT_DETAIL',
  ADD_DOCUMENT = 'ADD_DOCUMENT',
  EXPIRING_DOCUMENTS = 'EXPIRING_DOCUMENTS',
  MEDICINES = 'MEDICINES',
  ADD_MEDICINE = 'ADD_MEDICINE',
  MEDICAL_RECORDS = 'MEDICAL_RECORDS',
  DAILY_TRACKING = 'DAILY_TRACKING',
  NOTIFICATIONS = 'NOTIFICATIONS',
  SEARCH = 'SEARCH',
  PROFILE = 'PROFILE',
  ADD_MEMBER = 'ADD_MEMBER',
  ONBOARDING = 'ONBOARDING',
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  relation?: string;
  isAdmin?: boolean;
}

export interface CreditCard {
  id: string;
  last4Digits: string;
  billDueDay: string;
}

export interface Document {
  id: string;
  title: string;
  subtitle?: string; // e.g. "Expires in 2 years" or "Owner: Alex"
  type: string; // 'badge', 'id_card', etc. (icon name)
  category: string; // 'Identity', 'Medical Records', etc.
  expiryDate?: string;
  relevantDate?: string; // Date of visit/issue for medical records
  number?: string;
  status?: 'Valid' | 'Expired' | 'Expiring Soon';
  ownerId: string; // ID of the user who owns this document
  ownerName?: string; // Display name for convenience
  frontPhoto?: string | null; // Base64 string
  backPhoto?: string | null;  // Base64 string
  notes?: string;
  
  // Specific fields for Medical Records
  doctorName?: string;
  doctorContact?: string;
  subCategory?: string;

  // Specific fields for Bank Accounts
  accountNumber?: string;
  ifscCode?: string;
  branchAddress?: string;
  branchContact?: string;
  cancelledCheque?: string | null; // Base64
  creditCards?: CreditCard[];

  // Specific fields for Active Medicines
  medicineFrequency?: 'Daily' | 'Weekly';
  medicineTimes?: string[]; // ['Morning', 'Afternoon', 'Evening', 'Night']
  mealInstruction?: 'Before Meal' | 'After Meal';

  // Specific fields for Vehicles
  rcNumber?: string;
  insurancePhoto?: string | null; // Base64
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  frequency?: string; // 'Daily', 'Weekly'
}

export interface DailyStats {
  water: number; // in ml
  steps: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'medicine' | 'finance' | 'general' | 'document' | 'alert';
  priority?: 'p0' | 'p1'; // p0 = red, p1 = orange
  read: boolean;
  dateGroup: 'Today' | 'Yesterday' | string;
}

export interface Settings {
  documentExpiryAlerts: boolean;
  waterAlerts: boolean;
  stepsAlerts: boolean;
  medicineAlerts: boolean;
}
