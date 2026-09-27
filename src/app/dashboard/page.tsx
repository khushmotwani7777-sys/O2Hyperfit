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
  TrendingUp,
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
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  // MEMBER PORTAL VIEW
  if (user?.role === "MEMBER") {
    const member = data?.member;
    const membership = data?.activeMembership;
    const workout = data?.workoutPlan;

    let daysRemaining = 0;
    if (membership?.endDate) {
      const diff = new Date(membership.endDate).getTime() - new Date().getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return (
      <AppLayout title="Member Portal" subtitle={`Welcome back, ${user.name}!`}>
        {/* Welcome & Membership Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-dark-950 text-white p-6 sm:p-8 mb-8 border border-dark-800 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-dark-800 text-brand-500 border border-brand-500/40">
                  {membership ? membership.plan?.name : "No Active Plan"}
                </span>
                {membership && <Badge status={membership.status} />}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {member?.fullName}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Member ID: <span className="font-mono text-brand-500 font-bold">{member?.memberId}</span> • Joined {member?.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : ""}
              </p>
            </div>

            <div className="flex items-center gap-5 bg-dark-900 px-6 py-4 rounded-2xl border border-dark-750">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Membership Validity</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-brand-500">{daysRemaining}</span>
                  <span className="text-xs text-slate-400 font-semibold">days left</span>
                </div>
              </div>
              <div className="h-8 w-px bg-dark-750" />
              <Link
                href="/payments"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-md shadow-brand-500/30"
              >
                Invoices
              </Link>
            </div>
          </div>
        </div>

        {/* Member Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Attendance This Month"
            value={`${data?.attendanceThisMonth || 0} Sessions`}
            icon={CalendarCheck}
          />
          <StatCard
            title="Current Weight"
            value={member?.weight ? `${member.weight} kg` : "N/A"}
            subtitle={member?.height ? `Height: ${member.height} cm` : ""}
            icon={Dumbbell}
          />
          <StatCard
            title="Assigned Trainer"
            value={member?.assignedTrainer?.name || "Not Assigned"}
            subtitle={member?.assignedTrainer?.specialization || "General Trainer"}
            icon={UserCheck}
          />
          <StatCard
            title="BMI & InBody Reports"
            value={data?.recentAssessments?.length || 0}
            subtitle="Machine PDF Scans"
            icon={FileSpreadsheet}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Workout Routine */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black uppercase tracking-tight text-slate-900 text-sm flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-brand-500" />
                Current Workout Plan
              </h3>
              <Link
                href="/workouts"
                className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View Routine <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {workout ? (
              <div>
                <p className="text-sm font-bold text-slate-900">{workout.planName}</p>
                {workout.notes && <p className="text-xs text-slate-500 mt-1 mb-3">{workout.notes}</p>}

                <div className="space-y-2.5 mt-3">
                  {workout.exercises?.slice(0, 4).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{item.exercise.name}</span>
                        <span className="text-slate-500 block text-[11px]">{item.dayOfWeek}</span>
                      </div>
                      <span className="font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-lg">
                        {item.sets} sets × {item.reps} reps {item.weightKg ? `@ ${item.weightKg}kg` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                No active workout routine assigned. Consult your trainer!
              </div>
            )}
          </div>

          {/* BMI Assessment Reports */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black uppercase tracking-tight text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-brand-500" />
                BMI & Body Composition Reports
              </h3>
              <Link
                href="/assessments"
                className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                All Reports <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data?.recentAssessments?.length > 0 ? (
              <div className="space-y-3">
                {data.recentAssessments.map((ass: any) => (
                  <div
                    key={ass.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 bg-slate-50 hover:bg-slate-100/60 transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ass.pdfFileName}</p>
                      <p className="text-[11px] text-slate-500">
                        Scan Date: {new Date(ass.assessmentDate).toLocaleDateString()}
                      </p>
                      {ass.notes && <p className="text-[11px] text-slate-600 mt-1 italic">{ass.notes}</p>}
                    </div>
                    <a
                      href={ass.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition shadow-xs flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                No BMI scan reports uploaded yet.
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
      subtitle="Gym operations, member analytics, and financial overview"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/attendance"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-900 hover:bg-dark-800 text-white text-xs font-bold uppercase tracking-wider transition"
          >
            <CalendarCheck className="h-3.5 w-3.5 text-brand-500" />
            Check In
          </Link>
          <Link
            href="/members"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
          >
            <Users className="h-3.5 w-3.5" />
            New Member
          </Link>
        </div>
      }
    >
      {/* 6 Key Dashboard Cards (as requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Total Members"
          value={data?.totalMembers || 0}
          subtitle="Registered in database"
          icon={Users}
        />
        <StatCard
          title="Active Members"
          value={data?.activeMembers || 0}
          subtitle="Currently valid memberships"
          icon={UserCheck}
        />
        <StatCard
          title="Today's Attendance"
          value={data?.todayAttendanceCount || 0}
          subtitle="Logged check-ins today"
          icon={CalendarCheck}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(data?.monthlyRevenue || 0).toLocaleString()}`}
          subtitle="This calendar month"
          icon={IndianRupee}
        />
        <StatCard
          title="Expiring Memberships"
          value={data?.expiringSoon?.length || 0}
          subtitle="Expiring in next 7 days"
          icon={Clock}
        />
        <StatCard
          title="Recent Assessments"
          value={data?.recentAssessments?.length || 0}
          subtitle="InBody & BMI PDF uploads"
          icon={FileSpreadsheet}
        />
      </div>

      {/* Expiration Alerts Banner */}
      {data?.expiringSoon?.length > 0 && (
        <div className="mb-8 bg-dark-950 text-white border border-dark-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-brand-500/20 text-brand-500">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  Membership Expiration Alerts ({data.expiringSoon.length})
                </h3>
                <p className="text-[11px] text-slate-400">Members due for renewal within 7 days</p>
              </div>
            </div>
            <Link
              href="/memberships?status=EXPIRING_SOON"
              className="text-xs font-bold uppercase tracking-wider text-brand-500 hover:text-brand-400"
            >
              View All Subscriptions &rarr;
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
                  className="bg-dark-900 rounded-2xl p-4 border border-dark-750 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{item.member.fullName}</p>
                    <p className="text-slate-400 text-[11px]">{item.plan.name} • {item.member.phone}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider bg-brand-500 text-white">
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase tracking-tight text-slate-900 text-sm">Recent Transactions</h3>
            <Link
              href="/payments"
              className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              All Invoices <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
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
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{p.paymentId}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{p.member?.fullName}</td>
                    <td className="py-3 px-3"><Badge status={p.paymentMethod} /></td>
                    <td className="py-3 px-3 font-black text-slate-900">₹{p.amount.toLocaleString()}</td>
                    <td className="py-3 px-3"><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Assessments Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase tracking-tight text-slate-900 text-sm">Recent Body Assessments</h3>
            <Link
              href="/assessments"
              className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Upload PDF <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentAssessments?.map((a: any) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 bg-slate-50 hover:bg-slate-100/60 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{a.member?.fullName} ({a.member?.memberId})</p>
                  <p className="text-[11px] text-slate-500">
                    {a.pdfFileName} • {new Date(a.assessmentDate).toLocaleDateString()}
                  </p>
                  {a.notes && <p className="text-[11px] text-slate-600 italic mt-0.5">{a.notes}</p>}
                </div>
                <a
                  href={a.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs"
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
