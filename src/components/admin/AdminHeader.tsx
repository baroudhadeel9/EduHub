"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Calendar,
  LogIn,
  Bell,
  Menu,
} from "lucide-react";

interface AdminHeaderProps {
  onOpenCheckIn: () => void;
  onOpenMobileMenu: () => void;
}

export default function AdminHeader({
  onOpenCheckIn,
  onOpenMobileMenu,
}: AdminHeaderProps) {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const h = t.admin?.header;

  const [currentDateStr, setCurrentDateStr] = React.useState<string>("");

  React.useEffect(() => {
    const now = new Date();
    try {
      const formatted = now.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      setCurrentDateStr(formatted);
    } catch {
      setCurrentDateStr(now.toDateString());
    }
  }, [isRTL]);

  return (
    <header className="mb-8">
      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-5">
        
        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              {h?.title || (isRTL ? "الحضور اليومي" : "Daily Attendance")}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{currentDateStr || (isRTL ? "جاري تحديد التاريخ..." : "Loading date...")}</span>
            <span className="text-slate-300">•</span>
            <span>{h?.subtitle || (isRTL ? "تحديث فوري للسجلات الميدانية" : "Real-time field logs update")}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs lg:hidden cursor-pointer"
            aria-label="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Notifications Button with Live Badge */}
          <button
            type="button"
            className="relative p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors"
            title={h?.notifications || (isRTL ? "الإشعارات" : "Notifications")}
            aria-label={h?.notifications || "Notifications"}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* Fast Check-In Button (Primary Action) */}
          <button
            type="button"
            onClick={onOpenCheckIn}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-xs hover:shadow-md hover:shadow-emerald-900/15 transition-all cursor-pointer active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span>{h?.checkInBtn || (isRTL ? "تسجيل وصول فوري" : "Fast Check-In")}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
