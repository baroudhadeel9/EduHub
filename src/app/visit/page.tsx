"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowRight,
  ArrowLeft,
  Compass,
  Zap,
  Wifi,
  Clock,
  HelpCircle,
  Mail,
  Home,
  UserPlus,
} from "lucide-react";
import VisitorPassTab from "@/components/booking/VisitorPassTab";

export default function VisitorPassPage() {
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
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-navy tracking-tight">
              {isRTL ? "طلب تصريح زيارة لمساحة إديو هب غزة" : "Request a 1-Day Visitor Pass at EduHub"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {isRTL
                ? "مخصص للضيوف والطلاب والمستقلين غير المسجلين كأعضاء دائمين، والراغبين في تجربة مساحة العمل أو إنجاز مهمة طارئة (تقديم امتحان إلكتروني، مقابلة عمل، أو شحن حاسوب)."
                : "For non-members and guests wishing to experience the workspace or complete urgent academic or professional tasks."}
            </p>
          </div>

          {/* ─── The Visitor Pass Form Card ─── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10 mb-8">
            <VisitorPassTab />
          </div>

          {/* New Member Callout Banner */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-950">
                {isRTL ? "هل تخطط لاستخدام دوري ومستمر للمساحة؟" : "Looking for regular ongoing access?"}
              </h4>
              <p className="text-xs text-emerald-800">
                {isRTL
                  ? "يمكنك التقديم للحصول على عضوية رسمية مجانية والاستفادة من خدمات المساحة والبيئة التعليمية الهادئة."
                  : "Apply for free official membership to receive ongoing workspace access and amenities."}
              </p>
            </div>
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isRTL ? "تقديم طلب عضوية" : "Apply for Membership"}</span>
            </Link>
          </div>

          {/* Need help footer strip */}
          <div className="mt-8 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>{isRTL ? "هل تواجه مشكلة في ملء الطلب؟" : "Having trouble with the request?"}</span>
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
