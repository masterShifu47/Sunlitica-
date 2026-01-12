
import React, { useState, useEffect, useRef } from 'react';
import { SolarSystemInput, Obstruction, LoadMethod, Appliance } from '../types';
import { COLORS } from '../constants';
import RoofLayoutEditor from './RoofLayoutEditor';
import { analyzeBill } from '../services/geminiService';
import AdUnit from './AdUnit';

interface InputFormProps {
  onSubmit: (data: SolarSystemInput) => void;
  isLoading: boolean;
}

interface LocationSuggestion {
  name: string;
  city?: string;
  state?: string;
  country: string;
  display_name: string;
  lat?: number;
  lon?: number;
}

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'Nigeria': '₦',
  'United States': '$',
  'United Kingdom': '£',
  'Germany': '€',
  'France': '€',
  'Italy': '€',
  'Spain': '€',
  'Canada': '$',
  'Australia': '$',
  'India': '₹',
  'Japan': '¥',
  'China': '¥',
  'South Africa': 'R',
  'Brazil': 'R$',
  'United Arab Emirates': 'د.إ',
  'Ghana': 'GH₵',
  'Kenya': 'KSh',
};

const COMMON_CURRENCIES = ['₦', '$', '€', '£', '₹', '¥', 'R', 'GH₵', 'د.إ'];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<SolarSystemInput>({
    country: '',
    city: '',
    daily_kwh: 15,
    peak_watts: 5000,
    roof_type: 'Concrete Tile',
    roof_size: 100,
    sun_hours: 5,
    system_type: 'Hybrid',
    backup_hours: 4,
    battery_type: 'Lithium',
    budget_level: 'Medium',
    target_budget: 5000,
    obstructions: [],
    load_method: 'manual',
    currency_symbol: '$',
    appliances: [
      { id: '1', name: 'TV', qty: 2, watts: 120, hours: 6, efficiency: 100 },
      { id: '2', name: 'Fan', qty: 3, watts: 75, hours: 8, efficiency: 100 },
      { id: '3', name: 'Fridge', qty: 1, watts: 250, hours: 24, efficiency: 100 },
      { id: '4', name: 'Lights', qty: 10, watts: 15, hours: 6, efficiency: 100 },
    ]
  });

  const [billValue, setBillValue] = useState<number>(50000);
  const [tariffRate, setTariffRate] = useState<number>(225);
  const [isAnalyzingBill, setIsAnalyzingBill] = useState(false);

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  
  const suggestionRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const applianceListRef = useRef<HTMLTableSectionElement>(null);

  const calcEffectiveWatts = (app: Appliance) => app.watts * (app.efficiency / 100);

  const calcApplianceDaily = () => (formData.appliances?.reduce((acc, app) => acc + (app.qty * calcEffectiveWatts(app) * app.hours), 0) || 0) / 1000;
  const calcAppliancePeak = () => formData.appliances?.reduce((acc, app) => acc + (app.qty * calcEffectiveWatts(app)), 0) || 0;
  const calcBillDaily = () => tariffRate <= 0 ? 0 : (billValue / tariffRate) / 30;

  const getEffectiveKWh = () => {
    if (formData.load_method === 'appliance') return calcApplianceDaily();
    if (formData.load_method === 'bill') return calcBillDaily();
    return formData.daily_kwh;
  };

  const getEffectivePeak = () => formData.load_method === 'appliance' ? calcAppliancePeak() : formData.peak_watts;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSearch = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      const results = data.features.map((f: any) => ({
        name: f.properties.name,
        city: f.properties.city || f.properties.state,
        state: f.properties.state,
        country: f.properties.country,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        display_name: `${f.properties.name}${f.properties.city ? `, ${f.properties.city}` : ''}${f.properties.country ? `, ${f.properties.country}` : ''}`
      }));
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (err) { console.error("Location search failed", err); }
  };

  const selectLocation = (loc: LocationSuggestion) => {
    const currency = COUNTRY_CURRENCY_MAP[loc.country] || '$';
    setFormData(prev => ({ 
      ...prev, 
      city: loc.city || loc.name, 
      country: loc.country,
      currency_symbol: currency,
      latitude: loc.lat,
      longitude: loc.lon
    }));
    setShowSuggestions(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const resp = await fetch(`https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`);
        const data = await resp.json();
        if (data.features && data.features.length > 0) {
          const props = data.features[0].properties;
          const currency = COUNTRY_CURRENCY_MAP[props.country] || '$';
          setFormData(prev => ({ 
            ...prev, 
            city: props.city || props.state || props.name, 
            country: props.country,
            currency_symbol: currency,
            latitude: latitude,
            longitude: longitude
          }));
        }
      } catch (err) { console.error("Reverse geocoding failed", err); }
      finally { setIsLocating(false); }
    }, () => setIsLocating(false));
  };

  const cleanNumericString = (val: string): string => {
    // Remove all non-numeric chars except dot
    let cleaned = val.replace(/[^0-9.]/g, '');
    // Remove leading zeros but keep single '0' or '0.x'
    cleaned = cleaned.replace(/^0+(?!$|\.)/, '');
    return cleaned === '' ? '0' : cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const cleaned = cleanNumericString(value);
      setFormData(prev => ({ ...prev, [name]: parseFloat(cleaned) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (name === 'city') handleLocationSearch(value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      setFormData(prev => ({
        ...prev,
        uploaded_bill: {
          data: base64String,
          mimeType: file.type,
          fileName: file.name
        }
      }));

      setIsAnalyzingBill(true);
      try {
        const data = await analyzeBill(base64String, file.type);
        if (data.bill_amount) setBillValue(data.bill_amount);
        if (data.tariff_rate) setTariffRate(data.tariff_rate);
      } catch (err) {
        console.error("AI Analysis failed", err);
      } finally {
        setIsAnalyzingBill(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedFile = () => {
    setFormData(prev => ({ ...prev, uploaded_bill: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateAppliance = (id: string, field: keyof Appliance, rawValue: string) => {
    let finalValue: any = rawValue;
    
    // For numeric fields, clean the string immediately while typing
    if (['qty', 'watts', 'hours', 'efficiency'].includes(field)) {
      const cleaned = cleanNumericString(rawValue);
      finalValue = parseFloat(cleaned) || 0;
    }

    setFormData(prev => ({
      ...prev,
      appliances: prev.appliances?.map(a => a.id === id ? { ...a, [field]: finalValue } : a)
    }));
  };

  const addAppliance = () => {
    const newApp: Appliance = { 
      id: Math.random().toString(36).substr(2, 9), 
      name: '', 
      qty: 1, 
      watts: 0, 
      hours: 0,
      efficiency: 100 
    };
    setFormData(prev => ({ ...prev, appliances: [...(prev.appliances || []), newApp] }));
    
    // Auto-focus the new appliance name field on the next tick
    setTimeout(() => {
      const inputs = applianceListRef.current?.querySelectorAll('input');
      if (inputs && inputs.length > 0) {
        (inputs[inputs.length - 6] as HTMLInputElement).focus();
      }
    }, 0);
  };

  const removeAppliance = (id: string) => {
    setFormData(prev => ({ ...prev, appliances: prev.appliances?.filter(a => a.id !== id) }));
  };

  const handleObstructionChange = (obs: Obstruction[]) => {
    setFormData(prev => ({ ...prev, obstructions: obs }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, daily_kwh: getEffectiveKWh(), peak_watts: getEffectivePeak() });
  };

  const inputClasses = "w-full p-4 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:border-transparent transition-all placeholder:text-gray-300 text-sm font-medium";
  const labelClasses = "block text-xs font-black uppercase tracking-widest mb-2.5 text-[#0A2540]/60";
  const tabClasses = (active: boolean) => `flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${active ? 'bg-[#0A2540] border-[#0A2540] text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`;

  const getMethodContainerStyles = (method: LoadMethod) => {
    switch (method) {
      case 'manual': return 'bg-slate-50/80 border-slate-200';
      case 'appliance': return 'bg-amber-50/30 border-amber-200/50';
      case 'bill': return 'bg-emerald-50/30 border-emerald-200/50';
      default: return 'bg-gray-50/50 border-gray-100';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in duration-500">
      
      {/* 1. Location Section */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] solar-shadow border border-gray-100/50 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">1</div>
            <div>
              <h3 className="text-xl font-black text-[#0A2540] tracking-tight">Location & Climate</h3>
              <p className="text-xs text-gray-500">Environmental variables impact efficiency</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={detectLocation} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] font-black text-[#0A2540] hover:bg-gray-50 border-2 border-gray-100 px-6 py-2.5 rounded-full uppercase tracking-widest transition-all"
          >
            {isLocating ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            ) : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            {isLocating ? 'Locating...' : 'Auto-Detect'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative" ref={suggestionRef}>
            <label className={labelClasses}>City / Municipality</label>
            <div className="relative">
              <input name="city" value={formData.city} onChange={handleChange} onFocus={() => formData.city.length >= 3 && setShowSuggestions(true)} required placeholder="Search City..." className={inputClasses} autoComplete="off" />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                  {suggestions.map((loc, idx) => (
                    <button key={idx} type="button" onClick={() => selectLocation(loc)} className="w-full text-left px-5 py-4 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0 flex flex-col transition-colors">
                      <span className="font-bold text-[#0A2540]">{loc.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium uppercase">{loc.city ? `${loc.city}, ` : ''}{loc.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className={labelClasses}>Country</label>
            <input name="country" value={formData.country} onChange={handleChange} required placeholder="Country Name" className={inputClasses} />
          </div>
        </div>
      </div>

      {/* 2. Load Profiling Section */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] solar-shadow border border-gray-100/50 space-y-8">
        <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-xl">2</div>
          <div>
            <h3 className="text-xl font-black text-[#0A2540] tracking-tight">Energy Load Profile</h3>
            <p className="text-xs text-gray-500">Define your daily electrical demand</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex bg-gray-100/50 p-1.5 rounded-2xl gap-1.5 w-full max-w-xl mx-auto">
            <button type="button" onClick={() => setFormData(p => ({...p, load_method: 'manual'}))} className={tabClasses(formData.load_method === 'manual')}>Manual</button>
            <button type="button" onClick={() => setFormData(p => ({...p, load_method: 'appliance'}))} className={tabClasses(formData.load_method === 'appliance')}>Appliance List</button>
            <button type="button" onClick={() => setFormData(p => ({...p, load_method: 'bill'}))} className={tabClasses(formData.load_method === 'bill')}>Energy Bill</button>
          </div>

          <div className={`p-6 md:p-8 rounded-[2.5rem] border transition-all duration-500 ease-in-out min-h-[160px] ${getMethodContainerStyles(formData.load_method)}`}>
            {formData.load_method === 'manual' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4">
                <div className="space-y-2">
                  <label className={labelClasses}>Daily Consumption (kWh)</label>
                  <input name="daily_kwh" type="text" value={formData.daily_kwh} onChange={handleChange} onFocus={e => e.target.select()} required className={inputClasses} />
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>Peak Power Load (Watts)</label>
                  <input name="peak_watts" type="text" value={formData.peak_watts} onChange={handleChange} onFocus={e => e.target.select()} required className={inputClasses} />
                </div>
              </div>
            )}

            {formData.load_method === 'appliance' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                <div className="overflow-x-auto -mx-6 md:mx-0">
                  <table className="w-full text-left border-collapse px-6 md:px-0">
                    <thead>
                      <tr className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest border-b border-amber-100">
                        <th className="pb-4 pl-6 md:pl-0 min-w-[140px]">Appliance</th>
                        <th className="pb-4 px-2 w-16">Qty</th>
                        <th className="pb-4 px-2 w-20">Watts</th>
                        <th className="pb-4 px-2 w-16">Eff %</th>
                        <th className="pb-4 px-2 w-20">Adj W</th>
                        <th className="pb-4 px-2 w-16">Hrs</th>
                        <th className="pb-4 pr-6 md:pr-0 text-right w-10"></th>
                      </tr>
                    </thead>
                    <tbody ref={applianceListRef} className="divide-y divide-amber-100/30">
                      {formData.appliances?.map(app => (
                        <tr key={app.id}>
                          <td className="py-4 pl-6 md:pl-0 font-bold text-[#0A2540]">
                            <input 
                              value={app.name} 
                              onChange={(e) => updateAppliance(app.id, 'name', e.target.value)} 
                              onFocus={e => e.target.select()}
                              placeholder="e.g. Fridge, TV..." 
                              className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm placeholder:text-amber-200/50 placeholder:font-normal" 
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input 
                              type="text" 
                              value={app.qty} 
                              onChange={(e) => updateAppliance(app.id, 'qty', e.target.value)} 
                              onFocus={e => e.target.select()}
                              className="w-full bg-white border border-amber-100 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-[#0A2540] outline-none" 
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input 
                              type="text" 
                              value={app.watts} 
                              onChange={(e) => updateAppliance(app.id, 'watts', e.target.value)} 
                              onFocus={e => e.target.select()}
                              className="w-full bg-white border border-amber-100 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-[#0A2540] outline-none" 
                            />
                          </td>
                          <td className="py-2 px-1">
                            <input 
                              type="text" 
                              value={app.efficiency} 
                              onChange={(e) => updateAppliance(app.id, 'efficiency', e.target.value)} 
                              onFocus={e => e.target.select()}
                              className="w-full bg-white border border-amber-100 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-[#0A2540] outline-none" 
                            />
                          </td>
                          <td className="py-2 px-1">
                             <div className="bg-amber-100/50 rounded-xl py-2 px-3 text-sm font-black text-amber-900 text-center opacity-70">
                               {calcEffectiveWatts(app).toFixed(0)}
                             </div>
                          </td>
                          <td className="py-2 px-1">
                            <input 
                              type="text" 
                              value={app.hours} 
                              onChange={(e) => updateAppliance(app.id, 'hours', e.target.value)} 
                              onFocus={e => e.target.select()}
                              className="w-full bg-white border border-amber-100 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-[#0A2540] outline-none" 
                            />
                          </td>
                          <td className="py-4 pr-6 md:pr-0 text-right">
                            <button type="button" onClick={() => removeAppliance(app.id)} className="text-amber-200 hover:text-red-500 text-xl font-black">×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-amber-100 gap-4">
                  <button type="button" onClick={addAppliance} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-900 bg-amber-100/50 px-6 py-3 rounded-xl hover:bg-amber-200/50 transition-all border border-amber-200/30">
                    + Add Appliance
                  </button>
                  <div className="text-center sm:text-right bg-white p-4 rounded-2xl border border-amber-100 shadow-sm min-w-[160px]">
                    <p className="text-[10px] font-bold text-amber-400 uppercase mb-1">Total Requirement</p>
                    <p className="text-xl font-black text-amber-900">{calcApplianceDaily().toFixed(2)} <span className="text-xs">kWh</span></p>
                  </div>
                </div>
              </div>
            )}

            {formData.load_method === 'bill' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest mb-2.5 text-emerald-900/60">Average Monthly Bill</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-300 text-sm">{formData.currency_symbol}</span>
                      <input type="text" value={billValue} onChange={(e) => setBillValue(parseFloat(cleanNumericString(e.target.value)) || 0)} onFocus={e => e.target.select()} className={inputClasses + " pl-12 border-emerald-100 focus:ring-emerald-500"} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest mb-2.5 text-emerald-900/60">Current Tariff Rate (/kWh)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-300 text-sm">{formData.currency_symbol}</span>
                      <input type="text" value={tariffRate} onChange={(e) => setTariffRate(parseFloat(cleanNumericString(e.target.value)) || 0)} onFocus={e => e.target.select()} className={inputClasses + " pl-12 border-emerald-100 focus:ring-emerald-500"} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase tracking-widest mb-2.5 text-emerald-900/60">Analyze Bill with AI</label>
                  {!formData.uploaded_bill ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer group relative border-2 border-dashed border-emerald-200 rounded-[2.5rem] p-8 transition-all hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-3 text-center"
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,image/jpeg,image/png" className="hidden" />
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-900">Upload Bill Document</p>
                        <p className="text-xs text-emerald-400/80 mt-1">AI will extract cost and tariff data automatically</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-600 text-white rounded-[2.5rem] p-6 flex items-center justify-between border border-emerald-700 shadow-xl animate-in zoom-in-95">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                          {isAnalyzingBill ? (
                             <svg className="animate-spin h-5 w-5 text-emerald-100" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                          ) : (
                            <svg className="w-5 h-5 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {isAnalyzingBill ? 'AI Extracting Data...' : 'Extraction Complete'}
                          </p>
                          <p className="text-sm font-bold truncate max-w-[200px]">{formData.uploaded_bill.fileName}</p>
                        </div>
                      </div>
                      <button type="button" onClick={removeUploadedFile} className="p-2 hover:bg-white/10 rounded-xl transition-colors flex-shrink-0">
                        <svg className="w-5 h-5 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdUnit type="inline" className="max-w-2xl mx-auto" />

      {/* 3. Space & System Section */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] solar-shadow border border-gray-100/50 space-y-8">
        <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-black text-xl">3</div>
          <div>
            <h3 className="text-xl font-black text-[#0A2540] tracking-tight">System Specification</h3>
            <p className="text-xs text-gray-500">Infrastructure and physical constraints</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>Total Roof Area</label>
                <div className="relative">
                  <input name="roof_size" type="text" value={formData.roof_size} onChange={handleChange} onFocus={e => e.target.select()} required className={inputClasses} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">m²</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Peak Sun Hours</label>
                <input name="sun_hours" type="text" value={formData.sun_hours} onChange={handleChange} onFocus={e => e.target.select()} required className={inputClasses} />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
               <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-black uppercase tracking-widest text-[#0A2540]/60 mb-0">Financial Blueprint</label>
                  <div className="relative" ref={currencyRef}>
                    <button type="button" onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[#0A2540] rounded-xl text-xs font-black shadow-sm transition-all hover:border-[#0A2540]">
                      <span>{formData.currency_symbol}</span>
                      <svg className={`w-3 h-3 transition-transform ${isCurrencyMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isCurrencyMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[60] py-2 overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="grid grid-cols-3 gap-1 px-2 pb-2 border-b border-gray-50">
                          {COMMON_CURRENCIES.map((sym) => (
                            <button key={sym} type="button" onClick={() => { setFormData(p => ({ ...p, currency_symbol: sym })); setIsCurrencyMenuOpen(false); }} className={`h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${formData.currency_symbol === sym ? 'bg-blue-50 text-[#0A2540]' : 'text-gray-400 hover:bg-gray-50'}`}>
                              {sym}
                            </button>
                          ))}
                        </div>
                        <div className="p-2">
                          <input type="text" placeholder="Custom Symbol..." className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-black text-center outline-none focus:ring-1 focus:ring-[#0A2540]" onChange={(e) => e.target.value && setFormData(p => ({ ...p, currency_symbol: e.target.value }))} />
                        </div>
                      </div>
                    )}
                  </div>
               </div>
               <div className="space-y-2">
                <label className={labelClasses}>Target Investment Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300 text-sm">{formData.currency_symbol}</span>
                  <input name="target_budget" type="text" value={formData.target_budget} onChange={handleChange} onFocus={e => e.target.select()} required className={inputClasses + " pl-12 bg-white font-black text-lg"} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>System Setup</label>
                <select name="system_type" value={formData.system_type} onChange={handleChange} className={inputClasses}>
                  <option value="Off-grid">Off-grid</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Grid-tie">Grid-tie</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Backup Window</label>
                <div className="relative">
                  <input name="backup_hours" type="text" value={formData.backup_hours} onChange={handleChange} onFocus={e => e.target.select()} required className={inputClasses} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">Hrs</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClasses}>Battery Tech</label>
                <select name="battery_type" value={formData.battery_type} onChange={handleChange} className={inputClasses}>
                  <option value="Lithium">Lithium Ion</option>
                  <option value="AGM">AGM</option>
                  <option value="Gel">Gel</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Quality Preference</label>
                <select name="budget_level" value={formData.budget_level} onChange={handleChange} className={inputClasses}>
                  <option value="Low">Economic</option>
                  <option value="Medium">Standard</option>
                  <option value="High">Premium</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-gray-100">
            <RoofLayoutEditor roofSize={formData.roof_size} obstructions={formData.obstructions} onChange={handleObstructionChange} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-8 z-20">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-6 rounded-3xl text-white font-black text-xl shadow-2xl hover:shadow-[#0A2540]/30 transition-all disabled:opacity-50 active:scale-[0.98] relative overflow-hidden group bg-[#0A2540]"
        >
          <div className="absolute inset-0 bg-white/5 group-hover:translate-x-full transition-transform duration-700 ease-in-out -translate-x-full skew-x-12"></div>
          {isLoading ? (
            <div className="flex items-center justify-center gap-4">
              <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              <span>Analyzing Blueprint...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span>Generate Engineering Solution</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </div>
          )}
        </button>
      </div>
    </form>
  );
};

export default InputForm;
