"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import {
  Dumbbell,
  Plus,
  Trash2,
  Calendar,
  User,
  Clock,
  ChevronDown,
  Loader2,
} from "lucide-react";

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [exercisesList, setExercisesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Builder form
  const [form, setForm] = useState({
    planName: "",
    memberId: "",
    notes: "",
    exercises: [
      {
        exerciseId: "",
        dayOfWeek: "Monday (Chest & Tris)",
        sets: 3,
        reps: 10,
        weightKg: "",
        restSeconds: 60,
        trainerNotes: "",
      },
    ],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resW, resM, resE] = await Promise.all([
        fetch("/api/workouts"),
        user?.role !== "MEMBER" ? fetch("/api/members") : Promise.resolve(null),
        fetch("/api/exercises"),
      ]);

      const dataW = await resW.json();
      if (dataW.success) setWorkoutPlans(dataW.data);

      if (resM) {
        const dataM = await resM.json();
        if (dataM.success) setMembers(dataM.data);
      }

      const dataE = await resE.json();
      if (dataE.success) {
        setExercisesList(dataE.data);
        if (dataE.data.length > 0 && !form.exercises[0].exerciseId) {
          setForm((prev) => ({
            ...prev,
            exercises: [{ ...prev.exercises[0], exerciseId: dataE.data[0].id }],
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addExerciseRow = () => {
    setForm({
      ...form,
      exercises: [
        ...form.exercises,
        {
          exerciseId: exercisesList[0]?.id || "",
          dayOfWeek: "Monday",
          sets: 3,
          reps: 10,
          weightKg: "",
          restSeconds: 60,
          trainerNotes: "",
        },
      ],
    });
  };

  const removeExerciseRow = (index: number) => {
    setForm({
      ...form,
      exercises: form.exercises.filter((_, idx) => idx !== index),
    });
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        planName: form.planName,
        memberId: form.memberId,
        notes: form.notes,
        exercises: form.exercises.map((ex, i) => ({
          ...ex,
          weightKg: ex.weightKg ? parseFloat(ex.weightKg as string) : undefined,
          order: i + 1,
        })),
      };

      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setForm({
          planName: "",
          memberId: "",
          notes: "",
          exercises: [
            {
              exerciseId: exercisesList[0]?.id || "",
              dayOfWeek: "Monday (Chest & Tris)",
              sets: 3,
              reps: 10,
              weightKg: "",
              restSeconds: 60,
              trainerNotes: "",
            },
          ],
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workout routine?")) return;
    try {
      const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout
      title="Workout Management"
      subtitle={user?.role === "MEMBER" ? "Your personalized training routines" : "Customized member workout schedules and splits"}
      actions={
        user?.role !== "MEMBER" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="h-4 w-4" />
            Build Workout Plan
          </button>
        )
      }
    >
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : workoutPlans.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400">
          <Dumbbell className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-sm">No workout plans found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {workoutPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-black text-slate-800 text-base">{plan.planName}</h3>
                    <Badge status={plan.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Member: <span className="font-bold text-slate-700">{plan.member?.fullName}</span> ({plan.member?.memberId}) • Assigned by: {plan.trainer ? plan.trainer.name : "Staff"}
                  </p>
                  {plan.notes && <p className="text-xs text-slate-400 italic mt-1">{plan.notes}</p>}
                </div>

                {user?.role !== "MEMBER" && (
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                    title="Delete Plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Exercises inside plan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plan.exercises?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{item.exercise?.name}</span>
                        <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-semibold">
                          {item.exercise?.muscleGroup}
                        </span>
                      </div>
                      <span className="text-slate-400 block text-[11px] mb-3">{item.dayOfWeek}</span>

                      {item.trainerNotes && (
                        <p className="text-[11px] text-slate-500 italic mb-3 bg-white p-2 rounded-lg border border-slate-100">
                          {item.trainerNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 font-medium">
                      <span>{item.sets} Sets × {item.reps} Reps</span>
                      <span className="font-bold text-emerald-600">
                        {item.weightKg ? `${item.weightKg} kg` : "Bodyweight"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Build Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Build New Workout Routine"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Plan Name *</label>
              <input
                type="text"
                required
                value={form.planName}
                onChange={(e) => setForm({ ...form, planName: e.target.value })}
                placeholder="e.g. 4-Day Strength & Hypertrophy"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

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
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Trainer Guidance / Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Progressive overload weekly. Focus on eccentric tempo."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Exercises in this Routine</span>
              <button
                type="button"
                onClick={addExerciseRow}
                className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-semibold flex items-center gap-1 hover:bg-emerald-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Exercise
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {form.exercises.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Exercise</label>
                      <select
                        required
                        value={item.exerciseId}
                        onChange={(e) => {
                          const updated = [...form.exercises];
                          updated[idx].exerciseId = e.target.value;
                          setForm({ ...form, exercises: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      >
                        {exercisesList.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name} ({ex.muscleGroup})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Day / Split</label>
                      <input
                        type="text"
                        required
                        value={item.dayOfWeek}
                        onChange={(e) => {
                          const updated = [...form.exercises];
                          updated[idx].dayOfWeek = e.target.value;
                          setForm({ ...form, exercises: updated });
                        }}
                        placeholder="e.g. Monday (Push)"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Sets</label>
                      <input
                        type="number"
                        min="1"
                        value={item.sets}
                        onChange={(e) => {
                          const updated = [...form.exercises];
                          updated[idx].sets = parseInt(e.target.value) || 1;
                          setForm({ ...form, exercises: updated });
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Reps</label>
                      <input
                        type="number"
                        min="1"
                        value={item.reps}
                        onChange={(e) => {
                          const updated = [...form.exercises];
                          updated[idx].reps = parseInt(e.target.value) || 1;
                          setForm({ ...form, exercises: updated });
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={item.weightKg}
                        onChange={(e) => {
                          const updated = [...form.exercises];
                          updated[idx].weightKg = e.target.value;
                          setForm({ ...form, exercises: updated });
                        }}
                        placeholder="Opt."
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="flex items-end">
                      {form.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExerciseRow(idx)}
                          className="w-full py-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Workout Plan"}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
