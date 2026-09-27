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
  Edit2,
  Archive,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
} from "lucide-react";

export default function MembershipsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"plans" | "active" | "expired">("plans");
  const [memberships, setMemberships] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  // Forms
  const [planForm, setPlanForm] = useState({
    name: "",
    durationMonths: "3",
    price: "4999",
    description: "",
    features: "Full gym floor access, Cardio & strength zones, Locker facilities",
    status: "ACTIVE",
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
      const [resM, resP, resMem] = await Promise.all([
        fetch("/api/memberships"),
        fetch("/api/membership-plans"),
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
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/membership-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planForm.name,
          durationMonths: parseInt(planForm.durationMonths),
          price: parseFloat(planForm.price),
          description: planForm.description,
          features: planForm.features,
          status: planForm.status,
        }),
      });
      if (res.ok) {
        setIsPlanModalOpen(false);
        setPlanForm({
          name: "",
          durationMonths: "3",
          price: "4999",
          description: "",
          features: "Full gym floor access, Cardio & strength zones, Locker facilities",
          status: "ACTIVE",
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      const res = await fetch(`/api/membership-plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingPlan.name,
          durationMonths: parseInt(editingPlan.durationMonths),
          price: parseFloat(editingPlan.price),
          description: editingPlan.description,
          features: editingPlan.features,
          status: editingPlan.status,
        }),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingPlan(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (plan: any) => {
    const nextStatus = plan.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/membership-plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchivePlan = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to archive "${planName}"? Existing subscriptions will be preserved, but new members cannot be assigned this plan.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/membership-plans/${planId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchData();
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

  // Filter subscriptions
  const activeSubs = memberships.filter(
    (m) => m.status === "ACTIVE" || m.status === "EXPIRING_SOON"
  );
  const expiredSubs = memberships.filter(
    (m) => m.status === "EXPIRED" || m.status === "CANCELLED"
  );

  return (
    <AppLayout
      title="Membership Management"
      subtitle="Plans catalog, pricing matrix & member subscription tracking"
      allowedRoles={["ADMIN"]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            <Plus className="h-4 w-4 text-brand-500" />
            Create Plan
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-brand-500/25"
          >
            <Plus className="h-4 w-4" />
            Assign Subscription
          </button>
        </div>
      }
    >
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "plans"
              ? "bg-dark-950 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="h-4 w-4 text-brand-500" />
          Plans Catalog ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "active"
              ? "bg-dark-950 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          Active Subscriptions ({activeSubs.length})
        </button>
        <button
          onClick={() => setActiveTab("expired")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "expired"
              ? "bg-dark-950 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-rose-500" />
          Expired Subscriptions ({expiredSubs.length})
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex items-center justify-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
          Loading Membership Data...
        </div>
      ) : (
        <>
          {/* TAB 1: MEMBERSHIP PLANS CATALOG */}
          {activeTab === "plans" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((p) => {
                  const isArchived = p.status === "ARCHIVED";
                  const isActive = p.status === "ACTIVE";

                  return (
                    <div
                      key={p.id}
                      className={`rounded-3xl p-6 border flex flex-col justify-between transition-all duration-200 ${
                        isArchived
                          ? "bg-slate-100/70 border-slate-200 opacity-60"
                          : isActive
                          ? "bg-white border-slate-200 hover:border-brand-500/50 shadow-sm"
                          : "bg-amber-50/40 border-amber-200/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isArchived
                                ? "bg-slate-200 text-slate-600 border border-slate-300"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {p.status}
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {p._count?.memberships || 0} Members
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">
                          {p.name}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[32px]">
                          {p.description || "Full access gym membership tier."}
                        </p>

                        <div className="flex items-baseline gap-1 mb-4 pb-4 border-b border-slate-100">
                          <span className="text-3xl font-black text-slate-900">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            / {p.durationMonths} {p.durationMonths === 1 ? "month" : "months"}
                          </span>
                        </div>

                        {/* Included Features */}
                        <div className="space-y-2 mb-6">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Included Features
                          </span>
                          <ul className="text-xs text-slate-600 space-y-1.5">
                            {(p.features
                              ? p.features.split(",")
                              : ["Floor Access", "Cardio Zone", "Locker Room"]
                            ).map((feat: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
                                <span>{feat.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setEditingPlan({ ...p });
                            setIsEditModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          Edit
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(p)}
                            disabled={isArchived}
                            className={`p-1.5 rounded-xl border transition ${
                              isActive
                                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            } disabled:opacity-40`}
                            title={isActive ? "Deactivate Plan" : "Activate Plan"}
                          >
                            {isActive ? (
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-amber-600" />
                            )}
                          </button>

                          {!isArchived && (
                            <button
                              onClick={() => handleArchivePlan(p.id, p.name)}
                              className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition"
                              title="Archive Plan"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2 & 3: ACTIVE & EXPIRED SUBSCRIPTIONS TABLE */}
          {(activeTab === "active" || activeTab === "expired") && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-dark-950 text-white uppercase text-[10px] font-black tracking-wider border-b border-dark-800">
                    <tr>
                      <th className="py-4 px-6">Member</th>
                      <th className="py-4 px-6">Plan Name</th>
                      <th className="py-4 px-6">Validity Period</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {(activeTab === "active" ? activeSubs : expiredSubs).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                          No {activeTab} subscriptions recorded.
                        </td>
                      </tr>
                    ) : (
                      (activeTab === "active" ? activeSubs : expiredSubs).map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900">{m.member?.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {m.member?.memberId} • {m.member?.phone}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900 block">{m.plan?.name}</span>
                            <span className="text-[11px] text-slate-400">
                              {m.plan?.durationMonths} Months
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {new Date(m.startDate).toLocaleDateString()} &rarr;{" "}
                                {new Date(m.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900">
                            ₹{m.plan?.price?.toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-6">
                            <Badge status={m.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE PLAN MODAL */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Create Membership Plan"
        description="Add a new subscription tier with custom duration and pricing."
        maxWidth="md"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Plan Name *
            </label>
            <input
              type="text"
              required
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              placeholder="e.g. Half-Yearly Pro"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration (Months) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={36}
                value={planForm.durationMonths}
                onChange={(e) => setPlanForm({ ...planForm, durationMonths: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={planForm.price}
                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={planForm.description}
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              placeholder="Short summary of this membership plan..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Included Features (Comma-Separated)
            </label>
            <input
              type="text"
              value={planForm.features}
              onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
              placeholder="e.g. Cardio Zone, Sauna, InBody Scan, Locker"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-wider shadow-lg shadow-brand-500/25"
            >
              Create Plan
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPlan(null);
          }}
          title="Edit Membership Plan"
          description={`Update details, pricing, and features for ${editingPlan.name}.`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdatePlan} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Plan Name *
              </label>
              <input
                type="text"
                required
                value={editingPlan.name}
                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Duration (Months) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={36}
                  value={editingPlan.durationMonths}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, durationMonths: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={editingPlan.status}
                onChange={(e) => setEditingPlan({ ...editingPlan, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={editingPlan.description || ""}
                onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Included Features (Comma-Separated)
              </label>
              <input
                type="text"
                value={editingPlan.features || ""}
                onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPlan(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-wider shadow-lg shadow-brand-500/25"
              >
                Save Plan Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ASSIGN MEMBERSHIP MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Membership Subscription"
        description="Select an active member and attach a gym plan. Start and end dates are calculated automatically."
        maxWidth="md"
      >
        <form onSubmit={handleAssignPlan} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Member *
            </label>
            <select
              required
              value={assignForm.memberId}
              onChange={(e) => setAssignForm({ ...assignForm, memberId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.memberId}) - {m.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Plan *
            </label>
            <select
              required
              value={assignForm.planId}
              onChange={(e) => setAssignForm({ ...assignForm, planId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Choose Plan --</option>
              {plans
                .filter((p) => p.status === "ACTIVE")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ₹{p.price} ({p.durationMonths} Months)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={assignForm.startDate}
              onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={assignForm.notes}
              onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
              placeholder="e.g. Upgraded from Basic; promo discount applied."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black uppercase tracking-wider shadow-lg shadow-brand-500/25"
            >
              Assign Subscription
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
