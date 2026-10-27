"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function WeeklyUsageChart() {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const r = t.admin?.reports;

  const maxHours = 630;
  const weeks = [
    { label: r?.week1 || (isRTL ? "الأسبوع 1" : "Week 1"), hours: 560 },
    { label: r?.week2 || (isRTL ? "الأسبوع 2" : "Week 2"), hours: 630 },
    { label: r?.week3 || (isRTL ? "الأسبوع 3" : "Week 3"), hours: 590 },
    { label: r?.week4 || (isRTL ? "الأسبوع 4" : "Week 4"), hours: 590 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          {r?.usageTitle || (isRTL ? "استخدام المساحة (ساعات الحجز حسب الأسبوع)" : "Space Usage (Booking Hours by Week)")}
        </h2>
        <span className="text-xs font-semibold text-slate-400">
          {r?.weeklyMax || (isRTL ? "الحد الأقصى الأسبوعي: 630 ساعة" : "Weekly Maximum: 630 hrs")}
        </span>
      </div>

      {/* Bars List matching Image 1 */}
      <div className="space-y-4 pt-2">
        {weeks.map((w, index) => {
          const widthPercent = Math.min(100, Math.round((w.hours / maxHours) * 100));

          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>{w.label}</span>
                <span className="font-extrabold text-slate-900">{w.hours}</span>
              </div>

              {/* Bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#352586] transition-all duration-700 ease-out"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
