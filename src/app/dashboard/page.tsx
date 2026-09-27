"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  UserCheck,
  AlertTriangle,
  CalendarCheck,
  IndianRupee,
  Clock,
  FileSpreadsheet,
  Dumbbell,
  ArrowUpRight,
  Download,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load dashboard data");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <AppLayout title="Dashboard" subtitle="Overview and metrics">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // MEMBER PORTAL VIEW
  if (user?.role === "MEMBER") {
    const member = data?.member;
    const membership = data?.activeMembership;
    const workout = data?.workoutPlan;

    // Calculate days remaining
    let daysRemaining = 0;
    if (membership?.endDate) {
      const diff = new Date(membership.endDate).getTime() - new Date().getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return (
      <AppLayout title="Member Portal" subtitle={`Welcome back, ${user.name}!`}>
        {/* Welcome & Membership Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 mb-8 border border-emerald-900/40 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {membership ? membership.plan?.name : "No Active Plan"}
                </span>
                {membership && <Badge status={membership.status} />}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                {member?.fullName}
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                Member ID: <span className="font-mono text-emerald-400 font-bold">{member?.memberId}</span> • Joined {member?.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : ""}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Validity</span>
                <span className="text-2xl font-black text-emerald-400">{daysRemaining}</span>
                <span className="text-xs text-slate-300 ml-1">days left</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <Link
                href="/payments"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-emerald-500/30"
              >
                View Payments
              </Link>
            </div>
          </div>
        </div>

        {/* Member Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Attendance This Month"
            value={`${data?.attendanceThisMonth || 0} Days`}
            icon={CalendarCheck}
            color="emerald"
          />
          <StatCard
            title="Current Weight"
            value={member?.weight ? `${member.weight} kg` : "N/A"}
            subtitle={member?.height ? `Height: ${member.height} cm` : ""}
            icon={Dumbbell}
            color="blue"
          />
          <StatCard
            title="Assigned Trainer"
            value={member?.assignedTrainer?.name || "Not Assigned"}
            subtitle={member?.assignedTrainer?.specialization || "General Trainer"}
            icon={UserCheck}
            color="purple"
          />
          <StatCard
            title="Assessment Reports"
            value={data?.recentAssessments?.length || 0}
            subtitle="BMI & InBody PDFs"
            icon={FileSpreadsheet}
            color="indigo"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Workout Routine */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-emerald-600" />
                Current Workout Plan
              </h3>
              <Link
                href="/workouts"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View Details <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {workout ? (
              <div>
                <p className="text-sm font-semibold text-slate-800">{workout.planName}</p>
                {workout.notes && <p className="text-xs text-slate-500 mt-1 mb-3">{workout.notes}</p>}

                <div className="space-y-2 mt-3">
                  {workout.exercises?.slice(0, 4).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{item.exercise.name}</span>
                        <span className="text-slate-400 block text-[11px]">{item.dayOfWeek}</span>
                      </div>
                      <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                        {item.sets} sets × {item.reps} reps {item.weightKg ? `@ ${item.weightKg}kg` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No active workout plan assigned. Consult your trainer!
              </div>
            )}
          </div>

          {/* BMI Assessment Reports */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                BMI & Body Assessment Reports
              </h3>
              <Link
                href="/assessments"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                All Reports <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data?.recentAssessments?.length > 0 ? (
              <div className="space-y-3">
                {data.recentAssessments.map((ass: any) => (
                  <div
                    key={ass.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{ass.pdfFileName}</p>
                      <p className="text-xs text-slate-400">
                        Assessment Date: {new Date(ass.assessmentDate).toLocaleDateString()}
                      </p>
                      {ass.notes && <p className="text-xs text-slate-500 mt-1">{ass.notes}</p>}
                    </div>
                    <a
                      href={ass.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-xs flex items-center gap-1 text-xs font-medium"
                    >
                      <Download className="h-3.5 w-3.5" />
                      View PDF
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No BMI assessments uploaded yet. Take a scan at the gym reception!
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // ADMIN & TRAINER DASHBOARD VIEW
  return (
    <AppLayout
      title="Admin Dashboard"
      subtitle="Real-time gym performance and operations"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/attendance"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            Check In Member
          </Link>
          <Link
            href="/members"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition"
          >
            <Users className="h-3.5 w-3.5" />
            New Member
          </Link>
        </div>
      }
    >
      {/* 8 Core Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Members"
          value={data?.totalMembers || 0}
          subtitle="Registered in system"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Members"
          value={data?.activeMembers || 0}
          subtitle="Valid memberships"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Expired Memberships"
          value={data?.expiredMemberships || 0}
          subtitle="Requires renewal"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Today's Attendance"
          value={data?.todayAttendanceCount || 0}
          subtitle="Members checked in"
          icon={CalendarCheck}
          color="purple"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(data?.monthlyRevenue || 0).toLocaleString()}`}
          subtitle="This calendar month"
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Expiring Soon"
          value={data?.expiringSoon?.length || 0}
          subtitle="Within next 7 days"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Recent Payments"
          value={data?.recentPayments?.length || 0}
          subtitle="Latest transactions"
          icon={CheckCircle2}
          color="indigo"
        />
        <StatCard
          title="Recent Assessments"
          value={data?.recentAssessments?.length || 0}
          subtitle="BMI / InBody scans"
          icon={FileSpreadsheet}
          color="blue"
        />
      </div>

      {/* Critical Alerts: Memberships Expiring Soon */}
      {data?.expiringSoon?.length > 0 && (
        <div className="mb-8 bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Membership Expiration Alerts ({data.expiringSoon.length})</span>
            </div>
            <Link
              href="/memberships?status=EXPIRING_SOON"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.expiringSoon.map((item: any) => {
              const daysLeft = Math.ceil(
                (new Date(item.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-xs flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">{item.member.fullName}</p>
                    <p className="text-slate-500 text-[11px]">{item.plan.name} • {item.member.phone}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg font-bold bg-amber-100 text-amber-800">
                    {daysLeft <= 0 ? "Expires today" : `${daysLeft}d left`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tables: Recent Payments and Recent Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Recent Payments</h3>
            <Link
              href="/payments"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Payment ID</th>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentPayments?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-medium text-slate-600">{p.paymentId}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{p.member?.fullName}</td>
                    <td className="py-3 px-3"><Badge status={p.paymentMethod} /></td>
                    <td className="py-3 px-3 font-bold text-slate-800">₹{p.amount.toLocaleString()}</td>
                    <td className="py-3 px-3"><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Assessments Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Recent Body Assessments</h3>
            <Link
              href="/assessments"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Upload / View <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentAssessments?.map((a: any) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{a.member?.fullName} ({a.member?.memberId})</p>
                  <p className="text-[11px] text-slate-500">
                    {a.pdfFileName} • {new Date(a.assessmentDate).toLocaleDateString()}
                  </p>
                  {a.notes && <p className="text-[11px] text-slate-400 italic mt-0.5">{a.notes}</p>}
                </div>
                <a
                  href={a.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
