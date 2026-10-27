"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  HelpCircle,
  Mail,
  Home,
} from "lucide-react";
import NewMemberTab from "@/components/booking/NewMemberTab";

export default function JoinPage() {
  const router = useRouter();
  const { locale, setLocale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* ─── Top Focused Header ─── */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center group transition-transform active:scale-95"
              aria-label="EduHub Gaza Home"
            >
              <div className="relative h-10 sm:h-11 w-32 sm:w-36 transition-transform group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="cehub - Gaza Educational Hub"
                  fill
                  className="object-contain object-start"
                  priority
                  unoptimized
                />
              </div>
            </Link>

            {/* Right Controls: Language & Return Home */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div
                className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200"
                role="group"
                aria-label={isRTL ? "اختيار اللغة" : "Select language"}
              >
                <button
                  type="button"
                  onClick={() => setLocale("ar")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    locale === "en"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  English
                </button>
              </div>

              {/* Back to Home Link */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <BackArrow className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRTL ? "الرئيسية" : "Home"}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Banner & Context */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-extrabold text-emerald-800 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isRTL ? "بوابة العضوية الرسمية • التسجيل مفتوح" : "Official Membership Portal • Open for Intake"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-navy tracking-tight">
              {isRTL ? "طلب عضوية وانضمام لمساحة إديو هب غزة" : "Apply for Membership at EduHub Gaza"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {isRTL
                ? "نوفر للطلاب والرياديين والفريلانسرز في قطاع غزة بيئة دراسة وعمل مجهزة بالكهرباء المستقرة، الإنترنت الفضائي (Starlink)، ومساحات عمل هادئة مجاناً 100% وفق معايير العدالة والاستحقاق."
                : "Providing Gaza students and freelancers with a free, stable work sanctuary powered by solar energy and Starlink internet."}
            </p>
          </div>

          {/* Quick Value Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {isRTL ? "طاقة وإنترنت مجاناً 100%" : "100% Free Power & Net"}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isRTL ? "ألواح شمسية وإنترنت Starlink" : "Solar panels & Starlink"}
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {isRTL ? "مراجعة سريعة للطلب" : "Fast Application Review"}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isRTL ? "خلال 24 إلى 48 ساعة كحد أقصى" : "Within 24 to 48 hours"}
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {isRTL ? "إشعار رسمي برسالة SMS" : "Official SMS Notification"}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isRTL ? "على رقم جوالك فور الاعتماد" : "To your phone once verified"}
                </p>
              </div>
            </div>
          </div>

          {/* ─── The Official 4-Step Registration Form Card ─── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10">
            <NewMemberTab onReturnToHub={() => router.push("/")} />
          </div>

          {/* Need help footer strip */}
          <div className="mt-8 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>{isRTL ? "هل تواجه مشكلة في ملء النموذج؟" : "Having trouble with the application?"}</span>
            </span>
            <a
              href="mailto:support@eduhub.ps"
              className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>support@eduhub.ps</span>
            </a>
            <span>•</span>
            <Link href="/" className="font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>{isRTL ? "العودة للرئيسية" : "Return to Homepage"}</span>
            </Link>
          </div>

        </div>
      </main>

      {/* ─── Minimal Dedicated Footer ─── */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4">
          <p>
            {isRTL
              ? "© 2026 مساحة أيديو هب غزة (Gaza Edu Hub) — مبادرة مجتمعية غير ربحية لدعم التعليم والعمل الرقمي في قطاع غزة."
              : "© 2026 Gaza Edu Hub — A non-profit community initiative supporting education and digital work in Gaza."}
          </p>
        </div>
      </footer>
    </div>
  );
}
