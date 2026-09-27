"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { ForcePasswordChangeModal } from "@/components/auth/ForcePasswordChangeModal";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  allowedRoles?: ("ADMIN" | "TRAINER" | "MEMBER")[];
}

export function AppLayout({
  children,
  title,
  subtitle,
  actions,
  allowedRoles,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950 text-white gap-4">
        <div className="relative w-16 h-16 animate-pulse">
          <Image
            src="/logo.png"
            alt="O2 HyperFit"
            fill
            className="object-contain"
            sizes="64px"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Loader2 className="h-4 w-4 text-brand-500 animate-spin" />
          <span>Loading O2 HyperFit...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Force password change on first login or after admin reset
  if (user.mustChangePassword) {
    return <ForcePasswordChangeModal />;
  }

  // Check role restrictions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 p-6">
        <div className="bg-dark-900 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-dark-700">
          <div className="w-12 h-12 rounded-full bg-brand-500/20 text-brand-500 flex items-center justify-center mx-auto mb-4 font-black text-xl">
            !
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Access Restricted</h2>
          <p className="text-xs text-slate-400 mb-6">
            Your current account role (<span className="font-bold text-brand-500">{user.role}</span>) does not have authorization to view this section.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-brand-500/25"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={title}
          subtitle={subtitle}
          actions={actions}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
