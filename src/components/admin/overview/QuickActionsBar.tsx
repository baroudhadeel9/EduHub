"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Zap,
  LogIn,
  Armchair,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface QuickActionsBarProps {
  onOpenCheckIn: () => void;
  onOpenQuickBooking: () => void;
  pendingApplications?: number;
  pendingVisitors?: number;
}

export default function QuickActionsBar({
  onOpenCheckIn,
  onOpenQuickBooking,
  pendingApplications = 0,
  pendingVisitors = 0,
}: QuickActionsBarProps) {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const hasPending = pendingApplications > 0 || pendingVisitors > 0;

  return (
    <div className="space-y-4">
      {/* ── 1. Actionable Alerts Banner (If there are pending items) ── */}
      {hasPending ? (
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-white border border-amber-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-950 text-sm sm:text-base">
                  {isRTL ? "مهام تنتظر الاعتماد والمراجعة" : "Pending Actions Required"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200/80 text-amber-900 border border-amber-300/80">
                  {pendingApplications + pendingVisitors} {isRTL ? "طلبات جديدة" : "New"}
                </span>
              </div>
              <p className="text-xs text-amber-900/80 mt-0.5">
                {isRTL
                  ? `يوجد ${pendingApplications} طلب عضوية و ${pendingVisitors} طلب زيارة بانتظار الموافقة وتعيين الساعات.`
                  : `${pendingApplications} membership applications and ${pendingVisitors} visitor passes awaiting review.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            {pendingApplications > 0 && (
              <Link
                href="/admin/applications"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 text-amber-950 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <span>{isRTL ? `فحص العضويات (${pendingApplications})` : `Review Members (${pendingApplications})`}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </Link>
            )}

            {pendingVisitors > 0 && (
              <Link
                href="/admin/visitor-requests"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <span>{isRTL ? `اعتماد الزوار (${pendingVisitors})` : `Approve Visitors (${pendingVisitors})`}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 py-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              {isRTL
                ? "جميع طلبات العضوية وتصاريح الزوار مراجعة ومعتمدة بالكامل حتى الآن."
                : "All membership and visitor applications are fully reviewed and up to date."}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono hidden sm:inline">✓ Status OK</span>
        </div>
      )}

      {/* ── 2. Focused Reception Quick Actions ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{isRTL ? "الإجراءات السريعة للمركز والاستقبال:" : "Reception Quick Actions:"}</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Action 1: Instant Fast Check-In */}
          <button
            type="button"
            onClick={onOpenCheckIn}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title={isRTL ? "تسجيل وصول فوري لأي زائر أو عضو يدخل المركز الآن" : "Fast Check-In"}
          >
            <LogIn className="w-4 h-4" />
            <span>{isRTL ? "تسجيل وصول فوري" : "Fast Check-In"}</span>
          </button>

          {/* Action 2: Quick Booking for Member */}
          <button
            type="button"
            onClick={onOpenQuickBooking}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-brand-navy hover:bg-[#15345d] active:scale-95 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title={isRTL ? "حجز مقعد لعضو بناءً على اتصال أو طلب مباشر" : "Book for Member"}
          >
            <Armchair className="w-4 h-4 text-emerald-400" />
            <span>{isRTL ? "حجز مقعد لعضو" : "Book for Member"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
