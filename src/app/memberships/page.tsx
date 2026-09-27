"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import {
  CreditCard,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Calendar,
  User,
} from "lucide-react";

export default function MembershipsPage() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Forms
  const [planForm, setPlanForm] = useState({
    name: "",
    durationMonths: "3",
    price: "4999",
    description: "",
  });

  const [assignForm, setAssignForm] = useState({
    memberId: "",
    planId: "",
    startDate: new Date().toISOString().split("T")[0],
    autoRenew: false,
    notes: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const [resM, resP, resMem] = await Promise.all([
        fetch(`/api/memberships${query}`),
        fetch("/api/memberships/plans"),
        fetch("/api/members"),
      ]);

      const [dataM, dataP, dataMem] = await Promise.all([
        resM.json(),
        resP.json(),
        resMem.json(),
      ]);

      if (dataM.success) setMemberships(dataM.data);
      if (dataP.success) setPlans(dataP.data);
      if (dataMem.success) setMembers(dataMem.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/memberships/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planForm.name,
          durationMonths: parseInt(planForm.durationMonths),
          price: parseFloat(planForm.price),
          description: planForm.description,
        }),
      });
      if (res.ok) {
        setIsPlanModalOpen(false);
        setPlanForm({ name: "", durationMonths: "3", price: "4999", description: "" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignForm),
      });
      if (res.ok) {
        setIsAssignModalOpen(false);
        setAssignForm({
          memberId: "",
          planId: "",
          startDate: new Date().toISOString().split("T")[0],
          autoRenew: false,
          notes: "",
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout
      title="Membership Management"
      subtitle="Plans catalog and member subscription tracking"
      allowedRoles={["ADMIN"]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <Plus className="h-4 w-4" />
            Create Plan
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            Assign Subscription
          </button>
        </div>
      }
    >
      {/* Plans Showcase Grid */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-brand-600" />
          Active Gym Plans Catalog
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 text-sm">{p.name}</h3>
                  <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                    {p.durationMonths} Mo
                  </span>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-black text-slate-900">₹{p.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 ml-1">/ cycle</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{p.description || "Full access plan"}</p>
              </div>
              <div className="pt-3 mt-4 border-t border-slate-100 text-[11px] text-slate-400">
                {p._count?.memberships || 0} active subscribers
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Tracker Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Member Subscriptions Tracker</h3>
            <p className="text-xs text-slate-500">Live status of all member gym passes</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="EXPIRING_SOON">Expiring Soon (7d)</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-7 w-7 text-brand-500 animate-spin" />
          </div>
        ) : memberships.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No subscriptions found for this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4">Renewal</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberships.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{m.member.fullName}</div>
                      <div className="text-[11px] text-slate-500">{m.member.memberId} • {m.member.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{m.plan.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{new Date(m.startDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-slate-600">{new Date(m.endDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      {m.autoRenew ? (
                        <span className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[11px] font-medium">Auto-renew ON</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Manual</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Create New Membership Plan"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Plan Name *</label>
            <input
              type="text"
              required
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              placeholder="e.g. VIP Elite 6-Month"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (Months) *</label>
              <input
                type="number"
                min="1"
                required
                value={planForm.durationMonths}
                onChange={(e) => setPlanForm({ ...planForm, durationMonths: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                min="0"
                required
                value={planForm.price}
                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Perks</label>
            <textarea
              rows={3}
              value={planForm.description}
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              placeholder="Full gym access, sauna, complimentary trainer consultation..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold"
            >
              Save Plan
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Plan Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Membership Plan to Member"
      >
        <form onSubmit={handleAssignPlan} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Member *</label>
            <select
              required
              value={assignForm.memberId}
              onChange={(e) => setAssignForm({ ...assignForm, memberId: e.target.value })}
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
            <label className="block font-semibold text-slate-700 mb-1">Select Plan *</label>
            <select
              required
              value={assignForm.planId}
              onChange={(e) => setAssignForm({ ...assignForm, planId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            >
              <option value="">-- Choose Membership Plan --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.durationMonths} Mo - ₹{p.price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={assignForm.startDate}
              onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRenew"
              checked={assignForm.autoRenew}
              onChange={(e) => setAssignForm({ ...assignForm, autoRenew: e.target.checked })}
              className="rounded text-brand-500"
            />
            <label htmlFor="autoRenew" className="text-slate-700 font-medium">Enable Auto-Renewal</label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold"
            >
              Assign Subscription
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
