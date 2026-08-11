// app/dashboard/settings/general/page.tsx
"use client";

import React, { useState } from "react";

// ISOLATED FUNCTION: Main General Settings & Compliance Screen
export default function GeneralSettingsPage() {
  const [workspaceName, setWorkspaceName] = useState("Dogar's Workspace");
  const [timezone, setTimezone] = useState("GMT+05:00");
  
  // Data Deletion State
  const [deleteInput, setDeleteInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Validation: Delete button sirf tab active hoga jab input "DELETE" match karega
  const handleDelete = () => {
    if (deleteInput === "DELETE") {
      alert("Account deletion process started. Meta data deletion callback triggered.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">General Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage workspace defaults and compliance data.</p>
      </div>

      {/* Basic Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        
        {/* Workspace Name */}
        <div className="p-6 md:flex md:items-start gap-8">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <h3 className="text-sm font-semibold text-slate-900">Workspace Name</h3>
            <p className="text-xs text-slate-500 mt-1">This is visible in the top switcher.</p>
          </div>
          <div className="md:w-2/3">
            <input
              type="text"
              spellCheck="false"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] transition-all"
            />
          </div>
        </div>

        {/* Timezone (Scope Document Requirement) */}
        <div className="p-6 md:flex md:items-start gap-8">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <h3 className="text-sm font-semibold text-slate-900">Default Timezone</h3>
            <p className="text-xs text-slate-500 mt-1">Used for scheduling and calendar display.</p>
          </div>
          <div className="md:w-2/3">
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] appearance-none cursor-pointer"
            >
              <option value="GMT+00:00">London (GMT+00:00)</option>
              <option value="GMT-05:00">New York (GMT-05:00)</option>
              <option value="GMT+05:00">Karachi (GMT+05:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Compliance & Safety (FR-48, NFR-27, Resolves R-07) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Privacy & Compliance</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your data according to GDPR and CCPA rules.</p>
        </div>
        
        {/* Export Data */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Export Workspace Data</h3>
            <p className="text-xs text-slate-500 mt-1">Download a JSON/CSV archive of all posts, settings, and analytics.</p>
          </div>
          <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Request Data Export
          </button>
        </div>

        {/* Delete Account (Danger Zone) */}
        <div className="p-6">
          <div>
            <h3 className="text-sm font-bold text-red-600">Delete Workspace & Data</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Permanently remove this workspace. This will revoke all OAuth tokens (Meta/LinkedIn) and delete all scheduled posts.</p>
          </div>
          
          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Delete Workspace
            </button>
          ) : (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-3 max-w-md">
              <label className="text-xs font-bold text-red-700">Type "DELETE" to confirm</label>
              <input
                type="text"
                spellCheck="false"
                placeholder="DELETE"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full px-4 py-2 text-sm text-slate-900 placeholder-slate-400 bg-white border border-red-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={deleteInput !== "DELETE"}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Confirm Deletion
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}