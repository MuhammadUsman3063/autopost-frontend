"use client";

import { useState } from "react";

// ISOLATED FUNCTION: Register Form Logic & UI
export default function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🌟 STRICT VALIDATION LOGIC 🌟
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      setError("Access restricted: Only @gmail.com accounts are allowed.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      // Custom register API call
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Account created! Redirecting to login...");
      
      // 2 seconds baad automatically login screen par bhej do
      setTimeout(() => onSwitch(), 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Create your workspace</h2>
      <p className="text-gray-500 text-sm mb-6">Start your 14-day trial. No credit card required.</p>

      {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm font-medium">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm font-medium">{success}</div>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-2 text-slate-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            placeholder="Jordan Avery"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
          <input 
            type="email" 
            required
            className="w-full px-4 py-2 text-slate-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            required
            minLength={8}
            className="w-full px-4 py-2 text-slate-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors mt-4 disabled:opacity-70 flex justify-center items-center"
        >
          {isLoading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center space-x-4">
        <span className="text-sm text-gray-500">Already have an account?</span>
        <button onClick={onSwitch} className="text-orange-500 font-medium hover:underline">Log In</button>
      </div>
    </div>
  );
}