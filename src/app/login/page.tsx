"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Home } from "lucide-react";
import MemberBookingTab from "@/components/booking/MemberBookingTab";

export default function LoginPage() {
  const { locale, setLocale } = useLanguage();
  const isRTL = locale === "ar";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform active:scale-95"
            aria-label="EduHub Gaza"
          >
            <div className="relative h-10 w-36 shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="EduHub - Gaza Educational Hub"
                fill
                className="object-contain object-start"
                priority
                unoptimized
              />
            </div>
          </Link>

          {/* Controls: Back to Home + Language Selector */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
              <button
                type="button"
                onClick={() => setLocale("ar")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  locale === "ar"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  locale === "en"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                EN
              </button>
            </div>

            {/* Back to Home Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span>{isRTL ? "الرئيسية" : "Home"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content: Clean Centered Card ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-12 flex flex-col justify-center">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-lg sm:shadow-xl overflow-hidden p-4 sm:p-8 md:p-10">
          <MemberBookingTab
            onApplyNewMember={() => {
              window.location.href = "/join";
            }}
          />
        </div>

        {/* Link to Admin Login */}
        <div className="mt-4 text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#5243e1] transition-colors py-2 px-3 rounded-xl hover:bg-slate-100"
          >
            <span>{isRTL ? "هل أنت مدير للمساحة؟ الدخول للوحة التحكم الإدارية ←" : "Are you an admin? Sign in to Admin Portal →"}</span>
          </Link>
        </div>
      </main>

      {/* ── Footer note ── */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/80">
        <p>
          {isRTL
            ? "مساحة إديو هب غزة — مجتمع تعليمي ومساحة عمل مكرسة لدعم أبناء غزة مجاناً."
            : "EduHub Gaza — A dedicated free educational & productive workspace for Gaza."}
        </p>
      </footer>
    </div>
  );
}
