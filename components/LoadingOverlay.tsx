
import React, { useState, useEffect } from 'react';
import { Logo } from '../constants';

const SOLAR_FACTS = [
  {
    title: "Global Energy Potential",
    fact: "Enough solar energy hits the Earth every single hour to power the entire world's energy needs for a full year.",
    category: "Science"
  },
  {
    title: "The Cheapest Power",
    fact: "According to the IEA, solar power is now officially the cheapest source of electricity in history.",
    category: "Economics"
  },
  {
    title: "System Longevity",
    fact: "Most modern solar panels are rated to last 25-30 years, often continuing to produce at 80% efficiency even after three decades.",
    category: "Gains"
  },
  {
    title: "Zero Emission Yield",
    fact: "An average residential solar system offsets about 100,000 lbs of CO2 over 20 years—equivalent to planting 2,500 trees.",
    category: "Climate"
  },
  {
    title: "Fossil Fuel Comparison",
    fact: "Coal plants consume 25 times more water than solar installations to produce the same amount of electricity.",
    category: "Comparison"
  },
  {
    title: "Maintenance Advantage",
    fact: "Unlike generators or turbines, solar panels have no moving parts, which is why their maintenance costs are the lowest in the energy sector.",
    category: "Comparison"
  }
];

const ENGINEERING_STEPS = [
  "Initializing Sunlitica Analytics Engine...",
  "Querying regional solar irradiance models...",
  "Analyzing local hardware market (2025 data)...",
  "Calculating thermal derating for location...",
  "Auditing inductive load balance...",
  "Cross-referencing budget with hardware availability...",
  "Synthesizing technical wiring blueprint...",
  "Finalizing efficiency report..."
];

const LoadingOverlay: React.FC = () => {
  const [factIndex, setFactIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % SOLAR_FACTS.length);
    }, 6000);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % ENGINEERING_STEPS.length);
    }, 3500);

    return () => {
      clearInterval(factInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
      {/* Background Neural Animation (CSS only) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="neural-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="#0A2540" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#neural-grid)" />
        </svg>
      </div>

      <div className="max-w-2xl w-full space-y-12 relative z-10">
        {/* Top Logo & Spinner */}
        <div className="flex flex-col items-center space-y-6">
          <Logo className="scale-110" />
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#FDB813] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Fact Card */}
        <div className="bg-[#0A2540] text-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" /></svg>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-[#FDB813]">
              Did You Know? / {SOLAR_FACTS[factIndex].category}
            </div>
            
            <div key={factIndex} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl md:text-2xl font-black tracking-tight">{SOLAR_FACTS[factIndex].title}</h3>
              <p className="text-blue-100/70 text-sm md:text-lg leading-relaxed font-medium">
                "{SOLAR_FACTS[factIndex].fact}"
              </p>
            </div>

            <div className="flex gap-1.5 pt-4">
              {SOLAR_FACTS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === factIndex ? 'w-8 bg-[#FDB813]' : 'w-2 bg-white/20'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Engineering Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics Thread Status</span>
            <span className="text-[10px] font-black text-blue-500 animate-pulse uppercase tracking-widest">Active Processing</span>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] font-mono">
            <div className="space-y-2">
              {ENGINEERING_STEPS.slice(0, stepIndex + 1).map((step, i) => (
                <div 
                  key={i} 
                  className={`text-[11px] flex items-center gap-3 ${i === stepIndex ? 'text-[#0A2540] font-bold' : 'text-slate-300'}`}
                >
                  <span className={i === stepIndex ? 'text-[#FDB813]' : 'text-slate-200'}>
                    {i === stepIndex ? '●' : '✓'}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
          Building your intelligent energy future
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
