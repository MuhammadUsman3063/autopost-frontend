// app/dashboard/email/sequences/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']";

export default function SequenceBuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [selectedMailboxes, setSelectedMailboxes] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // 🌟 NAYA STATE
  
  const [steps, setSteps] = useState([
    { type: 'initial', delayDays: 0, content: '' }
  ]);

  useEffect(() => {
    const fetchMailboxes = async () => {
      const userId = (session?.user as any)?.id;
      if (status === "loading" || !userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/mailboxes?tenantId=${userId}`);
        const data = await res.json();
        if (res.ok) {
          const active = data.mailboxes.filter((mb: any) => mb.status === 'active');
          setMailboxes(active);
        }
      } catch (err) {
        console.error("Failed to fetch mailboxes");
      }
    };
    fetchMailboxes();
  }, [session, status]);

  const toggleMailbox = (id: string) => {
    setSelectedMailboxes(prev => 
      prev.includes(id) ? prev.filter(mbId => mbId !== id) : [...prev, id]
    );
  };

  const updateStepContent = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].content = value;
    setSteps(newSteps);
  };

  const updateStepDelay = (index: number, value: number) => {
    const newSteps = [...steps];
    newSteps[index].delayDays = value;
    setSteps(newSteps);
  };

  const addFollowUp = () => {
    if (steps.length < 4) {
      setSteps([...steps, { type: 'follow-up', delayDays: 3, content: '' }]);
    }
  };

  const removeStep = (indexToRemove: number) => {
    setSteps(steps.filter((_, index) => index !== indexToRemove));
  };

  // 🌟 NAYA: Gemini AI Sequence Auto-Filler
  const handleAutoGenerateAI = async () => {
    if (!name.trim()) return alert("Please enter a Sequence Name (e.g. B2B Marketing Outreach) first.");
    
    setIsGenerating(true);
    setMode('ai'); // Switch to AI mode automatically
    
    try {
      const res = await fetch("http://localhost:5000/api/ai/generate-sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Map AI prompts to our UI state
      const generatedSteps = data.prompts.map((promptText: string, idx: number) => ({
        type: idx === 0 ? 'initial' : 'follow-up',
        delayDays: idx === 0 ? 0 : (idx === 1 ? 2 : 3), // Smart delays: 0, 2, 3, 3
        content: promptText
      }));

      setSteps(generatedSteps);
    } catch (error: any) {
      alert("AI Error: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Sequence Name is required.");
    if (selectedMailboxes.length === 0) return alert("Select at least one mailbox.");
    if (steps.some(s => !s.content.trim())) return alert("All steps must have content/prompts.");

    const userId = (session?.user as any)?.id;
    if (!userId) return;

    setIsSaving(true);
    try {
      const formattedSteps = steps.map((step, index) => ({
        stepNumber: index,
        type: step.type,
        delayDays: step.delayDays,
        template: step.content, 
        prompt: step.content,   
        content: step.content   
      }));

      const res = await fetch("http://localhost:5000/api/sequences/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: userId,
          name,
          mode,
          mailboxPool: selectedMailboxes,
          steps: formattedSteps 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      alert("✅ " + data.message);
      
      // NAYA: Redirect to sequences list after successful save
      router.push('/dashboard/email/sequences');
      
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 overflow-x-hidden relative">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-[#faf8f5] z-20 py-4 border-b border-transparent">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sequence Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Design your outreach flow with automated follow-ups.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#3D9970] hover:bg-[#2d7354] text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
        >
          {isSaving ? "Saving..." : "Save & Activate"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Settings */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            
            {/* Sequence Name */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Sequence Name</label>
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q3 SaaS Outreach" 
                className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
              />
              
              {/* 🌟 NAYA: MAGIC AI BUTTON */}
              <button 
                onClick={handleAutoGenerateAI}
                disabled={isGenerating || !name.trim()}
                className="w-full mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex justify-center items-center gap-2 border border-indigo-100 disabled:opacity-50"
              >
                {isGenerating ? "✨ AI is thinking..." : "✨ Auto-Fill Sequence with AI"}
              </button>
            </div>

            {/* Content Mode */}
            <div className="mb-6 border-t border-slate-100 pt-6">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Content Mode</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setMode('ai')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'ai' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  ✨ AI Generated
                </button>
                <button 
                  onClick={() => setMode('manual')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'manual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  ✍️ Manual Copy
                </button>
              </div>
            </div>

            {/* Sending Mailbox Pool */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Sending Mailbox Pool</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{selectedMailboxes.length} Selected</span>
              </div>
              
              <div className={`max-h-52 overflow-y-auto space-y-2.5 ${hideScrollbar}`}>
                {mailboxes.length > 0 ? mailboxes.map((mb) => (
                  <label key={mb._id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedMailboxes.includes(mb._id) ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:border-indigo-200 hover:bg-slate-50'}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedMailboxes.includes(mb._id)}
                      onChange={() => toggleMailbox(mb._id)}
                      className="accent-indigo-600 w-4 h-4 flex-shrink-0 cursor-pointer" 
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-slate-900 truncate">{mb.smtpConfig.user}</span>
                      <span className="text-[10px] font-bold text-[#3D9970] uppercase tracking-wider mt-0.5">Active (Limit: {mb.dailyLimit}/day)</span>
                    </div>
                  </label>
                )) : (
                  <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium">
                    No active mailboxes found.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Sequence Steps */}
        <div className="lg:col-span-8 space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all relative group">
              
              {/* Step Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#181825] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{index === 0 ? 'Initial Email' : `Follow-up ${index}`}</h3>
                    {index === 0 && <p className="text-xs text-slate-500 font-medium mt-0.5">Sent immediately upon lead upload</p>}
                  </div>
                </div>
                
                {index > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <span className="text-xs font-bold text-slate-500 uppercase">Wait</span>
                      <input 
                        type="number" 
                        min="1" max="30" 
                        value={step.delayDays}
                        onChange={(e) => updateStepDelay(index, Number(e.target.value))}
                        className="w-14 px-2 py-1 text-sm text-center font-bold text-indigo-700 bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-500" 
                      />
                      <span className="text-xs font-bold text-slate-500 uppercase">Days</span>
                    </div>
                    <button 
                      onClick={() => removeStep(index)} 
                      className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Textarea Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  {mode === 'ai' ? '✨ AI Prompt / Instructions' : '✍️ Email Content (Text/HTML)'}
                </label>
                <textarea 
                  value={step.content}
                  onChange={(e) => updateStepContent(index, e.target.value)}
                  placeholder={mode === 'ai' ? "e.g. Write a friendly outreach mentioning their {Company} and how we can help..." : "Hi {FirstName},\n\nI noticed you work at {Company}..."}
                  rows={4}
                  className={`w-full p-4 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all ${hideScrollbar}`}
                />
              </div>
            </div>
          ))}

          {/* Add Follow-up Button */}
          {steps.length < 4 ? (
            <button 
              onClick={addFollowUp}
              className="w-full py-5 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-all"
            >
              <span className="text-xl leading-none">+</span> Add Follow-up Step
            </button>
          ) : (
            <div className="text-center py-4 text-xs font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
              Maximum sequence length reached (Initial + 3 Follow-ups).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}