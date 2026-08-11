"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PostEditorPage() {
  const { data: session } = useSession(); // NAYA: NextAuth Session Hook
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('editId');

  // --- States ---
  const [prompt, setPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [previewPlatform, setPreviewPlatform] = useState("IG");
  
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Edit Flow States
  const [originalText, setOriginalText] = useState(""); 
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  
  // Cooldown States (For 20-second debounce)
  const [isCooldown, setIsCooldown] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Constants for Limits
  const MAX_PROMPT_LENGTH = 500;
  const MAX_POST_LENGTH = 3000;

  // --- Effect: Load Existing Post for Edit ---
  useEffect(() => {
    if (editId) {
      setIsLoadingPost(true);
      const fetchPost = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/posts/${editId}`);
          const data = await res.json();
          if (res.ok) {
            setGeneratedText(data.post.textContent);
            setOriginalText(data.post.textContent);
            setPreviewPlatform(data.post.platform);
          }
        } catch (error) {
          console.error("Failed to load post for editing");
        } finally {
          setIsLoadingPost(false);
        }
      };
      fetchPost();
    }
  }, [editId]);

  // --- Action: Generate AI Content ---
  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedText(""); 
    
    try {
      const res = await fetch("http://localhost:5000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          tone: selectedTone,
          platform: previewPlatform
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Content generate karne mein masla aya.");

      // Enforce 3000 char limit on AI response just in case
      const finalText = data.content.substring(0, MAX_POST_LENGTH);
      setGeneratedText(finalText);
    } catch (error: any) {
      alert(error.message); 
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Action: Save New Post ---
  const handleSavePost = async () => {
    if (!generatedText) return;
    if (isCooldown) {
      alert(`Please wait ${countdown} seconds before saving again.`);
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      // Pura fetch call wahi rahega, sirf tenantId change hoga
        body: JSON.stringify({
          tenantId: (session?.user as { id?: string } | undefined)?.id || "64780c4aa5982c6c50fe5141", // NAYA: Real ID jayegi (fallback test id for safety)
          content: generatedText,
          platform: previewPlatform,
          status: "Draft" 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Post save nahi ho saki.");

      alert("🎉 " + data.message);
      
      setIsCooldown(true);
      let timeLeft = 20;
      setCountdown(timeLeft);
      
      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timer);
          setIsCooldown(false);
        }
      }, 1000);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Action: Update Existing Post ---
  const handleUpdatePost = async () => {
    if (!generatedText || !editId) return;
    setIsSaving(true);

    try {
      const res = await fetch(`http://localhost:5000/api/posts/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: generatedText,
          platform: previewPlatform
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Post update nahi ho saki.");

      alert("🎉 " + data.message);
      setOriginalText(generatedText); 
      router.push('/dashboard/library'); 

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Editor Controls */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {editId ? "Edit Post" : "Generate Post"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Tell the AI what you want to post about.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6 relative">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-700">Topic or Prompt</label>
              <span className={`text-xs font-medium ${prompt.length >= MAX_PROMPT_LENGTH ? 'text-red-500' : 'text-slate-400'}`}>
                {prompt.length} / {MAX_PROMPT_LENGTH}
              </span>
            </div>
            
          <textarea
              value={prompt}
              maxLength={MAX_PROMPT_LENGTH}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Announcing our new Q3 product lineup..."
              // TEXT COLOR FIX: text-slate-900 add kiya gaya ha taake input dark ho
              className="w-full h-32 p-4 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] resize-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Tone of Voice</label>
            <div className="flex flex-wrap gap-3">
              {["Professional", "Casual", "Playful", "Bold"].map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTone === tone
                      ? "bg-[#FF6B4A] text-white shadow-md shadow-[#FF6B4A]/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full py-3.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isGenerating ? "✨ Generating Magic..." : "✨ Generate Content"}
          </button>
        </div>
      </div>

      {/* Right Column: Live Preview & Actions */}
      <div className="lg:pl-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 tracking-wider">LIVE PREVIEW</span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setPreviewPlatform("IG")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                previewPlatform === "IG" ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => setPreviewPlatform("IN")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                previewPlatform === "IN" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              LinkedIn
            </button>
          </div>
        </div>

        {/* Mobile Phone Mockup */}
        <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-4 h-[600px] shadow-inner relative overflow-hidden flex flex-col items-center">
          {/* Phone Speaker Notch */}
          <div className="w-16 h-1.5 bg-slate-300 rounded-full mb-5"></div>
          
          <div className="bg-white w-full max-w-[320px] h-[520px] rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
            
            {/* Social Post Header Mockup */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white z-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)]">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
              <div className="flex flex-col gap-1.5">
                <div className="h-2.5 w-24 bg-slate-200 rounded-full"></div>
                <div className="h-2 w-12 bg-slate-100 rounded-full"></div>
              </div>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="p-4 flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {isLoadingPost ? (
                <div className="text-center text-sm text-slate-400 mt-20 animate-pulse">Loading Post...</div>
              ) : generatedText ? (
                <textarea 
                  value={generatedText}
                  maxLength={MAX_POST_LENGTH}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  placeholder="Your text here..."
                  // Tailwind wizardry to hide scrollbar but keep scroll functionality, break words safely
                  className="w-full flex-1 text-sm text-slate-700 leading-relaxed outline-none resize-none bg-transparent whitespace-pre-wrap break-words [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl">✨</span>
                  </div>
                  <p className="text-sm text-slate-400">Your generated post will appear here.</p>
                </div>
              )}
            </div>
            
            {/* Fixed Footer: Post Counter limit */}
            {generatedText && (
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-right">
                <span className={`text-[10px] font-medium ${generatedText.length >= MAX_POST_LENGTH ? 'text-red-500' : 'text-slate-400'}`}>
                  {generatedText.length} / {MAX_POST_LENGTH} chars
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {generatedText && !isLoadingPost && (
          <div className="mt-6 flex justify-end gap-3">
            <button 
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              onClick={() => setGeneratedText("")}
            >
              Discard
            </button>
            
            {editId ? (
              <button 
                onClick={handleUpdatePost}
                disabled={isSaving || generatedText === originalText} 
                className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 ${
                  generatedText === originalText ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0070F3] hover:bg-[#005bb5]'
                }`}
              >
                {isSaving ? "Updating..." : "Update Post"}
              </button>
            ) : (
              <button 
                onClick={handleSavePost}
                disabled={isSaving || isCooldown}
                className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 ${
                  isCooldown ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#3D9970] hover:bg-[#2d7a59]'
                }`}
              >
                {isSaving ? "Saving..." : isCooldown ? `Wait ${countdown}s` : "Save to Library"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}