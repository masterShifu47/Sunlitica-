
import React from 'react';

interface AdUnitProps {
  type: 'banner' | 'rectangle' | 'inline';
  className?: string;
  label?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ type, className = "", label = "Partner Content" }) => {
  const getStyles = () => {
    switch (type) {
      case 'banner':
        return "w-full min-h-[90px] md:min-h-[120px]";
      case 'rectangle':
        return "w-full min-h-[250px] md:min-h-[300px]";
      case 'inline':
        return "w-full min-h-[100px]";
      default:
        return "w-full min-h-[90px]";
    }
  };

  return (
    <div className={`no-print group relative ${className}`}>
      <div className="flex items-center justify-between mb-2 px-4">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
        <span className="text-[9px] font-medium text-slate-300 group-hover:text-slate-400 transition-colors cursor-help">Remove Ads?</span>
      </div>
      
      <div className={`bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center p-6 overflow-hidden transition-all hover:border-slate-300 hover:bg-slate-100/50 ${getStyles()}`}>
        {/* Ad Platform Hook Point (e.g. Google AdSense <ins> tag would go here) */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center text-slate-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.172-1.172a4 4 0 115.656 5.656l-1.172 1.172" />
            </svg>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Placement Slot</p>
          <p className="text-[9px] text-slate-300 font-medium max-w-[200px] mx-auto italic">Supporting Sunlitica engineering infrastructure</p>
        </div>
      </div>
    </div>
  );
};

export default AdUnit;
