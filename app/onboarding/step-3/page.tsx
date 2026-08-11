// app/onboarding/step-3/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ISOLATED FUNCTION: Onboarding Step 3 - Connect Accounts
export default function ConnectAccountsPage() {
  const router = useRouter();
  
  // States for connected platforms
  const [isIgConnected, setIsIgConnected] = useState(false);
  const [isLiConnected, setIsLiConnected] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

// ISOLATED FUNCTION: Fetch Official OAuth URL from Backend and Redirect
const handleConnect = async (platform: 'instagram' | 'linkedin') => {
  setConnectingPlatform(platform);
  
  try {
    // 1. Backend API ko call kar rahe hain real URL lene ke liye
    const res = await fetch(`http://localhost:5000/api/social/${platform}/auth-url`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `${platform} ka URL generate nahi ho saka.`);
    }

    // 2. User ko dynamically official Meta/LinkedIn page par redirect karna
    // (Abhi fake keys hain, isliye error page aayega, lakin redirection flow test ho jayega)
    window.location.href = data.url;

  } catch (error: any) {
    console.error("Connection Error:", error);
    alert(error.message);
    setConnectingPlatform(null); // Agar error aaye toh button reset kar do
  }
};

  const handleFinish = () => {
    // Aakhri step complete hone ke baad main Dashboard par redirect
    router.push("/dashboard");
  };

  // Scope Document Rule: Disable until at least one account is connected
  const isFinishEnabled = isIgConnected || isLiConnected;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        <div className="mb-8 text-center">
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-2">Step 3 of 3</p>
          <h1 className="text-3xl font-bold text-[#181825]">Connect your accounts</h1>
          <p className="text-slate-500 mt-2">Connect at least one account to start scheduling</p>
        </div>

        <div className="space-y-4">
          
          {/* Card 1: Instagram Business */}
          <div className="border border-gray-200 p-5 rounded-xl flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center font-bold text-slate-600">
                IG
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Instagram</h3>
                <p className="text-sm text-slate-500 mt-1">Feed posts, reels, and stories — scheduled and published for you.</p>
              </div>
            </div>
            {isIgConnected ? (
               <div className="flex items-center justify-center gap-2 py-2.5 bg-[#3D9970]/10 text-[#3D9970] font-medium rounded-lg">
                 <span>✓</span> Connected
               </div>
            ) : (
              <button 
                onClick={() => handleConnect('instagram')}
                disabled={connectingPlatform !== null}
                className="w-full bg-[#FF6B4A] hover:bg-[#E85A38] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
              >
                {connectingPlatform === 'instagram' ? "Connecting..." : "Connect Instagram Business"}
              </button>
            )}
          </div>

          {/* Card 2: LinkedIn */}
          <div className="border border-gray-200 p-5 rounded-xl flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center font-bold text-slate-600">
                IN
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">LinkedIn</h3>
                <p className="text-sm text-slate-500 mt-1">Company pages and personal profiles, posted at peak hours.</p>
              </div>
            </div>
            {isLiConnected ? (
               <div className="flex items-center justify-center gap-2 py-2.5 bg-[#3D9970]/10 text-[#3D9970] font-medium rounded-lg">
                 <span>✓</span> Connected
               </div>
            ) : (
              <button 
                onClick={() => handleConnect('linkedin')}
                disabled={connectingPlatform !== null}
                className="w-full bg-[#FF6B4A] hover:bg-[#E85A38] text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
              >
                {connectingPlatform === 'linkedin' ? "Connecting..." : "Connect LinkedIn"}
              </button>
            )}
          </div>
          
          <p className="text-sm text-slate-500 pt-2 text-center">
            You can connect more accounts later from Settings.
          </p>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
            <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 font-medium px-4 py-2 transition-colors">
              Back
            </button>
            <button 
              onClick={handleFinish} 
              disabled={!isFinishEnabled}
              className="bg-[#181825] hover:bg-black text-white disabled:bg-slate-300 disabled:text-slate-500 font-medium py-2.5 px-6 rounded-xl transition-colors"
            >
              Finish Setup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}