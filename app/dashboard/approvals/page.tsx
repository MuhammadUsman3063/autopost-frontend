// app/dashboard/approvals/page.tsx
"use client";

import React, { useState } from "react";

// ISOLATED FUNCTION: Approval Card Component
function ApprovalCard({ platform, content, clientName, time }: any) {
  const [isAutoPublish, setIsAutoPublish] = useState(false);
  
  // Validation Rule Applied: Reject reason must be alphanumeric & sensible (no random symbols)
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleRejectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strict Validation: Sirf Alphabets, Numbers aur basic punctuation allow karega
    const regex = /^[a-zA-Z0-9\s.,!?]*$/;
    if (regex.test(e.target.value)) {
      setRejectReason(e.target.value);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors flex flex-col gap-4">
      
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
            platform === 'IG' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'
          }`}>
            {platform}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{clientName}</h3>
            <p className="text-xs text-slate-500">Scheduled for: {time}</p>
          </div>
        </div>
        
        {/* Scope Document Requirement: Auto-publish Toggle (Resolves R-06) */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className="text-xs font-medium text-slate-600">Auto-publish:</span>
          <button 
            onClick={() => setIsAutoPublish(!isAutoPublish)}
            className={`w-8 h-4 rounded-full relative transition-colors ${isAutoPublish ? 'bg-[#3D9970]' : 'bg-slate-300'}`}
          >
            <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${isAutoPublish ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {/* Reject Input (Visible only if Reject is clicked) */}
      {showRejectInput && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Type reason for rejection (alphanumeric only)..."
            value={rejectReason}
            onChange={handleRejectChange}
            spellCheck="false"
            className="flex-1 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 bg-white border border-slate-300 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
            Confirm
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
        <button className="text-sm text-slate-500 hover:text-slate-900 font-medium px-4 py-2 bg-slate-50 rounded-lg transition-colors">
          Edit Draft
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowRejectInput(!showRejectInput)}
            className="text-sm text-red-500 hover:bg-red-50 font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Reject
          </button>
          <button className="text-sm text-white bg-[#3D9970] hover:bg-[#2d7a59] font-medium px-6 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
            <span>✓</span> Approve
          </button>
        </div>
      </div>

    </div>
  );
}

// ISOLATED FUNCTION: Main Approvals Queue Screen
export default function ApprovalsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          Approval Queue
          <span className="bg-[#E8912D]/10 text-[#E8912D] text-xs px-2.5 py-1 rounded-full font-bold">7 Pending</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Review AI-generated drafts before they go live on client accounts.</p>
      </div>

      {/* Queue List */}
      <div className="space-y-6">
        <ApprovalCard 
          platform="IN"
          clientName="Northbeam Studio"
          time="Tomorrow at 9:00 AM"
          content={"Leadership isn't just about guiding a team; it's about empowering them to make decisions.\n\nHere are 3 frameworks we use at Northbeam to ensure our engineers have the autonomy they need to build great products.\n\n#Leadership #EngineeringCulture"}
        />
        
        <ApprovalCard 
          platform="IG"
          clientName="Lumen Retail"
          time="Thursday at 6:00 PM"
          content={"Summer capsule drop is finally here! ☀️\n\nWe've been teasing this for weeks, and we're so excited to share 3 looks we absolutely love for the upcoming heatwave.\n\nLink in bio to shop the collection before it sells out! 🛍️\n\n#SummerFashion #LumenRetail #CapsuleWardrobe"}
        />
      </div>

    </div>
  );
}