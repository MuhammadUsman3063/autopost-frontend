// app/dashboard/settings/team/page.tsx
"use client";

import React, { useState } from "react";

// ISOLATED FUNCTION: Pagination Component (Prevents UI Overflow)
function PaginationControls({ currentPage, totalPages, totalItems }: { currentPage: number, totalPages: number, totalItems: number }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
      <div className="flex items-center">
        <p className="text-sm text-slate-500">
          Showing <span className="font-bold text-slate-900">1</span> to <span className="font-bold text-slate-900">5</span> of <span className="font-bold text-slate-900">{totalItems}</span> members
        </p>
      </div>
      <div className="flex gap-2">
        <button 
          disabled={currentPage === 1}
          className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button 
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ISOLATED FUNCTION: Team Member Row
function TeamMemberRow({ name, email, role, lastActive }: { name: string, email: string, role: string, lastActive: string }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#181825] text-white flex items-center justify-center text-xs font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{name}</p>
            <p className="text-xs text-slate-500">{email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          role === 'Owner' ? 'bg-[#FF6B4A]/10 text-[#FF6B4A]' : 'bg-slate-100 text-slate-600'
        }`}>
          {role}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-500">{lastActive}</td>
      <td className="px-6 py-4 text-right">
        {role !== 'Owner' && (
          <button className="text-slate-400 hover:text-slate-900 font-bold transition-colors">•••</button>
        )}
      </td>
    </tr>
  );
}

// ISOLATED FUNCTION: Main Team & Roles Screen
export default function TeamRolesPage() {
  const [emailInput, setEmailInput] = useState("");
  
  // Validation: Simple UI check for empty emails
  const handleInvite = () => {
    if(!emailInput) return;
    alert("Invite sent to: " + emailInput);
    setEmailInput("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team & Roles</h1>
          <p className="text-sm text-slate-500 mt-1">Manage workspace access and permissions.</p>
        </div>
      </div>

      {/* Invite Member Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-slate-900 mb-2">Invite new member</label>
          <input
            type="email"
            spellCheck="false"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="colleague@agency.com"
            className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-bold text-slate-900 mb-2">Role</label>
          <select className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] appearance-none cursor-pointer">
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button 
          onClick={handleInvite}
          disabled={!emailInput}
          className="w-full md:w-auto bg-[#181825] hover:bg-black disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
        >
          Send Invite
        </button>
      </div>

      {/* Team Members List with Pagination */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Active Members</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <TeamMemberRow name="Usman" email="usman@example.com" role="Owner" lastActive="Just now" />
              <TeamMemberRow name="Priya Nair" email="priya@northbeam.com" role="Editor" lastActive="2 hours ago" />
              <TeamMemberRow name="Marcus Webb" email="marcus@northbeam.com" role="Viewer" lastActive="1 day ago" />
              <TeamMemberRow name="Sarah Chen" email="sarah@northbeam.com" role="Admin" lastActive="3 days ago" />
              <TeamMemberRow name="David Kim" email="david@northbeam.com" role="Editor" lastActive="1 week ago" />
            </tbody>
          </table>
        </div>

        {/* Tumhari Pagination Rule Yahan Apply Hui Hai */}
        <PaginationControls currentPage={1} totalPages={3} totalItems={14} />
      </div>

    </div>
  );
}