"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowLeft,
  Users,
  RefreshCw,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function ImportMembersPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    summary: { totalRows: number; validRows: number; invalidRows: number };
    rows: any[];
  } | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Parse CSV client-side into JSON objects
  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Parse header row
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV splitting
      const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
      const rowObj: any = {};

      headers.forEach((header, idx) => {
        rowObj[header] = values[idx] || "";
      });

      rows.push(rowObj);
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith(".csv")) {
        setGlobalError("Please upload a valid .csv file.");
        return;
      }
      setFile(selected);
      setValidationResult(null);
      setGlobalError(null);
      setImportSuccessMsg(null);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setValidating(true);
    setGlobalError(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        setGlobalError("The uploaded CSV file contains no data rows.");
        setValidating(false);
        return;
      }

      const res = await fetch("/api/members/import?mode=validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setValidationResult(data);
      } else {
        setGlobalError(data.error || "Validation failed.");
      }
    } catch (err: any) {
      setGlobalError(err.message || "Failed to process CSV file.");
    } finally {
      setValidating(false);
    }
  };

  const handleCommitImport = async () => {
    if (!validationResult) return;
    setImporting(true);
    setGlobalError(null);

    try {
      const res = await fetch("/api/members/import?mode=commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validationResult.rows }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImportSuccessMsg(data.message);
        setValidationResult(null);
        setFile(null);
      } else {
        setGlobalError(data.error || "Failed to import members.");
      }
    } catch (err: any) {
      setGlobalError(err.message || "Network error during member import.");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadErrorReport = () => {
    if (!validationResult) return;

    const invalidRows = validationResult.rows.filter((r) => !r.isValid);
    if (invalidRows.length === 0) return;

    const headers = [
      "row_number",
      "member_id",
      "name",
      "email",
      "mobile",
      "membership_plan",
      "trainer",
      "error_reasons",
    ].join(",");

    const lines = invalidRows.map((r) => {
      const reasons = `"${r.errors.join("; ")}"`;
      return [
        r.rowNumber,
        r.memberId || "",
        `"${r.name || ""}"`,
        r.email || "",
        r.mobile || "",
        `"${r.membershipPlan || ""}"`,
        `"${r.trainer || ""}"`,
        reasons,
      ].join(",");
    });

    const csvContent = `${headers}\n${lines.join("\n")}\n`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `o2hyperfit_import_errors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout
      title="Bulk Member Onboarding"
      subtitle="Validate and import member records via CSV"
      allowedRoles={["ADMIN"]}
      actions={
        <div className="flex items-center gap-2">
          <a
            href="/api/members/import/template"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition"
          >
            <Download className="h-4 w-4 text-brand-500" />
            Download CSV Template
          </a>
          <Link
            href="/members"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-900 hover:bg-dark-800 text-white text-xs font-bold uppercase tracking-wider transition"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-brand-500" />
            Member Directory
          </Link>
        </div>
      }
    >
      {/* Success Notification */}
      {importSuccessMsg && (
        <div className="mb-6 p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <div className="text-sm font-black uppercase tracking-tight text-emerald-950">
                Import Completed Successfully
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">{importSuccessMsg}</div>
            </div>
          </div>
          <Link
            href="/members"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
          >
            View Members
          </Link>
        </div>
      )}

      {/* Error Banner */}
      {globalError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="text-xs font-bold">{globalError}</span>
        </div>
      )}

      {/* CSV Uploader Section */}
      {!validationResult && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 mx-auto mb-4 shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">
              Select or Drop CSV Member Roster
            </h3>
            <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              Upload your member spreadsheet containing IDs, contact information, plan choices, and assigned trainers. Passwords are automatically assigned from mobile numbers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <span className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider transition border border-slate-200 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-brand-500" />
                  {file ? file.name : "Choose CSV File"}
                </span>
              </label>

              {file && (
                <button
                  onClick={handleValidate}
                  disabled={validating}
                  className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-brand-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {validating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating Rows...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Validate & Preview Records</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation Summary & Preview Section */}
      {validationResult && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Total Roster Rows
              </span>
              <span className="text-3xl font-black text-slate-900">
                {validationResult.summary.totalRows}
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">
                Detected in uploaded spreadsheet
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                Valid Records
              </span>
              <span className="text-3xl font-black text-emerald-600">
                {validationResult.summary.validRows}
              </span>
              <span className="text-[11px] text-emerald-700/80 mt-2 block">
                Ready for database transaction
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-xs">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-1">
                Invalid Records
              </span>
              <span className="text-3xl font-black text-rose-600">
                {validationResult.summary.invalidRows}
              </span>
              <span className="text-[11px] text-rose-700/80 mt-2 block">
                Must be corrected before import
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium">
              Review records below. You can import all valid records or download an error report for failed rows.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setValidationResult(null);
                  setFile(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition"
              >
                Cancel
              </button>

              {validationResult.summary.invalidRows > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadErrorReport}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider transition border border-rose-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Error Report
                </button>
              )}

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={importing || validationResult.summary.validRows === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-brand-500/25"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing Records...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Import Valid Records ({validationResult.summary.validRows})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Records Preview Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Spreadsheet Record Validation Preview
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {validationResult.rows.length} rows processed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-950 text-white uppercase text-[10px] font-black tracking-wider border-b border-dark-800">
                  <tr>
                    <th className="py-4 px-6">Row #</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Member Name</th>
                    <th className="py-4 px-6">Contact Details</th>
                    <th className="py-4 px-6">Membership Plan</th>
                    <th className="py-4 px-6">Trainer</th>
                    <th className="py-4 px-6">Validation Notes / Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {validationResult.rows.map((r) => (
                    <tr
                      key={r.rowNumber}
                      className={`hover:bg-slate-50/70 transition ${
                        !r.isValid ? "bg-rose-50/30" : ""
                      }`}
                    >
                      <td className="py-4 px-6 font-mono font-bold text-slate-500">
                        #{r.rowNumber}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            r.isValid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {r.isValid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Valid</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Invalid</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{r.name || "—"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {r.memberId || "Auto-Generate"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-slate-900">{r.email || "—"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {r.mobile || "—"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {r.membershipPlan ? (
                          <span className="font-bold text-slate-800">{r.membershipPlan}</span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {r.trainer ? (
                          <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                            {r.trainer}
                          </span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {r.isValid ? (
                          <span className="text-emerald-600 text-[11px] font-semibold">
                            Ready for auto-provisioning
                          </span>
                        ) : (
                          <ul className="text-rose-600 text-[11px] list-disc list-inside space-y-0.5">
                            {r.errors.map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
