// app/dashboard/email/sequences/[id]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

// SCALABILITY FIX: Invisible Scrollbar CSS
const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']";

export default function SequenceDetailsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const sequenceId = params.id as string;

  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStoppingAll, setIsStoppingAll] = useState(false);

  // STRICT PAGINATION RULE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Thori zyada leads dikhayenge per page

  const fetchLeads = async () => {
    const userId = (session?.user as any)?.id;
    if (status === "loading" || !userId) return;

    try {
      const res = await fetch(`http://localhost:5000/api/leads/sequence/${sequenceId}?tenantId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "loading") fetchLeads();
  }, [session, status]);

  // ISOLATED FUNCTION: Stop Single Lead
  const handleStopLead = async (leadId: string) => {
    const confirmStop = window.confirm("Are you sure you want to stop sending emails to this lead?");
    if (!confirmStop) return;

    try {
      const res = await fetch(`http://localhost:5000/api/leads/${leadId}/stop`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Update UI instantly
      setLeads(leads.map(lead => lead._id === leadId ? { ...lead, status: 'suppressed' } : lead));
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  // ISOLATED FUNCTION: Bulk Kill Switch
  const handleStopAll = async () => {
    const confirmStop = window.confirm("WARNING: This will stop automated emails for ALL active leads in this sequence. Proceed?");
    if (!confirmStop) return;

    const userId = (session?.user as any)?.id;
    setIsStoppingAll(true);

    try {
      const res = await fetch(`http://localhost:5000/api/leads/sequence/${sequenceId}/stop-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      alert(data.message);
      fetchLeads(); // Refresh list to show updated statuses
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsStoppingAll(false);
    }
  };

  // Stats Calculation
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => l.status === 'active').length;
  const repliedLeads = leads.filter(l => l.status === 'replied').length;

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = leads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 overflow-x-hidden">
      {/* HEADER & KILL SWITCH */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button onClick={() => router.back()} className="text-sm font-bold text-[#FF6B4A] hover:underline mb-2 flex items-center gap-1">
            ← Back to Sequences
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Sequence Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor and manage individual leads enrolled in this campaign.</p>
        </div>
        
        {activeLeads > 0 && (
          <button
            onClick={handleStopAll}
            disabled={isStoppingAll}
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {isStoppingAll ? "Stopping..." : "Stop All Active Leads"}
          </button>
        )}
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Enrolled</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalLeads}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Currently Active</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{activeLeads}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Replied (Auto-Stopped)</p>
          <p className="text-2xl font-black text-[#3D9970] mt-1">{repliedLeads}</p>
        </div>
      </div>

      {/* LEADS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Lead Info</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Current Step</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 ${hideScrollbar}`}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">Loading leads...</td>
                </tr>
              ) : currentLeads.length > 0 ? (
                currentLeads.map((lead, index) => (
                  <tr key={lead._id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{lead.firstName} {lead.lastName}</p>
                      <p className="text-xs text-slate-500 font-medium">{lead.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{lead.company || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">Step {lead.currentStep}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        lead.status === 'active' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        lead.status === 'replied' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {lead.status === 'active' ? (
                        <button
                          onClick={() => handleStopLead(lead._id)}
                          className="text-red-500 hover:text-red-700 font-bold transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs"
                        >
                          Stop
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500 font-medium">No leads enrolled in this sequence yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
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
  );
}