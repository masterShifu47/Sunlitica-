
import React, { useState, useMemo } from 'react';
import { SimulatorInput, BatteryType, InverterType } from '../types';
import { Logo } from '../constants';

const APPLIANCE_DATABASE = [
  { name: 'LED Lights (Full House)', watts: 100, isCritical: true, icon: '💡', category: 'Essential' },
  { name: 'Ceiling Fans (x4)', watts: 300, isCritical: true, icon: '🌀', category: 'Comfort' },
  { name: 'LED TV (55")', watts: 120, isCritical: true, icon: '📺', category: 'Entertainment' },
  { name: 'Laptop Charger', watts: 65, isCritical: true, icon: '💻', category: 'Office' },
  { name: 'Refrigerator', watts: 300, isCritical: true, icon: '🧊', surge: 1200, category: 'Kitchen' },
  { name: 'Microwave', watts: 1200, isCritical: false, icon: '🍲', category: 'Kitchen' },
  { name: 'Water Pump (0.5HP)', watts: 750, isCritical: false, icon: '🚰', surge: 2500, category: 'Utility' },
  { name: 'AC (1.5HP)', watts: 1500, isCritical: false, icon: '❄️', surge: 4500, category: 'Comfort' },
  { name: 'Electric Kettle', watts: 2000, isCritical: false, icon: '☕', category: 'Kitchen' },
  { name: 'Washing Machine', watts: 500, isCritical: false, icon: '🧺', surge: 1500, category: 'Utility' },
];

const SystemSimulator: React.FC = () => {
  const [hasSimulated, setHasSimulated] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [input, setInput] = useState<SimulatorInput>({
    panelCount: 6,
    panelWatts: 550,
    inverterSizeKw: 5,
    inverterType: 'Hybrid',
    batteryCapacityKwh: 10,
    batteryType: 'Lithium',
  });

  const metrics = useMemo(() => {
    // 1. Total Solar Generation (Assuming 5 peak sun hours)
    const totalSolarGeneration = (input.panelCount * input.panelWatts * 5) / 1000;
    
    // 2. Battery Usable Energy (DOD adjusted)
    const dod = input.batteryType === 'Lithium' ? 0.85 : 0.5;
    const usableBatteryCapacity = input.batteryCapacityKwh * dod;
    
    // 3. Inverter Constraint
    const inverterLimitWatts = input.inverterSizeKw * 1000;

    // 4. Appliance Matching
    const capabilities = APPLIANCE_DATABASE.map(app => {
      const maxQty = Math.floor(inverterLimitWatts / (app.surge || app.watts));
      const canRun = maxQty > 0;
      const runtimeHours = app.watts > 0 ? usableBatteryCapacity / (app.watts / 1000) : 0;
      
      let status: 'safe' | 'warning' | 'unsafe' = 'safe';
      if (!canRun) status = 'unsafe';
      else if ((app.surge || app.watts) > inverterLimitWatts * 0.7) status = 'warning';

      return { ...app, canRun, maxQty, runtimeHours, status };
    });

    // Runtimes based on usage profiles
    const runtimes = {
      light: (usableBatteryCapacity / 0.3).toFixed(1), // ~300W load
      medium: (usableBatteryCapacity / 0.8).toFixed(1), // ~800W load
      heavy: (usableBatteryCapacity / 2.5).toFixed(1), // ~2500W load
    };

    // Safety Warnings
    const warnings = [];
    if (input.panelCount * input.panelWatts < 2000 && input.batteryCapacityKwh > 5) {
      warnings.push("Solar generation is insufficient for daytime usage + battery charging.");
    }
    if (input.inverterSizeKw < 3 && input.batteryType === 'Lithium') {
      warnings.push("Inverter may struggle with the high discharge potential of Lithium batteries.");
    }
    const highLoadApps = capabilities.filter(a => a.status === 'warning' && a.canRun);
    if (highLoadApps.length > 1) {
      warnings.push(`Running ${highLoadApps[0].name} and ${highLoadApps[1].name} together will likely overload your inverter.`);
    }

    return { totalSolarGeneration, usableBatteryCapacity, inverterLimitWatts, capabilities, runtimes, warnings };
  }, [input]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setInput(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    // Reset simulation view if inputs change to encourage clicking the button again
    setHasSimulated(false);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    // Add a slight delay for better UX feel (calculating...)
    setTimeout(() => {
      setIsSimulating(false);
      setHasSimulated(true);
      // Smooth scroll to results on mobile
      if (window.innerWidth < 1024) {
        document.getElementById('simulation-results')?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 800);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] solar-shadow border border-gray-100 space-y-8 sticky top-24">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="w-10 h-10 bg-[#0A2540] text-white rounded-xl flex items-center justify-center font-black">⚙️</div>
              <div>
                <h3 className="text-xl font-black text-[#0A2540] tracking-tight">System Specs</h3>
                <p className="text-xs text-slate-400 font-medium">Configure your planned setup</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Solar Panels</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Qty</p>
                    <input name="panelCount" type="number" value={input.panelCount} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Watts</p>
                    <input name="panelWatts" type="number" value={input.panelWatts} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Inverter Unit</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Size (kW)</p>
                    <input name="inverterSizeKw" type="number" value={input.inverterSizeKw} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Type</p>
                    <select name="inverterType" value={input.inverterType} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                      <option value="Hybrid">Hybrid</option>
                      <option value="Off-grid">Off-grid</option>
                      <option value="Pure Sine Wave">Pure Sine</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Battery Storage</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Capacity (kWh)</p>
                    <input name="batteryCapacityKwh" type="number" value={input.batteryCapacityKwh} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-300 uppercase">Technology</p>
                    <select name="batteryType" value={input.batteryType} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                      <option value="Lithium">Lithium Ion</option>
                      <option value="AGM">AGM (Lead-Acid)</option>
                      <option value="Gel">Gel (Lead-Acid)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full py-5 bg-[#0A2540] text-white font-black rounded-2xl shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3 hover:bg-[#FDB813] hover:text-[#0A2540] transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-[10px]"
              >
                {isSimulating ? (
                   <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )}
                {isSimulating ? 'Analyzing...' : 'Simulate Performance'}
              </button>
            </div>
          </div>
        </div>

        {/* DASHBOARD COLUMN */}
        <div id="simulation-results" className="lg:col-span-2 space-y-10 min-h-[600px] flex flex-col">
          {!hasSimulated && !isSimulating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3.5rem] text-center space-y-6">
               <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-5xl">
                 🔌
               </div>
               <div className="max-w-sm">
                 <h3 className="text-2xl font-black text-[#0A2540] tracking-tight">Ready to Simulate</h3>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2">
                   Adjust the hardware specifications on the left and click <b>Simulate Performance</b> to visualize your system's real-world capability.
                 </p>
               </div>
            </div>
          ) : isSimulating ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white border border-gray-100 solar-shadow rounded-[3.5rem] text-center space-y-8 animate-pulse">
               <div className="relative">
                  <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#FDB813] border-t-transparent rounded-full animate-spin"></div>
               </div>
               <div>
                  <h3 className="text-xl font-black text-[#0A2540]">Running Load Audit...</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Modeling daily cycles and surge demands</p>
               </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              {/* TOP METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0A2540] p-8 rounded-[2.5rem] text-white flex flex-col justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/60 mb-4">Total Solar Yield</p>
                  <div className="space-y-1">
                    <p className="text-4xl font-black">{metrics.totalSolarGeneration.toFixed(1)} <span className="text-lg">kWh</span></p>
                    <p className="text-[10px] text-blue-100/40 font-bold uppercase tracking-widest">per average day</p>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 solar-shadow flex flex-col justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Usable Storage</p>
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-[#0A2540]">{metrics.usableBatteryCapacity.toFixed(1)} <span className="text-lg">kWh</span></p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{input.batteryType} @ {input.batteryType === 'Lithium' ? '85%' : '50%'} DoD</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex flex-col justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Inverter Peak Load</p>
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-blue-900">{metrics.inverterLimitWatts.toFixed(0)} <span className="text-lg">W</span></p>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Max constant output</p>
                  </div>
                </div>
              </div>

              {/* CAPABILITY SECTION */}
              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 solar-shadow space-y-10">
                <div>
                  <h3 className="text-2xl font-black text-[#0A2540] tracking-tight">🔋 You Can Power:</h3>
                  <p className="text-xs text-slate-400 mt-1">Based on inverter limits and surge capacity</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metrics.capabilities.map((app, idx) => (
                    <div key={idx} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between gap-4 ${
                      app.status === 'safe' ? 'bg-emerald-50/40 border-emerald-100/50' :
                      app.status === 'warning' ? 'bg-amber-50/40 border-amber-100/50' :
                      'bg-slate-50/50 border-slate-100 grayscale opacity-40'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl">
                          {app.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#0A2540]">{app.name}</h4>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{app.watts}W {app.surge ? `(+${app.surge}W Surge)` : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {app.canRun ? (
                          <>
                            <div className="flex items-center justify-end gap-1.5 mb-1">
                              <span className="text-sm font-black text-[#0A2540]">{app.status === 'safe' ? '✅' : '⚠️'} {app.maxQty} units</span>
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">~{app.runtimeHours.toFixed(1)} hrs</p>
                          </>
                        ) : (
                          <div className="px-3 py-1.5 bg-rose-100 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            ❌ Overload
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RUNTIME SECTION */}
              <div className="bg-[#1A1A1A] p-10 rounded-[3.5rem] text-white shadow-2xl space-y-8 border border-white/5">
                <div>
                  <h3 className="text-2xl font-black text-[#FDB813] tracking-tight">⏱ Estimated Runtime (Battery Only)</h3>
                  <p className="text-xs text-white/40 mt-1">Duration of backup storage for different usage profiles</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Light</span>
                      <span className="text-white/20">💡</span>
                    </div>
                    <p className="text-4xl font-black">{metrics.runtimes.light} <span className="text-sm">hrs</span></p>
                    <p className="text-[10px] text-white/40 font-medium">Basic lights, fans, & small electronics.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Medium</span>
                      <span className="text-white/20">🧊</span>
                    </div>
                    <p className="text-4xl font-black">{metrics.runtimes.medium} <span className="text-sm">hrs</span></p>
                    <p className="text-[10px] text-white/40 font-medium">Refrigerator, TVs, and essential loads.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase">Heavy</span>
                      <span className="text-white/20">❄️</span>
                    </div>
                    <p className="text-4xl font-black">{metrics.runtimes.heavy} <span className="text-sm">hrs</span></p>
                    <p className="text-[10px] text-white/40 font-medium">High load: AC, pumps, or cooking appliances.</p>
                  </div>
                </div>
              </div>

              {/* WARNINGS SECTION */}
              {metrics.warnings.length > 0 && (
                <div className="bg-rose-50 border-2 border-rose-100 p-10 rounded-[3.5rem] space-y-6 animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-rose-900 tracking-tight">⚠️ System Warnings</h3>
                  </div>
                  <div className="space-y-3">
                    {metrics.warnings.map((warning, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <span className="text-rose-400 font-black">•</span>
                        <p className="text-sm font-bold text-rose-800 leading-relaxed">{warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EDUCATIONAL FOOTER */}
              <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 text-center space-y-4">
                <h4 className="text-lg font-black text-[#0A2540]">Need a professional engineering blueprint?</h4>
                <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  This simulator uses standard derating factors (0.8-0.9) to provide realistic household estimations. For a detailed rooftop analysis and hardware sourcing, use the <strong>Solar Analyzer</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSimulator;
