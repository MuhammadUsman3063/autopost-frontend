// app/dashboard/settings/brand/page.tsx
"use client";

import React, { useState } from "react";

// ISOLATED FUNCTION: Brand Profile Settings Screen
export default function BrandProfilePage() {
  const [brandName, setBrandName] = useState("Northbeam Studio");
  const [brandTone, setBrandTone] = useState("Professional");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const tones = ["Professional", "Casual", "Playful", "Bold"];

  // Mock function to trigger unsaved changes warning
  const handleChange = (setter: any, value: any) => {
    setter(value);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 relative">
      
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Brand Profile</h1>
        <p className="text-slate-500 mt-1">Configure how your AI sounds and what topics it focuses on.</p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        
        {/* Brand Name */}
        <div className="p-6 md:flex md:items-start gap-8">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <h3 className="text-sm font-semibold text-slate-900">Brand Name</h3>
            <p className="text-xs text-slate-500 mt-1">The official name of the business.</p>
          </div>
          <div className="md:w-2/3">
            <input
              type="text"
              spellCheck="false"
              value={brandName}
              onChange={(e) => handleChange(setBrandName, e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all"
            />
          </div>
        </div>

        {/* Brand Tone */}
        <div className="p-6 md:flex md:items-start gap-8">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <h3 className="text-sm font-semibold text-slate-900">Brand Tone</h3>
            <p className="text-xs text-slate-500 mt-1">This guides the AI's writing style.</p>
          </div>
          <div className="md:w-2/3">
            <div className="flex flex-wrap gap-3">
              {tones.map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleChange(setBrandTone, tone)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    brandTone === tone 
                      ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-[#FF6B4A]' 
                      : 'border-slate-300 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {brandTone === tone && <span className="mr-2">✓</span>}
                  {tone}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Banned Words */}
        <div className="p-6 md:flex md:items-start gap-8">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <h3 className="text-sm font-semibold text-slate-900">Banned Words</h3>
            <p className="text-xs text-slate-500 mt-1">Words the AI should never use in drafts.</p>
          </div>
          <div className="md:w-2/3">
            <input
              type="text"
              spellCheck="false"
              placeholder="e.g. cheap, guarantee (press enter to add)"
              className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all"
            />
          </div>
        </div>

      </div>

      {/* Sticky Save Bar (Scope Document Requirement) */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-3xl bg-[#181825] text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-[#FF6B4A]/30 z-50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#E8912D] animate-pulse"></div>
            <span className="text-sm font-medium">You have unsaved changes</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setHasUnsavedChanges(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={() => setHasUnsavedChanges(false)}
              className="px-6 py-2 text-sm font-medium bg-[#FF6B4A] hover:bg-[#E85A38] text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
}