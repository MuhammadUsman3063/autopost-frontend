"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// ISOLATED FUNCTION: Login Form Logic & UI
export default function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // NextAuth ka signIn function call kar rahe hain
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      // Login successful hone par dashboard par bhej do
      router.push("/dashboard");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Log in to your workspace</h2>
      <p className="text-gray-500 text-sm mb-6">Welcome back. Enter your details to continue.</p>

      {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Work email</label>
          <input 
            type="email" 
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <a href="#" className="text-sm text-orange-500 hover:text-orange-600">Forgot password?</a>
          </div>
          <input 
            type="password" 
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-70"
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center space-x-4">
        <span className="text-sm text-gray-500">Don't have an account?</span>
        <button onClick={onSwitch} className="text-orange-500 font-medium hover:underline">Sign Up</button>
      </div>
    </div>
  );
}