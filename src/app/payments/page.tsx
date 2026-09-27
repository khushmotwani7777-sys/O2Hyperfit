"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import {
  CreditCard,
  Plus,
  Search,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Loader2,
  Receipt,
} from "lucide-react";

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalRevenue: number; totalCount: number }>({
    totalRevenue: 0,
    totalCount: 0,
  });
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    memberId: "",
    amount: "",
    paymentMethod: "UPI",
    transactionRef: "",
    status: "COMPLETED",
    notes: "",
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (methodFilter) query.set("method", methodFilter);
      if (statusFilter) query.set("status", statusFilter);

      const res = await fetch(`/api/payments?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPayments(json.data);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (user?.role === "ADMIN") {
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
    fetchPayments();
    fetchMembers();
  }, [methodFilter, statusFilter]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setForm({
          memberId: "",
          amount: "",
          paymentMethod: "UPI",
          transactionRef: "",
          status: "COMPLETED",
          notes: "",
        });
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout
      title="Payment Management"
      subtitle={user?.role === "MEMBER" ? "Your invoices and payment receipts" : "Transactions and revenue bookkeeping"}
      actions={
        user?.role === "ADMIN" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </button>
        )
      }
    >
      {/* Revenue & Total Stats Banner */}
      {user?.role === "ADMIN" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Total Filtered Revenue</span>
              <span className="text-3xl font-black text-slate-800 tracking-tight">₹{stats.totalRevenue.toLocaleString()}</span>
              <p className="text-xs text-slate-500 mt-1">Across all matching payment methods</p>
            </div>
            <div className="p-4 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
              <IndianRupee className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Processed Transactions</span>
              <span className="text-3xl font-black text-slate-800 tracking-tight">{stats.totalCount}</span>
              <p className="text-xs text-slate-500 mt-1">Receipts generated</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Receipt className="h-7 w-7" />
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-7 w-7 text-brand-500 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No payment records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Receipt / ID</th>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{p.paymentId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {p.member?.fullName} ({p.member?.memberId})
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4"><Badge status={p.paymentMethod} /></td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{p.transactionRef || "-"}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">₹{p.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4"><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Gym Payment"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
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
              <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="4999"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="UPI">UPI</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transaction / Reference Number</label>
            <input
              type="text"
              value={form.transactionRef}
              onChange={(e) => setForm({ ...form, transactionRef: e.target.value })}
              placeholder="e.g. UPI/123456789 or POS Invoice"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Description</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Quarterly Plan Fee or Supplements"
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
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Payment"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
