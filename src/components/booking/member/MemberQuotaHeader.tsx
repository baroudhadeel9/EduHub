"use client";

import React from "react";
import { Clock, KeyRound, LogOut, Trophy, LifeBuoy } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface MemberQuotaHeaderProps {
  memberName: string;
  memberEmail: string;
  hoursUsed: number;
  monthlyLimit: number;
  hoursRemaining: number;
  dailyLimit: number;
  renewalDate?: string;
  renewalDay?: number;
  daysUntilRenewal?: number;
  memberSubView: "book" | "my_bookings" | "achievements" | "support";
  confirmedBookingsCount: number;
  onSelectSubView: (view: "book" | "my_bookings" | "achievements" | "support") => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export default function MemberQuotaHeader({
  memberName,
  memberEmail,
  hoursUsed,
  monthlyLimit,
  hoursRemaining,
  dailyLimit,
  renewalDate,
  renewalDay,
  daysUntilRenewal,
  memberSubView,
  confirmedBookingsCount,
  onSelectSubView,
  onOpenChangePassword,
  onLogout,
}: MemberQuotaHeaderProps) {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const bp = t.bookingPortal;

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Member Top Bar: Identity & Quota */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 w-full min-w-0">
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-brand-navy to-slate-800 text-emerald-400 flex items-center justify-center font-black text-sm sm:text-base shadow-2xs ring-1 ring-emerald-500/20 shrink-0">
            {(memberName || "M").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
              {memberName || (isRTL ? "عضو مسجل" : "Registered Member")}
            </h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
              {memberEmail}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 shrink-0">
          {/* Change Password Button */}
          <button
            type="button"
            onClick={onOpenChangePassword}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title={isRTL ? "تغيير كلمة المرور الخاصة بك" : "Change your password"}
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{isRTL ? "تغيير كلمة المرور" : "Change Password"}</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title={bp?.logoutTitle || (isRTL ? "تسجيل الخروج والعودة لشاشة الدخول" : "Log out")}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{bp?.logout || (isRTL ? "تسجيل خروج" : "Log out")}</span>
          </button>
        </div>
      </div>

      {/* ── Monthly Quota Balance Bar ── */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border border-emerald-100/90 shadow-2xs w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold text-brand-navy leading-snug">
              {isRTL
                ? `استخدمت ${hoursUsed} من ${monthlyLimit} ساعة في الدورة الشهرية الحالية`
                : `Used ${hoursUsed} of ${monthlyLimit} hours in current cycle`}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-white/95 px-3 py-1 rounded-full border border-emerald-200/80 shadow-2xs self-start sm:self-auto shrink-0">
            {isRTL
              ? `الرصيد المتبقي: ${hoursRemaining} ${hoursRemaining >= 3 && hoursRemaining <= 10 ? "ساعات" : "ساعة"}`
              : `Remaining: ${hoursRemaining} hours`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-emerald-100/80 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, monthlyLimit > 0 ? (hoursUsed / monthlyLimit) * 100 : 0)}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 mt-2.5 font-medium">
          <span>
            {isRTL
              ? `الحد اليومي المسموح: حتى ${dailyLimit} ساعات يومياً`
              : `Daily limit: up to ${dailyLimit}h/day`}
          </span>
          {renewalDate ? (
            <span className="text-emerald-800 font-bold flex items-center gap-1">
              <span>
                {isRTL
                  ? `يتجدد الرصيد: ${renewalDate} ${daysUntilRenewal !== undefined ? `(متبقي ${daysUntilRenewal} ${daysUntilRenewal === 1 ? "يوم" : "أيام"})` : ""}`
                  : `Renews on: ${renewalDate} ${daysUntilRenewal !== undefined ? `(${daysUntilRenewal} days left)` : ""}`}
              </span>
            </span>
          ) : (
            <span>
              {isRTL
                ? "ساعات العمل: 09:00 صباحاً – 04:00 مساءً"
                : "Working hours: 09:00 – 16:00"}
            </span>
          )}
        </div>
      </div>

      {/* Sub-Tabs: Responsive 2x2 Grid on Mobile and Flex Row on Desktop */}
      <div className="p-1 sm:p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:flex sm:items-center gap-1 sm:gap-1.5 w-full min-w-0">
        <button
          type="button"
          onClick={() => onSelectSubView("book")}
          className={`w-full sm:flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
            memberSubView === "book"
              ? "bg-brand-navy text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
          }`}
        >
          <span className="truncate">
            {isRTL ? "حجز مقعد جديد" : (bp?.bookNewDesk || "Book a Desk")}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSubView("my_bookings")}
          className={`w-full sm:flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
            memberSubView === "my_bookings"
              ? "bg-brand-navy text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
          }`}
        >
          <span className="truncate">{bp?.myBookings || (isRTL ? "حجوزاتي" : "My Bookings")}</span>
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
            memberSubView === "my_bookings"
              ? "bg-emerald-500 text-white"
              : "bg-emerald-100 text-emerald-800"
          }`}>
            {confirmedBookingsCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSubView("achievements")}
          className={`w-full sm:flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
            memberSubView === "achievements"
              ? "bg-brand-navy text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{bp?.myAchievements || (isRTL ? "إنجازاتي" : "Achievements")}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSubView("support")}
          className={`w-full sm:flex-1 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0 ${
            memberSubView === "support"
              ? "bg-brand-navy text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
          }`}
        >
          <LifeBuoy className={`w-3.5 h-3.5 shrink-0 ${memberSubView === "support" ? "text-emerald-400" : "text-slate-500"}`} />
          <span className="truncate">{bp?.supportTab || (isRTL ? "الدعم والمساعدة" : "Support")}</span>
        </button>
      </div>
    </div>
  );
}

