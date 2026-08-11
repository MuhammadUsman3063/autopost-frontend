// app/onboarding/step-2/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ISOLATED FUNCTION: Onboarding Step 2 - Content Pillars
export default function ContentPillarsPage() {
  const router = useRouter();
  const [pillars, setPillars] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Scope Document Rule: Quick-add suggestion chips[cite: 2]
  const suggestions = [
    "Product Updates", "Behind the Scenes", "Industry Tips", 
    "Client Wins", "Team Culture", "How-To Guides"
  ];

  // Tag add karne ka logic
  const handleAddPillar = (pillar: string) => {
    if (pillar.trim() && !pillars.includes(pillar)) {
      setPillars([...pillars, pillar.trim()]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPillar(inputValue);
    }
  };

  const removePillar = (pillarToRemove: string) => {
    setPillars(pillars.filter(p => p !== pillarToRemove));
  };

  const handleContinue = async () => {
    // Frontend route update - Step 3 par jayega
    router.push("/onboarding/step-3");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        <div className="mb-8 text-center">
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-2">Step 2 of 3</p>
          <h1 className="text-3xl font-bold text-[#181825]">What should we post about?</h1>
          <p className="text-slate-500 mt-2">Add topics your AI-generated content should focus on</p>
        </div>

        <div className="space-y-6">
          {/* Tag Input Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content pillars</label>
            
            {/* Display Added Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {pillars.map(pillar => (
                <span key={pillar} className="px-3 py-1.5 bg-[#181825] text-white text-sm rounded-full flex items-center gap-2">
                  {pillar}
                  <button onClick={() => removePillar(pillar)} className="hover:text-[#FF6B4A]">×</button>
                </span>
              ))}
            </div>

            <input
              type="text"
              spellCheck="false"
              placeholder="e.g. Product Updates — press Enter to add"
              className="w-full px-4 py-3 text-slate-900 placeholder-slate-400 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B4A] outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Quick Add Suggestions */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Popular with agencies</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => handleAddPillar(suggestion)}
                  className="px-3 py-1.5 border border-dashed border-gray-300 text-slate-600 text-sm rounded-full hover:border-[#FF6B4A] hover:text-[#FF6B4A] transition-colors"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-4">
              Three or four pillars is the sweet spot — enough variety to keep a feed interesting, focused enough to stay on message.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
            <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 font-medium px-4 py-2 transition-colors">
              Back
            </button>
            <button onClick={handleContinue} className="bg-[#FF6B4A] hover:bg-[#E85A38] text-white font-medium py-2.5 px-6 rounded-xl transition-colors">
              Continue →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}