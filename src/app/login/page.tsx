"use client";

import React, { useState } from "react";
import { Dumbbell, ShieldCheck, UserCheck, ArrowRight, Loader2, Sparkles, Key } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || "Login failed");
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    const res = await login(demoEmail, demoPass);
    if (!res.success) {
      setError(res.error || "Quick login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <Dumbbell className="h-7 w-7 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black tracking-tight text-white">
          O2HYPERFIT
        </h2>
        <p className="mt-1 text-center text-sm font-medium text-emerald-400">
          Gym & Body Assessment Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-800 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@o2hyperfit.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-lg shadow-emerald-500/25 transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In to System
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-3.5 w-3.5 text-emerald-400" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Demo Access
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@o2hyperfit.com", "Admin@123")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/60 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-500/50 text-slate-200 hover:text-purple-300 transition text-xs font-medium cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-purple-400 mb-1" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("trainer@o2hyperfit.com", "Trainer@123")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/60 hover:bg-blue-950/40 border border-slate-700 hover:border-blue-500/50 text-slate-200 hover:text-blue-300 transition text-xs font-medium cursor-pointer"
              >
                <UserCheck className="h-4 w-4 text-blue-400 mb-1" />
                <span>Trainer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("member@o2hyperfit.com", "Member@123")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/60 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 transition text-xs font-medium cursor-pointer"
              >
                <Dumbbell className="h-4 w-4 text-emerald-400 mb-1" />
                <span>Member</span>
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-400 mt-3">
              Click any role above to automatically authenticate with pre-seeded data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
