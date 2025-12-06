
import React, { useState } from 'react';
import { Document } from '../../types';
import { DOCUMENT_CATEGORIES } from '../../config';
import { base64ToFile } from '../../utils';
import { useToast } from '../Toast';
import ImageViewer from '../ImageViewer';
import { useAppStore } from '../../store';

interface Props {
  document: Document;
  onBack: () => void;
  onEdit: () => void;
}

const Linkify: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    
    // Regex for URLs and Phone numbers
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const phoneRegex = /(\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;

    const parts = text.split(new RegExp(`(${urlRegex.source}|${phoneRegex.source})`, 'g'));

    return (
        <span>
            {parts.map((part, i) => {
                if (!part) return null;
                
                if (part.match(urlRegex)) {
                    return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline">{part}</a>;
                } else if (part.match(phoneRegex)) {
                    // Simple check to avoid creating links for numbers that are clearly not phone numbers if needed
                    if (part.replace(/\D/g, '').length < 7) return part;
                    return <a key={i} href={`tel:${part.replace(/\D/g, '')}`} className="text-primary underline">{part}</a>;
                }
                return part;
            })}
        </span>
    );
};

const DocumentDetail: React.FC<Props> = ({ document, onBack, onEdit }) => {
  const { dispatch } = useAppStore();
  const icon = DOCUMENT_CATEGORIES.find(c => c.id === document.category)?.icon || 'description';
  const { showToast } = useToast();
  const [viewerImage, setViewerImage] = useState<{src: string, alt: string} | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  };

  const handleShareImage = async () => {
    const imageToShare = document.frontPhoto || document.cancelledCheque;
    if (imageToShare) {
        try {
            const file = base64ToFile(imageToShare, `${document.title.replace(/\s+/g, '_')}_image.jpg`);
            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: document.title,
                    text: `Shared document: ${document.title}`
                });
            } else {
                showToast("Sharing not supported on this device.");
            }
        } catch (error) {
            console.error("Error sharing:", error);
            showToast("Could not share image.");
        }
    } else {
        showToast("No image available to share.");
    }
  };

  const handleShareBankDetails = async () => {
    if (navigator.share) {
        const text = `
Bank Details for ${document.title}
Account No: ${document.accountNumber}
IFSC: ${document.ifscCode}
Branch: ${document.branchAddress}
`.trim();
        await navigator.share({
            title: document.title,
            text: text
        });
    } else {
        handleCopy(`${document.accountNumber} \n ${document.ifscCode}`);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
        dispatch({ type: 'DELETE_DOCUMENT', payload: document.id });
        onBack();
    } else {
        setConfirmDelete(true);
        setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const isBank = document.category === 'Bank Accounts';
  const isMedicine = document.category === 'Active Medicines';
  const isVehicle = document.category === 'Vehicles';

  return (
    <>
      {viewerImage && (
        <ImageViewer 
          src={viewerImage.src} 
          alt={viewerImage.alt} 
          onClose={() => setViewerImage(null)} 
        />
      )}
      
      <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-24">
        {/* Top App Bar */}
        <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pt-6 pb-2 justify-between backdrop-blur-sm">
          <div className="text-white flex size-10 shrink-0 items-center justify-center cursor-pointer" onClick={onBack}>
            <span className="material-symbols-outlined text-gray-800 dark:text-white">arrow_back_ios_new</span>
          </div>
          <h2 className="text-gray-800 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center truncate px-2">{document.title}</h2>
          <div className="flex size-10 shrink-0 items-center justify-center cursor-pointer text-red-500" onClick={handleDelete}>
             <span className="material-symbols-outlined">{confirmDelete ? 'warning' : 'delete'}</span>
          </div>
        </div>

        <div className="flex-grow px-4 pt-4 pb-32">
          {/* Headline Text */}
          <div className="space-y-4 rounded-xl bg-gray-100 dark:bg-black/20 p-5 shadow-sm">
            <div className="flex items-center gap-3">
               <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0">
                  <span className="material-symbols-outlined text-2xl">{icon}</span>
               </div>
               <h1 className="text-gray-800 dark:text-white text-2xl font-bold leading-tight tracking-tight text-left">{document.title}</h1>
            </div>
            
            {(document.category === 'Medical Records' || isMedicine) && document.subCategory && (
                 <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {document.subCategory}
                 </div>
            )}

            {isMedicine && (
                <>
                    <div className="flex items-center gap-4 bg-background-light/50 dark:bg-background-dark/50 p-3 rounded-lg justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-gray-800 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700/50 shrink-0 size-10">
                                <span className="material-symbols-outlined text-lg">repeat</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Frequency</p>
                                <p className="text-base font-medium leading-normal text-gray-800 dark:text-white">
                                    {document.medicineFrequency}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 p-1">
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark px-1">Times</p>
                        <div className="flex flex-wrap gap-2">
                            {document.medicineTimes?.map(time => (
                                <span key={time} className="px-3 py-1 rounded-full bg-card-light dark:bg-card-dark text-gray-800 dark:text-white text-sm font-medium border border-gray-200 dark:border-white/10">
                                    {time}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-background-light/50 dark:bg-background-dark/50 p-3 rounded-lg justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-gray-800 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700/50 shrink-0 size-10">
                                <span className="material-symbols-outlined text-lg">restaurant</span>
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Instruction</p>
                                <p className="text-base font-medium leading-normal text-gray-800 dark:text-white">
                                    {document.mealInstruction}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {document.number && !isBank && !isMedicine && (
              <div className="flex items-center gap-4 bg-background-light/50 dark:bg-background-dark/50 p-3 rounded-lg justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                  <div className="text-gray-800 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700/50 shrink-0 size-10">
                      <span className="material-symbols-outlined text-lg">badge</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{isVehicle ? 'Vehicle Number' : 'Number'}</p>
                      <p className="text-gray-800 dark:text-white text-base font-mono font-medium leading-normal truncate">{document.number}</p>
                  </div>
                  </div>
                  <div className="shrink-0">
                  <div className="text-primary flex size-7 items-center justify-center cursor-pointer" onClick={() => handleCopy(document.number || '')}>
                      <span className="material-symbols-outlined">content_copy</span>
                  </div>
                  </div>
              </div>
            )}

            {isVehicle && document.rcNumber && (
                <div className="flex items-center gap-4 bg-background-light/50 dark:bg-background-dark/50 p-3 rounded-lg justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                  <div className="text-gray-800 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700/50 shrink-0 size-10">
                      <span className="material-symbols-outlined text-lg">description</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">RC Number</p>
                      <p className="text-gray-800 dark:text-white text-base font-mono font-medium leading-normal truncate">{document.rcNumber}</p>
                  </div>
                  </div>
                  <div className="shrink-0">
                  <div className="text-primary flex size-7 items-center justify-center cursor-pointer" onClick={() => handleCopy(document.rcNumber || '')}>
                      <span className="material-symbols-outlined">content_copy</span>
                  </div>
                  </div>
              </div>
            )}

            {isBank && document.accountNumber && (
                <div className="flex items-center gap-4 bg-background-light/50 dark:bg-background-dark/50 p-3 rounded-lg justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                  <div className="text-gray-800 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700/50 shrink-0 size-10">
                      <span className="material-symbols-outlined text-lg">tag</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Account Number</p>
                      <p className="text-gray-800 dark:text-white text-base font-mono font-medium leading-normal truncate">{document.accountNumber}</p>
                  </div>
                  </div>
                  <div className="shrink-0">
                  <div className="text-primary flex size-7 items-center justify-center cursor-pointer" onClick={() => handleCopy(document.accountNumber || '')}>
                      <span className="material-symbols-outlined">content_copy</span>
                  </div>
                  </div>
              </div>
            )}

            {isBank && document.ifscCode && (
                <div className="flex items-center gap-4 bg-background-light/50 dark:bg-background-dark/50 p-3 rounded-lg justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                  <div className="text-gray-800 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700/50 shrink-0 size-10">
                      <span className="material-symbols-outlined text-lg">code</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">IFSC</p>
                      <p className="text-gray-800 dark:text-white text-base font-mono font-medium leading-normal truncate">{document.ifscCode}</p>
                  </div>
                  </div>
                  <div className="shrink-0">
                  <div className="text-primary flex size-7 items-center justify-center cursor-pointer" onClick={() => handleCopy(document.ifscCode || '')}>
                      <span className="material-symbols-outlined">content_copy</span>
                  </div>
                  </div>
              </div>
            )}

            {isBank && (document.branchAddress || document.branchContact) && (
                <div className="flex items-start gap-4 bg-background-light/50 dark:bg-background-dark/50 p-3 rounded-lg">
                  <div className="text-gray-800 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700/50 shrink-0 size-10">
                      <span className="material-symbols-outlined text-lg">location_on</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Branch Details</p>
                      <p className="text-gray-800 dark:text-white text-sm font-medium leading-normal">{document.branchAddress}</p>
                      {document.branchContact && (
                          <div className="flex items-center gap-2 mt-1">
                              <span className="material-symbols-outlined text-xs text-text-secondary-light dark:text-text-secondary-dark">call</span>
                              <Linkify text={document.branchContact} />
                          </div>
                      )}
                  </div>
              </div>
            )}

            {document.expiryDate && (
              <div className="flex items-center gap-4 bg-background-light/50 dark:bg-background-dark/50 p-3 rounded-lg justify-between">
                  <div className="flex items-center gap-4">
                  <div className="text-gray-800 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700/50 shrink-0 size-10">
                      <span className="material-symbols-outlined text-lg">{isVehicle ? 'shield' : 'calendar_today'}</span>
                  </div>
                  <div className="flex flex-col">
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{isVehicle ? 'Insurance Expiry' : 'Expiry Date'}</p>
                      <p className={`text-base font-medium leading-normal ${document.status === 'Expiring Soon' ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                          {document.expiryDate}
                      </p>
                  </div>
                  </div>
              </div>
            )}

            {document.relevantDate && (
              <div className="flex items-center gap-4 bg-background-light/50 dark:bg-background-dark/50 p-3 rounded-lg justify-between">
                  <div className="flex items-center gap-4">
                  <div className="text-gray-800 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700/50 shrink-0 size-10">
                      <span className="material-symbols-outlined text-lg">{isVehicle ? 'car_repair' : 'event'}</span>
                  </div>
                  <div className="flex flex-col">
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{isVehicle ? 'Last Service' : 'Date'}</p>
                      <p className="text-base font-medium leading-normal text-gray-800 dark:text-white">
                          {document.relevantDate}
                      </p>
                  </div>
                  </div>
              </div>
            )}

            {(document.doctorName || document.doctorContact) && (
              <div className="flex items-center gap-4 bg-background-light/50 dark:bg-background-dark/50 p-3 rounded-lg justify-between">
                  <div className="flex items-center gap-4">
                  <div className="text-gray-800 dark:text-white flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700/50 shrink-0 size-10">
                      <span className="material-symbols-outlined text-lg">stethoscope</span>
                  </div>
                  <div className="flex flex-col">
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Doctor</p>
                      <p className="text-base font-medium leading-normal text-gray-800 dark:text-white">
                          {document.doctorName}
                      </p>
                      {document.doctorContact && <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark"><Linkify text={document.doctorContact} /></p>}
                  </div>
                  </div>
                  {document.doctorContact && (
                    <div className="shrink-0">
                        <a href={`tel:${document.doctorContact}`} className="text-primary flex size-7 items-center justify-center cursor-pointer">
                            <span className="material-symbols-outlined">call</span>
                        </a>
                    </div>
                  )}
              </div>
            )}
          </div>

          {isBank && document.creditCards && document.creditCards.length > 0 && (
              <>
                <h3 className="text-gray-800 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-1 pb-2 pt-6">Credit Cards</h3>
                <div className="grid gap-3">
                    {document.creditCards.map(cc => (
                        <div key={cc.id} className="bg-gray-100 dark:bg-black/20 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">credit_card</span>
                                <div>
                                    <p className="font-mono text-gray-800 dark:text-white">xxxx xxxx xxxx {cc.last4Digits}</p>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Due on: {cc.billDueDay}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </>
          )}

          {/* Section Header: Document Photos */}
          {(document.frontPhoto || document.backPhoto || document.cancelledCheque || document.insurancePhoto) && (
              <>
                  <h3 className="text-gray-800 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-1 pb-2 pt-6">Attachments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {document.frontPhoto && (
                      <div 
                        className="flex flex-col items-center justify-center bg-gray-100 dark:bg-black/20 rounded-xl p-4 text-center cursor-zoom-in"
                        onClick={() => setViewerImage({ src: document.frontPhoto!, alt: isVehicle ? 'Vehicle Photo' : 'Front Photo' })}
                      >
                          <img src={document.frontPhoto} alt="Front" className="rounded-lg object-contain w-full max-h-64" />
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 font-medium">{document.category === 'Medical Records' ? 'Prescription / Report' : isMedicine ? 'Medicine Photo' : isVehicle ? 'Vehicle Photo' : 'Front Photo'}</p>
                      </div>
                  )}
                  {document.backPhoto && (
                      <div 
                        className="flex flex-col items-center justify-center bg-gray-100 dark:bg-black/20 rounded-xl p-4 text-center cursor-zoom-in"
                        onClick={() => setViewerImage({ src: document.backPhoto!, alt: isVehicle ? 'RC Photo' : 'Back Photo' })}
                      >
                          <img src={document.backPhoto} alt="Back" className="rounded-lg object-contain w-full max-h-64" />
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 font-medium">{document.category === 'Medical Records' ? 'Additional Page' : isMedicine ? 'Prescription' : isVehicle ? 'RC Photo' : 'Back Photo'}</p>
                      </div>
                  )}
                  {document.insurancePhoto && (
                      <div 
                        className="flex flex-col items-center justify-center bg-gray-100 dark:bg-black/20 rounded-xl p-4 text-center cursor-zoom-in"
                        onClick={() => setViewerImage({ src: document.insurancePhoto!, alt: 'Insurance Copy' })}
                      >
                          <img src={document.insurancePhoto} alt="Insurance" className="rounded-lg object-contain w-full max-h-64" />
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 font-medium">Insurance Copy</p>
                      </div>
                  )}
                  {document.cancelledCheque && (
                      <div 
                        className="flex flex-col items-center justify-center bg-gray-100 dark:bg-black/20 rounded-xl p-4 text-center cursor-zoom-in"
                        onClick={() => setViewerImage({ src: document.cancelledCheque!, alt: 'Cancelled Cheque' })}
                      >
                          <img src={document.cancelledCheque} alt="Cheque" className="rounded-lg object-contain w-full max-h-64" />
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 font-medium">Cancelled Cheque</p>
                      </div>
                  )}
                  </div>
              </>
          )}

          {/* Section Header: Summary / Notes */}
          {document.notes && (
              <>
                  <h3 className="text-gray-800 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-1 pb-2 pt-6">Summary / Notes</h3>
                  <div className="bg-gray-100 dark:bg-black/20 rounded-xl p-4">
                  <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                      <Linkify text={document.notes} />
                  </p>
                  </div>
              </>
          )}
          
          <div className="pt-8 pb-4">
             <button 
                onClick={handleDelete}
                className={`w-full h-14 rounded-xl font-bold text-sm transition-colors ${confirmDelete ? 'bg-red-500 text-white' : 'bg-transparent text-red-500 border border-red-500/20'}`}
             >
                {confirmDelete ? 'Confirm Delete' : 'Delete Document'}
             </button>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-white/10">
          <div className="flex flex-col sm:flex-row gap-3">
            {isBank ? (
                <button onClick={handleShareBankDetails} className="flex-1 flex items-center justify-center gap-2 h-16 px-6 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:bg-primary/90 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-2xl">share</span>
                    <span>Share Details</span>
                </button>
            ) : (
                <button onClick={handleShareImage} className="flex-1 flex items-center justify-center gap-2 h-16 px-6 bg-primary text-white rounded-xl font-bold text-lg shadow-lg hover:bg-primary/90 active:scale-95 transition-transform">
                    <span className="material-symbols-outlined text-2xl">share</span>
                    <span>Share Image</span>
                </button>
            )}
            
            <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 h-16 px-6 bg-primary/20 text-primary rounded-xl font-bold text-lg hover:bg-primary/30 active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-2xl">edit</span>
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentDetail;
