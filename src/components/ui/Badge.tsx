import React from "react";

interface BadgeProps {
  status: string;
  className?: string;
}

export function Badge({ status, className = "" }: BadgeProps) {
  const normalized = status.toUpperCase();

  let styles = "bg-dark-800 text-slate-300 border-dark-700";

  switch (normalized) {
    case "ACTIVE":
    case "PRESENT":
    case "COMPLETED":
      styles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      break;
    case "EXPIRING_SOON":
    case "LATE":
    case "PENDING":
      styles = "bg-brand-500/15 text-brand-500 border-brand-500/40 font-bold";
      break;
    case "EXPIRED":
    case "INACTIVE":
    case "FAILED":
    case "SUSPENDED":
      styles = "bg-rose-500/10 text-rose-400 border-rose-500/30";
      break;
    case "ADMIN":
      styles = "bg-brand-500 text-white border-brand-600 font-black shadow-xs";
      break;
    case "TRAINER":
      styles = "bg-dark-800 text-brand-500 border-brand-500/40 font-bold";
      break;
    case "MEMBER":
      styles = "bg-dark-800 text-slate-200 border-dark-700 font-bold";
      break;
    case "UPI":
      styles = "bg-dark-800 text-brand-400 border-brand-500/30 font-semibold";
      break;
    case "CARD":
      styles = "bg-dark-800 text-slate-200 border-dark-700 font-semibold";
      break;
    case "CASH":
      styles = "bg-dark-800 text-emerald-400 border-emerald-500/30 font-semibold";
      break;
    default:
      styles = "bg-dark-800 text-slate-300 border-dark-700";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border ${styles} ${className}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
