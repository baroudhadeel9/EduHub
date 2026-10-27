"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Users, Clock, CalendarDays, UserCheck } from "lucide-react";
import { getAdminReportsApi } from "@/services/applications";

export default function ReportsStats() {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const r = t.admin?.reports;

  const [realStats, setRealStats] = useState({
    activeMembers: 0,
    bookedHours: 0,
    bookingsAndVisits: 0,
    visitorsCount: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await getAdminReportsApi();
        if (res.stats) {
          setRealStats(res.stats);
        }
      } catch (err) {
        console.error("Failed to load reports stats:", err);
      }
    }
    loadStats();
  }, []);

  const stats = [
    {
      label: r?.activeMember || (isRTL ? "عضو نشط" : "Active Members"),
      value: realStats.activeMembers.toLocaleString(),
      icon: Users,
      iconBg: "bg-emerald-100/80 text-emerald-800",
    },
    {
      label: r?.bookedHours || (isRTL ? "ساعة محجوزة" : "Booked Hours"),
      value: realStats.bookedHours.toLocaleString(),
      icon: Clock,
      iconBg: "bg-blue-100/80 text-blue-700",
    },
    {
      label: r?.bookingsAndVisits || (isRTL ? "حجز وزيارة" : "Bookings & Visits"),
      value: realStats.bookingsAndVisits.toLocaleString(),
      icon: CalendarDays,
      iconBg: "bg-slate-100 text-[#0c2340]",
    },
    {
      label: r?.visitor || (isRTL ? "زائر" : "Visitors"),
      value: realStats.visitorsCount.toLocaleString(),
      icon: UserCheck,
      iconBg: "bg-emerald-100/80 text-emerald-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-slate-500">
                {stat.label}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
            </div>

            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
