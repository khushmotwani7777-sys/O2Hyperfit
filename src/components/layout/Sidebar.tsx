"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  BookOpen,
  FileSpreadsheet,
  TrendingUp,
  UserCircle,
  LogOut,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const role = user?.role || "MEMBER";

  const allNavItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "TRAINER", "MEMBER"],
    },
    {
      label: "Members",
      href: "/members",
      icon: Users,
      roles: ["ADMIN", "TRAINER"],
    },
    {
      label: "Trainers",
      href: "/trainers",
      icon: ShieldCheck,
      roles: ["ADMIN"],
    },
    {
      label: "Memberships",
      href: "/memberships",
      icon: CreditCard,
      roles: ["ADMIN"],
    },
    {
      label: "Payments",
      href: "/payments",
      icon: CreditCard,
      roles: ["ADMIN", "MEMBER"],
    },
    {
      label: "Attendance",
      href: "/attendance",
      icon: CalendarCheck,
      roles: ["ADMIN", "TRAINER", "MEMBER"],
    },
    {
      label: "Workouts",
      href: "/workouts",
      icon: Dumbbell,
      roles: ["ADMIN", "TRAINER", "MEMBER"],
    },
    {
      label: "Exercises",
      href: "/exercises",
      icon: BookOpen,
      roles: ["ADMIN", "TRAINER", "MEMBER"],
    },
    {
      label: "BMI & Assessments",
      href: "/assessments",
      icon: FileSpreadsheet,
      roles: ["ADMIN", "TRAINER", "MEMBER"],
    },
    {
      label: "Progress Tracking",
      href: "/progress",
      icon: TrendingUp,
      roles: ["ADMIN", "TRAINER", "MEMBER"],
    },
    {
      label: "My Account",
      href: "/profile",
      icon: UserCircle,
      roles: ["ADMIN", "TRAINER", "MEMBER"],
    },
  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-wider text-white">O2HYPERFIT</span>
              <span className="block text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">
                Management System
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <Badge status={role} className="mt-0.5" />
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 border border-rose-500/20 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
