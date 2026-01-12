
import React from 'react';
import { COLORS, Logo } from '../constants';

const AboutPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-slate-50 rounded-[3.5rem] mb-16 border border-slate-100">
        <div className="flex justify-center mb-8">
           <Logo className="scale-125" />
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-[#0A2540] mb-6 tracking-tight">
          Intelligent <br />
          <span className="text-[#FDB813]">Solar Analytics.</span>
        </h2>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
          sunlitica is an intelligent solar analytics platform that designs optimized solar systems using data and AI. We turn environmental complexity into precision engineering.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* The Name Logic */}
        <div className="space-y-8 bg-white p-10 rounded-[3rem] solar-shadow border border-slate-100">
          <h3 className="text-3xl font-black text-[#0A2540] tracking-tight">The sunlitica Equation</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-5">
               <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center font-black flex-shrink-0">☀️</div>
               <div>
                  <h4 className="font-black text-[#0A2540] uppercase text-xs tracking-widest mb-1">Sun</h4>
                  <p className="text-sm text-slate-500 font-medium">Harnessing raw solar irradiance data from global climate models.</p>
               </div>
            </div>
            <div className="flex items-start gap-5">
               <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center font-black flex-shrink-0">📊</div>
               <div>
                  <h4 className="font-black text-[#0A2540] uppercase text-xs tracking-widest mb-1">Analytics</h4>
                  <p className="text-sm text-slate-500 font-medium">Deep processing of electrical load profiles and consumption habits.</p>
               </div>
            </div>
            <div className="flex items-start gap-5">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center font-black flex-shrink-0">🧠</div>
               <div>
                  <h4 className="font-black text-[#0A2540] uppercase text-xs tracking-widest mb-1">Intelligence</h4>
                  <p className="text-sm text-slate-500 font-medium">AI-driven auditing to ensure budget compliance and hardware compatibility.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Brand Tone */}
        <div className="bg-[#0A2540] p-10 rounded-[3rem] text-white flex flex-col justify-center">
          <h3 className="text-2xl font-black mb-6 tracking-tight">Precision Solar, Powered by Data.</h3>
          <p className="text-blue-100/70 leading-relaxed font-medium mb-8">
            Our platform sits at the intersection of scientific rigor and user accessibility. We don't just calculate theoretical output; we build reliable energy blueprints designed for the long term.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black uppercase text-[#FDB813] mb-1">Status</p>
              <p className="text-xs font-bold">Enterprise Ready</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black uppercase text-[#FDB813] mb-1">Model</p>
              <p className="text-xs font-bold">Engineering-Grade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <section className="space-y-12 mb-20 text-center">
        <div>
          <h3 className="text-3xl font-black text-[#0A2540] tracking-tight">Where Solar Meets Intelligence</h3>
          <p className="text-slate-400 mt-2 font-medium">Building a sustainable future through data-driven decisions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="font-black text-[#0A2540] mb-4">Thermal Guard</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">System-wide auditing for heat derating, ensuring your hardware lasts through peak summer loads.</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="font-black text-[#0A2540] mb-4">Load Balance</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Algorithmic sizing of inductive loads to prevent inverter tripping and extend battery cycle life.</p>
          </div>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="font-black text-[#0A2540] mb-4">Regional Sourcing</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Integrated market intelligence that checks local hardware availability and real-time pricing.</p>
          </div>
        </div>
      </section>

      <div className="flex justify-center pb-24">
        <button 
          onClick={onBack}
          className="bg-[#0A2540] text-white px-12 py-5 rounded-3xl font-black shadow-2xl hover:bg-[#FDB813] hover:text-[#0A2540] transition-all flex items-center gap-3 uppercase text-xs tracking-widest"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AboutPage;
