"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Mail,
  Home,
  Lock,
  Loader2,
  Ticket,
} from "lucide-react";
import NewMemberTab from "@/components/booking/NewMemberTab";
import CompactMemberForm from "@/components/booking/CompactMemberForm";
import {
  getMembershipIntakeModeApi,
  MembershipIntakeMode,
} from "@/services/applications";

export default function JoinPage() {
  const router = useRouter();
  const { locale, setLocale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const [intakeMode, setIntakeMode] = useState<MembershipIntakeMode | "loading">("loading");

  useEffect(() => {
    let mounted = true;
    getMembershipIntakeModeApi()
      .then((mode) => {
        if (mounted) {
          setIntakeMode(mode);
        }
      })
      .catch((err) => {
        console.warn("Failed to load membership intake mode:", err);
        if (mounted) setIntakeMode("full");
      });

    return () => {
      mounted = false;
    };
  }, []);

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
            {intakeMode === "closed" ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs sm:text-sm font-extrabold text-rose-800 shadow-2xs">
                <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {isRTL ? "بوابة العضوية • التسجيل معلق حالياً" : "Membership Portal • Intake Paused"}
                </span>
              </div>
            ) : intakeMode === "short" ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs sm:text-sm font-extrabold text-amber-900 shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isRTL ? "بوابة العضوية الرسمية • التسجيل السريع مفعّل" : "Official Membership Portal • Express Intake"}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-extrabold text-emerald-800 shadow-2xs">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isRTL ? "بوابة العضوية الرسمية • التسجيل مفتوح" : "Official Membership Portal • Open for Intake"}
                </span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-navy tracking-tight">
              {isRTL ? "طلب عضوية وانضمام لمساحة إديو هب غزة" : "Apply for Membership at EduHub Gaza"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {isRTL
                ? "نوفر للطلاب والرياديين والفريلانسرز في قطاع غزة بيئة دراسة وعمل مجهزة بالكهرباء المستقرة، إنترنت عالي السرعة (100 ميجا)، ومساحات عمل هادئة مجاناً 100% وفق معايير العدالة والاستحقاق."
                : "Providing Gaza students and freelancers with a free, stable work sanctuary powered by solar energy and high-speed 100 Mbps internet."}
            </p>
          </div>

          {/* ─── The Single Registration Form / Notice Card ─── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10">
            {intakeMode === "loading" ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-xs sm:text-sm font-semibold">
                  {isRTL ? "جاري فحص حالة بوابة التسجيل..." : "Checking intake status..."}
                </p>
              </div>
            ) : intakeMode === "closed" ? (
              /* Case 1: Closed Registration View */
              <div className="text-center py-10 px-2 max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {isRTL ? "لا يوجد انضمام عضوية حالياً" : "Membership Applications Are Currently Closed"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {isRTL
                      ? "نعتذر منكم، تم إغلاق باب التقديم للعضويات الجديدة مؤقتاً لاكتمال الطاقة الاستيعابية وحرصاً على ضمان جودة الخدمة والمقاعد للطلبة والمستقلين الحاليين."
                      : "We apologize, new membership intake is temporarily paused due to maximum capacity."}
                  </p>
                </div>

                {/* Visitor pass alternative note */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-start space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Ticket className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isRTL
                        ? "هل تحتاج للمساحة لظرف طارئ أو تقديم اختبار؟"
                        : "Need urgent workspace access for an exam or task?"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isRTL
                      ? "يمكنك طلب تصريح زيارة ليوم واحد لإنجاز مهامك العاجلة، تقديم الامتحانات، أو شحن الأجهزة دون الحاجة لعضوية دائمة."
                      : "You can request a 1-day visitor pass for urgent tasks without needing permanent membership."}
                  </p>
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <Link
                      href="/visit"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{isRTL ? "طلب تصريح زيارة (يوم واحد)" : "Request 1-Day Pass"}</span>
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>{isRTL ? "العودة للرئيسية" : "Return to Home"}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : intakeMode === "short" ? (
              /* Case 2: Short / Express Intake Form */
              <CompactMemberForm onReturnToHub={() => router.push("/")} />
            ) : (
              /* Case 3: Full 4-Step Detailed Intake Form */
              <NewMemberTab onReturnToHub={() => router.push("/")} />
            )}
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
              ? "© 2026 مساحة إديو هب غزة (Gaza Edu Hub) — مبادرة مجتمعية غير ربحية لدعم التعليم والعمل الرقمي في قطاع غزة."
              : "© 2026 Gaza Edu Hub — A non-profit community initiative supporting education and digital work in Gaza."}
          </p>
        </div>
      </footer>
    </div>
  );
}
