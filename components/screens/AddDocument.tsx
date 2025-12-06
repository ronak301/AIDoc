
import React, { useState, useEffect } from 'react';
import { DOCUMENT_CATEGORIES, MEDICAL_SUB_CATEGORIES } from '../../config';
import { useAppStore } from '../../store';
import { generateId } from '../../utils';
import { CreditCard } from '../../types';
import PhotoUploadManager from '../PhotoUploadManager';

interface Props {
  onBack: () => void;
  initialCategory?: string;
  editDocumentId?: string;
}

const AddDocument: React.FC<Props> = ({ onBack, initialCategory, editDocumentId }) => {
  const { dispatch, state } = useAppStore();
  const [formData, setFormData] = useState({
    title: '',
    number: '',
    category: (initialCategory === 'All' ? 'Identity' : initialCategory) || 'Identity',
    expiryDate: '',
    relevantDate: '',
    notes: '',
    frontPhoto: null as string | null,
    backPhoto: null as string | null,
    doctorName: '',
    doctorContact: '',
    subCategory: '',
    // Bank specific
    accountNumber: '',
    ifscCode: '',
    branchAddress: '',
    branchContact: '',
    cancelledCheque: null as string | null,
    creditCards: [] as CreditCard[],
    // Medicine specific
    medicineFrequency: 'Daily' as 'Daily' | 'Weekly',
    medicineTimes: [] as string[],
    mealInstruction: 'After Meal' as 'Before Meal' | 'After Meal',
    // Vehicle specific
    rcNumber: '',
    insurancePhoto: null as string | null,
  });

  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showSubCategorySheet, setShowSubCategorySheet] = useState(false);

  // Load data if editing
  useEffect(() => {
    if (editDocumentId) {
      const doc = state.documents.find(d => d.id === editDocumentId);
      if (doc) {
        setFormData({
          title: doc.title,
          number: doc.number || '',
          category: doc.category,
          expiryDate: doc.expiryDate || '',
          relevantDate: doc.relevantDate || '',
          notes: doc.notes || '',
          frontPhoto: doc.frontPhoto || null,
          backPhoto: doc.backPhoto || null,
          doctorName: doc.doctorName || '',
          doctorContact: doc.doctorContact || '',
          subCategory: doc.subCategory || '',
          accountNumber: doc.accountNumber || '',
          ifscCode: doc.ifscCode || '',
          branchAddress: doc.branchAddress || '',
          branchContact: doc.branchContact || '',
          cancelledCheque: doc.cancelledCheque || null,
          creditCards: doc.creditCards || [],
          medicineFrequency: doc.medicineFrequency || 'Daily',
          medicineTimes: doc.medicineTimes || [],
          mealInstruction: doc.mealInstruction || 'After Meal',
          rcNumber: doc.rcNumber || '',
          insurancePhoto: doc.insurancePhoto || null,
        });
      }
    }
  }, [editDocumentId, state.documents]);

  const handleSave = () => {
    if (!formData.title || !formData.category) {
        alert("Please enter a title and select a category.");
        return;
    }

    if (!state.currentUser) return;

    const categoryConfig = DOCUMENT_CATEGORIES.find(c => c.id === formData.category);
    
    // Auto-set status based on expiry
    let status: 'Valid' | 'Expired' | 'Expiring Soon' | undefined = 'Valid';
    if (formData.expiryDate) {
        const expiry = new Date(formData.expiryDate);
        const now = new Date();
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) status = 'Expired';
        else if (diffDays < 30) status = 'Expiring Soon';
        else status = 'Valid';
    } else {
        status = undefined;
    }

    const docData = {
      title: formData.title,
      subtitle: formData.expiryDate ? `Expires: ${formData.expiryDate}` : (state.currentUser.name),
      type: categoryConfig?.icon || 'description',
      category: formData.category,
      number: formData.number,
      expiryDate: formData.expiryDate,
      relevantDate: formData.relevantDate,
      status: status,
      frontPhoto: formData.frontPhoto,
      backPhoto: formData.backPhoto,
      notes: formData.notes,
      doctorName: formData.doctorName,
      doctorContact: formData.doctorContact,
      subCategory: formData.subCategory,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      branchAddress: formData.branchAddress,
      branchContact: formData.branchContact,
      cancelledCheque: formData.cancelledCheque,
      creditCards: formData.creditCards,
      medicineFrequency: formData.medicineFrequency,
      medicineTimes: formData.medicineTimes,
      mealInstruction: formData.mealInstruction,
      rcNumber: formData.rcNumber,
      insurancePhoto: formData.insurancePhoto,
    };

    if (editDocumentId) {
      const original = state.documents.find(d => d.id === editDocumentId);
      if (original) {
        dispatch({ 
          type: 'UPDATE_DOCUMENT', 
          payload: { ...original, ...docData } 
        });
      }
    } else {
      dispatch({ 
        type: 'ADD_DOCUMENT', 
        payload: {
          id: generateId('doc'),
          ownerId: state.currentUser.id, 
          ownerName: state.currentUser.name,
          ...docData
        } 
      });
    }
    
    onBack();
  };

  const addCreditCard = () => {
    setFormData({
        ...formData,
        creditCards: [...formData.creditCards, { id: generateId('cc'), last4Digits: '', billDueDay: '' }]
    });
  };

  const updateCreditCard = (id: string, field: keyof CreditCard, value: string) => {
    setFormData({
        ...formData,
        creditCards: formData.creditCards.map(cc => cc.id === id ? { ...cc, [field]: value } : cc)
    });
  };

  const removeCreditCard = (id: string) => {
    setFormData({
        ...formData,
        creditCards: formData.creditCards.filter(cc => cc.id !== id)
    });
  };

  const toggleMedicineTime = (time: string) => {
    if (formData.medicineTimes.includes(time)) {
        setFormData({ ...formData, medicineTimes: formData.medicineTimes.filter(t => t !== time) });
    } else {
        setFormData({ ...formData, medicineTimes: [...formData.medicineTimes, time] });
    }
  };

  const isMedical = formData.category === 'Medical Records';
  const isBank = formData.category === 'Bank Accounts';
  const isMedicine = formData.category === 'Active Medicines';
  const isVehicle = formData.category === 'Vehicles';

  return (
    <div className="relative mx-auto flex h-auto min-h-screen w-full max-w-md flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-background-light/80 dark:bg-background-dark/80 px-4 pt-6 pb-2 backdrop-blur-sm">
        <div className="flex size-10 shrink-0 items-center justify-start cursor-pointer" onClick={onBack}>
          <span className="material-symbols-outlined text-3xl text-zinc-900 dark:text-white">close</span>
        </div>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">{editDocumentId ? 'Edit Document' : 'Add New Document'}</h1>
        <div className="flex w-10 shrink-0 items-center justify-end">
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6 overflow-y-auto px-4 pb-32 pt-4">
        {/* Core Details Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Core Details</h2>
          <div className="flex flex-col gap-4">
            
            {/* Category Selector */}
            <div 
                className="flex min-h-14 items-center justify-between gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setShowCategorySheet(true)}
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">category</span>
                <p className="flex-1 truncate text-base font-normal leading-normal text-zinc-900 dark:text-white">
                    {formData.category ? (DOCUMENT_CATEGORIES.find(c => c.id === formData.category)?.label || formData.category) : 'Category'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="text-base font-normal leading-normal text-text-secondary-light dark:text-text-secondary-dark">Select</p>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </div>
            </div>

            {/* Document Name */}
            <label className="flex flex-col">
              <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">
                {isMedical ? "Health Issue / Record Title" : isBank ? "Bank Name / Title" : isMedicine ? "Medicine Name" : isVehicle ? "Vehicle Name (e.g. Honda City)" : "Document Name"}
              </p>
              <input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                placeholder={isMedical ? "e.g., Viral Fever, Blood Test" : isBank ? "e.g., HDFC Savings, ICICI Credit" : isMedicine ? "e.g. Paracetamol 500mg" : isVehicle ? "e.g. Honda City" : "e.g., Passport"} 
              />
            </label>

            {/* Sub Category for Medical */}
            {isMedical && (
                <div 
                    className="flex min-h-14 items-center justify-between gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => setShowSubCategorySheet(true)}
                >
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">medical_services</span>
                    <p className="flex-1 truncate text-base font-normal leading-normal text-zinc-900 dark:text-white">
                        {formData.subCategory ? formData.subCategory : 'Sub Category'}
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <p className="text-base font-normal leading-normal text-text-secondary-light dark:text-text-secondary-dark">Select</p>
                    <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
                </div>
                </div>
            )}

            {/* Medicine Specifics */}
            {isMedicine && (
                <>
                    <label className="flex flex-col">
                        <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">Condition / Purpose</p>
                        <input 
                            value={formData.subCategory}
                            onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                            className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                            placeholder="e.g. Fever, BP, Diabetes" 
                        />
                    </label>

                    <div className="flex flex-col gap-2">
                        <p className="text-base font-medium leading-normal text-zinc-900 dark:text-white">Frequency</p>
                        <div className="flex bg-card-light dark:bg-card-dark rounded-xl p-1">
                            {['Daily', 'Weekly'].map(freq => (
                                <button
                                    key={freq}
                                    onClick={() => setFormData({...formData, medicineFrequency: freq as 'Daily' | 'Weekly'})}
                                    className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${formData.medicineFrequency === freq ? 'bg-primary text-white shadow-md' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                                >
                                    {freq}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-base font-medium leading-normal text-zinc-900 dark:text-white">Time</p>
                        <div className="flex flex-wrap gap-2">
                            {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                                <button
                                    key={time}
                                    onClick={() => toggleMedicineTime(time)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${formData.medicineTimes.includes(time) ? 'bg-primary border-primary text-white' : 'bg-transparent border-zinc-300 dark:border-zinc-700 text-text-secondary-light dark:text-text-secondary-dark'}`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-base font-medium leading-normal text-zinc-900 dark:text-white">Instruction</p>
                        <div className="flex bg-card-light dark:bg-card-dark rounded-xl p-1">
                            {['Before Meal', 'After Meal'].map(inst => (
                                <button
                                    key={inst}
                                    onClick={() => setFormData({...formData, mealInstruction: inst as 'Before Meal' | 'After Meal'})}
                                    className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${formData.mealInstruction === inst ? 'bg-primary text-white shadow-md' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                                >
                                    {inst}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Vehicle Specifics */}
            {isVehicle && (
                <>
                    <label className="flex flex-col">
                        <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">Vehicle Number</p>
                        <input 
                            value={formData.number}
                            onChange={(e) => setFormData({...formData, number: e.target.value})}
                            className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                            placeholder="e.g. KA01AB1234" 
                        />
                    </label>
                    <label className="flex flex-col">
                        <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">RC Number</p>
                        <input 
                            value={formData.rcNumber}
                            onChange={(e) => setFormData({...formData, rcNumber: e.target.value})}
                            className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                            placeholder="RC Number" 
                        />
                    </label>
                </>
            )}

            {/* Document Number (Hide for Medical and Bank and Medicine and Vehicle unless specific) */}
            {!isMedical && !isBank && !isMedicine && !isVehicle && (
                <label className="flex flex-col">
                <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">Document Number</p>
                <input 
                    value={formData.number}
                    onChange={(e) => setFormData({...formData, number: e.target.value})}
                    className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                    placeholder="Enter number (optional)" 
                />
                </label>
            )}

            {/* Bank Specific Fields */}
            {isBank && (
                <>
                    <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">Account Number</p>
                    <input 
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                        className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                        placeholder="e.g., 1234567890" 
                    />
                    </label>
                    <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">IFSC Code</p>
                    <input 
                        value={formData.ifscCode}
                        onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                        className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                        placeholder="e.g., HDFC0001234" 
                    />
                    </label>
                    <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">Home Branch Address</p>
                    <input 
                        value={formData.branchAddress}
                        onChange={(e) => setFormData({...formData, branchAddress: e.target.value})}
                        className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                        placeholder="e.g., MG Road Branch, Bangalore" 
                    />
                    </label>
                    <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">Home Branch Contact</p>
                    <input 
                        value={formData.branchContact}
                        onChange={(e) => setFormData({...formData, branchContact: e.target.value})}
                        className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                        placeholder="e.g., 080-12345678" 
                    />
                    </label>

                    {/* Credit Cards Section */}
                    <div className="flex flex-col gap-2 pt-2">
                        <div className="flex items-center justify-between">
                            <p className="text-base font-medium leading-normal text-zinc-900 dark:text-white">Credit Cards</p>
                            <button onClick={addCreditCard} className="text-sm font-bold text-primary">+ Add Card</button>
                        </div>
                        {formData.creditCards.map((cc, index) => (
                            <div key={cc.id} className="flex gap-2 items-start">
                                <input 
                                    className="flex-1 h-12 rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-sm text-zinc-900 dark:text-white focus:ring-1 focus:ring-primary"
                                    placeholder="Last 4 Digits"
                                    maxLength={4}
                                    value={cc.last4Digits}
                                    onChange={(e) => updateCreditCard(cc.id, 'last4Digits', e.target.value)}
                                />
                                <input 
                                    className="flex-1 h-12 rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-sm text-zinc-900 dark:text-white focus:ring-1 focus:ring-primary"
                                    placeholder="Bill Due Day (e.g. 5th)"
                                    value={cc.billDueDay}
                                    onChange={(e) => updateCreditCard(cc.id, 'billDueDay', e.target.value)}
                                />
                                <button onClick={() => removeCreditCard(cc.id)} className="h-12 w-10 flex items-center justify-center text-red-500">
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Doctor Details for Medical and Medicines */}
            {(isMedical || isMedicine) && (
                <>
                    <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">Doctor Name</p>
                    <input 
                        value={formData.doctorName}
                        onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                        className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                        placeholder="e.g., Dr. Smith" 
                    />
                    </label>
                    <label className="flex flex-col">
                    <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">Doctor Contact</p>
                    <input 
                        value={formData.doctorContact}
                        onChange={(e) => setFormData({...formData, doctorContact: e.target.value})}
                        className="h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                        placeholder="e.g., 555-0123" 
                    />
                    </label>
                </>
            )}
          </div>
        </section>

        {/* Key Dates Section */}
        {(!isMedical && !isBank && !isMedicine && !isVehicle) && (
            <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Key Dates</h2>
            <div className="flex min-h-14 items-center justify-between gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 relative">
                <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-zinc-900 dark:text-white">calendar_month</span>
                <p className="flex-1 truncate text-base font-normal leading-normal text-zinc-900 dark:text-white">Expiry Date</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                <input 
                    type="date"
                    className="bg-transparent text-right text-zinc-900 dark:text-white border-none focus:ring-0 p-0 dark:[color-scheme:dark]"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                />
                </div>
            </div>
            </section>
        )}

        {isMedical && (
            <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Key Dates</h2>
            <div className="flex min-h-14 items-center justify-between gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 relative">
                <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-zinc-900 dark:text-white">event</span>
                <p className="flex-1 truncate text-base font-normal leading-normal text-zinc-900 dark:text-white">Date</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                <input 
                    type="date"
                    className="bg-transparent text-right text-zinc-900 dark:text-white border-none focus:ring-0 p-0 dark:[color-scheme:dark]"
                    value={formData.relevantDate}
                    onChange={(e) => setFormData({...formData, relevantDate: e.target.value})}
                />
                </div>
            </div>
            </section>
        )}

        {isVehicle && (
            <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Key Dates</h2>
            <div className="flex min-h-14 items-center justify-between gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 relative">
                <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-zinc-900 dark:text-white">shield</span>
                <p className="flex-1 truncate text-base font-normal leading-normal text-zinc-900 dark:text-white">Insurance Expiry</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                <input 
                    type="date"
                    className="bg-transparent text-right text-zinc-900 dark:text-white border-none focus:ring-0 p-0 dark:[color-scheme:dark]"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                />
                </div>
            </div>
            <div className="flex min-h-14 items-center justify-between gap-4 rounded-xl bg-card-light dark:bg-card-dark p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 relative">
                <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-zinc-900 dark:text-white">car_repair</span>
                <p className="flex-1 truncate text-base font-normal leading-normal text-zinc-900 dark:text-white">Last Service Date</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                <input 
                    type="date"
                    className="bg-transparent text-right text-zinc-900 dark:text-white border-none focus:ring-0 p-0 dark:[color-scheme:dark]"
                    value={formData.relevantDate}
                    onChange={(e) => setFormData({...formData, relevantDate: e.target.value})}
                />
                </div>
            </div>
            </section>
        )}

        {/* Attachments Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Attachments</h2>
          {isBank ? (
             <div className="flex flex-col gap-4">
                <PhotoUploadManager 
                    label="Cancelled Cheque" 
                    existingImage={formData.cancelledCheque || undefined}
                    onImageSelected={(base64) => setFormData({...formData, cancelledCheque: base64})}
                />
             </div>
          ) : isVehicle ? (
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <PhotoUploadManager 
                        label="Vehicle Photo" 
                        existingImage={formData.frontPhoto || undefined}
                        onImageSelected={(base64) => setFormData({...formData, frontPhoto: base64})}
                    />
                </div>
                <PhotoUploadManager 
                    label="RC Photo" 
                    existingImage={formData.backPhoto || undefined}
                    onImageSelected={(base64) => setFormData({...formData, backPhoto: base64})}
                />
                <PhotoUploadManager 
                    label="Insurance Copy" 
                    existingImage={formData.insurancePhoto || undefined}
                    onImageSelected={(base64) => setFormData({...formData, insurancePhoto: base64})}
                />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
                <PhotoUploadManager 
                    label={isMedical ? "Prescription / Report" : isMedicine ? "Medicine Photo" : "Upload Front"} 
                    existingImage={formData.frontPhoto || undefined}
                    onImageSelected={(base64) => setFormData({...formData, frontPhoto: base64})}
                />
                <PhotoUploadManager 
                    label={isMedical ? "Additional Page" : isMedicine ? "Prescription" : "Upload Back"} 
                    existingImage={formData.backPhoto || undefined}
                    onImageSelected={(base64) => setFormData({...formData, backPhoto: base64})}
                />
            </div>
          )}
        </section>

        {/* Additional Information Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">Additional Information</h2>
          <label className="flex flex-col">
            <p className="pb-2 text-base font-medium leading-normal text-zinc-900 dark:text-white">Summary / Notes</p>
            <textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full resize-none rounded-xl border-none bg-card-light dark:bg-card-dark p-4 text-base font-normal leading-normal text-zinc-900 dark:text-white placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-0 focus:ring-2 focus:ring-primary/50" 
                placeholder="Add any relevant notes..." 
                rows={4}
            ></textarea>
          </label>
        </section>
      </main>

      {/* Floating CTA Button */}
      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-10 p-4">
        <div className="mx-auto max-w-md">
          <button onClick={handleSave} className="pointer-events-auto h-14 w-full rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95 hover:bg-primary/90">
            {editDocumentId ? 'Update Document' : 'Add Document'}
          </button>
        </div>
      </footer>

      {/* Category Selection Sheet Overlay */}
      {showCategorySheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCategorySheet(false)}>
            <div className="flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-card-light dark:bg-card-dark shadow-2xl max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-white/10">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Select Category</h3>
                    <button onClick={() => setShowCategorySheet(false)} className="p-2">
                        <span className="material-symbols-outlined text-zinc-500">close</span>
                    </button>
                </div>
                <div className="overflow-y-auto p-2">
                    {DOCUMENT_CATEGORIES.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => {
                                setFormData({...formData, category: cat.id});
                                setShowCategorySheet(false);
                            }}
                            className={`flex w-full items-center gap-4 p-4 rounded-xl transition-colors ${formData.category === cat.id ? 'bg-primary/10' : 'hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                        >
                            <div className={`flex size-10 items-center justify-center rounded-full ${formData.category === cat.id ? 'bg-primary text-white' : 'bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-white'}`}>
                                <span className="material-symbols-outlined">{cat.icon}</span>
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`text-base font-semibold ${formData.category === cat.id ? 'text-primary' : 'text-zinc-900 dark:text-white'}`}>{cat.label}</p>
                                {cat.isSharedDefault && <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Shared by default</p>}
                            </div>
                            {formData.category === cat.id && (
                                <span className="material-symbols-outlined text-primary">check</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Sub Category Sheet for Medical */}
      {showSubCategorySheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSubCategorySheet(false)}>
            <div className="flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-card-light dark:bg-card-dark shadow-2xl max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-white/10">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Select Sub-Category</h3>
                    <button onClick={() => setShowSubCategorySheet(false)} className="p-2">
                        <span className="material-symbols-outlined text-zinc-500">close</span>
                    </button>
                </div>
                <div className="overflow-y-auto p-2">
                    {MEDICAL_SUB_CATEGORIES.map(sub => (
                        <button 
                            key={sub}
                            onClick={() => {
                                setFormData({...formData, subCategory: sub});
                                setShowSubCategorySheet(false);
                            }}
                            className={`flex w-full items-center gap-4 p-4 rounded-xl transition-colors ${formData.subCategory === sub ? 'bg-primary/10' : 'hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                        >
                            <div className="flex-1 text-left">
                                <p className={`text-base font-semibold ${formData.subCategory === sub ? 'text-primary' : 'text-zinc-900 dark:text-white'}`}>{sub}</p>
                            </div>
                            {formData.subCategory === sub && (
                                <span className="material-symbols-outlined text-primary">check</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AddDocument;
