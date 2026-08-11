// app/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// ISOLATED FUNCTION: Onboarding Step 1 - Brand Profile
export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [brandName, setBrandName] = useState("");
  const [brandTone, setBrandTone] = useState("Professional");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Scope Document Rule: Brand tone selector pills[cite: 2]
  const tones = ["Professional", "Casual", "Playful", "Bold"];

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/workspaces/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: brandName,
          ownerId: (session?.user as { id?: string } | undefined)?.id, // NextAuth session se logged-in user ki ID
          brandVoice: brandTone,
          targetAudience: "General"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Workspace create nahi ho saka.");
      }

      
     // Success: Ab Dashboard ke bajaye Step 2 par bhej do
      router.push("/onboarding/step-2");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        <div className="mb-8 text-center">
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-2">Step 1 of 3</p>
          <h1 className="text-3xl font-bold text-[#181825]">Tell us about your brand</h1>
          <p className="text-slate-500 mt-2">This is what your AI writes from — you can refine it later.</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6 text-sm">{error}</div>}

        <form onSubmit={handleCreateWorkspace} className="space-y-6">
         {/* Brand Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Brand / company name</label>
            <input
              type="text"
              required
              spellCheck="false" 
              placeholder="e.g. Northbeam Studio"
              // Niche text-slate-900 aur placeholder-slate-400 add kiya hai UI clarity ke liye
              className="w-full px-4 py-3 text-slate-900 placeholder-slate-400 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B4A] focus:border-[#FF6B4A] outline-none"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>

          {/* Brand Tone Selector (Pills) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">Brand tone</label>
              <span className="text-xs text-slate-400">Sets how your AI drafts sound</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {tones.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setBrandTone(tone)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    brandTone === tone 
                      ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-[#FF6B4A]' 
                      : 'border-gray-200 text-slate-600 hover:border-gray-300'
                  }`}
                >
                  {brandTone === tone && <span className="mr-2">✓</span>}
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isLoading || !brandName}
              className="w-full bg-[#FF6B4A] hover:bg-[#E85A38] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center"
            >
              {isLoading ? "Saving..." : "Continue →"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}