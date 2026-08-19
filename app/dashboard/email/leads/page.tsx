// app/dashboard/email/leads/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']";

export default function LeadsUploadPage() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  const [sequences, setSequences] = useState<any[]>([]);
  const [sequenceId, setSequenceId] = useState(""); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSequences = async () => {
      const userId = (session?.user as any)?.id;
      if (status === "loading" || !userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/sequences?tenantId=${userId}`);
        const data = await res.json();
        if (res.ok && data.sequences.length > 0) {
          setSequences(data.sequences);
          setSequenceId(data.sequences[0]._id); 
        }
      } catch (err) {
        console.error("Failed to fetch sequences");
      }
    };
    fetchSequences();
  }, [session, status]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
 
// ISOLATED FUNCTION: Strict Client-Side File Validation
const validateAndSetFile = (selectedFile: File) => {
    const MAX_SIZE_MB = 2;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (selectedFile.size > MAX_SIZE_BYTES) {
        // STRICT RULE APPLIED: Professional English Error
        alert(`File is too large. Maximum allowed size is ${MAX_SIZE_MB}MB. Please split your list and try again.`);
        return;
    }
    
    setFile(selectedFile);
    setUploadResult(null); // Clear previous results
};

const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); 
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndSetFile(e.dataTransfer.files[0]);
    }
};

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        validateAndSetFile(e.target.files[0]);
    }
};
  
  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 🌟 NAYA: On-the-fly CSV Template Generator (No backend required)
  const handleDownloadTemplate = () => {
    const headers = ["Email", "FirstName", "LastName", "Company", "JobTitle", "PersonalizationNote"];
    const sampleData = ["ceo@example.com", "Ali", "Raza", "Tech Corp", "CEO", "Saw your recent funding news!"];
    
    // Join columns with commas and rows with newlines
    const csvContent = headers.join(",") + "\n" + sampleData.join(",");
    
    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "AutoPost_Leads_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file || !sequenceId) {
      alert("Please select a file and a sequence.");
      return;
    }
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tenantId", userId);
    formData.append("sequenceId", sequenceId);

    try {
      const res = await fetch("http://localhost:5000/api/leads/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "File upload failed. Please verify the template format.");
      
      setUploadResult(data);
      setFile(null); 
    } catch (error: any) {
      console.error("Upload Error:", error);
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upload Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Import your lead lists via CSV or Excel to enroll them in email sequences.</p>
        </div>
        
        {/* 🌟 NAYA: Connected Download Function */}
        <button 
          onClick={handleDownloadTemplate}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center gap-2 border border-indigo-100"
        >
          📄 Download Template
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Upload Form */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <h2 className="text-base font-bold text-slate-900 mb-5">Select File & Sequence</h2>
            
            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <div 
                onDragOver={handleDragOver} 
                onDragLeave={handleDragLeave} 
                onDrop={handleDrop} 
                onClick={() => !file && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 md:p-12 transition-all flex flex-col items-center justify-center relative ${
                  file ? "border-indigo-200 bg-white cursor-default" : 
                  isDragging ? "border-indigo-500 bg-indigo-50" : 
                  "border-slate-300 hover:border-indigo-400 hover:bg-slate-50 bg-slate-50/50 cursor-pointer"
                }`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" />
                
                {file ? (
                  <div className="w-full flex items-center justify-between bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-12 h-12 bg-white shadow-sm border border-indigo-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                        📊
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleClearFile}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove file"
                    >
                      ✖
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`w-16 h-16 shadow-sm border rounded-full flex items-center justify-center mb-4 text-2xl transition-colors ${isDragging ? "bg-indigo-100 border-indigo-200" : "bg-white border-slate-200"}`}>
                      📁
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1 text-center">
                      {isDragging ? "Drop file here..." : "Click or drag file to this area to upload"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium text-center">Support for CSV or XLSX files up to 5MB</p>
                  </>
                )}
              </div>

              {/* Sequence Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign to Email Sequence</label>
                <select 
                  value={sequenceId}
                  onChange={(e) => setSequenceId(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                >
                  {sequences.length > 0 ? sequences.map(seq => (
                    <option key={seq._id} value={seq._id}>{seq.name}</option>
                  )) : (
                    <option value="">No sequences found. Create one first.</option>
                  )}
                </select>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleUpload} 
                disabled={!file || isUploading || !sequenceId} 
                className="bg-[#181825] hover:bg-black text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
              >
                {isUploading ? "Processing File..." : "Upload & Validate Leads"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Upload Results or Rules */}
        <div className="xl:col-span-1 space-y-6">
          {uploadResult ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4">
              <h3 className="text-base font-bold text-slate-900 mb-5">Upload Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-sm font-medium text-slate-600">Total Rows Detected</span>
                  <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{uploadResult.summary.total}</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-[#3D9970]/5 rounded-xl border border-[#3D9970]/20">
                  <span className="text-sm font-bold text-[#3D9970]">Successfully Enrolled</span>
                  <span className="text-sm font-black text-[#3D9970] bg-white px-3 py-1 rounded-lg shadow-sm border border-[#3D9970]/10">{uploadResult.summary.accepted}</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-amber-50 rounded-xl border border-amber-200/50">
                  <span className="text-sm font-bold text-amber-600">Rejected / Duplicates</span>
                  <span className="text-sm font-black text-amber-600 bg-white px-3 py-1 rounded-lg shadow-sm border border-amber-100">{uploadResult.summary.rejected}</span>
                </div>
              </div>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Error Log</h4>
                  <div className={`bg-red-50 p-4 rounded-xl border border-red-100 max-h-48 overflow-y-auto ${hideScrollbar}`}>
                    <ul className="list-disc pl-4 space-y-1.5">
                      {uploadResult.errors.map((err: string, index: number) => (
                        <li key={index} className="text-[11px] font-medium text-red-600 leading-relaxed">{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">💡</span>
                <h3 className="text-sm font-bold text-slate-900">Formatting Rules</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Ensure your file includes an <strong className="text-slate-900">Email</strong> column. Optional columns for personalization include:
              </p>
              <ul className="text-xs text-slate-500 font-medium space-y-2 pl-2 mb-6">
                <li>• FirstName</li>
                <li>• LastName</li>
                <li>• Company</li>
                <li>• JobTitle</li>
                <li>• PersonalizationNote</li>
              </ul>
              <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-[11px] text-indigo-700 font-medium leading-relaxed">
                <span className="font-bold block mb-1">Anti-Spam Protection</span>
                Duplicates within the same sequence will be automatically skipped to protect your sender reputation.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}