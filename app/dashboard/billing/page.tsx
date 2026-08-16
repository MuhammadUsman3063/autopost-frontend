"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from 'next/navigation';

// ISOLATED FUNCTION: Usage Progress Bar (FR-41)
function UsageMeter({ title, used, limit, unit }: { title: string, used: number, limit: number, unit: string }) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = percentage > 80;
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-end mb-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <span className="text-sm font-medium text-slate-600">
          {used} / {limit === 999999 ? 'Unlimited' : limit} {unit}
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-[#E8912D]' : 'bg-[#3D9970]'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {isNearLimit && <p className="text-xs text-[#E8912D] mt-3 font-bold">Approaching limit. Consider upgrading.</p>}
    </div>
  );
}

// ISOLATED FUNCTION: Pricing Card with Dynamic Upgrade Logic (FR-39)
function PricingCard({ name, price, posts, aiCredits, isCurrent, onUpgrade, isLoading }: any) {
  return (
    <div className={`p-6 rounded-2xl border ${isCurrent ? 'border-[#FF6B4A] shadow-md relative' : 'border-slate-200 shadow-sm'} bg-white flex flex-col`}>
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6B4A] text-white text-xs font-bold px-3 py-1 rounded-full">
          CURRENT PLAN
        </span>
      )}
      <h3 className="text-lg font-bold text-slate-900">{name}</h3>
      <div className="mt-2 mb-4">
        <span className="text-3xl font-black text-slate-900">${price}</span>
        <span className="text-slate-500 text-sm font-medium">/month</span>
      </div>
      <ul className="space-y-3 mb-6 flex-1">
        <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
          <span className="text-[#3D9970] font-bold">✓</span> {posts} Posts / month
        </li>
        <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">
          <span className="text-[#3D9970] font-bold">✓</span> {aiCredits} AI Credits
        </li>
      </ul>
      <button
        onClick={() => onUpgrade(name)}
        disabled={isCurrent || isLoading}
        className={`w-full py-2.5 rounded-xl font-bold transition-colors ${
          isCurrent 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-[#181825] text-white hover:bg-black disabled:opacity-70'
        }`}
      >
        {isCurrent ? 'Current Plan' : isLoading ? 'Processing...' : 'Upgrade Plan'}
      </button>
    </div>
  );
}

// ISOLATED FUNCTION: Main Billing Screen
export default function BillingPage() {
  const { data: session, status } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // 2. ROUTER AUR SEARCH PARAMS INITIALIZE KARO
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Dynamic States
  const [subData, setSubData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]); // 100% REAL DYNAMIC STATE (No Mock Data)
  const [isLoading, setIsLoading] = useState(true);

  // Pagination States for Invoices
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 5;

  // Pagination Logic Math
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = invoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil(invoices.length / invoicesPerPage);

 // 3. USE-EFFECT MEIN SUCCESS LOGIC ADD KARO
  useEffect(() => {
    const fetchUsage = async () => {
      const userId = (session?.user as any)?.id;
      if (status === "loading" || !userId) return;
      
      try {
       const res = await fetch(`http://localhost:5000/api/billing/subscription?tenantId=${userId}`);
        const data = await res.json();
        if (res.ok) {
           setSubData(data.subscription);
           
           // NAYA: Backend se aane wali invoices ko state mein save karo
           setInvoices(data.invoices || []);
        }
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();

    // 🌟 NAYI LOGIC: URL CHECKER AUR AUTO-REFRESH
    const isSuccess = searchParams.get('success');
    if (isSuccess === 'true') {
      // Thora wait karo taake backend DB update kar le, phir refresh karo
      setTimeout(() => {
        fetchUsage(); // UI Update
        router.replace('/dashboard/billing'); // URL se ?success=true hata do
      }, 2000);
    }

  }, [session, status, searchParams, router]);

  // 2. Stripe Checkout Redirect Handler
  const handleUpgradePlan = async (planType: string) => {
    const userId = (session?.user as any)?.id;

    if (!userId) {
      alert("Session load ho raha hai, please wait...");
      return;
    }

    setLoadingPlan(planType);
    try {
      const res = await fetch("http://localhost:5000/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: planType,
          workspaceId: userId
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout session fail ho gaya");

      window.location.href = data.url;

    } catch (error: any) {
      console.error("Upgrade Error:", error.message);
      alert(error.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500 font-bold animate-pulse">Loading billing data...</div>;
  }

  // Dynamic values safe access
  const currentPlan = subData?.planType || 'Starter';
  const aiUsed = subData?.aiCreditsUsed || 0;
  const aiLimit = subData?.aiCreditsLimit || 500;
  const postsUsed = subData?.postsUsed || 0;
  const postsLimit = subData?.postsLimit || 50;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing & Usage</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your subscription, track usage, and view invoices.</p>
      </div>

      {/* DYNAMIC Usage Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UsageMeter title="Monthly Posts" used={postsUsed} limit={postsLimit} unit="posts" />
        <UsageMeter title="AI Generation Credits" used={aiUsed} limit={aiLimit} unit="credits" />
      </div>

      {/* DYNAMIC Subscription Plans */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PricingCard 
            name="Starter" price="0" posts="50" aiCredits="500" 
            isCurrent={currentPlan === 'Starter'} onUpgrade={handleUpgradePlan} isLoading={loadingPlan === 'Starter'} 
          />
          <PricingCard 
            name="Pro" price="29" posts="500" aiCredits="2000" 
            isCurrent={currentPlan === 'Pro'} onUpgrade={handleUpgradePlan} isLoading={loadingPlan === 'Pro'} 
          />
          <PricingCard 
            name="Agency" price="99" posts="Unlimited" aiCredits="10000" 
            isCurrent={currentPlan === 'Agency'} onUpgrade={handleUpgradePlan} isLoading={loadingPlan === 'Agency'} 
          />
        </div>
      </div>

      {/* Invoice History */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Invoice History</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Invoice Number</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-900 font-medium">{inv.date}</td>
                      <td className="px-6 py-4 text-[#FF6B4A] hover:underline cursor-pointer font-bold">{inv.id}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{inv.amount}</td>
                      <td className="px-6 py-4">
                        <span className="bg-[#3D9970]/10 text-[#3D9970] px-3 py-1 rounded-md text-xs font-bold">{inv.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500 font-medium">
                      No invoices found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              <span className="text-sm font-medium text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-100 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}