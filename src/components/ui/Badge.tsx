import React from "react";

interface BadgeProps {
  status: string;
  className?: string;
}

export function Badge({ status, className = "" }: BadgeProps) {
  const normalized = status.toUpperCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";

  switch (normalized) {
    case "ACTIVE":
    case "PRESENT":
    case "COMPLETED":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "EXPIRING_SOON":
    case "LATE":
    case "PENDING":
      styles = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "EXPIRED":
    case "INACTIVE":
    case "FAILED":
    case "SUSPENDED":
      styles = "bg-rose-50 text-rose-700 border-rose-200";
      break;
    case "ADMIN":
      styles = "bg-purple-50 text-purple-700 border-purple-200 font-semibold";
      break;
    case "TRAINER":
      styles = "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
      break;
    case "MEMBER":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
      break;
    case "UPI":
      styles = "bg-indigo-50 text-indigo-700 border-indigo-200";
      break;
    case "CARD":
      styles = "bg-cyan-50 text-cyan-700 border-cyan-200";
      break;
    case "CASH":
      styles = "bg-green-50 text-green-700 border-green-200";
      break;
    default:
      styles = "bg-slate-100 text-slate-700 border-slate-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
