"use client";

import React from "react";
import { Calendar, MapPin } from "lucide-react";
import { MemberRecord } from "@/components/admin/members/data";

interface MemberProfileBookingsTabProps {
  member: MemberRecord;
  isRTL: boolean;
}

export default function MemberProfileBookingsTab({
  member,
  isRTL,
}: MemberProfileBookingsTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Today's Active Booking Card (if any) */}
      {member.bookingNote && member.bookingNote.includes("حجز اليوم") && (
        <div className="bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 rounded-2xl border border-emerald-200/90 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{isRTL ? "حجز نشط اليوم بالمساحة" : "Active Booking Today"}</span>
            </span>
            <span className="text-xs font-bold text-emerald-800">
              {isRTL ? "طاولة رقم 12 (قاعة المستقلين)" : "Desk #12"}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#0c2340]">
            {member.bookingNote}
          </p>
        </div>
      )}

      {/* Booking History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0c2340]">
              {isRTL ? "سجل الحجوزات والزيارات" : "Booking & Visit History"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL
                ? "سجل الجلسات السابقة وساعات الاستخدام في المركز"
                : "Past sessions and time allocated at the center"}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {isRTL ? `${member.history.length} حجوزات مسجلة` : `${member.history.length} Bookings`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 text-xs font-bold border-b border-slate-200/60">
                <th className="py-3 px-5 text-start">{isRTL ? "التاريخ والمدة" : "Date & Duration"}</th>
                <th className="py-3 px-5 text-start">{isRTL ? "المكان / المقعد" : "Desk / Space"}</th>
                <th className="py-3 px-5 text-start">{isRTL ? "الغرض من الحجز" : "Purpose"}</th>
                <th className="py-3 px-5 text-center">{isRTL ? "الحالة" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {member.history.map((h) => {
                const cleanDate = String(h.date || "").split("T")[0];
                const dateFormatted = h.date_formatted || (h.day_name ? `${h.day_name}، ${cleanDate}` : cleanDate);
                const isAttended = h.status === "attended" || (h.status === "completed" && h.attended_range?.includes("حضر"));
                const isInside = h.status === "inside" || h.status === "active";
                const isNoShow = h.status === "no_show" || (h.purpose && h.purpose.includes("لم يحضر")) || (h.duration && h.duration.includes("لم يحضر"));
                const isCancelled = h.status === "cancelled" && !isNoShow;
                const isConfirmed = h.status === "confirmed";

                return (
                  <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-extrabold text-[#0c2340] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{dateFormatted}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{h.duration}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold">{h.desk}</span>
                      </div>
                      {h.room && <span className="text-[10px] text-slate-400 block mt-0.5">{h.room}</span>}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 max-w-sm">
                      {h.attended_range ? (
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block font-bold text-xs ${
                              isAttended
                                ? "text-emerald-700"
                                : isInside
                                ? "text-emerald-600"
                                : isNoShow
                                ? "text-amber-800"
                                : "text-slate-700"
                            }`}
                          >
                            {h.attended_range}
                          </span>
                          {h.purpose && <p className="text-[11px] text-slate-400 truncate">{h.purpose}</p>}
                        </div>
                      ) : (
                        <span>{h.purpose}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {isInside ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white animate-pulse">
                          {isRTL ? "داخل المساحة الآن 🟢" : "Active Now 🟢"}
                        </span>
                      ) : isAttended ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {isRTL ? "حضر بنجاح ✓" : "Attended ✓"}
                        </span>
                      ) : isNoShow ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {isRTL ? "لم يحضر ⚠️" : "No-Show ⚠️"}
                        </span>
                      ) : isCancelled ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          {isRTL ? "ملغي ✕" : "Cancelled ✕"}
                        </span>
                      ) : isConfirmed ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
                          {isRTL ? "حجز مؤكد ⏳" : "Confirmed ⏳"}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {h.status_label || (isRTL ? "مكتمل" : "Completed")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {member.history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    {isRTL ? "لا توجد حجوزات مسجلة بعد لهذا العضو" : "No booking history recorded yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
