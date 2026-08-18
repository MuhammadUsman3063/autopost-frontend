// app/dashboard/email/inbox/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']";

export default function ReplyInboxPage() {
  const { data: session, status } = useSession();
  const [repliedLeads, setRepliedLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDraftingAI, setIsDraftingAI] = useState(false); // 🌟 NAYA: AI Loading State
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchReplies = async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/leads/replies?tenantId=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setRepliedLeads(data.leads);
        if (selectedLead) {
          const updatedSelected = data.leads.find((l: any) => l._id === selectedLead._id);
          if (updatedSelected) setSelectedLead(updatedSelected);
        }
      }
    } catch (error) {
      console.error("Fetch replies error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "loading") fetchReplies();
    const interval = setInterval(() => {
      if (status !== "loading") fetchReplies();
    }, 15000); 
    return () => clearInterval(interval);
  }, [session, status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedLead?.conversationThread]);

  // 🌟 NAYA: AI Integration Logic
  const handleDraftAI = async () => {
    if (!selectedLead || !selectedLead.conversationThread || selectedLead.conversationThread.length === 0) {
        alert("No conversation history available for AI to read.");
        return;
    }

    setIsDraftingAI(true);
    setReplyText("✨ AI is reading the thread and drafting a reply...");

    try {
      const res = await fetch("http://localhost:5000/api/ai/draft-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation: selectedLead.conversationThread })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);
      
      // Paste AI draft into the text box
      setReplyText(data.draft);
    } catch (error: any) {
      alert("AI Generation Error: " + error.message);
      setReplyText("");
    } finally {
      setIsDraftingAI(false);
    }
  };

  const handleSendManualReply = async () => {
    if (!replyText.trim() || !selectedLead || isSending) return;
    
    const userId = (session?.user as any)?.id;
    const previousText = replyText;
    setReplyText(""); 
    setIsSending(true);

    try {
      const res = await fetch("http://localhost:5000/api/leads/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: userId, leadId: selectedLead._id, text: previousText })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      
      await fetchReplies();
    } catch (error: any) {
      alert("Error: " + error.message);
      setReplyText(previousText); 
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-slate-50 border-t border-slate-200 overflow-hidden">
      
      {/* LEFT SIDEBAR: Lead List */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col z-10 flex-shrink-0">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <h1 className="text-base font-bold text-slate-900">Reply Inbox</h1>
          <p className="text-[10px] text-slate-500 mt-0.5">Manual follow-ups</p>
        </div>
        
        <div className={`flex-1 overflow-y-auto ${hideScrollbar}`}>
          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-500 font-medium">Loading threads...</div>
          ) : repliedLeads.length > 0 ? (
            repliedLeads.map((lead) => (
              <div 
                key={lead._id}
                onClick={() => setSelectedLead(lead)}
                className={`px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors ${selectedLead?._id === lead._id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900 text-xs truncate pr-2">{lead.firstName} {lead.lastName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0"></span>
                </div>
                <p className="text-[10px] font-medium text-slate-600 truncate">{lead.company}</p>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">{lead.email}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-[11px]">No active conversations.</div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Chat / Conversation Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50 relative overflow-hidden">
        {selectedLead ? (
          <>
            <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5 flex-shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {selectedLead.firstName?.charAt(0) || 'L'}
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">{selectedLead.firstName} {selectedLead.lastName}</h2>
                  <p className="text-[10px] font-medium text-slate-500">{selectedLead.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200 uppercase tracking-wider">
                  Seq: {selectedLead.sequenceId?.name || 'Unknown'}
                </span>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto p-5 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] ${hideScrollbar}`}>
              {selectedLead.conversationThread && selectedLead.conversationThread.length > 0 ? (
                selectedLead.conversationThread.map((msg: any, idx: number) => (
                  <div key={idx} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-end gap-2 max-w-[80%]">
                      {msg.sender === 'lead' && (
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600 flex-shrink-0">
                          {selectedLead.firstName?.charAt(0)}
                        </div>
                      )}
                      
                      <div className={`px-3 py-2.5 rounded-2xl shadow-sm text-xs whitespace-pre-wrap leading-relaxed font-medium ${
                        msg.sender === 'admin' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-bold px-7">
                      {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-full">
                  <div className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 text-[10px] font-medium text-slate-500">
                    No conversation history available.
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col gap-2">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your manual reply here..."
                  disabled={isDraftingAI}
                  className={`w-full h-16 p-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all ${hideScrollbar} ${isDraftingAI ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendManualReply();
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <button 
                    onClick={handleDraftAI}
                    disabled={isDraftingAI}
                    className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDraftingAI ? '✨ Drafting...' : '✨ Draft AI Reply'}
                  </button>
                  <button 
                    onClick={handleSendManualReply}
                    disabled={!replyText.trim() || isSending || isDraftingAI}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSending ? 'Sending...' : 'Send'}
                    <span className="text-[9px] bg-indigo-500 px-1 rounded text-indigo-100 ml-0.5">↵ Enter</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 text-2xl border border-slate-200 shadow-sm">
              💬
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">No Conversation Selected</h3>
            <p className="text-xs font-medium">Click on a lead from the sidebar to view the email thread.</p>
          </div>
        )}
      </div>
    </div>
  );
}