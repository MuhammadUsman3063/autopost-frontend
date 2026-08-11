"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// ISOLATED FUNCTION: Single Dynamic Account Card (Updated)
function ConnectedAccountCard({ id, platform, handle, status, onDisconnect }: any) {
  const isHealthy = status === 'Active' || status === 'Connected';
  const platformCode = platform === 'Instagram' || platform === 'IG' ? 'IG' : 'IN';
  const platformStyle = platformCode === 'IG' ? 'text-pink-600 bg-pink-50 border-pink-200' : 'text-blue-600 bg-blue-50 border-blue-200';

  return (
    <div className={`bg-white p-6 rounded-2xl border ${isHealthy ? 'border-slate-200' : 'border-amber-200'} shadow-sm flex flex-col justify-between`}>
      {/* ... (Upar wala header aur status dot ka code waise hi rahega) ... */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${platformStyle}`}>
            {platformCode}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">{platform}</h3>
            <p className="text-sm text-slate-500 font-medium">{handle}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isHealthy ? 'bg-[#3D9970]/10' : 'bg-[#E8912D]/10'}`}>
          <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-[#3D9970]' : 'bg-[#E8912D]'}`}></div>
          <span className={`text-xs font-bold ${isHealthy ? 'text-[#3D9970]' : 'text-[#E8912D]'}`}>
            {isHealthy ? 'Connected' : 'Expiring'}
          </span>
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
         <span className={`text-xs font-bold ${isHealthy ? 'text-slate-400' : 'text-[#E8912D]'}`}>
            {isHealthy ? 'Token is active' : 'Token expiring soon'}
         </span>
         <div className="flex gap-4">
           {!isHealthy && <button className="text-sm text-[#FF6B4A] hover:underline font-bold transition-colors">Reconnect</button>}
           
           {/* NAYA: Disconnect Button Dynamic Link */}
           <button 
             onClick={() => onDisconnect(id)} 
             className="text-sm text-slate-500 hover:text-red-600 font-bold transition-colors"
           >
             Disconnect
           </button>
         </div>
      </div>
    </div>
  );
}

// ISOLATED FUNCTION: Main Social Accounts Management Screen
export default function SocialAccountsPage() {
  const { data: session, status } = useSession();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Dynamic Connected Accounts from Backend
  useEffect(() => {
    const fetchAccounts = async () => {
      // TypeScript Fix: Cast session.user to 'any' to access custom 'id' safely
      const userId = (session?.user as any)?.id;

      if (status === "loading" || !userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/social/accounts?tenantId=${userId}`);
        const data = await res.json();
        if (res.ok) setAccounts(data.accounts);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, [session, status]);

  // NAYA: Disconnect API Call
  const handleDisconnect = async (accountId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to disconnect this account? All scheduled posts for this platform will fail.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/social/accounts/${accountId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        // UI se foran remove kar do
        setAccounts(accounts.filter(acc => acc._id !== accountId));
      } else {
        const data = await res.json();
        alert(data.message || "Account disconnect karne mein masla aya.");
      }
    } catch (error) {
      alert("Network error: Could not disconnect account.");
    }
  };

  // 2. Official OAuth Redirect Handler
  const handleConnect = async (platform: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/social/${platform}/auth-url`);
      const data = await res.json();
      if (res.ok) window.location.href = data.url;
    } catch (error: any) {
      alert(error.message || "Connection URL generate nahi ho saka.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header & Connect Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Social Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your connected platforms and API tokens.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleConnect('instagram')} 
            className="bg-[#FF6B4A] hover:bg-[#E85A38] text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            <span>+</span> Instagram
          </button>
          <button 
            onClick={() => handleConnect('linkedin')} 
            className="bg-[#0F172A] hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            <span>+</span> LinkedIn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dynamic Accounts Rendering */}
        {isLoading ? (
           <div className="col-span-1 md:col-span-2 text-center py-10 text-slate-500 font-medium">Loading connected accounts...</div>
        ) : accounts.length > 0 ? (
           accounts.map((acc) => (
   <ConnectedAccountCard 
        key={acc._id}
         id={acc._id}
         platform={acc.platform}
        handle={acc.accountName}
         status={acc.status}
        onDisconnect={handleDisconnect}
   />
           ))
        ) : (
           <div className="col-span-1 md:col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
              <p className="text-slate-900 font-bold text-lg mb-1">No accounts connected yet.</p>
              <p className="text-sm text-slate-500">Connect a social profile to start publishing content.</p>
           </div>
        )}
        
        {/* COMING SOON CARDS: (Per Scope Document FR-10 / Phase 3) */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed flex flex-col justify-between opacity-60">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400">TK</div>
            <div>
              <h3 className="font-semibold text-slate-500 text-lg">TikTok</h3>
              <p className="text-sm text-slate-400 font-medium">Video publishing</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1.5 rounded-full">Coming in Phase 3</span>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed flex flex-col justify-between opacity-60">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400">X</div>
            <div>
              <h3 className="font-semibold text-slate-500 text-lg">X (Twitter)</h3>
              <p className="text-sm text-slate-400 font-medium">Thread publishing</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1.5 rounded-full">Coming in Phase 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}