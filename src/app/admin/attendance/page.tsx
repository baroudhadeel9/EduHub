"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  getAdminBookingsApi,
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
        status: (r.status as "inside" | "waiting" | "left") || "waiting",
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
      const [attRes, bookingsRes] = await Promise.allSettled([
        getAdminAttendanceApi(targetDate),
        getAdminBookingsApi(targetDate),
      ]);

      const attList = attRes.status === "fulfilled" && attRes.value?.data ? attRes.value.data : [];
      const bookingsList = bookingsRes.status === "fulfilled" && Array.isArray(bookingsRes.value) ? bookingsRes.value : [];

      const initialMapped = mapRecords(attList);
      const existingIds = new Set(initialMapped.map((r) => r.id));

      const pendingBookings: AttendanceRecord[] = [];
      for (const b of bookingsList) {
        const bIdStr = String(b.id);
        const bookingKey = `booking_${b.id}`;
        if (!existingIds.has(bIdStr) && !existingIds.has(bookingKey)) {
          const user = b.user || {};
          const memberType = (user.member_type === "freelancer" ? "freelancer" : "student") as "freelancer" | "student";
          const start = b.start_time || "";
          const end = b.end_time || "";
          pendingBookings.push({
            id: bookingKey,
            name: user.name || "عضو مسجل",
            avatarLetter: user.name ? user.name.charAt(0) : "ع",
            avatarColor: memberType === "freelancer" ? "bg-teal-50 text-teal-800 border-teal-200" : "bg-emerald-50 text-emerald-800 border-emerald-200",
            type: memberType,
            subText: isRTL ? `حجز مقعد مسبق (${b.hours_count || 8} ساعات)` : `Seat booking (${b.hours_count || 8}h)`,
            bookingTime: start && end ? `${start} – ${end}` : "حجز مسبق",
            arrivalTime: isRTL ? "لم يسجل بعد" : "Not recorded",
            departureTime: "-",
            actualDuration: "-",
            status: "waiting",
            userId: (b.user_id || user.id) as number | string | undefined,
            bookingId: b.id as number | string | undefined,
            phone: String(user.phone || ""),
            nationalId: String(user.national_id || user.nationalId || ""),
          });
        }
      }

      setRecords([...initialMapped, ...pendingBookings]);
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

    return {
      attendedCount: attended,
      insideCount: inside,
      awaitingCount: awaiting,
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
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                id: updated?.id ? String(updated.id) : r.id,
                status: "inside",
                arrivalTime: updated?.arrival_time || "الآن",
                departureTime: isRTL ? "لم يغادر بعد" : "Still in hub",
                actualDuration: isRTL ? "منذ قليل" : "Just now",
              }
            : r
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert(msg || "تعذر تسجيل الدخول");
    }
  };

  // Check-Out Action handler
  const handleCheckOut = async (id: string) => {
    try {
      const updated = await checkOutAttendanceApi(id);
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "left",
                departureTime: updated.departure_time || "الآن",
                actualDuration: updated.actual_duration || (isRTL ? "تمت المغادرة" : "Departed"),
              }
            : r
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert(msg || "تعذر تسجيل الخروج");
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
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Quick Allowed Days Shortcut Buttons (Saturday to Thursday) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {weekInfo.currentWeek.map((dayItem) => {
                const isSelected = selectedDate === dayItem.date;
                return (
                  <button
                    key={dayItem.date}
                    type="button"
                    onClick={() => handleSelectDate(dayItem.date)}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs scale-[1.02]"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                    }`}
                  >
                    <span>{isRTL ? dayItem.dayNameAr : dayItem.dayNameEn}</span>
                    <span
                      className={`text-[11px] font-mono ${
                        isSelected ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      {dayItem.formattedShort}
                    </span>
                    {dayItem.isToday && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-white" : "bg-emerald-600 animate-pulse"
                        }`}
                      />
                    )}
                  </button>
                );
              })}

              {weekInfo.nextWeek.length > 0 && (
                <>
                  <span className="text-slate-300 px-0.5">|</span>
                  {weekInfo.nextWeek.map((dayItem) => {
                    const isSelected = selectedDate === dayItem.date;
                    return (
                      <button
                        key={dayItem.date}
                        type="button"
                        onClick={() => handleSelectDate(dayItem.date)}
                        className={`px-3 py-2 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          isSelected
                            ? "bg-[#0c2340] text-white shadow-xs scale-[1.02]"
                            : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        }`}
                        title={isRTL ? "الأسبوع القادم (مفتوح)" : "Next Week"}
                      >
                        <span>{isRTL ? dayItem.dayNameAr : dayItem.dayNameEn}</span>
                        <span
                          className={`text-[11px] font-mono ${
                            isSelected ? "text-indigo-200" : "text-indigo-400"
                          }`}
                        >
                          {dayItem.formattedShort}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Date Select Dropdown & Status Tag */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* قائمة التاريخ المحددة بأيام الأسبوع المسموح بها فقط */}
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-1.5 hover:border-emerald-500/40 transition-colors shadow-2xs">
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
          />

          {/* Attendance Table & Filters */}
          <AttendanceTable
            records={records}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
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
