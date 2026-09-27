"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  Plus,
  Scale,
  Calendar,
  User,
  Activity,
  Loader2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

export default function ProgressPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    memberId: "",
    date: new Date().toISOString().split("T")[0],
    weightKg: "",
    bodyFatPercentage: "",
    chestCm: "",
    waistCm: "",
    armsCm: "",
    thighsCm: "",
    notes: "",
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const query = selectedMemberFilter ? `?memberId=${selectedMemberFilter}` : "";
      const res = await fetch(`/api/progress${query}`);
      const json = await res.json();
      if (json.success) setRecords(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (user?.role !== "MEMBER") {
      try {
        const res = await fetch("/api/members");
        const json = await res.json();
        if (json.success) setMembers(json.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchMembers();
  }, [selectedMemberFilter]);

  const handleRecordProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        memberId: form.memberId || (members[0]?.id ?? ""),
        date: form.date,
        weightKg: parseFloat(form.weightKg),
        notes: form.notes || undefined,
      };
      if (form.bodyFatPercentage) payload.bodyFatPercentage = parseFloat(form.bodyFatPercentage);
      if (form.chestCm) payload.chestCm = parseFloat(form.chestCm);
      if (form.waistCm) payload.waistCm = parseFloat(form.waistCm);
      if (form.armsCm) payload.armsCm = parseFloat(form.armsCm);
      if (form.thighsCm) payload.thighsCm = parseFloat(form.thighsCm);

      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setForm({
          memberId: "",
          date: new Date().toISOString().split("T")[0],
          weightKg: "",
          bodyFatPercentage: "",
          chestCm: "",
          waistCm: "",
          armsCm: "",
          thighsCm: "",
          notes: "",
        });
        fetchRecords();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate metrics diff if records >= 2
  const latest = records[records.length - 1];
  const previous = records[records.length - 2];
  const weightChange = latest && previous ? (latest.weightKg - previous.weightKg).toFixed(1) : null;

  return (
    <AppLayout
      title="Body Progress Tracking"
      subtitle={user?.role === "MEMBER" ? "Your physical transformation and body measurements log" : "Member weight, body fat %, and tape measurement history"}
      actions={
        user?.role !== "MEMBER" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            Log Measurements
          </button>
        )
      }
    >
      {/* Member Filter (if Admin/Trainer) */}
      {user?.role !== "MEMBER" && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Filter by Member:</span>
            <select
              value={selectedMemberFilter}
              onChange={(e) => setSelectedMemberFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
            >
              <option value="">All Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.memberId})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Progress Cards Summary */}
      {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Latest Weight</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">{latest.weightKg} kg</span>
              {weightChange && (
                <span
                  className={`text-xs font-bold flex items-center ${
                    parseFloat(weightChange) <= 0 ? "text-brand-600" : "text-amber-600"
                  }`}
                >
                  {parseFloat(weightChange) <= 0 ? (
                    <ArrowDown className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowUp className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(parseFloat(weightChange))} kg
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Logged {new Date(latest.date).toLocaleDateString()}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Body Fat</span>
            <span className="text-2xl font-black text-purple-600">
              {latest.bodyFatPercentage ? `${latest.bodyFatPercentage}%` : "Not recorded"}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Calipers / Bio-impedance</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Waist Measurement</span>
            <span className="text-2xl font-black text-slate-800">
              {latest.waistCm ? `${latest.waistCm} cm` : "N/A"}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Umbilicus tape measure</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Arms (Flexed)</span>
            <span className="text-2xl font-black text-brand-600">
              {latest.armsCm ? `${latest.armsCm} cm` : "N/A"}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Bicep peak circumference</p>
          </div>
        </div>
      )}

      {/* Progress Records History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Measurement Logs History</h3>
          <span className="text-xs text-slate-400">{records.length} entries recorded</span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-7 w-7 text-brand-500 animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No progress logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Weight</th>
                  <th className="py-3 px-4">Body Fat %</th>
                  <th className="py-3 px-4">Chest</th>
                  <th className="py-3 px-4">Waist</th>
                  <th className="py-3 px-4">Arms</th>
                  <th className="py-3 px-4">Thighs</th>
                  <th className="py-3 px-4">Trainer Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-800">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-slate-700">{r.member?.fullName}</td>
                    <td className="py-3 px-4 font-bold text-brand-600">{r.weightKg} kg</td>
                    <td className="py-3 px-4">{r.bodyFatPercentage ? `${r.bodyFatPercentage}%` : "-"}</td>
                    <td className="py-3 px-4">{r.chestCm ? `${r.chestCm} cm` : "-"}</td>
                    <td className="py-3 px-4">{r.waistCm ? `${r.waistCm} cm` : "-"}</td>
                    <td className="py-3 px-4">{r.armsCm ? `${r.armsCm} cm` : "-"}</td>
                    <td className="py-3 px-4">{r.thighsCm ? `${r.thighsCm} cm` : "-"}</td>
                    <td className="py-3 px-4 text-slate-500 italic">{r.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Progress Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Body Measurements & Progress"
      >
        <form onSubmit={handleRecordProgress} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Member *</label>
            <select
              required
              value={form.memberId}
              onChange={(e) => setForm({ ...form, memberId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.memberId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                min="20"
                required
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                placeholder="e.g. 76.5"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Body Fat %</label>
              <input
                type="number"
                step="0.1"
                value={form.bodyFatPercentage}
                onChange={(e) => setForm({ ...form, bodyFatPercentage: e.target.value })}
                placeholder="18.5"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chest (cm)</label>
              <input
                type="number"
                step="0.5"
                value={form.chestCm}
                onChange={(e) => setForm({ ...form, chestCm: e.target.value })}
                placeholder="104"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waist (cm)</label>
              <input
                type="number"
                step="0.5"
                value={form.waistCm}
                onChange={(e) => setForm({ ...form, waistCm: e.target.value })}
                placeholder="82"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Arms (cm)</label>
              <input
                type="number"
                step="0.5"
                value={form.armsCm}
                onChange={(e) => setForm({ ...form, armsCm: e.target.value })}
                placeholder="36"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thighs (cm)</label>
              <input
                type="number"
                step="0.5"
                value={form.thighsCm}
                onChange={(e) => setForm({ ...form, thighsCm: e.target.value })}
                placeholder="59"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Observation / Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Excellent fat loss progress, arms gained 0.7cm..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Measurements"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
