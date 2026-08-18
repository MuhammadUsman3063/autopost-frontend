// app/dashboard/email/suppression/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// 🌟 SCALABILITY FIX: Invisible Scrollbar
const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']";

export default function SuppressionListPage() {
  const { data: session, status } = useSession();
  const [suppressions, setSuppressions] = useState<any[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [reasonInput, setReasonInput] = useState("manual");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchSuppressions = async () => {
      const userId = (session?.user as any)?.id;
      if (status === "loading" || !userId) return;
      
      try {
        const res = await fetch(`http://localhost:5000/api/suppressions?tenantId=${userId}`);
        const data = await res.json();
        if (res.ok) setSuppressions(data.suppressions);
      } catch (error) {
        console.error("Failed to fetch suppression list:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuppressions();
  }, [session, status]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = (session?.user as any)?.id;
    if (!emailInput || !userId) return;

    setIsAdding(true);
    try {
      const res = await fetch("http://localhost:5000/api/suppressions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: userId, email: emailInput, reason: reasonInput })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      setSuppressions([data.suppression, ...suppressions]);
      setEmailInput("");
      setReasonInput("manual"); // Reset to default
      // Optional: Add a small toast notification here instead of alert for better UX
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm("Remove this email from the blocklist? It will be eligible for future campaigns.")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/suppressions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuppressions(suppressions.filter(s => s._id !== id));
      } else {
        const data = await res.json();
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Error: Failed to remove the email.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 overflow-x-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppression List</h1>
          <p className="text-sm text-slate-500 mt-1">Manage unsubscribed or bounced emails. The system will auto-block these addresses.</p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-200 text-xs font-bold flex items-center gap-2">
          <span>⚠️</span> Protects Domain Reputation
        </div>
      </div>

      {/* ADD TO LIST FORM (Inline Layout for compactness) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Block New Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">✉️</span>
              <input 
                type="email" 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)} 
                spellCheck="false" 
                placeholder="name@company.com" 
                className="w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors" 
              />
            </div>
          </div>
          <div className="w-full md:w-56">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason</label>
            <select 
              value={reasonInput} 
              onChange={(e) => setReasonInput(e.target.value)} 
              className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 appearance-none cursor-pointer transition-colors"
            >
              <option value="manual">Manual Block</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced (Invalid)</option>
            </select>
          </div>
          <button 
            type="submit"
            disabled={!emailInput || isAdding} 
            className="bg-[#181825] hover:bg-black text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-70 flex-shrink-0 h-[46px]"
          >
            {isAdding ? "Adding..." : "Add to Blocklist"}
          </button>
        </form>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden flex flex-col">
        {/* Table Header (Fixed) */}
        <div className="bg-slate-50 border-b border-slate-200 grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-5">Email Address</div>
          <div className="col-span-3">Reason / Source</div>
          <div className="col-span-3">Date Added</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Table Body (Scrollable with Invisible Scrollbar) */}
        <div className={`overflow-y-auto max-h-[500px] ${hideScrollbar}`}>
          {isLoading ? (
            <div className="p-10 text-center text-sm text-slate-500 font-medium">Loading suppression list...</div>
          ) : suppressions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {suppressions.map((s, index) => (
                <div key={s._id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/80 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  
                  {/* Email Col */}
                  <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 text-sm border border-slate-200 shadow-sm">
                      {s.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-900 truncate">{s.email}</span>
                  </div>

                  {/* Reason Col */}
                  <div className="col-span-3">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                      s.reason === 'bounced' ? 'bg-red-100 text-red-700 border border-red-200' : 
                      s.reason === 'unsubscribed' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {s.reason}
                    </span>
                  </div>

                  {/* Date Col */}
                  <div className="col-span-3 text-sm text-slate-500 font-medium">
                    {new Date(s.addedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>

                  {/* Action Col */}
                  <div className="col-span-1 text-right">
                    <button 
                      onClick={() => handleRemove(s._id)} 
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-lg"
                      title="Remove from blocklist"
                    >
                      ✖
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-2xl border border-slate-100 shadow-sm">
                🛡️
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Your list is clean</h3>
              <p className="text-xs font-medium">No emails have been bounced or blocked yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}