
import React from 'react';

export const COLORS = {
  solarYellow: '#FDB813',
  energyBlue: '#0A2540',
  cleanWhite: '#FFFFFF',
  neutralGray: '#E5E7EB',
  successGreen: '#16A34A',
  warningOrange: '#F97316',
  errorRed: '#DC2626',
};

export const Logo: React.FC<{ className?: string, invert?: boolean }> = ({ className = "h-8", invert = false }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className={`relative w-9 h-9 flex items-center justify-center rounded-full overflow-hidden group ${invert ? 'bg-white' : 'bg-[#0A2540]'}`}>
      {/* Sun Circle */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0A2540] to-[#FDB813] opacity-90"></div>
      {/* Neural/Data Node SVG */}
      <svg className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 duration-500 ${invert ? 'text-[#0A2540]' : 'text-white'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="3" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="21" />
        <line x1="3" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="21" y2="12" />
        <path d="M18.4 5.6l-2.1 2.1" />
        <path d="M7.7 16.3l-2.1 2.1" />
        <path d="M18.4 18.4l-2.1-2.1" />
        <path d="M7.7 7.7l-2.1-2.1" />
      </svg>
    </div>
    <span className={`text-2xl font-extrabold tracking-tight lowercase flex items-center ${invert ? 'text-white' : ''}`} style={{ color: invert ? undefined : COLORS.energyBlue, fontFamily: 'sans-serif' }}>
      sun<span style={{ color: COLORS.solarYellow }}>litica</span>
    </span>
  </div>
);
