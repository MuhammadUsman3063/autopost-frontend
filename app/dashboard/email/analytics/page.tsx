// app/dashboard/email/analytics/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']";

export default function EmailAnalyticsPage() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🌟 NAYA: Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchAnalytics = async () => {
      const userId = (session?.user as any)?.id;
      if (status === "loading" || !userId) return;

      try {
        const res = await fetch(`http://localhost:5000/api/email-analytics?tenantId=${userId}`);
        const data = await res.json();
        if (res.ok) setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
    
    const interval = setInterval(() => {
      if (status !== "loading") fetchAnalytics();
    }, 30000);
    return () => clearInterval(interval);
  }, [session, status]);

  // 🌟 NAYA: Dynamic CSV Export Logic (No backend needed)
  const handleExport = () => {
      if (!analytics) return;
      
      const headers = ["Metric", "Value", "Rate"];
      const rows = [
          ["Total Sent", analytics.stats.totalSent, ""],
          ["Opened", analytics.stats.totalOpened, `${analytics.stats.totalSent > 0 ? Math.round((analytics.stats.totalOpened / analytics.stats.totalSent) * 100) : 0}%`],
          ["Replied", analytics.stats.totalReplied, `${analytics.stats.totalSent > 0 ? Math.round((analytics.stats.totalReplied / analytics.stats.totalSent) * 100) : 0}%`],
          ["Bounced", analytics.stats.totalBounced, `${analytics.stats.totalSent > 0 ? Math.round((analytics.stats.totalBounced / analytics.stats.totalSent) * 100) : 0}%`]
      ];

      const csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `AutoPost_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Pagination Logic Calculation
  const totalPages = analytics ? Math.ceil(analytics.mailboxStats.length / itemsPerPage) : 0;
  const currentMailboxes = analytics ? analytics.mailboxStats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 overflow-x-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Track campaign performance, replies, and mailbox health in real-time.</p>
        </div>
        <div className="flex gap-3">
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Data
            </div>
            <button 
              onClick={handleExport}
              className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              📥 Export CSV
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="font-medium text-sm">Crunching the numbers...</p>
        </div>
      ) : analytics ? (
        <>
          {/* OVERVIEW STATS CARDS (More compact design) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Sent */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-10 text-5xl">📤</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-600 text-xs">📤</div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Sent</h3>
              </div>
              <p className="text-3xl font-black text-slate-900">{analytics.stats.totalSent}</p>
            </div>

            {/* Opened */}
            <div className="bg-indigo-600 p-4 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20 text-5xl text-white">👁️</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-indigo-500/50 flex items-center justify-center text-white text-xs">👁️</div>
                <h3 className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider">Opened</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white">{analytics.stats.totalOpened}</p>
                <span className="text-xs font-bold text-indigo-200">
                    {analytics.stats.totalSent > 0 ? Math.round((analytics.stats.totalOpened / analytics.stats.totalSent) * 100) : 0}% Rate
                </span>
              </div>
            </div>

            {/* Replied */}
            <div className="bg-[#3D9970] p-4 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20 text-5xl text-white">💬</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-white text-xs">💬</div>
                <h3 className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">Replied</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-white">{analytics.stats.totalReplied}</p>
                <span className="text-xs font-bold text-emerald-200">
                    {analytics.stats.totalSent > 0 ? Math.round((analytics.stats.totalReplied / analytics.stats.totalSent) * 100) : 0}% Rate
                </span>
              </div>
            </div>

            {/* Bounced */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden hover:border-red-200 transition-colors">
              <div className="absolute top-0 right-0 p-3 opacity-5 text-5xl">⚠️</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-red-50 flex items-center justify-center text-red-500 text-xs">⚠️</div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bounced</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-red-500">{analytics.stats.totalBounced}</p>
                <span className="text-xs font-bold text-slate-400">
                    {analytics.stats.totalSent > 0 ? Math.round((analytics.stats.totalBounced / analytics.stats.totalSent) * 100) : 0}% Rate
                </span>
              </div>
            </div>

          </div>

          {/* MAILBOX HEALTH TABLE with Pagination */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mt-6">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-base font-bold text-slate-900">Mailbox Health & Warm-up</h2>
              </div>
            </div>
            
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-200 grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Mailbox Account</div>
              <div className="col-span-2">Connection Status</div>
              <div className="col-span-3">Daily Volume</div>
              <div className="col-span-2">Warm-up Stage</div>
            </div>

            {/* Table Body (Paginated) */}
            <div className={`overflow-y-auto ${hideScrollbar}`}>
              {currentMailboxes.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {currentMailboxes.map((mb: any, idx: number) => {
                      const limitWarning = mb.sentToday >= mb.dailyLimit;
                      
                      return (
                        <div key={idx} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/80 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                          
                          <div className="col-span-5 flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200 shadow-sm">
                                {mb.email.charAt(0).toUpperCase()}
                             </div>
                             <span className="font-bold text-sm text-slate-900 truncate">{mb.email}</span>
                          </div>

                          <div className="col-span-2">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                mb.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                            }`}>
                              {mb.status}
                            </span>
                          </div>

                          <div className="col-span-3 flex items-center gap-3">
                             <div className="flex-1 max-w-[120px]">
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${limitWarning ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min((mb.sentToday / mb.dailyLimit) * 100, 100)}%` }}
                                    ></div>
                                </div>
                             </div>
                             <span className={`text-[11px] font-bold ${limitWarning ? 'text-amber-600' : 'text-slate-500'}`}>
                                 {mb.sentToday} / {mb.dailyLimit}
                             </span>
                          </div>

                          <div className="col-span-2">
                             <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                                Stage {mb.warmupStage}
                             </span>
                          </div>

                        </div>
                      )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  <h3 className="text-sm font-bold text-slate-900">No Mailboxes Connected</h3>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, analytics.mailboxStats.length)} of {analytics.mailboxStats.length} mailboxes
                    </span>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                            Previous
                        </button>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
          </div>
        </>
      ) : (
         <div className="text-center py-16 text-red-500 font-medium bg-red-50 rounded-2xl border border-red-100">
            Failed to load analytics data.
         </div>
      )}
    </div>
  );
}