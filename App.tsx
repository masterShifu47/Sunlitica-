
import React, { useState, useEffect } from 'react';
import { Logo, COLORS } from './constants';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import AboutPage from './components/AboutPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import TOSModal from './components/TOSModal';
import FormModal, { FormType } from './components/FormModal';
import AdUnit from './components/AdUnit';
import LoadingOverlay from './components/LoadingOverlay';
import SystemSimulator from './components/SystemSimulator';
import { SolarSystemInput, SolarSystemResult } from './types';
import { generateSolarDesign } from './services/geminiService';
// @ts-ignore
import html2pdf from 'html2pdf.js';

type View = 'analyzer' | 'about' | 'privacy' | 'tos' | 'simulator';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('analyzer');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<SolarSystemResult | null>(null);
  const [lastInput, setLastInput] = useState<SolarSystemInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<FormType | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => {
    return localStorage.getItem('sunlitica_tos_accepted') === 'true';
  });

  const handleAcceptTerms = () => {
    localStorage.setItem('sunlitica_tos_accepted', 'true');
    setHasAcceptedTerms(true);
  };

  const handleDesignRequest = async (data: SolarSystemInput) => {
    setIsLoading(true);
    setError(null);
    setLastInput(data);
    try {
      const design = await generateSolarDesign(data);
      setResult(design);
      setTimeout(() => {
        const el = document.getElementById('results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      console.error('Design generation error:', err);
      let message = "Analysis encountered a constraint. ";
      if (err.message?.includes("API_KEY")) {
        message = "System configuration required. Please contact support.";
      } else {
        message += "Refine inputs to help our analytics engine calibrate.";
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportRequest = async () => {
    const element = document.getElementById('results-section');
    if (!element) return;

    setIsExporting(true);
    document.body.classList.add('is-generating-pdf');

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Sunlitica_Solar_Report_${lastInput?.city || 'Project'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      const pdfGen = typeof html2pdf === 'function' ? html2pdf : (html2pdf as any).default;
      if (typeof pdfGen !== 'function') {
        throw new Error('PDF generator not properly loaded');
      }
      await pdfGen().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation failed, falling back to print:', err);
      window.print();
    } finally {
      document.body.classList.remove('is-generating-pdf');
      setIsExporting(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setLastInput(null);
    setError(null);
    setCurrentView('analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'about': return <AboutPage onBack={() => setCurrentView('analyzer')} />;
      case 'privacy': return <PrivacyPolicyPage onBack={() => setCurrentView('analyzer')} />;
      case 'tos': return <TermsOfServicePage onBack={() => setCurrentView('analyzer')} />;
      case 'simulator': return (
        <div className="space-y-20 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="text-center space-y-4 max-w-4xl mx-auto no-print">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Real-time Simulation Engine
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]" style={{ color: COLORS.energyBlue }}>
              System <span className="bg-gradient-to-r from-[#FDB813] to-[#F97316] bg-clip-text text-transparent">Simulator.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Manually configure panels, inverters, and batteries to instantly see what appliances your system can handle.
            </p>
          </header>
          <SystemSimulator />
          <div className="flex justify-center pb-20">
            <button onClick={() => setCurrentView('analyzer')} className="flex items-center gap-3 px-12 py-5 bg-[#0A2540] text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-[#FDB813] hover:text-[#0A2540] transition-all">
               <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
               Back to Sizing Analyzer
            </button>
          </div>
        </div>
      );
      case 'analyzer':
      default:
        return (
          <div className="space-y-20">
            <header className="text-center space-y-8 max-w-4xl mx-auto pt-12 no-print">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-[#0A2540] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
                Intelligent Solar Analytics
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]" style={{ color: COLORS.energyBlue }}>
                Solar Intelligence <br />
                <span className="bg-gradient-to-r from-[#FDB813] to-[#F97316] bg-clip-text text-transparent italic">Simplified.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                Professional-grade energy modeling and precise technical specifications powered by the Sunlitica analytics engine.
              </p>
            </header>

            {/* NEW FEATURE CTA */}
            <section className="max-w-5xl mx-auto no-print">
               <div className="bg-gradient-to-r from-[#0A2540] to-[#1a3a5a] p-1 rounded-[3rem] shadow-2xl overflow-hidden group">
                  <div className="bg-[#0A2540] rounded-[2.8rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-400">
                           Experimental Feature
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">System Capability Simulator</h2>
                        <p className="text-blue-100/60 font-medium leading-relaxed max-w-md">
                           Already have a system in mind? Input your custom hardware specs to see exactly which appliances you can power.
                        </p>
                     </div>
                     <button 
                       onClick={() => setCurrentView('simulator')}
                       className="px-10 py-6 bg-[#FDB813] text-[#0A2540] font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/10 uppercase tracking-widest text-xs"
                     >
                        Launch Simulator
                     </button>
                  </div>
               </div>
            </section>

            <section className="max-w-5xl mx-auto no-print">
              <div className="text-center mb-10">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-300">Start Sizing Analysis</h3>
              </div>
              {error && (
                <div className="mb-10 p-6 bg-red-50 border-2 border-red-100 text-[#DC2626] rounded-3xl flex items-start gap-4 animate-in fade-in zoom-in-95">
                  <div className="p-3 bg-white rounded-2xl shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                  <div className="flex-1">
                    <p className="font-black uppercase text-xs tracking-widest mb-1">Analytical Notice</p>
                    <p className="text-sm font-medium opacity-90">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="hover:bg-red-100 p-2 rounded-xl transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              )}
              <InputForm onSubmit={handleDesignRequest} isLoading={isLoading} />
            </section>

            {result && lastInput && (
              <section id="results-section" className="pt-24 border-t border-gray-100 scroll-mt-24">
                <ResultDisplay 
                  result={result} 
                  inputData={lastInput} 
                  onOpenForm={(type) => setActiveForm(type)}
                />
                <div id="payment-section" className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 p-10 md:p-16 bg-[#0A2540] rounded-[3.5rem] text-white overflow-hidden relative no-print shadow-2xl">
                  <div className="absolute top-0 right-0 p-12 opacity-5"><Logo invert /></div>
                  <div className="relative z-10 text-center md:text-left flex-1 max-w-lg">
                    <h3 className="text-3xl font-black tracking-tight mb-4">Engineering Export</h3>
                    <p className="text-blue-200/80 text-sm font-medium leading-relaxed">
                      Your high-fidelity analytics report is ready. Generate a professional PDF document for your records or contractor review.
                    </p>
                  </div>
                  <div className="relative z-10 w-full md:w-auto">
                    <button 
                      onClick={handleExportRequest}
                      disabled={isExporting}
                      className="w-full flex items-center justify-center gap-4 px-12 py-6 bg-white text-[#0A2540] font-black rounded-[2rem] hover:bg-[#FDB813] transition-all hover:scale-105 active:scale-95 shadow-2xl uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      {isExporting ? (
                        <svg className="animate-spin h-5 w-5 text-[#0A2540]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      )}
                      {isExporting ? "Generating PDF..." : "Download Sizing PDF"}
                    </button>
                  </div>
                </div>
              </section>
            )}

            <div className="max-w-4xl mx-auto pt-10">
              <AdUnit type="banner" label="Platform Infrastructure Partner" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD] selection:bg-[#FDB813]/20">
      {isLoading && <LoadingOverlay />}
      {!hasAcceptedTerms && (
        <TOSModal 
          onAccept={handleAcceptTerms} 
          onViewFull={() => { setCurrentView('tos'); setHasAcceptedTerms(true); }} 
        />
      )}
      <FormModal 
        isOpen={!!activeForm} 
        type={activeForm || 'client'} 
        onClose={() => setActiveForm(null)} 
      />
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 py-5 px-6 md:px-16 flex justify-between items-center no-print">
        <div className="cursor-pointer" onClick={resetForm}><Logo /></div>
        <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-[#0A2540]/60">
          <button onClick={() => setCurrentView('analyzer')} className={`hover:text-[#FDB813] transition-colors ${currentView === 'analyzer' ? 'text-[#FDB813]' : ''}`}>Solar Analyzer</button>
          <button onClick={() => setCurrentView('simulator')} className={`hover:text-[#FDB813] transition-colors ${currentView === 'simulator' ? 'text-[#FDB813]' : ''}`}>System Simulator</button>
          <button onClick={() => setCurrentView('about')} className={`hover:text-[#FDB813] transition-colors ${currentView === 'about' ? 'text-[#FDB813]' : ''}`}>How it works</button>
          <button onClick={() => setActiveForm('partner')} className="hover:text-[#FDB813] transition-colors">Become Partner</button>
        </div>
        <button onClick={resetForm} className="bg-[#0A2540] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5 transition-all">Start New</button>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-16">
        {renderContent()}
      </main>
      <footer className="bg-[#0A2540] text-white pt-32 pb-16 px-6 md:px-16 no-print">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-20 mb-24">
            <div className="max-w-sm space-y-10">
              <div className="cursor-pointer" onClick={resetForm}>
                <div className="flex items-center gap-3">
                   <Logo invert />
                </div>
              </div>
              <p className="text-blue-100/40 text-lg font-medium leading-relaxed">Precision Solar, Powered by Data. We provide the technical blueprints for an intelligent energy future.</p>
              <button 
                onClick={() => setActiveForm('partner')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Become a Partner Installer
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-16">
              <div className="space-y-8"><h4 className="font-black text-[10px] uppercase tracking-widest text-white/30">Application</h4><ul className="space-y-5 text-blue-100/60 font-bold text-xs"><li><button onClick={() => setCurrentView('analyzer')} className="hover:text-white transition-colors">Analyzer</button></li><li><button onClick={() => setCurrentView('simulator')} className="hover:text-white transition-colors">Simulator</button></li><li><button onClick={() => setCurrentView('about')} className="hover:text-white transition-colors">Logic & Math</button></li><li><button onClick={() => setActiveForm('client')} className="hover:text-white transition-colors">Get Quotes</button></li></ul></div>
              <div className="space-y-8"><h4 className="font-black text-[10px] uppercase tracking-widest text-white/30">Policy</h4><ul className="space-y-5 text-blue-100/60 font-bold text-xs"><li><button onClick={() => setCurrentView('privacy')} className="hover:text-white transition-colors text-left">Privacy Policy</button></li><li><button onClick={() => setCurrentView('tos')} className="hover:text-white transition-colors text-left">Terms of Service</button></li></ul></div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest text-white/20">
            <p>© 2025 Sunlitica Intelligence</p>
            <p className="italic text-center text-[8px] opacity-40">Affiliate disclosure: We may earn a commission from partner connections.</p>
            <p className="italic text-center">Always consult a certified electrical engineer before final installation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
