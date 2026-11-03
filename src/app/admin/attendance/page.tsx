"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AttendanceStats from "@/components/admin/AttendanceStats";
import AttendanceTable from "@/components/admin/AttendanceTable";
import CheckInModal from "@/components/admin/CheckInModal";
import { AttendanceRecord } from "@/components/admin/types";
import {
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import {
  getAdminAttendanceApi,
  checkInAttendanceApi,
  checkOutAttendanceApi,
  createManualAttendanceApi,
} from "@/services/applications";
import { getLocalDateString, getAllowedWeekDates } from "@/utils/dateTime";

export default function AdminAttendancePage() {
  const { locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  const [currentTab, setCurrentTab] = useState("dailyAttendance");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Persistent session lock to guarantee no row reverts to 'waiting' after check-in
  const sessionCheckedInMap = useRef<Map<string, { id: string; arrivalTime: string }>>(new Map());
  const sessionCheckedOutMap = useRef<Map<string, { departureTime: string; actualDuration: string }>>(new Map());

  // Allowed Week Dates Calculation (Saturday to Thursday, Friday closed)
  const weekInfo = useMemo(() => getAllowedWeekDates(), []);
  const todayStr = useMemo(() => getLocalDateString(0), []);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // If today is in allowed dates (Sat-Thu), start with today, otherwise use defaultDate
    const isTodayAllowed = weekInfo.allAllowed.some((d) => d.date === todayStr);
    return isTodayAllowed ? todayStr : weekInfo.defaultDate;
  });

  const isToday = selectedDate === todayStr;
  const selectedDateObj = useMemo(() => {
    return weekInfo.allAllowed.find((d) => d.date === selectedDate) || null;
  }, [weekInfo.allAllowed, selectedDate]);
  const isFuture = selectedDateObj ? selectedDateObj.isFuture : selectedDate > todayStr;

  const mapRecords = useCallback((data: Record<string, unknown>[]): AttendanceRecord[] => {
    return (data || []).map((r: Record<string, unknown>) => {
      const user = (r.user as Record<string, unknown>) || {};
      const visitorPass = (r.visitorPass as Record<string, unknown>) || {};
      return {
        id: String(r.id),
        name: String(r.name || user.name || visitorPass.full_name || ""),
        avatarLetter: r.name ? String(r.name).charAt(0) : "ع",
        avatarColor:
          r.type === "student"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : r.type === "visitor"
            ? "bg-cyan-50 text-cyan-800 border-cyan-200"
            : "bg-teal-50 text-teal-800 border-teal-200",
        type: (r.type as "student" | "freelancer" | "visitor") || "student",
        subText:
          (r.sub_text as string) ||
          (r.type === "visitor"
            ? (isRTL ? "طلب زيارة معتمد" : "Approved visitor pass")
            : (isRTL ? "عضو مسجل في المساحة" : "Registered hub member")),
        bookingTime: (r.booking_time as string) || (isRTL ? "حضور معتمد" : "Approved slot"),
        arrivalTime: (r.arrival_time as string) || (isRTL ? "لم يسجل بعد" : "Not recorded"),
        departureTime:
          (r.departure_time as string) ||
          (r.status === "inside" ? (isRTL ? "داخل المساحة الآن" : "Inside space now") : "-"),
        actualDuration: (r.actual_duration as string) || "-",
        status: (r.status as "inside" | "waiting" | "left" | "unattended") || "waiting",
        userId: (r.user_id || user.id) as number | string | undefined,
        bookingId: (r.booking_id || (r.booking as Record<string, unknown>)?.id) as number | string | undefined,
        visitorPassId: (r.visitor_pass_id || visitorPass.id) as number | string | undefined,
        phone: String(user.phone || visitorPass.phone || r.phone || ""),
        nationalId: String(user.national_id || user.nationalId || visitorPass.national_id || ""),
      };
    });
  }, [isRTL]);

  const loadAttendance = useCallback(async (dateToLoad?: string) => {
    setLoading(true);
    const targetDate = dateToLoad || selectedDate;
    try {
      const attRes = await getAdminAttendanceApi(targetDate);
      const attList = attRes?.data ? attRes.data : [];
      const initialMapped = mapRecords(attList);

      const mergedList = initialMapped.map((rec) => {
        // Enforce session check-in / check-out lock to prevent any 1-second reversion
        const checkedInInfo =
          sessionCheckedInMap.current.get(rec.id) ||
          (rec.bookingId && sessionCheckedInMap.current.get(`booking_${rec.bookingId}`)) ||
          (rec.bookingId && sessionCheckedInMap.current.get(String(rec.bookingId))) ||
          (rec.visitorPassId && sessionCheckedInMap.current.get(`visitor_${rec.visitorPassId}`));

        if (checkedInInfo && (rec.status === "waiting" || rec.status === "unattended")) {
          return {
            ...rec,
            id: checkedInInfo.id,
            status: "inside" as const,
            arrivalTime: checkedInInfo.arrivalTime,
            departureTime: isRTL ? "داخل المساحة الآن" : "Inside space now",
            actualDuration: isRTL ? "منذ قليل" : "Just now",
          };
        }

        const checkedOutInfo = sessionCheckedOutMap.current.get(rec.id);
        if (checkedOutInfo && rec.status === "inside") {
          return {
            ...rec,
            status: "left" as const,
            departureTime: checkedOutInfo.departureTime,
            actualDuration: checkedOutInfo.actualDuration,
          };
        }

        return rec;
      });

      setRecords(mergedList);
    } catch (err) {
      console.warn("Failed to load attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, mapRecords, isRTL]);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        loadAttendance(selectedDate);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedDate, loadAttendance]);

  const handleSelectDate = (newDate: string) => {
    if (!newDate) return;
    setSelectedDate(newDate);
  };

  // Dynamic Calculated Statistics
  const stats = useMemo(() => {
    const attended = records.filter((r) => r.status === "inside" || r.status === "left").length;
    const inside = records.filter((r) => r.status === "inside").length;
    const awaiting = records.filter((r) => r.status === "waiting").length;
    const unattended = records.filter((r) => r.status === "unattended").length;

    return {
      attendedCount: attended,
      insideCount: inside,
      awaitingCount: awaiting,
      unattendedCount: unattended,
    };
  }, [records]);

  // Check-In Action handler
  const handleCheckIn = async (id: string) => {
    try {
      const record = records.find((r) => r.id === id);
      const isVisitor = record?.type === "visitor" || String(id).startsWith("visitor_");
      const updated = await checkInAttendanceApi(id, {
        type: isVisitor ? "visitor" : "member",
        userId: record?.userId,
        bookingId: record?.bookingId,
        visitorPassId: record?.visitorPassId,
        notes: record?.subText || "تسجيل حضور من كشف الاستقبال",
      });

      const newId = updated?.id ? String(updated.id) : id;
      const gazaNowStr = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Gaza",
      }).format(new Date());

      const arrival = updated?.arrival_time || gazaNowStr;

      // Lock in session ref
      sessionCheckedInMap.current.set(id, { id: newId, arrivalTime: arrival });
      sessionCheckedInMap.current.set(newId, { id: newId, arrivalTime: arrival });
      if (record?.bookingId) {
        sessionCheckedInMap.current.set(`booking_${record.bookingId}`, { id: newId, arrivalTime: arrival });
        sessionCheckedInMap.current.set(String(record.bookingId), { id: newId, arrivalTime: arrival });
      }
      if (record?.visitorPassId) {
        sessionCheckedInMap.current.set(`visitor_${record.visitorPassId}`, { id: newId, arrivalTime: arrival });
      }

      // Immediately flip button & row status to 'inside'
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id || r.id === newId || (record?.bookingId && r.bookingId === record.bookingId)
            ? {
                ...r,
                id: newId,
                status: "inside",
                arrivalTime: arrival,
                departureTime: isRTL ? "داخل المساحة الآن" : "Inside space now",
                actualDuration: isRTL ? "منذ قليل" : "Just now",
              }
            : r
        )
      );

      // Re-sync with server authoritative state
      await loadAttendance(selectedDate);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert(msg || "تعذر تسجيل الدخول");
      throw err;
    }
  };

  // Check-Out Action handler
  const handleCheckOut = async (id: string) => {
    try {
      const record = records.find((r) => r.id === id);
      const updated = await checkOutAttendanceApi(id);
      const gazaNowStr = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Gaza",
      }).format(new Date());

      const departure = updated?.departure_time || gazaNowStr;
      const duration = updated?.actual_duration || (isRTL ? "تمت المغادرة" : "Departed");

      sessionCheckedOutMap.current.set(id, { departureTime: departure, actualDuration: duration });
      if (updated?.id) {
        sessionCheckedOutMap.current.set(String(updated.id), { departureTime: departure, actualDuration: duration });
      }
      if (record?.bookingId) {
        sessionCheckedOutMap.current.set(`booking_${record.bookingId}`, { departureTime: departure, actualDuration: duration });
      }
      if (record?.visitorPassId) {
        sessionCheckedOutMap.current.set(`visitor_${record.visitorPassId}`, { departureTime: departure, actualDuration: duration });
      }

      // Immediately flip button & row status to 'left'
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id || (updated?.id && r.id === String(updated.id)) || (record?.bookingId && r.bookingId === record.bookingId)
            ? {
                ...r,
                status: "left",
                departureTime: departure,
                actualDuration: duration,
              }
            : r
        )
      );

      // Re-sync with server authoritative state
      await loadAttendance(selectedDate);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert(msg || "تعذر تسجيل الخروج");
      throw err;
    }
  };

  // Fast Check-In Modal submit handler
  const handleNewCheckIn = async (newRecord: AttendanceRecord) => {
    try {
      await createManualAttendanceApi({
        name: newRecord.name,
        type: newRecord.type,
        subText: newRecord.subText,
        bookingTime: newRecord.bookingTime,
        date: selectedDate,
      });
      await loadAttendance(selectedDate);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert(msg || "تعذر إضافة سجل الحضور");
    }
  };

  // Formatted date label for human reading
  const formattedDateTitle = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate, isRTL]);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white"
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-72" : "lg:ml-72"
        }`}
      >
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <AdminHeader
            onOpenCheckIn={() => setIsCheckInOpen(true)}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          {/* ── Date Navigator & Filter Bar ── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Date Select Dropdown & Today Quick Return */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* قائمة التاريخ المحددة بأيام الأسبوع المسموح بها فقط */}
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2 hover:border-emerald-500/40 transition-colors shadow-2xs">
                <CalendarDays className="w-4 h-4 text-emerald-700 shrink-0" />
                <label htmlFor="attendance-date-select" className="text-xs font-bold text-slate-600 whitespace-nowrap">
                  {isRTL ? "قائمة التاريخ:" : "Date:"}
                </label>
                <select
                  id="attendance-date-select"
                  value={selectedDate}
                  onChange={(e) => handleSelectDate(e.target.value)}
                  className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  {weekInfo.nextWeek.length > 0 ? (
                    <>
                      <optgroup label={isRTL ? "الأسبوع الحالي (السبت – الخميس)" : "Current Week (Sat – Thu)"}>
                        {weekInfo.currentWeek.map((item) => (
                          <option key={item.date} value={item.date}>
                            {isRTL ? item.fullLabelAr : item.fullLabelEn}{" "}
                            {item.isToday ? (isRTL ? "— (اليوم)" : "— (Today)") : ""}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={isRTL ? "الأسبوع القادم (مفتوح للتسجيل)" : "Next Week (Open for Registration)"}>
                        {weekInfo.nextWeek.map((item) => (
                          <option key={item.date} value={item.date}>
                            {isRTL ? item.fullLabelAr : item.fullLabelEn}
                          </option>
                        ))}
                      </optgroup>
                    </>
                  ) : (
                    weekInfo.currentWeek.map((item) => (
                      <option key={item.date} value={item.date}>
                        {isRTL ? item.fullLabelAr : item.fullLabelEn}{" "}
                        {item.isToday ? (isRTL ? "— (اليوم)" : "— (Today)") : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Quick Return to Today button if different date is selected */}
              {!isToday && (
                <button
                  type="button"
                  onClick={() => handleSelectDate(todayStr)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer shrink-0"
                >
                  {isRTL ? "العودة لليوم" : "Back to Today"}
                </button>
              )}
            </div>

            {/* Status Badge & Refresh Button */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {/* Status Badge */}
              {isToday ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isRTL ? "مباشر اليوم" : "Live Today"}</span>
                </span>
              ) : isFuture ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shrink-0">
                  <span>{isRTL ? "معاينة قادمة" : "Upcoming"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 shrink-0">
                  <span>{isRTL ? "سجل سابق" : "Past Log"}</span>
                </span>
              )}

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => loadAttendance(selectedDate)}
                title={isRTL ? "تحديث السجل" : "Refresh Log"}
                className={`p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0 ${
                  loading ? "animate-spin text-emerald-700" : ""
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Date Context Banner (if viewing future or past) */}
          {!isToday && (
            <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
              isFuture
                ? "bg-blue-50/70 border-blue-200 text-blue-800"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span className="font-semibold">
                  {isFuture
                    ? (isRTL
                        ? `معاينة الحجوزات والزيارات المعتمدة ليوم: ${formattedDateTitle}`
                        : `Previewing scheduled visits for: ${formattedDateTitle}`)
                    : (isRTL
                        ? `عرض سجل الحضور لأرشيف يوم: ${formattedDateTitle}`
                        : `Viewing attendance archive for: ${formattedDateTitle}`)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectDate(todayStr)}
                className="text-xs font-bold underline hover:opacity-80 cursor-pointer shrink-0"
              >
                {isRTL ? "العودة لليوم" : "Return to Today"}
              </button>
            </div>
          )}

          {/* Dynamic Statistics Cards */}
          <AttendanceStats
            attendedCount={stats.attendedCount}
            insideCount={stats.insideCount}
            awaitingCount={stats.awaitingCount}
            unattendedCount={stats.unattendedCount}
          />

          {/* Attendance Table & Filters */}
          <AttendanceTable
            records={records}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            isToday={isToday}
          />

        </main>
      </div>

      {/* Fast Check-In Modal */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSubmit={handleNewCheckIn}
      />
    </div>
  );
}
