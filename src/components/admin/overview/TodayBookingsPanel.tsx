"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Clock, CalendarDays, Armchair } from "lucide-react";
import { getAdminOverviewApi, getAdminBookingsApi } from "@/services/applications";

interface TodayBookingItem {
  id?: string | number;
  time?: string;
  name?: string;
  reason?: string;
  desk?: string;
  type?: string;
}

interface TodayBookingsPanelProps {
  refreshKey?: number;
}

export default function TodayBookingsPanel({ refreshKey = 0 }: TodayBookingsPanelProps) {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const o = t.admin?.overview;

  const [bookings, setBookings] = useState<TodayBookingItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const [bookingsList, overviewRes] = await Promise.allSettled([
          getAdminBookingsApi(todayStr),
          getAdminOverviewApi(),
        ]);

        const rawBookings =
          bookingsList.status === "fulfilled" && Array.isArray(bookingsList.value)
            ? bookingsList.value
            : [];
        const overviewData =
          overviewRes.status === "fulfilled" && overviewRes.value ? overviewRes.value : null;

        if (rawBookings.length > 0) {
          setBookings(
            rawBookings.map((b: Record<string, unknown>, idx: number) => {
              const user = (b.user as Record<string, unknown>) || {};
              const userName =
                (user.name as string) || (b.userName as string) || (b.name as string) || "عضو مسجل";
              const start = (b.start_time as string) || (b.startTime as string) || "";
              const end = (b.end_time as string) || (b.endTime as string) || "";
              const timeStr = start && end ? `${start} – ${end}` : "اليوم";
              const memberType = (user.member_type as string) || (b.member_type as string);

              return {
                id: (b.id as string | number) || idx + 1,
                name: userName,
                time: timeStr,
                desk: `مقعد #${b.id || idx + 1}`,
                type: memberType === "freelancer" ? "عمل حر" : "طالب",
                reason: (b.notes as string) || "حجز مقعد دراسة/عمل",
              };
            })
          );
        } else if (overviewData?.todayBookings && overviewData.todayBookings.length > 0) {
          setBookings(overviewData.todayBookings);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.warn("Could not load today bookings:", err);
      }
    }
    loadData();
  }, [refreshKey]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
      {/* Sleek Minimal Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#0c2340] tracking-tight">
              {o?.todayBookings || (isRTL ? "حجوزات اليوم" : "Today's Bookings")}
            </h2>
            <p className="text-xs text-slate-400">
              {isRTL ? "مواعيد المساحة المشتركة والاجتماعات المجدولة" : "Scheduled coworking seats"}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {bookings.length} {isRTL ? "حجوزات" : "Bookings"}
        </span>
      </div>

      {/* Bookings Content */}
      <div className="pt-4">
        {bookings.length === 0 ? (
          <div className="py-7 px-4 rounded-xl bg-slate-50/70 border border-slate-200/60 text-center space-y-1.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700">
              {isRTL ? "لا توجد حجوزات مجدولة لهذا اليوم حتى الآن" : "No bookings scheduled for today"}
            </p>
            <p className="text-[11px] text-slate-400">
              {isRTL
                ? "أي حجز جديد يتم تأكيده سيظهر هنا تلقائياً."
                : "New confirmed reservations will appear here automatically."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookings.map((b, idx) => {
              const isStudent = b.type?.includes("طالب") || b.type?.toLowerCase().includes("student");
              const badgeClass = isStudent
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-teal-50 text-teal-700 border-teal-200";

              return (
                <div
                  key={b.id || idx}
                  className="p-3.5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-2xs transition-all flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{b.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${badgeClass}`}>
                      {b.type || (isRTL ? "عضو" : "Member")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-bold">
                      <Clock className="w-3 h-3" />
                      <span>{b.time}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Armchair className="w-3 h-3" />
                      <span>{b.desk}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
