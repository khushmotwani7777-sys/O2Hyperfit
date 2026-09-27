"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  BookOpen,
  FileSpreadsheet,
  TrendingUp,
  UserCircle,
  LogOut,
  ExternalLink,
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
          className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-dark-950 text-slate-100 flex flex-col border-r border-dark-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header with Exact Uploaded Logo */}
        <div className="h-20 flex items-center px-5 border-b border-dark-800 bg-dark-900/60">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="O2 HyperFit Official Logo"
                fill
                priority
                className="object-contain"
                sizes="48px"
              />
            </div>
            <div>
              <span className="font-black text-sm tracking-wider text-white block leading-tight">
                O2 HYPERFIT
              </span>
              <span className="block text-[9px] text-brand-500 font-bold tracking-widest uppercase">
                Management System
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation Menu
            </p>
            <Link
              href="/"
              className="text-[10px] text-brand-500 hover:text-brand-400 font-semibold flex items-center gap-0.5"
              title="Visit Public Website"
            >
              Website <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>

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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                    : "text-slate-300 hover:bg-dark-850 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-dark-800 bg-dark-900/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-dark-800 border border-dark-700 flex items-center justify-center font-black text-brand-500 text-xs">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || "User"}</p>
              <Badge status={role} className="mt-0.5" />
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-dark-800 hover:border-rose-500/20 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
