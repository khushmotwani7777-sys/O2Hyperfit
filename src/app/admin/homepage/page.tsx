"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { defaultHomepageConfig } from "@/lib/homepageConfig";
import {
  Layout,
  Save,
  Send,
  RotateCcw,
  History,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Dumbbell,
  ShieldCheck,
  Users,
  CreditCard,
  CalendarCheck,
  FileSpreadsheet,
  Star,
  Smartphone,
  Monitor,
} from "lucide-react";

export default function HomePageEditor() {
  const { user } = useAuth();
  const [sections, setSections] = useState<any>(defaultHomepageConfig);
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string>("order");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

  // Notifications
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isRevisionsModalOpen, setIsRevisionsModalOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState("");
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  // Database-backed items
  const [activeTrainers, setActiveTrainers] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    content: "",
    rating: 5,
  });

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/homepage");
      const data = await res.json();
      if (data.success) {
        setSections(data.data || defaultHomepageConfig);
        setIsPublished(data.isPublished);
        setActiveTrainers(data.trainers || []);
        setTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load homepage configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections, isDraft: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsPublished(false);
        showToast("Draft saved successfully. Preview and click Publish when ready.");
      } else {
        showToast(data.error || "Failed to save draft", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const res = await fetch("/api/admin/homepage/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections, changeSummary }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsPublished(true);
        setIsPublishModalOpen(false);
        setChangeSummary("");
        showToast(data.message || "Homepage published to live successfully!");
      } else {
        showToast(data.error || "Failed to publish", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscardChanges = async () => {
    if (!confirm("Discard all unsaved edits and reload current live version?")) return;
    await loadData();
    showToast("Unsaved changes discarded.");
  };

  const handleOpenRevisions = async () => {
    setIsRevisionsModalOpen(true);
    setLoadingRevisions(true);
    try {
      const res = await fetch("/api/admin/homepage/revisions");
      const data = await res.json();
      if (data.success) {
        setRevisions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleRestoreRevision = async (revId: string, versionId: string) => {
    if (!confirm(`Restore ${versionId} as draft?`)) return;
    try {
      const res = await fetch("/api/admin/homepage/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId: revId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSections(data.data);
        setIsPublished(false);
        setIsRevisionsModalOpen(false);
        showToast(`Restored ${versionId} as draft.`);
      } else {
        showToast(data.error || "Failed to restore revision", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Section Ordering Helpers
  const moveSection = (index: number, direction: "up" | "down") => {
    const list = [...(sections.sectionOrder || [])];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setSections({ ...sections, sectionOrder: list });
    setIsPublished(false);
  };

  const toggleSectionVisibility = (secKey: string) => {
    const vis = { ...(sections.sectionVisibility || {}) };
    vis[secKey] = !vis[secKey];
    setSections({ ...sections, sectionVisibility: vis });
    setIsPublished(false);
  };

  // Testimonial API handlers
  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.name || !newTestimonial.content) return;
    try {
      const res = await fetch("/api/admin/homepage/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTestimonial),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestimonials([...testimonials, data.data]);
        setNewTestimonial({ name: "", content: "", rating: 5 });
        showToast("Testimonial added");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/homepage/testimonials/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTestimonials(testimonials.filter((t) => t.id !== id));
        showToast("Testimonial removed");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const sectionNames: Record<string, string> = {
    hero: "1. Hero Banner",
    stats: "2. Live Statistics Bar",
    features: "3. Core Features (6 Cards)",
    assessments: "4. Machine Assessments (BMI)",
    memberships: "5. Membership Tiers",
    trainers: "6. Coaches & Trainers",
    testimonials: "7. Athlete Transformations",
    about: "8. About O2 HyperFit",
    cta: "9. Call to Action (CTA)",
    contact: "10. Contact Information",
    footer: "11. Brand Footer",
  };

  return (
    <AppLayout
      title="Public Website Editor"
      subtitle="Visual CMS for customizing the public O2 HyperFit landing page"
      allowedRoles={["ADMIN"]}
      actions={
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
              isPublished
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse"
            }`}
          >
            {isPublished ? "● Live / Published" : "● Draft (Unpublished)"}
          </span>

          <button
            onClick={handleOpenRevisions}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
            title="View Revision History"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Revisions</span>
          </button>

          <button
            onClick={handleDiscardChanges}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition"
            title="Discard Unsaved Changes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Discard</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-dark-900 hover:bg-dark-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-brand-500" />}
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-brand-500/25"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Live</span>
          </button>
        </div>
      }
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-xl flex items-center gap-3 text-xs font-bold ${
            toastMsg.type === "success"
              ? "bg-dark-950 text-white border-emerald-500/40"
              : "bg-dark-950 text-white border-rose-500/40"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Mobile Toggle Bar */}
      <div className="lg:hidden flex items-center gap-2 mb-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            mobileTab === "editor" ? "bg-dark-950 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Editor Controls
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            mobileTab === "preview" ? "bg-dark-950 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Live Preview
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex items-center justify-center gap-3 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
          Loading Homepage Studio...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: EDITOR CONTROLS (5 Cols on Desktop) */}
          {/* ======================================================== */}
          <div
            className={`lg:col-span-5 space-y-4 ${
              mobileTab === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Logo Protection Notice */}
            <div className="p-3.5 bg-dark-950 text-white rounded-2xl border border-dark-800 flex items-center gap-3 shadow-xs">
              <div className="relative w-8 h-8 shrink-0">
                <Image src="/logo.png" alt="O2 HyperFit" fill className="object-contain" />
              </div>
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-brand-500">Official Brand Logo:</span> Preserved from official asset. Modifying or redrawing the brand emblem is restricted.
              </div>
            </div>

            {/* ACCORDION 1: SECTION ORDER & VISIBILITY */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "order" ? "" : "order")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Layout className="w-4 h-4 text-brand-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Section Order & Visibility
                  </span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeAccordion === "order" ? "rotate-90" : ""
                  }`}
                />
              </button>

              {activeAccordion === "order" && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
                  <p className="text-[11px] text-slate-500 mb-3">
                    Use Move Up / Move Down buttons to rearrange sections. Click the eye icon to toggle visibility on the public site.
                  </p>
                  {(sections.sectionOrder || []).map((secKey: string, idx: number) => {
                    const isVisible = sections.sectionVisibility?.[secKey] !== false;
                    return (
                      <div
                        key={secKey}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs"
                      >
                        <span className="text-xs font-bold text-slate-800">
                          {sectionNames[secKey] || secKey}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleSectionVisibility(secKey)}
                            className={`p-1.5 rounded-lg border transition ${
                              isVisible
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-400 border-slate-200"
                            }`}
                            title={isVisible ? "Visible (Click to hide)" : "Hidden (Click to show)"}
                          >
                            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSection(idx, "up")}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === (sections.sectionOrder?.length || 0) - 1}
                            onClick={() => moveSection(idx, "down")}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ACCORDION 2: HERO SECTION EDITOR */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "hero" ? "" : "hero")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Hero Banner Editor
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeAccordion === "hero" ? "rotate-90" : ""
                  }`}
                />
              </button>

              {activeAccordion === "hero" && (
                <div className="p-4 border-t border-slate-100 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Small Tagline
                    </label>
                    <input
                      type="text"
                      value={sections.hero?.smallHeading || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          hero: { ...sections.hero, smallHeading: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Main Headline
                    </label>
                    <input
                      type="text"
                      value={sections.hero?.mainHeading || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          hero: { ...sections.hero, mainHeading: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Highlighted Accent Text
                    </label>
                    <input
                      type="text"
                      value={sections.hero?.highlightedText || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          hero: { ...sections.hero, highlightedText: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={sections.hero?.description || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          hero: { ...sections.hero, description: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={sections.hero?.primaryBtnText || ""}
                        onChange={(e) =>
                          setSections({
                            ...sections,
                            hero: { ...sections.hero, primaryBtnText: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Primary Action Link
                      </label>
                      <input
                        type="text"
                        value={sections.hero?.primaryBtnAction || ""}
                        onChange={(e) =>
                          setSections({
                            ...sections,
                            hero: { ...sections.hero, primaryBtnAction: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Background Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={sections.hero?.bgImageUrl || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          hero: { ...sections.hero, bgImageUrl: e.target.value },
                        })
                      }
                      placeholder="https://... or leave blank for dark athletic motif"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 3: STATISTICS BAR */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "stats" ? "" : "stats")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Live Statistics Bar
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeAccordion === "stats" ? "rotate-90" : ""
                  }`}
                />
              </button>

              {activeAccordion === "stats" && (
                <div className="p-4 border-t border-slate-100 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Section Header
                    </label>
                    <input
                      type="text"
                      value={sections.stats?.title || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          stats: { ...sections.stats, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Statistics Metrics
                    </span>
                    {(sections.stats?.items || []).map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const newItems = [...sections.stats.items];
                              newItems[idx].label = e.target.value;
                              setSections({
                                ...sections,
                                stats: { ...sections.stats, items: newItems },
                              });
                            }}
                            className="font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-brand-500 focus:outline-none"
                          />
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600">
                            <input
                              type="checkbox"
                              checked={item.isDynamic}
                              onChange={(e) => {
                                const newItems = [...sections.stats.items];
                                newItems[idx].isDynamic = e.target.checked;
                                setSections({
                                  ...sections,
                                  stats: { ...sections.stats, items: newItems },
                                });
                              }}
                              className="rounded text-brand-500"
                            />
                            <span>Live Database Count</span>
                          </label>
                        </div>
                        {!item.isDynamic && (
                          <div>
                            <input
                              type="text"
                              value={item.value}
                              onChange={(e) => {
                                const newItems = [...sections.stats.items];
                                newItems[idx].value = e.target.value;
                                setSections({
                                  ...sections,
                                  stats: { ...sections.stats, items: newItems },
                                });
                              }}
                              placeholder="Fallback/Custom Value"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 4: FEATURES SECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "features" ? "" : "features")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Feature Highlights (6 Cards)
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeAccordion === "features" ? "rotate-90" : ""
                  }`}
                />
              </button>

              {activeAccordion === "features" && (
                <div className="p-4 border-t border-slate-100 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={sections.features?.title || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          features: { ...sections.features, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Section Subtitle
                    </label>
                    <input
                      type="text"
                      value={sections.features?.description || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          features: { ...sections.features, description: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    {(sections.features?.items || []).map((feat: any, idx: number) => (
                      <div
                        key={feat.id || idx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-brand-600 uppercase">
                            Feature #{idx + 1}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={feat.title}
                          onChange={(e) => {
                            const newItems = [...sections.features.items];
                            newItems[idx].title = e.target.value;
                            setSections({
                              ...sections,
                              features: { ...sections.features, items: newItems },
                            });
                          }}
                          placeholder="Feature Title"
                          className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg"
                        />
                        <textarea
                          rows={2}
                          value={feat.description}
                          onChange={(e) => {
                            const newItems = [...sections.features.items];
                            newItems[idx].description = e.target.value;
                            setSections({
                              ...sections,
                              features: { ...sections.features, items: newItems },
                            });
                          }}
                          placeholder="Feature Description"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 5: MEMBERSHIP PLANS CALLOUT */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "membership" ? "" : "membership")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Membership Plans Section
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeAccordion === "membership" ? "rotate-90" : ""
                  }`}
                />
              </button>

              {activeAccordion === "membership" && (
                <div className="p-4 border-t border-slate-100 space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 leading-relaxed">
                    <span className="font-bold">Real-Time Database Sync:</span> As requested, membership plan prices, durations, and features are NOT duplicated in the CMS. The public landing page renders active plans directly from the database table.
                  </div>
                  <div>
                    <Link
                      href="/memberships"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-dark-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-brand-500" />
                      Manage Database Plans
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 6: TESTIMONIALS SECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "testimonials" ? "" : "testimonials")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Athlete Testimonials ({testimonials.length})
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeAccordion === "testimonials" ? "rotate-90" : ""
                  }`}
                />
              </button>

              {activeAccordion === "testimonials" && (
                <div className="p-4 border-t border-slate-100 space-y-4 text-xs">
                  {/* List of existing */}
                  <div className="space-y-2">
                    {testimonials.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900">{t.name}</span>
                            <span className="text-[10px] text-amber-500 flex items-center">
                              ★ {t.rating}
                            </span>
                          </div>
                          <p className="text-slate-600 italic text-[11px]">&quot;{t.content}&quot;</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add new testimonial form */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                      Add New Member Review
                    </span>
                    <input
                      type="text"
                      placeholder="Member Name"
                      value={newTestimonial.name}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <textarea
                      rows={2}
                      placeholder="Testimonial text..."
                      value={newTestimonial.content}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddTestimonial}
                      className="px-3.5 py-1.5 bg-dark-900 hover:bg-dark-800 text-white rounded-lg font-bold text-xs"
                    >
                      + Add Testimonial
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 7: ABOUT & STORY */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "about" ? "" : "about")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  About & Gym Story
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeAccordion === "about" ? "rotate-90" : ""
                  }`}
                />
              </button>

              {activeAccordion === "about" && (
                <div className="p-4 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Heading
                    </label>
                    <input
                      type="text"
                      value={sections.about?.heading || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          about: { ...sections.about, heading: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Lead Paragraph
                    </label>
                    <textarea
                      rows={2}
                      value={sections.about?.description || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          about: { ...sections.about, description: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Story
                    </label>
                    <textarea
                      rows={3}
                      value={sections.about?.gymStory || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          about: { ...sections.about, gymStory: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ACCORDION 8: CONTACT & SOCIAL */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "contact" ? "" : "contact")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Contact & Social Media Links
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeAccordion === "contact" ? "rotate-90" : ""
                  }`}
                />
              </button>

              {activeAccordion === "contact" && (
                <div className="p-4 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={sections.contact?.address || ""}
                      onChange={(e) =>
                        setSections({
                          ...sections,
                          contact: { ...sections.contact, address: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={sections.contact?.phone || ""}
                        onChange={(e) =>
                          setSections({
                            ...sections,
                            contact: { ...sections.contact, phone: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={sections.contact?.email || ""}
                        onChange={(e) =>
                          setSections({
                            ...sections,
                            contact: { ...sections.contact, email: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Instagram URL
                      </label>
                      <input
                        type="text"
                        value={sections.contact?.instagramUrl || ""}
                        onChange={(e) =>
                          setSections({
                            ...sections,
                            contact: { ...sections.contact, instagramUrl: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Facebook URL
                      </label>
                      <input
                        type="text"
                        value={sections.contact?.facebookUrl || ""}
                        onChange={(e) =>
                          setSections({
                            ...sections,
                            contact: { ...sections.contact, facebookUrl: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        WhatsApp URL
                      </label>
                      <input
                        type="text"
                        value={sections.contact?.whatsappUrl || ""}
                        onChange={(e) =>
                          setSections({
                            ...sections,
                            contact: { ...sections.contact, whatsappUrl: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: REAL-TIME INTERACTIVE LIVE PREVIEW */}
          {/* ======================================================== */}
          <div
            className={`lg:col-span-7 bg-dark-950 rounded-3xl border border-dark-800 overflow-hidden shadow-2xl ${
              mobileTab === "editor" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Live Preview Device Toolbar */}
            <div className="bg-dark-900 px-4 py-3 border-b border-dark-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Live Viewport Preview
                </span>
              </div>
              <div className="flex items-center gap-1 bg-dark-950 p-1 rounded-xl border border-dark-750">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    previewDevice === "desktop"
                      ? "bg-brand-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Desktop Viewport"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    previewDevice === "mobile"
                      ? "bg-brand-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Mobile Viewport"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Viewport Container */}
            <div
              className={`p-4 sm:p-6 transition-all duration-300 max-h-[85vh] overflow-y-auto ${
                previewDevice === "mobile" ? "max-w-sm mx-auto" : "w-full"
              }`}
            >
              {/* Preview Header */}
              <div className="flex items-center justify-between pb-6 border-b border-dark-800">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image src="/logo.png" alt="O2 HyperFit" fill className="object-contain" />
                  </div>
                  <div>
                    <span className="text-base font-black text-white block leading-none">
                      O2 HYPERFIT
                    </span>
                    <span className="text-[9px] font-bold text-brand-500 tracking-widest uppercase">
                      More Than A Gym
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg bg-brand-500 text-white text-[10px] font-bold uppercase">
                  Portal Login
                </div>
              </div>

              {/* Render Sections in Configured Order */}
              <div className="space-y-12 py-8">
                {(sections.sectionOrder || []).map((secKey: string) => {
                  if (sections.sectionVisibility?.[secKey] === false) return null;

                  if (secKey === "hero") {
                    return (
                      <div key={secKey} className="text-center py-6">
                        <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-black uppercase tracking-widest inline-block mb-3">
                          {sections.hero?.smallHeading || "MORE SWEAT MORE GLORY"}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
                          {sections.hero?.mainHeading || "TRAIN. TRACK. TRANSFORM."}{" "}
                          <span className="text-brand-500">
                            {sections.hero?.highlightedText || "REACH YOUR PEAK"}
                          </span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
                          {sections.hero?.description}
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-6">
                          <span className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-wider">
                            {sections.hero?.primaryBtnText || "GET STARTED"}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (secKey === "stats") {
                    return (
                      <div key={secKey} className="bg-dark-900 p-4 rounded-2xl border border-dark-800">
                        <span className="text-[10px] font-black uppercase text-brand-500 tracking-widest block text-center mb-3">
                          {sections.stats?.title}
                        </span>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          {(sections.stats?.items || []).map((item: any, i: number) => (
                            <div key={i} className="p-2.5 bg-dark-950 rounded-xl border border-dark-800">
                              <span className="text-lg font-black text-white block">
                                {item.isDynamic ? "Live DB Count" : item.value}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (secKey === "features") {
                    return (
                      <div key={secKey} className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-lg font-black text-white uppercase">
                            {sections.features?.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {sections.features?.description}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(sections.features?.items || []).map((feat: any, i: number) => (
                            <div
                              key={i}
                              className="p-3 bg-dark-900 rounded-xl border border-dark-800 text-left"
                            >
                              <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-500 flex items-center justify-center mb-2">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                              <div className="font-bold text-white text-xs">{feat.title}</div>
                              <div className="text-[11px] text-slate-400 mt-1">{feat.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (secKey === "assessments") {
                    return (
                      <div key={secKey} className="p-5 bg-dark-900 rounded-2xl border border-brand-500/30">
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest block">
                          Biometrics & Analytics
                        </span>
                        <h3 className="text-base font-black text-white uppercase mt-1">
                          {sections.assessments?.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {sections.assessments?.description}
                        </p>
                      </div>
                    );
                  }

                  if (secKey === "memberships") {
                    return (
                      <div key={secKey} className="text-center p-4 bg-dark-900/60 rounded-2xl border border-dark-800">
                        <h3 className="text-base font-black text-white uppercase">
                          {sections.memberships?.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {sections.memberships?.description}
                        </p>
                        <div className="mt-3 text-[11px] text-brand-400 font-mono">
                          [Renders live database plans automatically]
                        </div>
                      </div>
                    );
                  }

                  if (secKey === "testimonials") {
                    return (
                      <div key={secKey} className="space-y-3">
                        <h3 className="text-base font-black text-white uppercase text-center">
                          {sections.testimonials?.title}
                        </h3>
                        <div className="space-y-2">
                          {testimonials.slice(0, 2).map((t, idx) => (
                            <div key={idx} className="p-3 bg-dark-900 rounded-xl border border-dark-800">
                              <span className="text-[11px] text-slate-300 italic block mb-1">
                                &quot;{t.content}&quot;
                              </span>
                              <span className="text-[10px] font-bold text-brand-500">
                                — {t.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (secKey === "about") {
                    return (
                      <div key={secKey} className="p-5 bg-dark-900 rounded-2xl border border-dark-800">
                        <h3 className="text-base font-black text-white uppercase">
                          {sections.about?.heading}
                        </h3>
                        <p className="text-xs text-slate-300 mt-2">{sections.about?.description}</p>
                        <p className="text-xs text-slate-400 mt-2">{sections.about?.gymStory}</p>
                      </div>
                    );
                  }

                  if (secKey === "cta") {
                    return (
                      <div key={secKey} className="text-center p-6 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl text-white">
                        <h3 className="text-lg font-black uppercase">
                          {sections.cta?.heading}
                        </h3>
                        <p className="text-xs text-white/80 mt-1 max-w-sm mx-auto">
                          {sections.cta?.description}
                        </p>
                        <span className="mt-4 inline-block px-5 py-2 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider">
                          {sections.cta?.btnText}
                        </span>
                      </div>
                    );
                  }

                  if (secKey === "contact") {
                    return (
                      <div key={secKey} className="p-4 bg-dark-900 rounded-2xl border border-dark-800 text-xs text-slate-400 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white block mb-2">
                          Contact Info
                        </span>
                        <div>📍 {sections.contact?.address}</div>
                        <div>📞 {sections.contact?.phone}</div>
                        <div>✉️ {sections.contact?.email}</div>
                      </div>
                    );
                  }

                  if (secKey === "footer") {
                    return (
                      <div key={secKey} className="text-center pt-6 border-t border-dark-800 text-[10px] text-slate-500">
                        <p>{sections.footer?.description}</p>
                        <p className="mt-1 font-bold text-slate-400">{sections.footer?.copyrightText}</p>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Publish Homepage Live"
        description="This will push your changes live to the public gym website immediately."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Change Summary (Audit Log)
            </label>
            <input
              type="text"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="e.g. Updated hero copy & reorganized features"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
            A version snapshot will be saved in Revision History for rollback safety.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-500/25"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Confirm & Publish</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* REVISIONS HISTORY MODAL */}
      <Modal
        isOpen={isRevisionsModalOpen}
        onClose={() => setIsRevisionsModalOpen(false)}
        title="Published Revision History"
        description="View past snapshots of the public website and rollback if needed."
        maxWidth="lg"
      >
        {loadingRevisions ? (
          <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
            Loading History...
          </div>
        ) : revisions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No historical revisions recorded.</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {revisions.map((rev) => (
              <div
                key={rev.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                      {rev.versionId}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(rev.publishedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900">{rev.changeSummary}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Published by: {rev.publishedBy}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestoreRevision(rev.id, rev.versionId)}
                  className="px-3 py-1.5 bg-dark-900 hover:bg-dark-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0"
                >
                  Restore Draft
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
