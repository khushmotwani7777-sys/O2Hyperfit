"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Users,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  BookOpen,
  IndianRupee,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavItem {
  label: string;
  href?: string;
  icon: any;
  roles: ("ADMIN" | "TRAINER" | "MEMBER")[];
  subItems?: { label: string; href: string; external?: boolean }[];
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role || "MEMBER";

  // State for expanded collapsible groups in sidebar
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Home Page": pathname.startsWith("/admin/homepage"),
    "Members": pathname.startsWith("/members"),
    "Memberships": pathname.startsWith("/memberships"),
    "Trainers & Staff": pathname.startsWith("/trainers"),
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  let visibleItems: NavItem[] = [];

  if (role === "MEMBER") {
    visibleItems = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["MEMBER"] },
      { label: "My Profile", href: "/profile", icon: UserCircle, roles: ["MEMBER"] },
      { label: "Membership", href: "/memberships", icon: CreditCard, roles: ["MEMBER"] },
      { label: "Attendance", href: "/attendance", icon: CalendarCheck, roles: ["MEMBER"] },
      { label: "Workout Plan", href: "/workouts", icon: Dumbbell, roles: ["MEMBER"] },
      { label: "Progress", href: "/progress", icon: TrendingUp, roles: ["MEMBER"] },
      { label: "Body Assessments", href: "/assessments", icon: FileSpreadsheet, roles: ["MEMBER"] },
      { label: "Payments", href: "/payments", icon: IndianRupee, roles: ["MEMBER"] },
    ];
  } else if (role === "ADMIN") {
    visibleItems = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN"] },
      {
        label: "Home Page",
        icon: Globe,
        roles: ["ADMIN"],
        subItems: [
          { label: "Edit Home Page", href: "/admin/homepage" },
          { label: "Preview Live", href: "/admin/homepage?preview=true" },
          { label: "Published Version", href: "/", external: true },
          { label: "Revision History", href: "/admin/homepage?tab=revisions" },
        ],
      },
      {
        label: "Members",
        icon: Users,
        roles: ["ADMIN"],
        subItems: [
          { label: "All Members", href: "/members" },
          { label: "Add Member", href: "/members?action=add" },
          { label: "Import Members", href: "/members/import" },
        ],
      },
      {
        label: "Memberships",
        icon: CreditCard,
        roles: ["ADMIN"],
        subItems: [
          { label: "Plans Catalog", href: "/memberships" },
          { label: "Active Subscriptions", href: "/memberships?tab=active" },
          { label: "Expired Subscriptions", href: "/memberships?tab=expired" },
        ],
      },
      { label: "Payments", href: "/payments", icon: IndianRupee, roles: ["ADMIN"] },
      { label: "Attendance", href: "/attendance", icon: CalendarCheck, roles: ["ADMIN"] },
      {
        label: "Trainers & Staff",
        icon: ShieldCheck,
        roles: ["ADMIN"],
        subItems: [
          { label: "Trainers Directory", href: "/trainers" },
          { label: "Staff Salary", href: "/trainers/salary" },
        ],
      },
      { label: "Workouts", href: "/workouts", icon: Dumbbell, roles: ["ADMIN"] },
      { label: "Body Assessments", href: "/assessments", icon: FileSpreadsheet, roles: ["ADMIN"] },
      { label: "Progress", href: "/progress", icon: TrendingUp, roles: ["ADMIN"] },
      { label: "Reports", href: "/dashboard#reports", icon: BarChart3, roles: ["ADMIN"] },
      { label: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN"] },
    ];
  } else {
    // TRAINER
    visibleItems = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["TRAINER"] },
      { label: "Members", href: "/members", icon: Users, roles: ["TRAINER"] },
      { label: "Attendance", href: "/attendance", icon: CalendarCheck, roles: ["TRAINER"] },
      { label: "Workouts", href: "/workouts", icon: Dumbbell, roles: ["TRAINER"] },
      { label: "Exercises", href: "/exercises", icon: BookOpen, roles: ["TRAINER"] },
      { label: "Body Assessments", href: "/assessments", icon: FileSpreadsheet, roles: ["TRAINER"] },
      { label: "Progress", href: "/progress", icon: TrendingUp, roles: ["TRAINER"] },
      { label: "My Profile", href: "/profile", icon: UserCircle, roles: ["TRAINER"] },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-dark-950 border-r border-dark-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
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
              Admin Console
            </p>
            <Link
              href="/"
              target="_blank"
              className="text-[10px] text-brand-500 hover:text-brand-400 font-semibold flex items-center gap-0.5"
              title="Visit Public Website"
            >
              Live Site <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const hasSub = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedGroups[item.label] ?? false;

            if (hasSub) {
              const isGroupActive = item.subItems?.some(
                (s) => pathname === s.href.split("?")[0]
              );

              return (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isGroupActive
                        ? "bg-dark-900 text-white border-l-2 border-brand-500"
                        : "text-slate-300 hover:bg-dark-850 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isGroupActive ? "text-brand-500" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>

                  {/* Sub-Items dropdown */}
                  {isExpanded && (
                    <div className="pl-9 pr-2 py-1 space-y-1">
                      {item.subItems?.map((sub) => {
                        const isSubActive = pathname === sub.href.split("?")[0];
                        return (
                          <Link
                            key={sub.label}
                            href={sub.href}
                            target={sub.external ? "_blank" : undefined}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                              isSubActive
                                ? "text-brand-400 bg-brand-500/10 font-bold"
                                : "text-slate-400 hover:text-white hover:bg-dark-850"
                            }`}
                          >
                            <span>{sub.label}</span>
                            {sub.external && <ExternalLink className="w-2.5 h-2.5 opacity-60" />}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Normal Flat Link
            const isActive =
              item.href &&
              (pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href)));

            const isAssessmentsSpecial = role === "MEMBER" && item.label === "Body Assessments";

            return (
              <Link
                key={item.label}
                href={item.href || "#"}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                    : isAssessmentsSpecial
                    ? "text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30"
                    : "text-slate-300 hover:bg-dark-850 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : isAssessmentsSpecial ? "text-brand-500" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isAssessmentsSpecial && !isActive && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-brand-500 text-white tracking-widest uppercase">
                    SCAN
                  </span>
                )}
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
