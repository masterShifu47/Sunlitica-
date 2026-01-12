
import React from 'react';
import { SolarSystemResult, SolarSystemInput } from '../types';
import { COLORS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import AdUnit from './AdUnit';

interface ResultDisplayProps {
  result: SolarSystemResult;
  inputData: SolarSystemInput;
  onOpenForm: (type: 'client' | 'partner') => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, inputData, onOpenForm }) => {
  const energyFlowData = [
    { name: 'Consumption', value: result.energy_summary.daily_consumption_kwh },
    { name: 'Estimated Generation', value: result.solar_panels.estimated_daily_generation_kwh },
    { name: 'Req (+Losses)', value: result.system_losses.adjusted_energy_requirement_kwh },
  ];

  const lossColors = ['#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12'];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Within Budget': return 'bg-green-500';
      case 'Near Limit': return 'bg-orange-500';
      case 'Over Budget': return 'bg-red-600';
      default: return 'bg-gray-400';
    }
  };

  const getStatusBorder = (status: string) => {
    switch(status) {
      case 'Within Budget': return 'border-green-100';
      case 'Near Limit': return 'border-orange-100';
      case 'Over Budget': return 'border-red-200';
      default: return 'border-gray-100';
    }
  };

  const getStatusBg = (status: string) => {
    switch(status) {
      case 'Within Budget': return 'bg-green-50';
      case 'Near Limit': return 'bg-orange-50';
      case 'Over Budget': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  const getStatusTextClasses = (status: string) => {
    switch(status) {
      case 'Within Budget': return 'text-green-600';
      case 'Near Limit': return 'text-orange-600';
      case 'Over Budget': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMethodologyNote = () => {
    switch (inputData.load_method) {
      case 'manual':
        return "Manual Input: System designed based on user-provided consumption and peak load figures.";
      case 'appliance':
        return "Appliance Profiling: Analyzed specific wattage and quantity demand models.";
      case 'bill':
        return "Utility Bill Analysis: Data reverse-engineered from historical billing and regional tariffs.";
      default:
        return "Optimized based on provided parameters.";
    }
  };

  const batteryType = inputData.battery_type;
  const recommendedDOD = batteryType === 'Lithium' ? 85 : 50;
  const reserveCapacity = 100 - recommendedDOD;
  const reportDate = new Date().toLocaleDateString('en-GB');
  const reportTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // Use lat/lng if available for precise map centering, else use city name
  const mapQuery = inputData.latitude && inputData.longitude 
    ? `${inputData.latitude},${inputData.longitude}` 
    : encodeURIComponent(`${inputData.city}, ${inputData.country}`);
  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Official Sizing Report Header (Visible on Print and PDF) */}
      <div className="hidden print:flex pdf-header-visible justify-between items-start border-b-4 border-[#FDB813] pb-6 mb-8">
        <div>
          <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1">SUNLITICA.COM</p>
          <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter">Solar Sizing Report</h1>
        </div>
        <div className="text-right">
          <div className="bg-[#FDB813] px-6 py-2 rounded-2xl text-white font-black text-sm mb-1">
            Sol {reportDate.split('/').reverse().join('-')}
          </div>
          <p className="text-[10px] font-bold text-gray-400">{reportDate} {reportTime}</p>
        </div>
      </div>

      {/* Hero Header (Web Only) */}
      <div className="bg-[#0A2540] p-8 md:p-12 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden no-print">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
            Engineering Design Finalized
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter">Solar Intelligence</h2>
          <p className="text-blue-100 opacity-80 max-w-xl text-sm md:text-base leading-relaxed font-medium">
            Regional hardware analysis and strict derating-factor auditing completed for your location.
          </p>
        </div>
      </div>

      {/* Methodology Identification Note */}
      <div className="bg-slate-50 border border-slate-200 p-6 md:p-8 rounded-[2rem] flex items-start gap-4 no-print">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-[#0A2540] flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Analytical Methodology</p>
          <p className="text-sm font-medium text-[#0A2540] leading-relaxed italic">
            {getMethodologyNote()}
          </p>
        </div>
      </div>

      {/* Report Summary Boxes (Mimicking PDF Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-2">
        {/* Left: Location & Requirements */}
        <div className="bg-white p-8 rounded-[2.5rem] solar-shadow border border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0A2540] text-white rounded-xl flex items-center justify-center text-xs font-black">LOC</div>
            <h3 className="text-xl font-black text-[#0A2540]">Location & Requirements</h3>
          </div>
          
          <div className="aspect-video w-full bg-slate-100 rounded-3xl overflow-hidden relative border border-slate-200">
            {/* Live Google Map Iframe */}
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapUrl}
              className="grayscale-[0.2] contrast-[1.1]"
              title="Solar Installation Location"
            ></iframe>
            
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/50 pointer-events-none">
              <p className="text-xs font-black text-[#0A2540] flex items-center gap-2">
                <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                {inputData.city}, {inputData.country}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Units/month</p>
              <p className="font-black text-[#0A2540]">{ (result.energy_summary.daily_consumption_kwh * 30).toFixed(0) } kWh</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Backup Window</p>
              <p className="font-black text-[#0A2540]">{ result.energy_summary.backup_hours } hrs</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Peak Load</p>
              <p className="font-black text-[#0A2540]">{ result.energy_summary.peak_load_watts } W</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Irradiance</p>
              <p className="font-black text-[#0A2540]">{ inputData.sun_hours } peak hrs</p>
            </div>
          </div>
        </div>

        {/* Right: Proposed System Solution */}
        <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xs font-black">SOL</div>
            <h3 className="text-xl font-black text-[#0A2540]">Proposed System Solution</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
               <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l.707.707M6.343 6.343l.707-.707m12.728 0A9 9 0 115.636 5.636m12.728 12.728L5.636 5.636" /></svg>
               </div>
               <div>
                 <h4 className="font-black text-blue-600 text-sm">Solar Array</h4>
                 <p className="text-xl font-black text-[#0A2540] leading-none">{ result.solar_panels.total_solar_capacity_kw.toFixed(2) } kWp</p>
                 <p className="text-[10px] font-bold text-gray-400 mt-1">{ result.solar_panels.number_of_panels } x { result.solar_panels.recommended_panel_wattage }W panels</p>
               </div>
            </div>

            <div className="flex items-center gap-4 group">
               <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-800 group-hover:scale-110 transition-transform">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <div>
                 <h4 className="font-black text-blue-800 text-sm">Inverter</h4>
                 <p className="text-xl font-black text-[#0A2540] leading-none">{ result.inverter.recommended_size_kw.toFixed(1) } kW</p>
                 <p className="text-[10px] font-bold text-gray-400 mt-1">{ result.inverter.type }</p>
               </div>
            </div>

            <div className="flex items-center gap-4 group">
               <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <div>
                 <h4 className="font-black text-indigo-600 text-sm">Battery</h4>
                 <p className="text-xl font-black text-[#0A2540] leading-none">{ result.battery.total_storage_kwh.toFixed(1) } kWh</p>
                 <p className="text-[10px] font-bold text-gray-400 mt-1">Total Storage Capacity</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Potential Monthly Production Card */}
      <div className="bg-[#1A1A1A] p-8 md:p-12 rounded-[3rem] text-white shadow-2xl space-y-10 border border-white/5">
        <div className="space-y-6 max-w-2xl">
          <h3 className="text-3xl font-black text-[#FDB813] tracking-tight">Potential Monthly Production (kWh)</h3>
          <p className="text-blue-100/60 text-sm md:text-base leading-relaxed font-medium">
            Projected monthly yield assumes ideal conditions. Annual total: <span className="text-white font-black">{result.monthly_production.annual_total_kwh.toLocaleString()} units</span>.
          </p>
        </div>

        <div className="h-[350px] w-full bg-black/20 rounded-[2rem] p-6 border border-white/5 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.monthly_production.data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ borderRadius: '1.5rem', border: 'none', background: '#0A2540', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', fontWeight: 'bold', fontSize: '12px', color: 'white' }} 
              />
              <Bar dataKey="kwh" radius={[8, 8, 0, 0]} barSize={25}>
                {result.monthly_production.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#FDB813" opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-[#0A2540]/60 border border-[#0A2540] p-6 rounded-3xl text-center group transition-all hover:bg-[#0A2540] hover:scale-105">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/60 mb-2">Average month</p>
            <p className="text-2xl font-black text-blue-100">{result.monthly_production.average_kwh.toLocaleString()} <span className="text-xs">kWh</span></p>
          </div>
          <div className="bg-[#064E3B]/60 border border-[#064E3B] p-6 rounded-3xl text-center group transition-all hover:bg-[#064E3B] hover:scale-105">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300/60 mb-2">Best month: {result.monthly_production.best_month.name}</p>
            <p className="text-2xl font-black text-emerald-100">{result.monthly_production.best_month.kwh.toLocaleString()} <span className="text-xs">kWh</span></p>
          </div>
          <div className="bg-[#7F1D1D]/60 border border-[#7F1D1D] p-6 rounded-3xl text-center group transition-all hover:bg-[#7F1D1D] hover:scale-105">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300/60 mb-2">Worst month: {result.monthly_production.worst_month.name}</p>
            <p className="text-2xl font-black text-red-100">{result.monthly_production.worst_month.kwh.toLocaleString()} <span className="text-xs">kWh</span></p>
          </div>
        </div>
      </div>

      {/* System Cost & Savings Analysis */}
      <div className="bg-white p-10 rounded-[3rem] solar-shadow border border-gray-100">
         <div className="flex justify-between items-start mb-10">
            <div>
               <h3 className="text-2xl font-black text-[#0A2540] tracking-tight">Investment Status</h3>
               <p className="text-xs text-gray-500 font-medium">Financial audit and cost utilization</p>
            </div>
            <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${getStatusBg(result.budget_guard.status)} ${getStatusTextClasses(result.budget_guard.status)} border border-current`}>
               { result.budget_guard.status }
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Budget Target</p>
                     <p className="text-2xl font-black text-[#0A2540]">{ result.budget_guard.target_budget_display }</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Total</p>
                     <p className="text-2xl font-black text-[#0A2540]">{ result.budget_guard.estimated_total_cost_range }</p>
                  </div>
               </div>
               <div className="p-8 bg-[#0A2540] text-white rounded-[2.5rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10"><svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FDB813] mb-3">Optimization Strategy</h4>
                  <p className="text-sm font-medium leading-relaxed italic">{ result.budget_guard.optimization_strategy }</p>
               </div>
            </div>

            <div className="p-8 bg-green-50 border-2 border-green-100 rounded-[2.5rem] flex flex-col justify-between min-h-[220px]">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-2">Projected ROI</h4>
                  <p className="text-3xl font-black text-green-900 tracking-tighter">Save { result.budget_guard.savings_vs_utility_annually }</p>
                  <p className="text-xs text-green-700/60 font-medium mt-1">Estimated annual utility reduction based on current tariff</p>
               </div>
               <div className="pt-6 border-t border-green-200/50">
                  <p className="text-[10px] font-black text-green-800/40 uppercase tracking-widest">Efficiency Audit</p>
                  <p className="text-sm font-bold text-green-800">Total System Loss: { result.system_losses.loss_percentage }</p>
               </div>
            </div>
         </div>
      </div>

      {/* Recommendations & Local Sourcing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] solar-shadow border border-gray-100">
            <h3 className="text-2xl font-black text-[#0A2540] tracking-tight mb-8">Hardware Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {result.market_intelligence.slice(0, 4).map((product, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-blue-500/20 transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase">{ product.brand }</span>
                        <span className="text-sm font-black text-[#0A2540]">{ product.estimated_price }</span>
                     </div>
                     <h4 className="text-sm font-bold text-[#0A2540] mb-2">{ product.name }</h4>
                     <p className="text-[11px] text-gray-500 leading-relaxed mb-4 line-clamp-2">{ product.description }</p>
                     <a href={product.source_url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                        Verify Availability
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                     </a>
                  </div>
               ))}
            </div>
         </div>

         {/* Installers & Backup (mimicking the screenshot right side) */}
         <div className="bg-purple-50 p-10 rounded-[3rem] border border-purple-100 space-y-10">
            <div>
               <h3 className="text-2xl font-black text-purple-900 tracking-tight">Recommended Installers</h3>
               <p className="text-xs text-purple-700/60 mt-2 font-medium">Verified local solar contractors in {inputData.city}</p>
            </div>
            
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-purple-200">
                  <h4 className="font-black text-purple-900 text-sm">Portable Backup Solution</h4>
                  <p className="text-lg font-black text-[#0A2540] mt-1">EcoFlow Delta Pro</p>
                  <p className="text-[10px] text-gray-400 mt-1">Perfect for essential loads and plug-and-play ease.</p>
                  <button className="mt-4 w-full py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Check Pricing</button>
               </div>

               <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-purple-200">
                  <h4 className="font-black text-purple-900 text-sm">Official Affiliate Partner</h4>
                  <p className="text-xs font-bold text-[#0A2540] mt-1">Local Installers Network</p>
                  <p className="text-[10px] text-gray-400 mt-1">Get 3 quotes from certified electricians.</p>
                  <button 
                    onClick={() => onOpenForm('client')}
                    className="mt-4 w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0A2540] transition-colors"
                  >
                    Get Quotes
                  </button>
               </div>
            </div>

            <div className="pt-4 border-t border-purple-200/50">
               <p className="text-[8px] text-purple-800/40 font-bold italic leading-relaxed">
                 Affiliate disclosure: Sunlytica may earn a commission when users connect with or purchase from partner installers.
               </p>
            </div>
         </div>
      </div>

      {/* Future Expansion Section */}
      <div className="bg-sky-50 p-10 rounded-[3rem] border border-sky-100 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-600 text-white rounded-xl flex items-center justify-center text-xs font-black">EXP</div>
          <h3 className="text-xl font-black text-[#0A2540]">Scalability & Future Proofing</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-sky-200 flex items-center gap-5">
            <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 flex-shrink-0">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Max Panel Expansion</p>
              <p className="text-2xl font-black text-[#0A2540]">{result.future_expansion?.max_additional_panels || 0} Panels</p>
              <p className="text-[10px] text-gray-400 font-medium">Potential for additional generation capacity</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-sky-200 flex items-center gap-5">
            <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 flex-shrink-0">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Inverter Headroom</p>
              <p className="text-xl font-black text-[#0A2540]">{result.future_expansion?.inverter_headroom || 'Optimized for current load'}</p>
              <p className="text-[10px] text-gray-400 font-medium">Available electrical capacity in existing inverter</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200">
         <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A2540] mb-3">Notes & Disclaimers</h4>
         <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Estimates are based on standard meteorological year data and regional irradiance profiles for {inputData.city}. Actual performance varies by component efficiency, site-specific shading, and installation quality. 
            <br/><br/>
            <strong>Caution:</strong> Always consult a certified electrical engineer before final procurement and mounting. This blueprint is for preliminary sizing purposes only.
         </p>
      </div>
    </div>
  );
};

export default ResultDisplay;
