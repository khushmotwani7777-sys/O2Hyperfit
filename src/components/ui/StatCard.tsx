import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "brand" | "emerald" | "blue" | "purple" | "amber" | "rose" | "indigo";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "brand",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex items-center justify-between transition hover:border-brand-500/40 hover:shadow-md">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className="p-3.5 rounded-2xl bg-dark-950 text-brand-500 border border-dark-800 shadow-xs">
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
}
