"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, ArrowRight, UserPlus, UserCheck, Users } from "lucide-react";
import { getAdminOverviewApi } from "@/services/applications";

export default function OverviewTopCards() {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const o = t.admin?.overview;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [topCards, setTopCards] = useState({
    pendingApplications: 0,
    pendingVisitors: 0,
    insideAttendees: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAdminOverviewApi();
        if (res.topCards) {
          setTopCards(res.topCards);
        }
      } catch (err) {
        console.warn("Could not load overview cards:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
      
      {/* ── Card 1: New Membership Requests (Clean without "نشط الآن") ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between group">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-4xl sm:text-5xl font-black text-[#0c2340] tracking-tight">
              {topCards.pendingApplications}
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {o?.newMembershipRequests || (isRTL ? "طلبات عضوية جديدة" : "New Membership Requests")}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL ? "طلبات انضمام جديدة تحتاج للاعتماد وتحديد الحصة" : "New applicant submissions awaiting approval"}
            </p>
          </div>
        </div>

        <div className="pt-5 mt-2 border-t border-slate-100">
          <Link
            href="/admin/applications"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md hover:shadow-emerald-900/15 active:scale-98 transition-all cursor-pointer"
          >
            <span>{o?.reviewRequests || (isRTL ? "فحص واعتماد الطلبات" : "Review Applications")}</span>
            <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Card 2: Visitor Requests (Clean without "اليوم") ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between group">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-4xl sm:text-5xl font-black text-[#0c2340] tracking-tight">
              {topCards.pendingVisitors}
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {o?.visitorRequests || (isRTL ? "طلبات زوار" : "Visitor Requests")}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL ? "تصاريح دخول ليوم واحد للباحثين والضيوف" : "1-day guest passes awaiting verification"}
            </p>
          </div>
        </div>

        <div className="pt-5 mt-2 border-t border-slate-100">
          <Link
            href="/admin/visitor-requests"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md hover:shadow-teal-900/15 active:scale-98 transition-all cursor-pointer"
          >
            <span>{o?.reviewRequests || (isRTL ? "مراجعة تصاريح الزوار" : "Review Visitor Passes")}</span>
            <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Card 3: Inside Space Now (EduHub Brand Navy) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-400 transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between group">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="w-11 h-11 rounded-2xl bg-[#0c2340]/10 text-[#0c2340] border border-[#0c2340]/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#0c2340] border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isRTL ? "داخل المساحة الآن" : "Inside Now"}</span>
            </span>
          </div>

          <div>
            <div className="text-4xl sm:text-5xl font-black text-[#0c2340] tracking-tight">
              {topCards.insideAttendees}
            </div>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {isRTL ? "المتواجدون في المركز حالياً" : "Current Attendees Inside"}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL ? "تسجيل الحضور الميداني المباشر عبر رمز الاستجابة" : "Live field check-ins and active seat users"}
            </p>
          </div>
        </div>

        <div className="pt-5 mt-2 border-t border-slate-100">
          <Link
            href="/admin/attendance"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0c2340] hover:bg-[#15345d] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md hover:shadow-[#0c2340]/20 active:scale-98 transition-all cursor-pointer"
          >
            <span>{isRTL ? "عرض سجل الحضور اليومي" : "View Attendance Log"}</span>
            <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

    </div>
  );
}
