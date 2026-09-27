"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  FileSpreadsheet,
  TrendingUp,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  Plus,
  Loader2,
  Trash2,
  UploadCloud,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "memberships" | "payments" | "attendance" | "workout" | "progress" | "assessments"
  >("overview");

  // Assessment upload state
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [assessmentFile, setAssessmentFile] = useState<File | null>(null);
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [assessmentNotes, setAssessmentNotes] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/members/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setMember(data.data);
      } else {
        router.push("/members");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchMember();
    }
  }, [params.id]);

  const handleUploadAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentFile || !member) return;
    setUploadingPdf(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", assessmentFile);
      formData.append("memberId", member.id);
      formData.append("assessmentDate", assessmentDate);
      if (assessmentNotes) formData.append("notes", assessmentNotes);

      const res = await fetch("/api/assessments", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsAssessmentModalOpen(false);
        setAssessmentFile(null);
        setAssessmentNotes("");
        fetchMember();
      } else {
        setUploadError(json.error || "Failed to upload assessment PDF");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload assessment");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment report?")) return;
    try {
      const res = await fetch(`/api/assessments?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchMember();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Member Details">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout title="Member Not Found">
        <div className="p-8 text-center text-slate-500">Member does not exist.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={member.fullName}
      subtitle={`Member Profile: ${member.memberId}`}
      actions={
        <Link
          href="/members"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-900 hover:bg-dark-800 text-white text-xs font-bold uppercase tracking-wider transition"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-brand-500" />
          Member Directory
        </Link>
      }
    >
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-dark-950 border border-brand-500/40 flex items-center justify-center text-brand-500 text-2xl font-black shadow-lg">
              {member.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                  {member.fullName}
                </h2>
                <Badge status={member.status} />
              </div>
              <p className="font-mono text-xs font-bold text-brand-600 mb-2">{member.memberId}</p>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {member.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {member.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Joined {new Date(member.joiningDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-dark-950 p-4 rounded-2xl border border-dark-800 text-xs text-right w-full sm:w-auto">
            <span className="text-slate-400 block text-[10px] uppercase tracking-widest font-bold">Assigned Trainer</span>
            <span className="font-bold text-white text-sm">
              {member.assignedTrainer ? member.assignedTrainer.name : "Unassigned"}
            </span>
            {member.assignedTrainer && (
              <span className="text-brand-500 block text-[11px] font-semibold mt-0.5">
                {member.assignedTrainer.specialization}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Bar: Overview, Membership, Payments, Attendance, Workout, Progress, Body Assessments */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 mb-6 pb-2 text-xs font-bold uppercase tracking-wider">
        {[
          { key: "overview", label: "Overview", icon: User },
          { key: "memberships", label: "Membership", icon: CreditCard, count: member.memberships?.length },
          { key: "payments", label: "Payments", icon: CreditCard, count: member.payments?.length },
          { key: "attendance", label: "Attendance", icon: CalendarCheck, count: member.attendance?.length },
          { key: "workout", label: "Workout", icon: Dumbbell, count: member.workoutPlans?.length },
          { key: "progress", label: "Progress", icon: TrendingUp, count: member.progressRecords?.length },
          { key: "assessments", label: "Body Assessments", icon: FileSpreadsheet, count: member.bodyAssessments?.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    isActive ? "bg-dark-950 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="font-black uppercase tracking-tight text-slate-900 text-sm mb-4">Physical Attributes & Biometrics</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Height</span>
                <span className="font-black text-slate-900 text-base">{member.height ? `${member.height} cm` : "N/A"}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Weight</span>
                <span className="font-black text-slate-900 text-base">{member.weight ? `${member.weight} kg` : "N/A"}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Gender</span>
                <span className="font-black text-slate-900 text-base">{member.gender}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Date of Birth</span>
                <span className="font-black text-slate-900 text-base">
                  {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="font-black uppercase tracking-tight text-slate-900 text-sm mb-4">Contact & Location</h3>
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Emergency Contact</span>
                <span className="font-bold text-slate-900">{member.emergencyContact || "None provided"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Residential Address</span>
                <span className="font-bold text-slate-900">{member.address || "None provided"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Member Account</span>
                <span className="font-bold text-slate-900">{member.user ? member.user.email : "No account linked"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Membership */}
      {activeTab === "memberships" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {member.memberships?.map((m: any) => (
                <tr key={m.id}>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.plan.name}</td>
                  <td className="py-3.5 px-4 text-slate-700">{m.plan.durationMonths} Months</td>
                  <td className="py-3.5 px-4 text-slate-700">{new Date(m.startDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 text-slate-700">{new Date(m.endDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4"><Badge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Payments */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Receipt ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {member.payments?.map((p: any) => (
                <tr key={p.id}>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{p.paymentId}</td>
                  <td className="py-3.5 px-4 text-slate-700">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4"><Badge status={p.paymentMethod} /></td>
                  <td className="py-3.5 px-4 font-black text-slate-900">₹{p.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{p.transactionRef || "-"}</td>
                  <td className="py-3.5 px-4"><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Attendance */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Check-Out Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {member.attendance?.map((att: any) => (
                <tr key={att.id}>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{new Date(att.date).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-brand-600">{new Date(att.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-mono">
                    {att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Active Session"}
                  </td>
                  <td className="py-3.5 px-4"><Badge status={att.status} /></td>
                  <td className="py-3.5 px-4 text-slate-400 italic">{att.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Workout */}
      {activeTab === "workout" && (
        <div className="space-y-6">
          {member.workoutPlans?.map((plan: any) => (
            <div key={plan.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-base">{plan.planName}</h3>
                  <p className="text-xs text-slate-500">
                    Assigned by: {plan.trainer ? plan.trainer.name : "Staff"} • Started: {new Date(plan.startDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge status={plan.status} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plan.exercises?.map((item: any) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <span className="font-bold text-slate-900 block">{item.exercise.name}</span>
                    <span className="text-slate-500 block text-[11px] mb-2">{item.dayOfWeek} • {item.exercise.muscleGroup}</span>
                    <div className="flex items-center justify-between text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                      <span>{item.sets} Sets × {item.reps} Reps</span>
                      <span className="font-bold text-brand-600">{item.weightKg ? `${item.weightKg} kg` : "Bodyweight"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Progress */}
      {activeTab === "progress" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Weight (kg)</th>
                <th className="py-3 px-4">Body Fat %</th>
                <th className="py-3 px-4">Chest (cm)</th>
                <th className="py-3 px-4">Waist (cm)</th>
                <th className="py-3 px-4">Arms (cm)</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {member.progressRecords?.map((r: any) => (
                <tr key={r.id}>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 font-black text-brand-600">{r.weightKg} kg</td>
                  <td className="py-3.5 px-4">{r.bodyFatPercentage ? `${r.bodyFatPercentage}%` : "-"}</td>
                  <td className="py-3.5 px-4">{r.chestCm ? `${r.chestCm} cm` : "-"}</td>
                  <td className="py-3.5 px-4">{r.waistCm ? `${r.waistCm} cm` : "-"}</td>
                  <td className="py-3.5 px-4">{r.armsCm ? `${r.armsCm} cm` : "-"}</td>
                  <td className="py-3.5 px-4 text-slate-500 italic">{r.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 7: Body Assessments */}
      {activeTab === "assessments" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                BMI & Body Composition PDF Reports
              </h3>
              <p className="text-xs text-slate-500">
                Machine-generated InBody, Tanita, or Accuniq body scan reports
              </p>
            </div>
            {user?.role !== "MEMBER" && (
              <button
                onClick={() => setIsAssessmentModalOpen(true)}
                className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm"
              >
                <UploadCloud className="h-4 w-4" />
                UPLOAD ASSESSMENT
              </button>
            )}
          </div>

          {/* Assessment History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {member.bodyAssessments?.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No body assessments uploaded for this member yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Assessment Date</th>
                      <th className="py-3 px-4">PDF File</th>
                      <th className="py-3 px-4">Uploaded By</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4 text-right">View PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {member.bodyAssessments?.map((ass: any) => (
                      <tr key={ass.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {new Date(ass.assessmentDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-brand-500" />
                            <span className="font-semibold text-slate-800">{ass.pdfFileName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {ass.uploadedBy?.name || "Staff"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                          {ass.notes || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={ass.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-dark-950 text-brand-500 hover:bg-dark-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
                            >
                              <Download className="h-3.5 w-3.5" />
                              View PDF
                            </a>
                            {user?.role !== "MEMBER" && (
                              <button
                                onClick={() => handleDeleteAssessment(ass.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Assessment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Assessment Modal */}
      <Modal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        title="Upload Body Composition / BMI PDF"
      >
        {uploadError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {uploadError}
          </div>
        )}

        <form onSubmit={handleUploadAssessment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Assessment Date *</label>
            <input
              type="date"
              required
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Select Machine PDF File *</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              required
              onChange={(e) => setAssessmentFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-dark-950 file:text-brand-500 hover:file:bg-dark-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">Upload the raw PDF generated by the BMI / InBody scanner.</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Notes / Trainer Summary</label>
            <textarea
              rows={3}
              value={assessmentNotes}
              onChange={(e) => setAssessmentNotes(e.target.value)}
              placeholder="e.g. InBody 570 scan: SMM 36.8kg, Body Fat 16.5%, Visceral Fat level 5..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssessmentModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingPdf}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
            >
              {uploadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload PDF"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
