
import React from 'react';

interface TOSModalProps {
  onAccept: () => void;
  onViewFull: () => void;
}

const TOSModal: React.FC<TOSModalProps> = ({ onAccept, onViewFull }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/50">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 md:p-12 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 text-[#0A2540] rounded-[2rem] flex items-center justify-center shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-[#0A2540] tracking-tight">Analytical Compliance</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              To proceed with Sunlitica's intelligent solar modeling, you must acknowledge our professional standards and liability protocols.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-6 text-sm text-gray-600 space-y-4">
            <div className="flex gap-4">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">1</div>
              <p>You agree that all outputs are <strong>preliminary estimates</strong> and must be verified by a local solar professional.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">2</div>
              <p>You confirm that Sunlitica is not liable for structural or electrical issues arising from the use of this data.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={onAccept}
              className="w-full py-5 bg-[#0A2540] text-white font-black rounded-2xl hover:bg-[#FDB813] hover:text-[#0A2540] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-900/10 text-xs uppercase tracking-widest"
            >
              I Accept & Understand the Protocol
            </button>
            <button
              onClick={onViewFull}
              className="w-full py-4 text-[#0A2540]/60 font-black text-[10px] uppercase tracking-[0.2em] hover:text-[#0A2540] transition-colors"
            >
              Read Full Terms of Service
            </button>
          </div>
        </div>
        <div className="bg-[#0A2540] py-4 text-center">
          <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em]">v2.5 SECURED BY SUNLITICA</p>
        </div>
      </div>
    </div>
  );
};

export default TOSModal;
