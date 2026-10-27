"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Users, DoorOpen, Clock, CheckCircle2 } from "lucide-react";

interface AttendanceStatsProps {
  attendedCount: number;
  insideCount: number;
  awaitingCount: number;
}

export default function AttendanceStats({
  attendedCount,
  insideCount,
  awaitingCount,
}: AttendanceStatsProps) {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const st = t.admin?.stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
      
      {/* ── Card 1: Attended Today (EduHub Navy) ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-500">
            {st?.attendedToday || (isRTL ? "إجمالي الحضور اليوم" : "Attended Today")}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0c2340] tracking-tight">
              {attendedCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {st?.people || (isRTL ? "أشخاص مسجلين" : "individuals")}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isRTL ? "سجلوا دخولهم بالفعل للمركز" : "Completed or active check-ins"}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#0c2340] flex items-center justify-center shrink-0 border border-slate-200/70 group-hover:scale-105 transition-transform">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* ── Card 2: Inside Space Now (EduHub Brand Emerald) ── */}
      <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition-all flex items-center justify-between group">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{st?.insideNow || (isRTL ? "داخل المساحة الآن" : "Inside Space Now")}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700 tracking-tight">
              {insideCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600/80">
              {st?.activeMember || (isRTL ? "عضو متواجد" : "present")}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600/70">
            {isRTL ? "يشغلون مقاعد العمل والإنترنت" : "Currently occupying seats"}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/70 group-hover:scale-105 transition-transform">
          <DoorOpen className="w-5 h-5" />
        </div>
      </div>

      {/* ── Card 3: Awaiting Arrival (Soft Warm Slate) ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-500">
            {st?.awaitingArrival || (isRTL ? "حجوزات اليوم (بانتظار الحضور)" : "Awaiting Arrival")}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0c2340] tracking-tight">
              {awaitingCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {st?.remainingBooking || (isRTL ? "حجوزات متبقية" : "bookings")}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isRTL ? "مواعيد مجدولة متوقع وصولها" : "Scheduled arrivals pending"}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/70 group-hover:scale-105 transition-transform">
          <Clock className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
}
