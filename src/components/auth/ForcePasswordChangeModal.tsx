"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Lock, KeyRound, AlertCircle, CheckCircle2, Loader2, LogOut } from "lucide-react";

export function ForcePasswordChangeModal() {
  const { user, refreshUser, logout } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        await refreshUser();
      } else {
        setError(data.error || "Failed to update password");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-dark-900 border border-dark-700 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-16 h-16 mb-4">
            <Image
              src="/logo.png"
              alt="O2 HyperFit"
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Security Requirement</span>
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Set Your Permanent Password
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
            Welcome to O2 HyperFit, <span className="font-bold text-white">{user?.name}</span>. For your account security, your initial temporary password must now be replaced with a secure personal password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-dark-950 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activate Account & Continue</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 bg-dark-800 hover:bg-dark-700 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
