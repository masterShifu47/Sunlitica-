
import React from 'react';

export type FormType = 'client' | 'partner';

interface FormModalProps {
  type: FormType;
  isOpen: boolean;
  onClose: () => void;
}

const FORMS = {
  client: {
    url: "https://docs.google.com/forms/d/1MpNU-sd3Jn_OQfDCNgR2iTEZvSmrJFS7kWaRL2FckPU/viewform?embedded=true",
    title: "Get Matched with Installers",
    description: "We'll match you with verified solar installers in your area.",
    trustSignal: "Verified local partners • No obligation quotes",
    disclaimer: "Affiliate disclosure: Sunlytica may earn a commission when users connect with or purchase from partner installers."
  },
  partner: {
    url: "https://docs.google.com/forms/d/e/1FAIpQLScqN5KKo6XZY9Dc19p90AnrM8hO0yddPE3zSMGWUTcHSVuYUg/viewform?embedded=true",
    title: "Become a Partner Installer",
    description: "Access qualified solar-ready clients and join our verified network.",
    trustSignal: "Grow your business • Vetted solar-ready leads",
    disclaimer: "By applying, you agree to our partner vetting and verification process."
  }
};

const FormModal: React.FC<FormModalProps> = ({ type, isOpen, onClose }) => {
  if (!isOpen) return null;

  const config = FORMS[type];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-black/40 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className="p-6 md:p-10 border-b border-gray-100 bg-slate-50/50 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0A2540] text-white flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#0A2540] tracking-tight">{config.title}</h3>
            </div>
            <p className="text-sm text-slate-500 font-medium">{config.description}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-red-500 active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto bg-white p-2">
          <iframe 
            src={config.url}
            width="100%" 
            height="800" 
            frameBorder="0" 
            marginHeight={0} 
            marginWidth={0}
            className="w-full"
            title={config.title}
          >
            Loading...
          </iframe>
        </div>

        {/* Footer Info */}
        <div className="p-6 md:p-8 border-t border-gray-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0A2540] opacity-60">
                {config.trustSignal}
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-1">
              <p className="text-[9px] text-slate-400 font-bold max-w-[300px] text-center md:text-right">
                {config.disclaimer}
              </p>
              <button 
                onClick={onClose}
                className="mt-2 text-xs font-black text-[#0A2540] hover:text-blue-600 transition-colors uppercase tracking-widest"
              >
                Finished? Close Window
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
