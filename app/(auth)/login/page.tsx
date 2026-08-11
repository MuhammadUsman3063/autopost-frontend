"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

// ISOLATED FUNCTION: Main Auth Page Layout (Split Screen)
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* LEFT PANEL: Dark Gradient with Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 bg-gradient-to-br from-slate-900 via-purple-900 to-orange-950 text-white">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-12">
            {/* Logo placeholder */}
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">
              <span className="text-orange-400 font-bold">A</span>
            </div>
            <span className="font-semibold text-lg">AutoPost AI</span>
          </div>
          
          <p className="text-orange-400 text-sm font-semibold tracking-wider mb-4 uppercase">
            For creators, studios & agencies
          </p>
          <h1 className="text-5xl font-bold leading-tight mb-8">
            Your social calendar, <br />
            <span className="text-orange-400">written while you sleep.</span>
          </h1>
          
          <p className="text-slate-300 mb-12">
            AutoPost AI drafts, schedules, and reports on content for every client you manage — so the work that used to eat your Mondays runs itself.
          </p>
          
          {/* Feature List */}
          <div className="space-y-6">
            <FeatureItem title="AI-generated content" desc="Drafts written in your voice — or your client's — in seconds." />
            <FeatureItem title="Automated scheduling" desc="Queue a month across every channel and account at once." />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: The Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {isLogin ? (
              <LoginForm onSwitch={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitch={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Function for Left Panel Features
function FeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  );
}