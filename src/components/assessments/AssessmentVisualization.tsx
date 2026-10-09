"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Activity,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  ExternalLink,
  Flame,
  Scale,
  Percent,
  Droplet,
  Bone,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

export interface AssessmentItem {
  id: string;
  memberId: string;
  assessmentDate: string | Date;
  createdAt?: string | Date;
  pdfFileName: string;
  pdfUrl: string;
  pdfPath: string;
  notes?: string | null;
  uploadedBy?: { name?: string; role?: string } | null;
  weightKg?: number | null;
  bmi?: number | null;
  bodyFatPercentage?: number | null;
  muscleMassKg?: number | null;
  bodyWaterPercentage?: number | null;
  visceralFat?: number | null;
  boneMassKg?: number | null;
  bmrKcal?: number | null;
  bodyAge?: number | null;
  skeletalMusclePercentage?: number | null;
  metrics?: Record<string, any> | null;
}

interface AssessmentVisualizationProps {
  assessments: AssessmentItem[];
  title?: string;
  showTitle?: boolean;
  isAdminView?: boolean;
}

/**
 * Pure SVG Sparkline/Trend Chart
 */
function TrendChart({
  title,
  unit,
  data,
  color = "#ff4d00",
}: {
  title: string;
  unit: string;
  data: { date: Date; value: number }[];
  color?: string;
}) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;
  const padding = range * 0.2;
  const chartMin = min - padding;
  const chartMax = max + padding;
  const chartRange = chartMax - chartMin;

  const width = 460;
  const height = 140;
  const padX = 35;
  const padY = 25;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (width - padX * 2);
    const y = height - padY - ((d.value - chartMin) / chartRange) * (height - padY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

  const firstVal = data[0].value;
  const lastVal = data[data.length - 1].value;
  const diff = Math.round((lastVal - firstVal) * 100) / 100;

  return (
    <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800 text-white shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            {title} Trend
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-white">{lastVal}</span>
            <span className="text-xs text-slate-400 font-semibold">{unit}</span>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${
            diff > 0
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : diff < 0
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          {diff > 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : diff < 0 ? (
            <TrendingDown className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          <span>
            {diff > 0 ? `+${diff}` : diff} {unit}
          </span>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-28 overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Subtle horizontal gridline */}
          <line
            x1={padX}
            y1={height - padY}
            x2={width - padX}
            y2={height - padY}
            stroke="#334155"
            strokeDasharray="3 3"
            strokeWidth="1"
          />

          {/* Shaded Area */}
          <path d={areaD} fill={`url(#grad-${title})`} />

          {/* Trend Polyline */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Coordinate Circles & Tooltip points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#0f172a"
                stroke={color}
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                className="text-[9px] fill-slate-300 font-bold"
              >
                {p.value}
              </text>
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className="text-[8px] fill-slate-500 font-semibold"
              >
                {p.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export function AssessmentVisualization({
  assessments,
  title = "Body Assessment Analytics",
  showTitle = true,
  isAdminView = false,
}: AssessmentVisualizationProps) {
  // Sort chronologically (oldest to newest for trend analysis)
  const chronological = [...assessments].sort(
    (a, b) => new Date(a.assessmentDate).getTime() - new Date(b.assessmentDate).getTime()
  );

  // Newest first for recent summary & cards
  const newestFirst = [...assessments].sort(
    (a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
  );

  const latest = newestFirst[0] || null;

  // Extract trend series only for records that contain measurable data
  const weightSeries = chronological
    .filter((a) => a.weightKg !== null && a.weightKg !== undefined)
    .map((a) => ({ date: new Date(a.assessmentDate), value: a.weightKg! }));

  const fatSeries = chronological
    .filter((a) => a.bodyFatPercentage !== null && a.bodyFatPercentage !== undefined)
    .map((a) => ({ date: new Date(a.assessmentDate), value: a.bodyFatPercentage! }));

  const bmiSeries = chronological
    .filter((a) => a.bmi !== null && a.bmi !== undefined)
    .map((a) => ({ date: new Date(a.assessmentDate), value: a.bmi! }));

  const muscleSeries = chronological
    .filter((a) => a.muscleMassKg !== null && a.muscleMassKg !== undefined)
    .map((a) => ({ date: new Date(a.assessmentDate), value: a.muscleMassKg! }));

  // Check if any trend has 2 or more historical data points
  const hasSufficientTrendData =
    weightSeries.length >= 2 ||
    fatSeries.length >= 2 ||
    bmiSeries.length >= 2 ||
    muscleSeries.length >= 2;

  // Collect any metrics that exist in the latest report
  const latestMetricsList: { label: string; value: string; icon: any }[] = [];
  if (latest) {
    if (latest.weightKg !== null && latest.weightKg !== undefined) {
      latestMetricsList.push({ label: "Weight", value: `${latest.weightKg} kg`, icon: Scale });
    }
    if (latest.bmi !== null && latest.bmi !== undefined) {
      latestMetricsList.push({ label: "BMI", value: `${latest.bmi}`, icon: Activity });
    }
    if (latest.bodyFatPercentage !== null && latest.bodyFatPercentage !== undefined) {
      latestMetricsList.push({ label: "Body Fat", value: `${latest.bodyFatPercentage}%`, icon: Percent });
    }
    if (latest.muscleMassKg !== null && latest.muscleMassKg !== undefined) {
      latestMetricsList.push({ label: "Muscle Mass", value: `${latest.muscleMassKg} kg`, icon: Flame });
    }
    if (latest.bodyWaterPercentage !== null && latest.bodyWaterPercentage !== undefined) {
      latestMetricsList.push({ label: "Body Water", value: `${latest.bodyWaterPercentage}%`, icon: Droplet });
    }
    if (latest.visceralFat !== null && latest.visceralFat !== undefined) {
      latestMetricsList.push({ label: "Visceral Fat", value: `Level ${latest.visceralFat}`, icon: Layers });
    }
    if (latest.boneMassKg !== null && latest.boneMassKg !== undefined) {
      latestMetricsList.push({ label: "Bone Mass", value: `${latest.boneMassKg} kg`, icon: Bone });
    }
    if (latest.bmrKcal !== null && latest.bmrKcal !== undefined) {
      latestMetricsList.push({ label: "BMR", value: `${latest.bmrKcal} kcal`, icon: Flame });
    }
    if (latest.bodyAge !== null && latest.bodyAge !== undefined) {
      latestMetricsList.push({ label: "Body Age", value: `${latest.bodyAge} yrs`, icon: Clock });
    }
    if (latest.skeletalMusclePercentage !== null && latest.skeletalMusclePercentage !== undefined) {
      latestMetricsList.push({ label: "Skeletal Muscle", value: `${latest.skeletalMusclePercentage}%`, icon: Percent });
    }
  }

  if (assessments.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center text-slate-400">
        <Activity className="h-10 w-10 mx-auto text-slate-300 mb-2" />
        <p className="font-bold text-slate-700 text-sm">No body assessment records found</p>
        <p className="text-xs text-slate-400 mt-1">
          {isAdminView
            ? "This member has not submitted any body composition scans yet."
            : "Upload your raw machine PDF report to view extracted metrics and progress."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Latest Verified Metrics Banner */}
      {latestMetricsList.length > 0 && (
        <div className="bg-dark-950 text-white p-6 rounded-3xl border border-dark-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 blur-[80px] pointer-events-none rounded-full" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-dark-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-500 block">
                  Latest Body Composition Scan
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight text-white mt-0.5">
                  Verified Scan Metrics ({new Date(latest.assessmentDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-dark-900 border border-dark-750 text-slate-300">
                  File: {latest.pdfFileName}
                </span>
                <a
                  href={latest.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Original
                </a>
              </div>
            </div>

            {/* Extracted Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {latestMetricsList.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-dark-900/90 border border-dark-750 hover:border-brand-500/40 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {m.label}
                      </span>
                      <Icon className="h-3.5 w-3.5 text-brand-500" />
                    </div>
                    <span className="text-base font-black text-white">{m.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Progress Charts (Only shown when 2+ reports with measurable data exist) */}
      {hasSufficientTrendData ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand-500" />
                Body Composition Progress Charts
              </h3>
              <p className="text-[11px] text-slate-500">
                Longitudinal progression across verified reports ({assessments.length} scans on record)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weightSeries.length >= 2 && (
              <TrendChart title="Body Weight" unit="kg" data={weightSeries} color="#ff4d00" />
            )}
            {fatSeries.length >= 2 && (
              <TrendChart title="Body Fat" unit="%" data={fatSeries} color="#f97316" />
            )}
            {bmiSeries.length >= 2 && (
              <TrendChart title="Body Mass Index (BMI)" unit="" data={bmiSeries} color="#06b6d4" />
            )}
            {muscleSeries.length >= 2 && (
              <TrendChart title="Skeletal Muscle Mass" unit="kg" data={muscleSeries} color="#10b981" />
            )}
          </div>
        </div>
      ) : assessments.length === 1 ? (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">Baseline Assessment Established</span>
            <span className="text-[11px] text-slate-500">
              1 report registered. Trend charts and change graphs will automatically activate once 2 or more reports are submitted.
            </span>
          </div>
        </div>
      ) : null}

      {/* Chronological Body Assessment Timeline (Requirement 5) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 mb-1 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-brand-500" />
          BODY COMPOSITION PROGRESS TIMELINE
        </h3>
        <p className="text-[11px] text-slate-500 mb-6">
          Chronological milestone progression of physical measurements over time
        </p>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-brand-500/30 space-y-6">
          {newestFirst.map((item, index) => {
            const hasData =
              item.weightKg !== null ||
              item.bmi !== null ||
              item.bodyFatPercentage !== null ||
              item.muscleMassKg !== null;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-dark-950 border-2 border-brand-500 flex items-center justify-center text-[10px] text-brand-500 font-bold shadow-md">
                  ●
                </div>

                <div className="bg-slate-50 hover:bg-slate-100/80 transition p-4 sm:p-5 rounded-2xl border border-slate-200/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-black text-slate-900 uppercase">
                        {new Date(item.assessmentDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="ml-2 text-[10px] font-mono font-semibold text-brand-600">
                        {item.pdfFileName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-dark-950 text-brand-500 hover:bg-dark-900 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                      <a
                        href={item.pdfUrl}
                        download
                        className="px-2.5 py-1 rounded-lg bg-brand-500 text-white hover:bg-brand-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    </div>
                  </div>

                  {/* Highlighted extracted values for this scan */}
                  {hasData && (
                    <div className="flex flex-wrap items-center gap-2 my-2.5">
                      {item.weightKg !== null && item.weightKg !== undefined && (
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold">
                          Weight: <span className="text-brand-600">{item.weightKg} kg</span>
                        </span>
                      )}
                      {item.bmi !== null && item.bmi !== undefined && (
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold">
                          BMI: <span className="text-cyan-600">{item.bmi}</span>
                        </span>
                      )}
                      {item.bodyFatPercentage !== null && item.bodyFatPercentage !== undefined && (
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold">
                          Fat: <span className="text-amber-600">{item.bodyFatPercentage}%</span>
                        </span>
                      )}
                      {item.muscleMassKg !== null && item.muscleMassKg !== undefined && (
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold">
                          Muscle: <span className="text-emerald-600">{item.muscleMassKg} kg</span>
                        </span>
                      )}
                      {item.visceralFat !== null && item.visceralFat !== undefined && (
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold">
                          Visceral: <span className="text-indigo-600">Lvl {item.visceralFat}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100 mt-2">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
