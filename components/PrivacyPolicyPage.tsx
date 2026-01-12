
import React from 'react';
import { COLORS } from '../constants';

const PrivacyPolicyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const lastUpdated = "May 24, 2024";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-24">
      <section className="text-center py-16 px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A2540] mb-4">
          Privacy Policy
        </h2>
        <p className="text-gray-500 font-medium">Last updated: {lastUpdated}</p>
      </section>

      <div className="bg-white rounded-[2.5rem] solar-shadow border border-gray-100 p-8 md:p-12 space-y-12 text-gray-600 leading-relaxed">
        <section className="space-y-4">
          <h3 className="text-2xl font-bold text-[#0A2540]">1. Introduction</h3>
          <p>
            Sunlitica ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our intelligent solar analytics platform. We prioritize data minimization, focusing exclusively on the technical parameters required to generate accurate energy engineering reports.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-bold text-[#0A2540]">2. Information We Collect</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-2xl">
              <h4 className="font-bold text-[#0A2540] mb-2">Technical Energy Data</h4>
              <p className="text-sm">Information regarding household energy consumption, appliance inventories, and utility bills provided by you during the analysis process.</p>
            </div>
            <div className="p-6 bg-amber-50 rounded-2xl">
              <h4 className="font-bold text-[#0A2540] mb-2">Geographic Information</h4>
              <p className="text-sm">Approximate location used to calculate solar irradiance, peak sun hours, and regional climate factors.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-bold text-[#0A2540]">3. Data Processing & Third Parties</h3>
          <p>
            Sunlitica utilizes advanced analytical models. By using this tool, you acknowledge that technical inputs are processed by:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Google Gemini AI:</strong> For generation of structural JSON design reports. Data shared is technical and does not include personally identifiable information (PII).</li>
            <li><strong>Photon Geocoding:</strong> To translate city names into coordinates for solar mapping.</li>
          </ul>
        </section>
      </div>

      <div className="flex justify-center mt-12">
        <button 
          onClick={onBack}
          className="bg-[#0A2540] text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
