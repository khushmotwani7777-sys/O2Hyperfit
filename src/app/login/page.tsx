"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck, UserCheck, Dumbbell, Key } from "lucide-react";
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
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-white selection:bg-brand-500 selection:text-white">
      {/* Background Subtle Orange-Red Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-500/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Return to Home link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-900 border border-dark-700 hover:border-brand-500/50 text-slate-300 hover:text-white text-xs font-semibold transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        {/* Exact Uploaded Brand Logo */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4 drop-shadow-[0_10px_25px_rgba(255,70,18,0.2)]">
          <Image
            src="/logo.png"
            alt="O2 HyperFit Official Logo"
            fill
            priority
            className="object-contain"
            sizes="(max-width: 640px) 96px, 112px"
          />
        </div>

        {/* Headlines */}
        <h2 className="text-center text-3xl sm:text-4xl font-black tracking-tight uppercase text-white leading-tight">
          TRAIN. TRACK. <br />
          <span className="text-brand-500">TRANSFORM.</span>
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-300 font-medium">
          Your fitness journey, managed in one place.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-dark-900/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-dark-700 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@o2hyperfit.com"
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-xl shadow-brand-500/25 transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  LOGIN
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Access */}
          <div className="mt-8 pt-6 border-t border-dark-800">
            <div className="flex items-center gap-2 mb-3">
              <Key className="h-3.5 w-3.5 text-brand-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Demo Access
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@o2hyperfit.com", "Admin@123")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand-500/50 text-slate-200 hover:text-white transition text-xs font-medium cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-brand-500 mb-1" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("trainer@o2hyperfit.com", "Trainer@123")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand-500/50 text-slate-200 hover:text-white transition text-xs font-medium cursor-pointer"
              >
                <UserCheck className="h-4 w-4 text-brand-500 mb-1" />
                <span>Trainer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("member@o2hyperfit.com", "Member@123")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-brand-500/50 text-slate-200 hover:text-white transition text-xs font-medium cursor-pointer"
              >
                <Dumbbell className="h-4 w-4 text-brand-500 mb-1" />
                <span>Member</span>
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-400 mt-3">
              Select any role above to instantly authenticate with pre-seeded database records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
