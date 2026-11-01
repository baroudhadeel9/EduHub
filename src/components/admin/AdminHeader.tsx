"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Calendar,
  LogIn,
  Menu,
} from "lucide-react";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onOpenCheckIn?: () => void;
  onOpenMobileMenu: () => void;
  actionButton?: React.ReactNode;
}

export default function AdminHeader({
  title,
  subtitle,
  onOpenCheckIn,
  onOpenMobileMenu,
  actionButton,
}: AdminHeaderProps) {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const h = t.admin?.header;

  const currentDateStr = React.useMemo(() => {
    try {
      const now = new Date();
      return now.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return new Date().toDateString();
    }
  }, [isRTL]);

  const displayTitle = title || h?.title || (isRTL ? "الحضور اليومي" : "Daily Attendance");
  const displaySubtitle =
    subtitle || h?.subtitle || (isRTL ? "تحديث فوري للسجلات الميدانية" : "Real-time field logs update");

  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Title Side: Mobile Menu Button (lg:hidden) + Title & Subtitle */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-2xs lg:hidden cursor-pointer shrink-0"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0c2340] tracking-tight">
              {displayTitle}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium flex-wrap">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{currentDateStr || (isRTL ? "جاري تحديد التاريخ..." : "Loading date...")}</span>
              <span className="text-slate-300">•</span>
              <span>{displaySubtitle}</span>
            </div>
          </div>
        </div>

        {/* Action Controls (Fast Check-in, Book Seat, Room Closure, etc.) */}
        {(actionButton || onOpenCheckIn) && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
            {actionButton ? (
              actionButton
            ) : onOpenCheckIn ? (
              <button
                type="button"
                onClick={onOpenCheckIn}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-xs hover:shadow-md hover:shadow-emerald-900/15 transition-all cursor-pointer active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>{h?.checkInBtn || (isRTL ? "تسجيل وصول فوري" : "Fast Check-In")}</span>
              </button>
            ) : null}
          </div>
        )}

      </div>
    </header>
  );
}
