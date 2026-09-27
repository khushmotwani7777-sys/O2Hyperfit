"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import {
  FileSpreadsheet,
  Plus,
  Download,
  Trash2,
  Calendar,
  User,
  Search,
  Loader2,
  FileText,
  UploadCloud,
} from "lucide-react";

export default function AssessmentsPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/assessments");
      const json = await res.json();
      if (json.success) {
        setAssessments(json.data);
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
    fetchAssessments();
    fetchMembers();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !memberId) return;
    setUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("memberId", memberId);
      formData.append("assessmentDate", date);
      if (notes) formData.append("notes", notes);

      const res = await fetch("/api/assessments", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setIsModalOpen(false);
        setFile(null);
        setMemberId("");
        setNotes("");
        fetchAssessments();
      } else {
        setErrorMsg(json.error || "Failed to upload PDF report");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload assessment");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment record and its PDF?")) return;
    try {
      const res = await fetch(`/api/assessments?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchAssessments();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAssessments = assessments.filter((a) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      a.member?.fullName?.toLowerCase().includes(term) ||
      a.member?.memberId?.toLowerCase().includes(term) ||
      a.pdfFileName?.toLowerCase().includes(term) ||
      a.notes?.toLowerCase().includes(term)
    );
  });

  return (
    <AppLayout
      title="BMI & Body Assessments"
      subtitle={user?.role === "MEMBER" ? "Your machine-generated body composition scan history" : "Body analyzer PDF reports archive & uploader"}
      actions={
        user?.role !== "MEMBER" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Machine PDF
          </button>
        )
      }
    >
      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search member, report name, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing {filteredAssessments.length} assessment reports
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400">
          <FileSpreadsheet className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-sm">No assessment reports found</p>
          <p className="text-xs text-slate-400 mt-1">Upload a machine PDF to start archiving body composition scans.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssessments.map((ass) => (
            <div
              key={ass.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  {user?.role !== "MEMBER" && (
                    <button
                      onClick={() => handleDelete(ass.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-slate-800 text-sm mb-1">{ass.member?.fullName}</h3>
                <p className="font-mono text-xs text-emerald-600 font-semibold mb-2">{ass.member?.memberId}</p>

                <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Scan Date: {new Date(ass.assessmentDate).toLocaleDateString()}
                  </p>
                  <p className="truncate text-slate-600 font-medium">
                    File: {ass.pdfFileName}
                  </p>
                </div>

                {ass.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4 italic">
                    {ass.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Uploaded by {ass.uploadedBy?.name || "Staff"}
                </span>
                <a
                  href={ass.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  View PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload BMI / InBody Assessment PDF"
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Member *</label>
            <select
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assessment Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Raw Machine PDF Report *</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Supports InBody, Tanita, Accuniq or any standard body analyzer PDF. File will be securely archived.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Trainer Summary</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. InBody 570 scan, visceral fat level 4, skeletal muscle mass 36.2kg..."
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
              disabled={uploading}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload Report"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
