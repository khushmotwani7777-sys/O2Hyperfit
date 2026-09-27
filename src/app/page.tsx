"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  Dumbbell,
  Users,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  FileSpreadsheet,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Activity,
  FileText,
  Download,
  Flame,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsData, setStatsData] = useState({
    activeMembers: 120,
    trainers: 12,
    workoutsTracked: 450,
    plansCount: 4,
  });
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats/public");
        const json = await res.json();
        if (json.success) {
          if (json.stats) setStatsData(json.stats);
          if (json.plans) setPlans(json.plans);
        }
      } catch (err) {
        console.error("Stats fetch error", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 text-white selection:bg-brand-500 selection:text-white">
      {/* 1. STICKY NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-dark-950/90 backdrop-blur-md border-b border-dark-700 py-3 shadow-2xl"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Exact Uploaded Brand Logo */}
          <Link href="#home" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 transition-transform group-hover:scale-105 duration-200">
              <Image
                src="/logo.png"
                alt="O2 HyperFit Official Logo"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 640px) 48px, 56px"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black tracking-wider text-white block leading-none">
                O2 HYPERFIT
              </span>
              <span className="text-[10px] font-bold text-brand-500 tracking-widest uppercase block mt-1">
                More Than A Gym
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide">
            <Link
              href="#home"
              className="text-slate-200 hover:text-brand-500 transition-colors"
            >
              Home
            </Link>
            <Link
              href="#features"
              className="text-slate-300 hover:text-brand-500 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#assessments"
              className="text-slate-300 hover:text-brand-500 transition-colors"
            >
              BMI & Assessments
            </Link>
            <Link
              href="#membership"
              className="text-slate-300 hover:text-brand-500 transition-colors"
            >
              Membership
            </Link>
            <Link
              href="#about"
              className="text-slate-300 hover:text-brand-500 transition-colors"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-slate-300 hover:text-brand-500 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right Header CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-brand-500/25 flex items-center gap-1.5"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-brand-500/25 flex items-center gap-1.5"
                >
                  Get Started
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-dark-800 transition"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-900 border-b border-dark-700 px-6 py-6 space-y-4 shadow-2xl">
            <Link
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-200 hover:text-brand-500"
            >
              Home
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-200 hover:text-brand-500"
            >
              Features
            </Link>
            <Link
              href="#assessments"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-200 hover:text-brand-500"
            >
              BMI & Assessments
            </Link>
            <Link
              href="#membership"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-200 hover:text-brand-500"
            >
              Membership
            </Link>
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-200 hover:text-brand-500"
            >
              About
            </Link>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-200 hover:text-brand-500"
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-dark-700 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-dark-800 text-white font-bold text-xs uppercase"
              >
                Login to Portal
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-brand-500 text-white font-bold text-xs uppercase shadow-md shadow-brand-500/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. DYNAMIC HERO SECTION */}
      <section
        id="home"
        className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6"
      >
        {/* Subtle Athletic Grid Background & Orange-Red Ambient Lighting */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(#262626 1px, transparent 1px), linear-gradient(to right, #151515 1px, transparent 1px)",
            backgroundSize: "40px 40px, 80px 80px",
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-500/15 blur-[140px] pointer-events-none rounded-full animate-pulse-subtle" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-600/10 blur-[120px] pointer-events-none rounded-full" />

        {/* Floating Athletic Geometry */}
        <div className="absolute top-28 left-8 sm:left-20 w-16 h-16 border-2 border-brand-500/20 rounded-2xl rotate-12 pointer-events-none animate-float-slow hidden md:block" />
        <div className="absolute bottom-28 right-8 sm:right-20 w-24 h-24 border border-white/10 rounded-full pointer-events-none animate-float-slow hidden md:block" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Prominent Exact Uploaded Logo Badge */}
          <div className="mb-6 relative w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_10px_35px_rgba(255,70,18,0.25)] transition-transform hover:scale-105 duration-300">
            <Image
              src="/logo.png"
              alt="O2 HyperFit Brand Logo"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 640px) 112px, 144px"
            />
          </div>

          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-850 border border-brand-500/40 text-brand-500 text-xs font-bold tracking-widest uppercase mb-6 shadow-md shadow-brand-500/10">
            <Flame className="h-3.5 w-3.5" />
            <span>MORE THAN A GYM, IT&apos;S A LIFESTYLE !</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white uppercase mb-6">
            MORE THAN A GYM. <br />
            <span className="text-brand-500">IT&apos;S A LIFESTYLE.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-lg sm:text-2xl font-medium text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Train harder. Track smarter. Transform better.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>GET STARTED</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-850 hover:bg-dark-800 text-white border border-dark-700 hover:border-brand-500/50 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer"
            >
              EXPLORE THE GYM
            </Link>
          </div>
        </div>
      </section>

      {/* 3. HERO STATISTICS SECTION */}
      <section className="relative z-20 -mt-8 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-dark-900 border border-dark-700 rounded-3xl p-6 sm:p-8 shadow-2xl grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 border-r border-dark-800 last:border-r-0">
            <span className="text-3xl sm:text-4xl font-black text-brand-500 block mb-1">
              {statsData.activeMembers}+
            </span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              ACTIVE MEMBERS
            </span>
          </div>

          <div className="p-4 border-r border-dark-800 last:border-r-0">
            <span className="text-3xl sm:text-4xl font-black text-white block mb-1">
              {statsData.trainers}+
            </span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              CERTIFIED TRAINERS
            </span>
          </div>

          <div className="p-4 border-r border-dark-800 last:border-r-0">
            <span className="text-3xl sm:text-4xl font-black text-brand-500 block mb-1">
              {statsData.workoutsTracked}+
            </span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              WORKOUTS TRACKED
            </span>
          </div>

          <div className="p-4">
            <span className="text-3xl sm:text-4xl font-black text-white block mb-1">
              {statsData.plansCount}
            </span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
              MEMBERSHIP PLANS
            </span>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION ("EVERYTHING YOU NEED TO TRAIN BETTER") */}
      <section id="features" className="py-24 sm:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-500 uppercase tracking-widest block mb-2">
            CORE PLATFORM CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
            EVERYTHING YOU NEED TO TRAIN BETTER
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Engineered for fitness enthusiasts and gym management alike. Seamlessly handle operations, workout routines, and member results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-dark-900 border border-dark-700 hover:border-brand-500/50 rounded-3xl p-8 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Smart Member Management</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Complete digital profiles with biometrics, emergency contacts, medical records, and dedicated personal coach assignments.
              </p>
            </div>
            <div className="pt-4 border-t border-dark-800 text-xs text-brand-500 font-bold flex items-center gap-1">
              Automated Member IDs (MEM-XXX)
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-dark-900 border border-dark-700 hover:border-brand-500/50 rounded-3xl p-8 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <CreditCard className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2. Membership Management</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Monthly, quarterly, and annual pass tracking with automatic expiry alerts, renewal statuses, and auto-renew switches.
              </p>
            </div>
            <div className="pt-4 border-t border-dark-800 text-xs text-brand-500 font-bold flex items-center gap-1">
              Real-time Expiry Status
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-dark-900 border border-dark-700 hover:border-brand-500/50 rounded-3xl p-8 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. Attendance Tracking</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Front-desk check-in and check-out console. Tracks real-time active floor headcounts and eliminates duplicate entries.
              </p>
            </div>
            <div className="pt-4 border-t border-dark-800 text-xs text-brand-500 font-bold flex items-center gap-1">
              Live Gym Floor Headcount
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-dark-900 border border-dark-700 hover:border-brand-500/50 rounded-3xl p-8 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <Dumbbell className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">4. Workout Plans</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Customized training routines by trainers. Assign exercises with prescribed sets, reps, weight (kg), rest intervals, and coaching tips.
              </p>
            </div>
            <div className="pt-4 border-t border-dark-800 text-xs text-brand-500 font-bold flex items-center gap-1">
              Muscle Group Exercise Library
            </div>
          </div>

          {/* Card 5 - Highlighted */}
          <div className="bg-gradient-to-b from-dark-900 to-dark-850 border-2 border-brand-500/60 rounded-3xl p-8 transition-all hover:-translate-y-1 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-brand-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-bl-xl">
              Signature
            </div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-500 mb-6">
                <FileSpreadsheet className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">5. Body Assessments</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                Directly upload and securely archive raw machine PDFs generated by gym BMI scanners (InBody, Tanita). Stream and view anytime.
              </p>
            </div>
            <div className="pt-4 border-t border-brand-500/30 text-xs text-brand-400 font-bold flex items-center gap-1">
              Secure PDF Storage & Streaming
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-dark-900 border border-dark-700 hover:border-brand-500/50 rounded-3xl p-8 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">6. Progress Tracking</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Record weight, body fat %, and tape circumferences (chest, waist, arms, thighs) over time with transformation milestones.
              </p>
            </div>
            <div className="pt-4 border-t border-dark-800 text-xs text-brand-500 font-bold flex items-center gap-1">
              Body Measurement History
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEDICATED BODY ASSESSMENT / BMI PDF SECTION */}
      <section
        id="assessments"
        className="py-24 bg-dark-900 border-y border-dark-800 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-500 text-xs font-bold uppercase tracking-widest mb-4">
                <FileSpreadsheet className="h-4 w-4" />
                <span>BMI MACHINE INTEGRATION MODULE</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-6">
                KNOW YOUR BODY. <br />
                <span className="text-brand-500">TRACK YOUR PROGRESS.</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
                The gym already has an advanced BMI / body composition analyzer that generates comprehensive assessment reports as PDF files.
                Our dedicated Body Assessment module archives and streams the original machine PDF directly inside the member’s profile.
              </p>

              {/* 5-Step Real-World Workflow */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200 bg-dark-850 p-3.5 rounded-xl border border-dark-700">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <span>Member steps onto the gym&apos;s BMI & Body Composition analyzer</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200 bg-dark-850 p-3.5 rounded-xl border border-dark-700">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <span>Machine generates the comprehensive multi-page PDF scan report</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200 bg-dark-850 p-3.5 rounded-xl border border-dark-700">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <span>Trainer/Admin uploads original PDF directly to member&apos;s record</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200 bg-dark-850 p-3.5 rounded-xl border border-dark-700">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </div>
                  <span>Storage layer safely preserves original PDF on disk or cloud bucket</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200 bg-dark-850 p-3.5 rounded-xl border border-dark-700">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    5
                  </div>
                  <span>Member logs in to their portal to view and download anytime</span>
                </div>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-brand-500/25"
              >
                <span>Upload & View Sample Scans</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right Visual Dashboard Mockup */}
            <div className="bg-dark-950 p-6 sm:p-8 rounded-3xl border border-dark-700 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-dark-800 mb-6">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-500">SAMPLE BODY COMPOSITION</span>
                  <h4 className="text-base font-bold text-white">InBody 570 Report Archive</h4>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-brand-500/20 text-emerald-400 text-xs font-semibold">
                  Verified Scan
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">BMI Value</span>
                  <span className="text-2xl font-black text-white">22.4</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Normal Range</span>
                </div>
                <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Body Fat %</span>
                  <span className="text-2xl font-black text-brand-500">16.9%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">-1.3% past month</span>
                </div>
                <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Skeletal Muscle</span>
                  <span className="text-2xl font-black text-white">36.5 kg</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">+0.7 kg gained</span>
                </div>
                <div className="p-4 rounded-2xl bg-dark-900 border border-dark-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Visceral Fat Level</span>
                  <span className="text-2xl font-black text-white">5</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Optimal Healthy</span>
                </div>
              </div>

              {/* Sample PDF file list */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-dark-900 border border-dark-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-brand-500" />
                    <div>
                      <p className="text-xs font-bold text-white">InBody570_Report_Rohan_M2.pdf</p>
                      <p className="text-[10px] text-slate-400">Scan Date: 22 Sep 2026 • 248 KB</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer">
                    <Download className="h-3.5 w-3.5 text-brand-500" />
                    PDF
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-dark-900 border border-dark-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Tanita_Report_Priya_P.pdf</p>
                      <p className="text-[10px] text-slate-400">Scan Date: 12 Sep 2026 • 192 KB</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer">
                    <Download className="h-3.5 w-3.5 text-brand-500" />
                    PDF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MEMBERSHIP PLANS SHOWCASE */}
      <section id="membership" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-500 uppercase tracking-widest block mb-2">
            TRANSPARENT PRICING
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
            CHOOSE YOUR COMMITMENT
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            All memberships include full access to the gym floor, locker rooms, cardio zone, and BMI tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.length > 0 ? (
            plans.map((p) => (
              <div
                key={p.id}
                className="bg-dark-900 border border-dark-700 hover:border-brand-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xl group"
              >
                <div>
                  <span className="text-xs font-bold text-brand-500 uppercase tracking-wider block mb-2">
                    {p.durationMonths} Months Duration
                  </span>
                  <h3 className="text-xl font-bold text-white mb-4">{p.name}</h3>
                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-white">₹{p.price.toLocaleString()}</span>
                    <span className="text-xs text-slate-400 ml-1">/ cycle</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{p.description}</p>
                </div>

                <div>
                  <Link
                    href="/login"
                    className="w-full py-3 rounded-xl bg-dark-800 group-hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors shadow-md"
                  >
                    Select Plan
                  </Link>
                </div>
              </div>
            ))
          ) : (
            // Default Fallback Plans if DB is spinning up
            [
              { name: "Basic Monthly", duration: "1 Month", price: "₹1,999", desc: "Full gym floor access, cardio zone, and locker rooms." },
              { name: "Standard Quarterly", duration: "3 Months", price: "₹4,999", desc: "Full gym access + 2 complimentary trainer sessions." },
              { name: "Elite Annual", duration: "12 Months", price: "₹14,999", desc: "All-inclusive, sauna, custom diet charts, and priority support." },
              { name: "VIP Coaching (6 Mo)", duration: "6 Months", price: "₹19,999", desc: "Dedicated 1-on-1 personal trainer 3x weekly and monthly BMI scans." },
            ].map((p, idx) => (
              <div
                key={idx}
                className="bg-dark-900 border border-dark-700 hover:border-brand-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xl group"
              >
                <div>
                  <span className="text-xs font-bold text-brand-500 uppercase tracking-wider block mb-2">
                    {p.duration}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-4">{p.name}</h3>
                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-white">{p.price}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{p.desc}</p>
                </div>
                <Link
                  href="/login"
                  className="w-full py-3 rounded-xl bg-dark-800 group-hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors shadow-md"
                >
                  Select Plan
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 7. ABOUT & CONTACT SECTION */}
      <section id="about" className="py-24 bg-dark-900 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <span className="text-xs font-bold text-brand-500 uppercase tracking-widest block mb-2">
                ABOUT O2 HYPERFIT
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white mb-6">
                MORE THAN A GYM, <br />
                <span className="text-brand-500">IT&apos;S A LIFESTYLE !</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                At O2 HyperFit, we believe elite fitness is not a seasonal habit—it is a lifelong commitment.
                Our training facility combines world-class biomechanical equipment, certified strength and hypertrophy coaches, and scientific body composition tracking to help you break through plateaus.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                From our dedicated InBody & Tanita scanning station to personalized nutrition and workout split assignment, every member receives personalized guidance tailored to their exact physiology.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  <span>Biomechanical Equipment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  <span>Certified Personal Trainers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  <span>Machine BMI PDF Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  <span>Sauna & Recovery Zones</span>
                </div>
              </div>
            </div>

            <div id="contact" className="bg-dark-950 p-8 rounded-3xl border border-dark-700 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Visit Our Facility</h3>
                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">O2 HyperFit Main Studio</p>
                      <p className="text-slate-400 text-xs">Plot 42, 100 Feet Road, Indiranagar, Bangalore, 560038</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-brand-500 shrink-0" />
                    <span className="text-slate-300">+91 98765 43210 / +91 80 4123 4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-brand-500 shrink-0" />
                    <span className="text-slate-300">contact@o2hyperfit.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-brand-500 shrink-0" />
                    <span className="text-slate-300">Mon - Sat: 5:30 AM - 10:30 PM | Sun: 7:00 AM - 8:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dark-800">
                <Link
                  href="/login"
                  className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-brand-500/25"
                >
                  <span>Member & Staff Portal Login</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BRANDED FOOTER */}
      <footer className="bg-dark-950 border-t border-dark-800 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 shrink-0">
              <Image
                src="/logo.png"
                alt="O2 HyperFit Official Logo"
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
            <div>
              <span className="font-black text-white text-base block tracking-wider">O2 HYPERFIT</span>
              <span className="text-brand-500 text-[11px] font-bold block">
                MORE THAN A GYM, IT&apos;S A LIFESTYLE !
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-semibold">
            <Link href="#home" className="hover:text-white transition">Home</Link>
            <Link href="#features" className="hover:text-white transition">Features</Link>
            <Link href="#assessments" className="hover:text-white transition">Assessments</Link>
            <Link href="#membership" className="hover:text-white transition">Membership</Link>
            <Link href="#about" className="hover:text-white transition">About</Link>
            <Link href="#contact" className="hover:text-white transition">Contact</Link>
            <Link href="/login" className="text-brand-500 hover:text-brand-400 transition font-bold">Portal Login</Link>
          </div>

          <div className="text-slate-300 text-[11px]">
            &copy; {new Date().getFullYear()} O2 HyperFit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
