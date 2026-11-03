"use client";

import React from "react";
import { Clock, KeyRound, LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface MemberQuotaHeaderProps {
  memberName: string;
  memberEmail: string;
  hoursUsed: number;
  monthlyLimit: number;
  hoursRemaining: number;
  dailyLimit: number;
  memberSubView: "book" | "my_bookings";
  confirmedBookingsCount: number;
  onSelectSubView: (view: "book" | "my_bookings") => void;
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
    <div className="space-y-4">
      {/* Member Top Bar: Identity & Quota */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-navy to-slate-800 text-emerald-400 flex items-center justify-center font-black text-base shadow-2xs ring-1 ring-emerald-500/20 shrink-0">
            {(memberName || "M").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
              {memberName || (isRTL ? "عضو مسجل" : "Registered Member")}
            </h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
              {memberEmail}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
          {/* Change Password Button */}
          <button
            type="button"
            onClick={onOpenChangePassword}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title={isRTL ? "تغيير كلمة المرور الخاصة بك" : "Change your password"}
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isRTL ? "تغيير كلمة المرور" : "Change Password"}</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
            title={bp?.logoutTitle || (isRTL ? "تسجيل الخروج والعودة لشاشة الدخول" : "Log out")}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{bp?.logout || (isRTL ? "تسجيل خروج" : "Log out")}</span>
          </button>
        </div>
      </div>

      {/* ── Monthly Quota Balance Bar ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border border-emerald-100/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold text-brand-navy">
              {isRTL
                ? `استخدمت ${hoursUsed} من ${monthlyLimit} ساعة هذا الشهر`
                : `Used ${hoursUsed} of ${monthlyLimit} hours this month`}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-white/95 px-3 py-1 rounded-full border border-emerald-200/80 shadow-2xs self-start sm:self-auto">
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
          <span>
            {isRTL
              ? "ساعات العمل: 08:00 صباحاً – 04:00 مساءً"
              : "Working hours: 08:00 – 16:00"}
          </span>
        </div>
      </div>

      {/* Sub-Tabs: Direct Booking Form vs My Bookings */}
      <div className="p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSelectSubView("book")}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            memberSubView === "book"
              ? "bg-brand-navy text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <span>{bp?.bookNewDesk || (isRTL ? "حجز موعد مقعد جديد" : "Book a New Desk")}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectSubView("my_bookings")}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            memberSubView === "my_bookings"
              ? "bg-brand-navy text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <span>{bp?.myBookings || (isRTL ? "حجوزاتي" : "My Bookings")}</span>
          <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
            memberSubView === "my_bookings"
              ? "bg-emerald-500 text-white"
              : "bg-emerald-100 text-emerald-800"
          }`}>
            {confirmedBookingsCount}
          </span>
        </button>
      </div>
    </div>
  );
}

