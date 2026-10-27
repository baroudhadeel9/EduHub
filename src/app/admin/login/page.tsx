"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldCheck,
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Home,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { adminLoginApi, setAdminAuthSession } from "@/services/applications";

export default function AdminLoginPage() {
  const router = useRouter();
  const { locale, setLocale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [email, setEmail] = useState("admin@eduhub.ps");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError(
        isRTL
          ? "يرجى إدخال البريد الإلكتروني وكلمة المرور الخاصة بالإدارة."
          : "Please enter your admin email and password."
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Attempt login with remote Laravel API
      const res = await adminLoginApi(email.trim(), password);
      if (res.token) {
        setSuccess(true);
        setTimeout(() => {
          router.replace("/admin/overview");
        }, 500);
      }
    } catch (err: unknown) {
      console.warn("API login failed, checking fallback:", err);
      // Fallback: If credentials match default seeded admin, allow instant access
      if (
        (email.trim() === "admin@eduhub.ps" || email.trim() === "admin") &&
        (password === "password123" || password === "admin" || password === "admin123")
      ) {
        setAdminAuthSession({
          token: "demo-admin-session-token-" + Date.now(),
          admin: {
            id: 1,
            name: isRTL ? "مدير مساحة EduHub" : "EduHub Administrator",
            email: email.trim(),
            role: "admin",
          },
        });
        setSuccess(true);
        setTimeout(() => {
          router.replace("/admin/overview");
        }, 500);
      } else {
        const msg = err instanceof Error ? err.message : "";
        setError(
          msg ||
            (isRTL
              ? "بيانات الدخول غير صحيحة، أو أن السيرفر غير مستجيب حالياً."
              : "Invalid administrator credentials or server unavailable.")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = () => {
    setLoading(true);
    setError(null);
    setAdminAuthSession({
      token: "demo-supervisor-session-" + Date.now(),
      admin: {
        id: 1,
        name: isRTL ? "مدير المنصة (حساب إشرافي)" : "EduHub Admin (Supervisor)",
        email: "admin@eduhub.ps",
        role: "admin",
      },
    });
    setSuccess(true);
    setTimeout(() => {
      router.replace("/admin/overview");
    }, 400);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[#071321] text-white flex flex-col justify-between selection:bg-[#5243e1] selection:text-white relative overflow-hidden"
    >
      {/* Background Decorative Glows */}
      <div className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#5243e1]/20 via-[#00c49f]/10 to-transparent blur-3xl pointer-events-none" />

      {/* ── Top Bar ── */}
      <header className="relative z-10 border-b border-white/10 bg-[#071321]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-32 shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="EduHub"
                fill
                className="object-contain object-start brightness-125"
                priority
                unoptimized
              />
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/10 text-emerald-400 border border-white/10">
              Admin Portal
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="inline-flex items-center p-0.5 bg-white/5 rounded-xl border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLocale("ar")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  locale === "ar"
                    ? "bg-[#5243e1] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  locale === "en"
                    ? "bg-[#5243e1] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            {/* Back Home */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isRTL ? "الرئيسية" : "Home"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Form Container ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-[#0c2340]/90 backdrop-blur-xl rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl relative">
          {/* Badge Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5243e1] to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-[#5243e1]/30 mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {isRTL ? "تسجيل دخول لوحة الإدارة" : "Administrator Sign In"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isRTL
                ? "إدارة العمليات، الحجوزات، المستحقات، والمستفيدين"
                : "Manage operations, bookings, dues, and attendance"}
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                {isRTL ? "تم التحقق بنجاح! جاري توجيهك..." : "Authenticated! Redirecting..."}
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isRTL ? "البريد الإلكتروني للإدارة" : "Admin Email"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eduhub.ps"
                  required
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#5243e1] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isRTL ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full ps-10 pe-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#5243e1] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 end-3 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#5243e1] to-[#00c49f] hover:from-[#4335c9] hover:to-[#00a887] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#5243e1]/25 hover:shadow-[#5243e1]/40 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جاري تسجيل الدخول..." : "Signing in..."}</span>
                </>
              ) : (
                <>
                  <span>{isRTL ? "دخول لوحة التحكم" : "Enter Dashboard"}</span>
                  <ArrowIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Button (Crucial for live supervisor presentation) */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={loading || success}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>
                {isRTL ? "دخول فوري للعرض (Demo Bypass)" : "Instant Demo Access for Presentation"}
              </span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              {isRTL
                ? "يسمح باستعراض جميع الأقسام والشاشات مباشرة أمام المشرف"
                : "Allows immediate walkthrough of all admin pages during demo"}
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400 border-t border-white/10">
        <p>
          {isRTL
            ? "نظام إدارة مساحة إديو هب غزة © 2026 — مصمم للعمل الميداني والسحابي"
            : "EduHub Gaza Admin Portal © 2026"}
        </p>
      </footer>
    </div>
  );
}