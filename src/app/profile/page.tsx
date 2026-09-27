"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import {
  UserCircle,
  Mail,
  Phone,
  Shield,
  Key,
  CheckCircle2,
  Calendar,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: "error", message: "New passwords do not match" });
      return;
    }
    setLoading(true);
    setStatusMsg(null);

    // Simulated password update
    setTimeout(() => {
      setLoading(false);
      setStatusMsg({ type: "success", message: "Account security settings updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 600);
  };

  return (
    <AppLayout title="My Account" subtitle="Profile information and security credentials">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-emerald-500/25">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-800">{user?.name}</h2>
                <Badge status={user?.role || "MEMBER"} />
              </div>
              <p className="text-slate-500 text-xs mt-1">{user?.email}</p>
              {user?.memberProfile && (
                <p className="text-xs font-mono font-bold text-brand-600 mt-1">
                  Member ID: {user.memberProfile.memberId}
                </p>
              )}
              {user?.trainerProfile && (
                <p className="text-xs font-mono font-bold text-purple-600 mt-1">
                  Trainer ID: {user.trainerProfile.trainerId} • {user.trainerProfile.specialization}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 text-xs">
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <span className="text-[11px] text-slate-400 block">Registered Email</span>
                <span className="font-semibold text-slate-800">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Phone className="h-5 w-5 text-slate-400" />
              <div>
                <span className="text-[11px] text-slate-400 block">Contact Phone</span>
                <span className="font-semibold text-slate-800">{user?.phone || "+91 98765 43210"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Shield className="h-5 w-5 text-slate-400" />
              <div>
                <span className="text-[11px] text-slate-400 block">Access Level</span>
                <span className="font-semibold text-slate-800">{user?.role} Permissions</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Calendar className="h-5 w-5 text-slate-400" />
              <div>
                <span className="text-[11px] text-slate-400 block">Account Status</span>
                <span className="font-semibold text-brand-600">Active & Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-800">Change Account Password</h3>
          </div>

          {statusMsg && (
            <div
              className={`mb-4 p-3.5 rounded-xl text-xs font-medium ${
                statusMsg.type === "success"
                  ? "bg-brand-50 text-brand-700 border border-brand-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {statusMsg.message}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
