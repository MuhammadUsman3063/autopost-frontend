"use client";
import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Dropdown States
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // LOGOUT LOGIC
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" }); // Logout ke baad login page par bhej dega
  };

  // CREATE WORKSPACE LOGIC (MVP Placeholder)
  const handleCreateWorkspace = () => {
    setIsWorkspaceOpen(false);
    const workspaceName = prompt("Enter new Workspace Name:");
    if (workspaceName) {
      // Future DB logic will go here
      alert(`✅ Workspace "${workspaceName}" creation logic triggered! (Yeh backend module mein connect hoga)`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0">
      
      {/* LEFT: Workspace Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
          className="flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'W'}
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {session?.user?.name ? `${session.user.name}'s Workspace` : 'My Workspace'}
          </span>
          <span className="text-xs text-slate-400">▼</span>
        </button>
{isWorkspaceOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden">
            <div className="p-2 border-b border-slate-100">
              <input 
                type="text" 
                placeholder="Search workspaces..." 
                // UI FIX: text-slate-900 aur bg-white add kiya taake text crisp aur black nazar aaye
                className="w-full text-sm px-3 py-1.5 text-slate-900 bg-white border border-slate-200 rounded-md outline-none focus:border-[#FF6B4A]"
              />
            </div>
            <button 
              onClick={handleCreateWorkspace}
              className="w-full text-left px-4 py-3 text-sm font-medium text-[#FF6B4A] hover:bg-orange-50 transition-colors"
            >
              + Create New Workspace
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Bell Icon */}
        <button className="text-slate-400 hover:text-slate-600 relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-sm font-bold shadow-sm hover:ring-2 hover:ring-slate-300 transition-all"
          >
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
          </button>

          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-bold text-slate-800">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{session?.user?.email || 'user@example.com'}</p>
              </div>
              <button 
                onClick={() => router.push('/dashboard/settings')}
                className="text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile Settings
              </button>
              <button 
                onClick={handleLogout}
                className="text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}