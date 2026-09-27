"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import {
  Banknote,
  Plus,
  History,
  TrendingUp,
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Loader2,
  ArrowRight,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function StaffSalaryPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Selected for editing / history
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Forms
  const [addForm, setAddForm] = useState({
    employeeId: "",
    trainerId: "",
    name: "",
    role: "Strength & Conditioning Coach",
    salaryType: "MONTHLY",
    salaryAmount: "35000",
    paymentFrequency: "Monthly on 1st",
    joiningDate: new Date().toISOString().split("T")[0],
    employmentStatus: "ACTIVE",
    notes: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    salaryType: "MONTHLY",
    salaryAmount: "",
    paymentFrequency: "",
    employmentStatus: "ACTIVE",
    notes: "",
    changeReason: "",
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStaff, resTrainers] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/trainers"),
      ]);

      const [dataStaff, dataTrainers] = await Promise.all([
        resStaff.json(),
        resTrainers.json(),
      ]);

      if (dataStaff.success) setStaffList(dataStaff.data);
      if (dataTrainers.success) setTrainers(dataTrainers.data);
    } catch (err) {
      console.error("Fetch salary error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTrainerSelect = (trainerId: string) => {
    const t = trainers.find((tr) => tr.id === trainerId);
    if (t) {
      setAddForm({
        ...addForm,
        trainerId: t.id,
        name: t.name,
        employeeId: t.trainerId ? `EMP-${t.trainerId.replace(/[^0-9]/g, "").padStart(3, "0")}` : addForm.employeeId,
        role: t.specialization || "Fitness Coach",
      });
    } else {
      setAddForm({ ...addForm, trainerId: "" });
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAddModalOpen(false);
        setAddForm({
          employeeId: "",
          trainerId: "",
          name: "",
          role: "Strength & Conditioning Coach",
          salaryType: "MONTHLY",
          salaryAmount: "35000",
          paymentFrequency: "Monthly on 1st",
          joiningDate: new Date().toISOString().split("T")[0],
          employmentStatus: "ACTIVE",
          notes: "",
        });
        fetchData();
      } else {
        alert(data.error || "Failed to add staff salary");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      const res = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsEditModalOpen(false);
        setSelectedStaff(null);
        fetchData();
      } else {
        alert(data.error || "Failed to update salary");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleViewHistory = async (staff: any) => {
    setSelectedStaff(staff);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/staff/${staff.id}/salary-history`);
      const data = await res.json();
      if (data.success) {
        setSalaryHistory(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Metrics calculation
  const totalMonthlyPayroll = staffList
    .filter((s) => s.employmentStatus === "ACTIVE")
    .reduce((acc, curr) => {
      if (curr.salaryType === "MONTHLY") return acc + curr.salaryAmount;
      if (curr.salaryType === "WEEKLY") return acc + curr.salaryAmount * 4.33;
      if (curr.salaryType === "DAILY") return acc + curr.salaryAmount * 26;
      if (curr.salaryType === "HOURLY") return acc + curr.salaryAmount * 160;
      return acc + curr.salaryAmount;
    }, 0);

  return (
    <AppLayout
      title="Staff & Trainer Salary Management"
      subtitle="Confidential compensation records, salary structure & revision history"
      allowedRoles={["ADMIN"]}
      actions={
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-brand-500/25"
        >
          <Plus className="h-4 w-4" />
          <span>Add Staff Salary</span>
        </button>
      }
    >
      {/* Confidentiality Notice */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Confidential Administrative Console:</span> Salary records and compensation histories are strictly restricted to administrators. Normal trainers and gym members cannot access these records.
          </div>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Estimated Monthly Payroll
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              ₹{Math.round(totalMonthlyPayroll).toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Across active coaches and floor personnel
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Total Staff on Payroll
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{staffList.length}</span>
            <span className="text-xs text-emerald-600 font-bold">
              ({staffList.filter((s) => s.employmentStatus === "ACTIVE").length} Active)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Trainers, nutritionists & administrative staff
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Average Monthly Compensation
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              ₹
              {staffList.length > 0
                ? Math.round(totalMonthlyPayroll / (staffList.length || 1)).toLocaleString("en-IN")
                : 0}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Standard compensation package average
          </span>
        </div>
      </div>

      {/* Staff Salary Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Employee Compensation Register
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Showing {staffList.length} records
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex items-center justify-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
            Loading Compensation Data...
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">
            No staff salary records registered yet. Click &quot;Add Staff Salary&quot; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-950 text-white uppercase text-[10px] font-black tracking-wider border-b border-dark-800">
                <tr>
                  <th className="py-4 px-6">Employee ID</th>
                  <th className="py-4 px-6">Staff Name</th>
                  <th className="py-4 px-6">Role / Designation</th>
                  <th className="py-4 px-6">Salary Type</th>
                  <th className="py-4 px-6">Salary Amount</th>
                  <th className="py-4 px-6">Frequency</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {s.employeeId}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Joined: {new Date(s.joiningDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">{s.role}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                        {s.salaryType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-black text-slate-900">
                        ₹{s.salaryAmount?.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{s.paymentFrequency}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          s.employmentStatus === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {s.employmentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewHistory(s)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider transition"
                          title="View Salary History"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" />
                          <span>History</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStaff(s);
                            setEditForm({
                              name: s.name,
                              role: s.role,
                              salaryType: s.salaryType,
                              salaryAmount: String(s.salaryAmount),
                              paymentFrequency: s.paymentFrequency,
                              employmentStatus: s.employmentStatus,
                              notes: s.notes || "",
                              changeReason: "",
                              effectiveDate: new Date().toISOString().split("T")[0],
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
                          title="Edit Salary / Log Increment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD STAFF SALARY MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Salary Record"
        description="Attach salary details to an existing trainer or register an independent staff member."
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          {trainers.length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Link to Existing Trainer (Optional)
              </label>
              <select
                value={addForm.trainerId}
                onChange={(e) => handleTrainerSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- None / Independent Staff Member --</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.trainerId}) - {t.specialization}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={addForm.employeeId}
                onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
                placeholder="e.g. EMP-003"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Role / Designation *
              </label>
              <input
                type="text"
                required
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                placeholder="e.g. Head Coach"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Joining Date
              </label>
              <input
                type="date"
                value={addForm.joiningDate}
                onChange={(e) => setAddForm({ ...addForm, joiningDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Salary Type *
              </label>
              <select
                value={addForm.salaryType}
                onChange={(e) => setAddForm({ ...addForm, salaryType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="DAILY">Daily</option>
                <option value="HOURLY">Hourly</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Salary Amount (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={addForm.salaryAmount}
                onChange={(e) => setAddForm({ ...addForm, salaryAmount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Frequency
            </label>
            <input
              type="text"
              value={addForm.paymentFrequency}
              onChange={(e) => setAddForm({ ...addForm, paymentFrequency: e.target.value })}
              placeholder="e.g. Monthly on 1st, Bi-weekly on Fridays"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              rows={2}
              value={addForm.notes}
              onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
              placeholder="Probation details, bonus incentives, or cert prerequisites..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-wider shadow-lg shadow-brand-500/25"
            >
              Save Staff Record
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT SALARY / LOG INCREMENT MODAL */}
      {selectedStaff && isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedStaff(null);
          }}
          title={`Adjust Salary: ${selectedStaff.name}`}
          description="Updates here are automatically recorded in the employee's audit history."
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role / Designation
                </label>
                <input
                  type="text"
                  required
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Employment Status
                </label>
                <select
                  value={editForm.employmentStatus}
                  onChange={(e) => setEditForm({ ...editForm, employmentStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_LEAVE">ON LEAVE</option>
                  <option value="TERMINATED">TERMINATED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Salary Type *
                </label>
                <select
                  value={editForm.salaryType}
                  onChange={(e) => setEditForm({ ...editForm, salaryType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="DAILY">Daily</option>
                  <option value="HOURLY">Hourly</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Salary Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editForm.salaryAmount}
                  onChange={(e) => setEditForm({ ...editForm, salaryAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={editForm.effectiveDate}
                  onChange={(e) => setEditForm({ ...editForm, effectiveDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Payment Frequency
                </label>
                <input
                  type="text"
                  value={editForm.paymentFrequency}
                  onChange={(e) => setEditForm({ ...editForm, paymentFrequency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Change Reason / Increment Notes
              </label>
              <input
                type="text"
                value={editForm.changeReason}
                onChange={(e) => setEditForm({ ...editForm, changeReason: e.target.value })}
                placeholder="e.g. Annual merit increment, promotion to Senior Coach..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedStaff(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-wider shadow-lg shadow-brand-500/25"
              >
                Save & Log History
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* SALARY HISTORY MODAL */}
      {selectedStaff && isHistoryModalOpen && (
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setSelectedStaff(null);
          }}
          title={`Salary Audit Trail: ${selectedStaff.name}`}
          description={`Employee ID: ${selectedStaff.employeeId} • Role: ${selectedStaff.role}`}
          maxWidth="lg"
        >
          {loadingHistory ? (
            <div className="p-8 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
              Loading Audit Trail...
            </div>
          ) : salaryHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              No historical revisions logged.
            </div>
          ) : (
            <div className="space-y-4 my-2">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {salaryHistory.map((h, idx) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white" />
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-sm font-black text-slate-900">
                          ₹{h.salaryAmount?.toLocaleString("en-IN")}{" "}
                          <span className="text-[11px] font-normal text-slate-500">
                            / {h.salaryType}
                          </span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(h.effectiveDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{h.notes || "Salary record established."}</p>
                      {h.changedBy && (
                        <div className="text-[10px] text-slate-400 mt-2 font-mono">
                          Recorded by: {h.changedBy.name} ({h.changedBy.role})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </AppLayout>
  );
}
