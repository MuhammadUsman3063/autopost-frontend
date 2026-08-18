// app/dashboard/email/mailboxes/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function MailboxesPage() {
  const { data: session, status } = useSession();
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState(465);
  const [imapHost, setImapHost] = useState("imap.gmail.com");
  const [imapPort, setImapPort] = useState(993);

  const fetchMailboxes = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/mailboxes?tenantId=${userId}`);
      const data = await res.json();
      if (res.ok) setMailboxes(data.mailboxes);
    } catch (error) {
      console.error("Fetch mailboxes error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "loading") fetchMailboxes();
  }, [session, status]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    setIsVerifying(true);
    try {
      const payload = {
        tenantId: userId,
        email, appPassword, smtpHost, smtpPort, imapHost, imapPort
      };

      const res = await fetch("http://localhost:5000/api/mailboxes/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ " + data.message);
      
      // Reset Form and Hide it
      setEmail(""); setAppPassword(""); setShowForm(false);
      await fetchMailboxes(); // Refresh list

    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Mailboxes</h1>
          <p className="text-sm text-slate-500 mt-1">Connect and verify your sending accounts for outreach campaigns.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#FF6B4A] hover:bg-[#e55a39] text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          {showForm ? "Cancel" : "+ Add New Mailbox"}
        </button>
      </div>

      {/* CONNECT FORM (Collapsible) */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Connect New Account</h2>
            <p className="text-xs text-slate-500 mt-1">Use Google App Passwords for Gmail accounts.</p>
          </div>
          
          <form onSubmit={handleConnect} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full px-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">App Password</label>
                <input type="password" required value={appPassword} onChange={(e) => setAppPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SMTP Host</label>
                <input type="text" required value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="w-full px-4 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SMTP Port</label>
                <input type="number" required value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} className="w-full px-4 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">IMAP Host</label>
                <input type="text" required value={imapHost} onChange={(e) => setImapHost(e.target.value)} className="w-full px-4 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">IMAP Port</label>
                <input type="number" required value={imapPort} onChange={(e) => setImapPort(Number(e.target.value))} className="w-full px-4 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#FF6B4A]" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isVerifying} className="bg-[#181825] hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                {isVerifying ? "Verifying Credentials..." : "Verify & Connect Mailbox"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MAILBOXES GRID SECTION */}
      <div>
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading connected mailboxes...</div>
        ) : mailboxes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mailboxes.map((mb) => {
              // Calculate Progress Bar Width
              const progressPercentage = Math.min((mb.sentToday / mb.dailyLimit) * 100, 100);
              
              return (
                <div key={mb._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow flex flex-col gap-5">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg uppercase shadow-sm">
                        {mb.smtpConfig.user.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-sm font-bold text-slate-900 truncate" title={mb.smtpConfig.user}>
                          {mb.smtpConfig.user}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`w-2 h-2 rounded-full ${mb.status === 'active' ? 'bg-[#3D9970]' : 'bg-red-500'}`}></span>
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${mb.status === 'active' ? 'text-[#3D9970]' : 'text-red-500'}`}>
                            {mb.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Limits & Progress */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Daily Capacity</p>
                        <p className="text-sm font-black text-slate-900">{mb.sentToday} <span className="text-slate-400 font-medium text-xs">/ {mb.dailyLimit} sent</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Warm-up</p>
                        <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Stage {mb.warmupStage}</p>
                      </div>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${progressPercentage > 90 ? 'bg-red-500' : progressPercentage > 75 ? 'bg-amber-500' : 'bg-[#3D9970]'}`} 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-3xl border border-slate-100 shadow-sm">
              📬
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No Mailboxes Connected</h3>
            <p className="text-sm font-medium mb-6">Start by connecting your first sending account.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-[#181825] hover:bg-black text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              Connect Mailbox
            </button>
          </div>
        )}
      </div>

    </div>
  );
}