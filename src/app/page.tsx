"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
      <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      <p className="text-sm font-medium text-slate-400">Loading O2Hyperfit...</p>
    </div>
  );
}
