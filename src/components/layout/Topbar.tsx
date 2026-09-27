"use client";

import React from "react";
import { Menu, Dumbbell, Shield, User, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface TopbarProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ onMenuToggle, title, subtitle, actions }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">
            {title || "Overview"}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <Link
          href="/profile"
          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300/60 flex items-center justify-center font-bold text-emerald-700 text-xs">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-semibold text-slate-800 leading-none">
              {user?.name || "Guest"}
            </span>
            <span className="block text-[10px] text-slate-400 capitalize mt-0.5">
              {user?.role?.toLowerCase() || "User"}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
