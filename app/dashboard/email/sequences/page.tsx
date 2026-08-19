// app/dashboard/email/sequences/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// SCALABILITY FIX: Invisible Scrollbar CSS
const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']";

export default function SequencesListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sequences, setSequences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // STRICT PAGINATION RULE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchSequences = async () => {
    const userId = (session?.user as any)?.id;
    if (status === "loading" || !userId) return;

    try {
      const res = await fetch(`http://localhost:5000/api/sequences?tenantId=${userId}`);
      const data = await res.json();
      if (res.ok) setSequences(data.sequences);
    } catch (error) {
      console.error("Failed to fetch sequences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "loading") fetchSequences();
  }, [session, status]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this sequence? This action cannot be undone.");
    if (!confirmDelete) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/sequences/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) {
        // STRICT RULE: Backend safety lock message will display here
        throw new Error(data.message);
      }
      
      alert(data.message);
      setSequences(sequences.filter(seq => seq._id !== id));
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSequences = sequences.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sequences.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 overflow-x-hidden">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Sequences</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your automated outreach campaigns and follow-ups.</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/email/sequences/create')}
          className="bg-[#FF6B4A] hover:bg-[#e55a39] text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Create New Sequence
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Sequence Name</th>
                <th className="px-6 py-4">Content Mode</th>
                <th className="px-6 py-4">Mailbox Pool</th>
                <th className="px-6 py-4">Created On</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-100 ${hideScrollbar}`}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">Loading sequences...</td>
                </tr>
              ) : currentSequences.length > 0 ? (
                currentSequences.map((seq, index) => (
                  <tr key={seq._id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-6 py-4">
                     <button 
  onClick={() => router.push(`/dashboard/email/sequences/${seq._id}`)} 
  className="font-bold text-slate-900 hover:text-[#FF6B4A] hover:underline transition-colors text-left"
>
  {seq.name}
</button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        seq.aiGenerated ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {seq.aiGenerated ? 'AI Generated' : 'Manual Copy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {seq.mailboxPool?.length || 0} Mailboxes
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                      {new Date(seq.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(seq._id)}
                        className="text-red-500 hover:text-red-700 font-bold transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                     <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-2xl border border-slate-200 shadow-sm">
                            📭
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No Sequences Found</h3>
                        <p className="text-xs font-medium">Create your first sequence to start automating emails.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* STRICT PAGINATION CONTROLS */}
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