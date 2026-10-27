"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  CalendarCheck,
  UserCheck,
  UserPlus,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Wifi,
  LogIn,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function BookingSection() {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const bp = t.bookingPortal;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section
      id="booking-section"
      className="py-16 lg:py-24 bg-gradient-to-b from-white via-slate-50/50 to-white relative border-t border-slate-200/90"
      aria-labelledby="booking-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-extrabold text-emerald-800 mb-3 shadow-2xs">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {bp?.badge || (isRTL ? "بوابة حجز المقاعد ومساحات العمل" : "EduHub Desk & Sanctuary Reservation")}
            </span>
          </div>

          <h2
            id="booking-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy tracking-tight mb-4"
          >
            {isRTL ? "احجز مقعدك في أيديو هب" : "Reserve Your Seat at EduHub"}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            {isRTL
              ? "نوفر لطلاب الجامعات والمستقلين في غزة بيئة دراسة وعمل مجهزة بالكهرباء المستقرة والإنترنت الفضائي مجاناً 100% وفق نظام حجز عادل ومنظم."
              : "Providing Gaza students and freelancers with a free, stable work sanctuary powered by solar energy and Starlink internet."}
          </p>
        </div>

        {/* ── 2 Main Action Gateway Cards: Members vs 1-Day Visitors ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">
          
          {/* Card 1: Active Members (تسجيل دخول الأعضاء لحجز مقعد) */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 border border-emerald-600/30 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400/50 transition-all">
            <div className="absolute top-0 end-0 -mt-8 -me-8 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-all pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <UserCheck className="w-6 h-6 text-emerald-200" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {isRTL ? "للأعضاء المسجلين" : "Active Members"}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
                  {isRTL ? "تسجيل دخول الأعضاء وحجز مقعد" : "Member Login & Desk Booking"}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                  {isRTL
                    ? "سجّل دخولك لحسابك لحجز مقعدك لليوم أو الأيام القادمة، ومتابعة حجوزاتك بكل سهولة."
                    : "Sign in to reserve your desk for today or upcoming days, and manage your bookings."}
                </p>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-sm sm:text-base shadow-lg transition-all active:scale-98 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-emerald-700" />
                <span>{isRTL ? "تسجيل دخول الأعضاء وحجز المقعد" : "Sign In & Reserve Desk"}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: 1-Day Visitor Pass (تسجيل زيارة ليوم واحد - صفحة مخصصة) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/40 flex flex-col justify-between group hover:border-teal-400 transition-all relative overflow-hidden">
            <div className="absolute top-0 end-0 -mt-8 -me-8 w-44 h-44 bg-teal-50 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200/60">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  {isRTL ? "للزوار والضيوف" : "For Visitors & Guests"}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mb-2">
                  {isRTL ? "تسجيل زيارة استثنائية (ليوم واحد)" : "1-Day Visitor Pass Request"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {isRTL
                    ? "لغير الأعضاء الراغبين في تجربة المساحة، أو حضور يوم دراسي محدد، أو إنجاز مهمة طارئة (امتحان إلكتروني، مقابلة عمل، أو شحن بطارية حاسوب)."
                    : "For non-members needing temporary single-day access for online exams, remote interviews, or device charging."}
                </p>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <Link
                href="/visit"
                className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-black text-sm sm:text-base shadow-md shadow-teal-700/20 transition-all active:scale-98 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-teal-200" />
                <span>{isRTL ? "تقديم طلب تصريح زيارة الآن" : "Apply for Visitor Pass"}</span>
                <ArrowIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── 3. Bottom Card: New Member Intake Banner ── */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {isRTL ? "انضمام جديد لمجتمع إديو هب" : "New Member Intake"}
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                  {isRTL ? "لست مسجلاً كعضو بعد؟ انضم مجاناً الآن" : "Not a member yet? Join for free today"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-normal">
                  {isRTL
                    ? "قدّم طلبك الرسمي للانضمام لعائلة إديو هب والاستفادة من خدمات المساحة والبيئة التعليمية الهادئة مجاناً 100%."
                    : "Apply for official membership to get access to EduHub educational sanctuary and work amenities for free."}
                </p>
              </div>
            </div>

            <Link
              href="/join"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-700/20 transition-all active:scale-95 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isRTL ? "طلب عضوية جديدة" : "Apply for Membership"}</span>
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
