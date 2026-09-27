"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Building2,
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Mail,
  Phone,
  Globe,
  MapPin,
  Lock,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<"profile" | "system" | "security">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    gymName: "O2 HyperFit",
    tagline: "MORE SWEAT MORE GLORY",
    logoUrl: "/logo.png",
    address: "42, Prime Fitness Boulevard, Metro City, India",
    phone: "+91 98765 43210",
    email: "contact@o2hyperfit.com",
    website: "https://o2hyperfit.com",
    openingTime: "06:00 AM",
    closingTime: "10:00 PM",
    weeklyHolidays: "Sunday",
    currency: "₹",
    defaultDurationMonths: 1,
    defaultPaymentMethod: "UPI",
    attendanceMode: "MANUAL",
    notificationEmail: true,
    notificationSms: false,
    passwordMinLength: 6,
    sessionTimeoutDays: 7,
    forcePasswordChange: true,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (json.success && json.data) {
          setSettings(json.data);
        }
      } catch (err) {
        console.error("Load settings error", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Settings saved successfully.");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error || "Failed to update settings");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout
      title="System Settings"
      subtitle="Gym profile, platform configurations & security controls"
      allowedRoles={["ADMIN"]}
      actions={
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-brand-500/25"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>Save Changes</span>
        </button>
      }
    >
      {/* Alert Banners */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="text-xs font-bold">{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            tab === "profile"
              ? "bg-dark-950 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="h-4 w-4 text-brand-500" />
          Gym Profile
        </button>
        <button
          type="button"
          onClick={() => setTab("system")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            tab === "system"
              ? "bg-dark-950 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sliders className="h-4 w-4 text-brand-500" />
          System Settings
        </button>
        <button
          type="button"
          onClick={() => setTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            tab === "security"
              ? "bg-dark-950 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-brand-500" />
          Security Settings
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
          Loading Settings...
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {/* TAB 1: GYM PROFILE */}
          {tab === "profile" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Brand & Facility Profile
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Public gym metadata, location coordinates, and operational hours.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Gym Name
                  </label>
                  <input
                    type="text"
                    value={settings.gymName}
                    onChange={(e) => setSettings({ ...settings, gymName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Official Contact Phone
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={settings.website}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Weekly Holidays
                  </label>
                  <input
                    type="text"
                    value={settings.weeklyHolidays}
                    onChange={(e) => setSettings({ ...settings, weeklyHolidays: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Opening Time
                  </label>
                  <input
                    type="text"
                    value={settings.openingTime}
                    onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Closing Time
                  </label>
                  <input
                    type="text"
                    value={settings.closingTime}
                    onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM SETTINGS */}
          {tab === "system" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  System & Billing Defaults
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Global currency symbol, default plan durations, and automated member notifications.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Default Membership Duration (Months)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={settings.defaultDurationMonths}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultDurationMonths: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Default Payment Method
                  </label>
                  <select
                    value={settings.defaultPaymentMethod}
                    onChange={(e) => setSettings({ ...settings, defaultPaymentMethod: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Attendance Mode
                  </label>
                  <select
                    value={settings.attendanceMode}
                    onChange={(e) => setSettings({ ...settings, attendanceMode: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  >
                    <option value="MANUAL">Manual Admin Check-In</option>
                    <option value="QR">QR Code Scanner</option>
                    <option value="BIOMETRIC">Biometric Machine Integration</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-4 border-t border-slate-100 flex flex-col gap-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Automated Notifications
                  </h4>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notificationEmail}
                      onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Email Notifications
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Dispatch email receipts and renewal reminders 7 days before membership expiry.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notificationSms}
                      onChange={(e) => setSettings({ ...settings, notificationSms: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        SMS / WhatsApp Notifications
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Send automated check-in confirmations and payment receipts via SMS.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY SETTINGS */}
          {tab === "security" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                  Security & Access Policies
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enforce strong passwords, manage session duration, and mandate first-login credential rotation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    min={6}
                    max={32}
                    value={settings.passwordMinLength}
                    onChange={(e) =>
                      setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) || 6 })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    JWT Session Expiration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.sessionTimeoutDays}
                    onChange={(e) =>
                      setSettings({ ...settings, sessionTimeoutDays: parseInt(e.target.value) || 7 })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  />
                </div>

                <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.forcePasswordChange}
                      onChange={(e) => setSettings({ ...settings, forcePasswordChange: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-brand-500 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Force Password Change For New Members
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                        When enabled, any member created via individual registration or CSV bulk import will receive their mobile number as a temporary password and must set a new password before accessing the member dashboard.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </AppLayout>
  );
}
