"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, Search, Bell, Menu } from "lucide-react";

interface OverviewHeaderProps {
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function OverviewHeader({
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
}: OverviewHeaderProps) {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const o = t.admin?.overview;

  const [currentDateStr, setCurrentDateStr] = useState<string>("");

  useEffect(() => {
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
    <header className="mb-6 sm:mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Right Side in RTL: Title & Live Indicator */}
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50 lg:hidden cursor-pointer"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight">
              {o?.title || (isRTL ? "نظرة عامة" : "Overview")}
            </h1>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{o?.liveBadge || (isRTL ? "محدّث مباشرة" : "Live Updated")}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{currentDateStr || (isRTL ? "جاري تحديد التاريخ..." : "Loading date...")}</span>
          </div>
        </div>

        {/* Left Side in RTL: Search Box & Notification Bell */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={o?.searchPlaceholder || (isRTL ? "بحث عن عضو، حجز..." : "Search member, booking...")}
              className={`w-full bg-white border border-slate-200/80 rounded-xl py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all shadow-2xs font-medium ${
                isRTL ? "pr-4 pl-9" : "pl-4 pr-9"
              }`}
            />
            <div
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${
                isRTL ? "left-3" : "right-3"
              }`}
            >
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
