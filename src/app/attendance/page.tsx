"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarCheck,
  UserCheck,
  LogOut,
  Plus,
  Search,
  Clock,
  Calendar,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const query = dateFilter ? `?date=${dateFilter}` : "";
      const res = await fetch(`/api/attendance${query}`);
      const json = await res.json();
      if (json.success) {
        setAttendance(json.data);
      }
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
    fetchAttendance();
    fetchMembers();
  }, [dateFilter]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    setCheckingIn(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMemberId, status: "PRESENT" }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setIsModalOpen(false);
        setSelectedMemberId("");
        fetchAttendance();
      } else {
        setErrorMsg(json.error || "Failed to check in member");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to check in");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async (attendanceId: string) => {
    try {
      const res = await fetch("/api/attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId }),
      });
      if (res.ok) {
        fetchAttendance();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeInGymCount = attendance.filter((a) => !a.checkOutTime).length;

  return (
    <AppLayout
      title="Attendance Desk"
      subtitle={user?.role === "MEMBER" ? "Your workout check-in history" : "Gym entry, exit, and real-time head count"}
      actions={
        user?.role !== "MEMBER" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            Check In Member
          </button>
        )
      }
    >
      {/* Attendance Stats */}
      {user?.role !== "MEMBER" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Currently Working Out</span>
              <span className="text-3xl font-black text-emerald-600">{activeInGymCount}</span>
              <p className="text-xs text-slate-500 mt-1">Checked in & on the floor</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <UserCheck className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Logged Check-ins</span>
              <span className="text-3xl font-black text-slate-800">{attendance.length}</span>
              <p className="text-xs text-slate-500 mt-1">Filtered date records</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <CalendarCheck className="h-7 w-7" />
            </div>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-2"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-7 w-7 text-emerald-500 animate-spin" />
          </div>
        ) : attendance.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No attendance entries recorded for this date.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4">Status</th>
                  {user?.role !== "MEMBER" && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((a) => {
                  const checkInFormatted = new Date(a.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  const checkOutFormatted = a.checkOutTime
                    ? new Date(a.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : null;

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{a.member.fullName}</div>
                        <div className="text-[11px] text-slate-500">{a.member.memberId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">{checkInFormatted}</td>
                      <td className="py-3.5 px-4 font-mono">
                        {checkOutFormatted ? (
                          <span className="text-slate-600">{checkOutFormatted}</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                            Active Inside
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={a.status} />
                      </td>
                      {user?.role !== "MEMBER" && (
                        <td className="py-3.5 px-4 text-right">
                          {!a.checkOutTime && (
                            <button
                              onClick={() => handleCheckOut(a.id)}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition"
                            >
                              <LogOut className="h-3 w-3" />
                              Check Out
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check In Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Quick Member Check-In"
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCheckIn} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Member by Name or ID *</label>
            <select
              required
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.memberId}) - {m.status}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-slate-500 text-[11px]">
            Check-in timestamp will automatically record current time. Members can later be checked out when leaving.
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
              disabled={checkingIn}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm"
            >
              {checkingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Check-In"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
