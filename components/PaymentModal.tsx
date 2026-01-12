
import React, { useState } from 'react';

interface PaymentModalProps {
  onSuccess: () => void;
  onClose: () => void;
  amount: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onSuccess, onClose, amount }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setIsProcessing(true);
    
    // Simulate payment gateway delay
    setTimeout(() => {
      setStep('success');
      setIsProcessing(false);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {step === 'details' && (
          <form onSubmit={handlePay} className="p-8 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold text-[#0A2540]">Secure Checkout</h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-2xl flex justify-between items-center border border-blue-100">
              <span className="text-sm font-medium text-blue-700">Engineering Specification PDF</span>
              <span className="text-xl font-bold text-blue-900">{amount}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Card Number</label>
                <div className="relative">
                  <input required placeholder="0000 0000 0000 0000" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#0A2540] outline-none" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Expiry</label>
                  <input required placeholder="MM/YY" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#0A2540] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">CVC</label>
                  <input required placeholder="123" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#0A2540] outline-none" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#0A2540] text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Unlock Full Report
            </button>
            <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">Encrypted by Sunlytics Gateway</p>
          </form>
        )}

        {step === 'processing' && (
          <div className="p-12 text-center space-y-6 flex flex-col items-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#0A2540] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0A2540]">Verifying Payment</h3>
              <p className="text-gray-500 text-sm">Please do not refresh the page...</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center space-y-6 flex flex-col items-center animate-in zoom-in-50">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0A2540]">Success!</h3>
              <p className="text-gray-500 text-sm">Report Unlocked. Opening Print View...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
