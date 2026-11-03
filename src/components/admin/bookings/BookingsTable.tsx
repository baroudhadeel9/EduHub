"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  getAdminBookingsApi,
  cancelAdminBookingApi,
} from "@/services/applications";
import {
  cleanBookingDate,
  formatHour12,
  formatBookingCreatedAt,
  getLocalDateString,
} from "@/utils/dateTime";
import {
  CalendarDays,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Armchair,
  GraduationCap,
  Phone,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

export interface AdminBookingRecord {
  id: string | number;
  user_id?: string | number;
  user?: {
    id?: string | number;
    name?: string;
    email?: string;
    phone?: string;
    member_type?: string;
  };
  booking_date: string;
  start_time: string;
  end_time: string;
  hours_count: number;
  notes?: string;
  status: "confirmed" | "attended" | "cancelled";
  created_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  seat_number?: number;
  seat_label?: string;
  seat_code?: string;
  room_name?: string;
  room_key?: string;
  seat?: {
    id?: number;
    seat_number?: number;
    label?: string;
    code?: string;
  };
  room?: {
    id?: number;
    room_key?: string;
    name_ar?: string;
    name_en?: string;
    gender?: string;
  };
}

interface BookingsTableProps {
  refreshTrigger?: number;
}

export default function BookingsTable({ refreshTrigger = 0 }: BookingsTableProps) {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  // Date selection state
  const todayStr = useMemo(() => getLocalDateString(0), []);
  const tomorrowStr = useMemo(() => getLocalDateString(1), []);
  const yesterdayStr = useMemo(() => getLocalDateString(-1), []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [bookings, setBookings] = useState<AdminBookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [activeCategoryTab, setActiveCategoryTab] = useState<
    "all" | "student" | "freelancer" | "confirmed" | "attended" | "cancelled"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Action states
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<AdminBookingRecord | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<AdminBookingRecord | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isToday = selectedDate === todayStr;
  const isTomorrow = selectedDate === tomorrowStr;
  const isYesterday = selectedDate === yesterdayStr;

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load Bookings for the selected date
  const loadBookings = useCallback(async (dateToLoad?: string) => {
    const targetDate = dateToLoad || selectedDate;
    setLoading(true);
    try {
      const bookingsData = await getAdminBookingsApi(targetDate);
      const rawBookings = Array.isArray(bookingsData) ? bookingsData : [];
      setBookings(rawBookings as AdminBookingRecord[]);
    } catch (err) {
      console.warn("Failed to load admin bookings:", err);
      setToastMessage({
        type: "error",
        text: isRTL ? "تعذر تحديث جدول الحجوزات من الخادم." : "Could not fetch bookings from server.",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, isRTL]);

  useEffect(() => {
    loadBookings(selectedDate);
  }, [selectedDate, loadBookings, refreshTrigger]);

  // Step day
  const handleStepDay = (step: number) => {
    try {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const curr = new Date(y, m - 1, d);
      curr.setDate(curr.getDate() + step);
      const nextY = curr.getFullYear();
      const nextM = String(curr.getMonth() + 1).padStart(2, "0");
      const nextD = String(curr.getDate()).padStart(2, "0");
      setSelectedDate(`${nextY}-${nextM}-${nextD}`);
    } catch {
      setSelectedDate(todayStr);
    }
  };

  // Confirm and Cancel Booking
  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setIsCancelling(true);
    try {
      await cancelAdminBookingApi(cancelModalBooking.id, cancelReason || "إلغاء بواسطة مسؤول النظام");
      setToastMessage({
        type: "success",
        text: isRTL
          ? `تم إلغاء الحجز #${cancelModalBooking.id} وإعادة الساعات للعضو بنجاح.`
          : `Booking #${cancelModalBooking.id} cancelled successfully.`,
      });
      setCancelModalBooking(null);
      setCancelReason("");
      loadBookings(selectedDate);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setToastMessage({
        type: "error",
        text: msg || (isRTL ? "فشل إلغاء الحجز." : "Failed to cancel booking."),
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Statistics for the selected date
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const attended = bookings.filter((b) => b.status === "attended");
    const activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "attended");
    const cancelled = bookings.filter((b) => b.status === "cancelled");
    const students = activeBookings.filter((b) => (b.user?.member_type || "student") === "student").length;
    const freelancers = activeBookings.filter((b) => b.user?.member_type === "freelancer").length;
    const totalHours = activeBookings.reduce((acc, b) => acc + (Number(b.hours_count) || 8), 0);

    return {
      total,
      confirmedCount: confirmed.length,
      attendedCount: attended.length,
      activeCount: activeBookings.length,
      cancelledCount: cancelled.length,
      studentsCount: students,
      freelancersCount: freelancers,
      totalHours,
    };
  }, [bookings]);

  // Filtered Bookings List
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const uType = (b.user?.member_type || "student").toLowerCase();

      if (activeCategoryTab === "student" && uType !== "student") return false;
      if (activeCategoryTab === "freelancer" && uType !== "freelancer") return false;
      if (activeCategoryTab === "confirmed" && b.status !== "confirmed") return false;
      if (activeCategoryTab === "attended" && b.status !== "attended") return false;
      if (activeCategoryTab === "cancelled" && b.status !== "cancelled") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const userName = (b.user?.name || "").toLowerCase();
        const userEmail = (b.user?.email || "").toLowerCase();
        const userPhone = (b.user?.phone || "").toLowerCase();
        const bookingId = String(b.id).toLowerCase();
        const seatNum = String(b.seat_number || b.seat?.seat_number || "");
        const seatLabel = (b.seat_label || b.seat?.label || "").toLowerCase();
        const seatCode = (b.seat_code || b.seat?.code || "").toLowerCase();
        const roomName = (b.room_name || b.room?.name_ar || "").toLowerCase();
        const notes = (b.notes || "").toLowerCase();

        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          userPhone.includes(q) ||
          bookingId.includes(q) ||
          seatNum.includes(q) ||
          seatLabel.includes(q) ||
          seatCode.includes(q) ||
          roomName.includes(q) ||
          notes.includes(q)
        );
      }

      return true;
    });
  }, [bookings, activeCategoryTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ── Toast Notification Banner ── */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-2xl border shadow-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold underline hover:opacity-75 cursor-pointer shrink-0"
          >
            {isRTL ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* ── 1. Sleek Compact Date Navigator ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => handleStepDay(isRTL ? 1 : -1)}
            title={isRTL ? "اليوم التالي" : "Previous Day"}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isToday
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {isRTL ? "اليوم" : "Today"}
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate(tomorrowStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isTomorrow
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {isRTL ? "غداً" : "Tomorrow"}
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate(yesterdayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isYesterday
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {isRTL ? "أمس" : "Yesterday"}
          </button>

          <button
            type="button"
            onClick={() => handleStepDay(isRTL ? -1 : 1)}
            title={isRTL ? "اليوم السابق" : "Next Day"}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Date Input & Status Label */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(e.target.value);
              }}
              className="bg-transparent border-none outline-none font-mono text-xs cursor-pointer text-slate-800"
            />
          </div>

          <button
            type="button"
            onClick={() => loadBookings(selectedDate)}
            title={isRTL ? "تحديث" : "Refresh"}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 2. Top Metric Cards (Responsive: Compact 3-col on mobile, spacious on desktop) ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Card 1: Total Bookings */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 block truncate">
              {isRTL ? "إجمالي الحجوزات" : "Total Bookings"}
            </span>
            <span className="text-base sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1 block">
              {stats.total}
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold block truncate">
              {stats.activeCount} {isRTL ? "مؤكد / حضر" : "active"}
              {stats.attendedCount > 0 && ` (${stats.attendedCount} ${isRTL ? "حضر" : "attended"})`}
              {stats.cancelledCount > 0 && ` • ${stats.cancelledCount} ${isRTL ? "ملغي" : "cancelled"}`}
            </span>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 self-end sm:self-auto">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Card 2: Students vs Freelancers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 block truncate">
              {isRTL ? "حسب الفئة" : "By Category"}
            </span>
            <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
              <span className="text-xs sm:text-lg font-black text-slate-900">
                {stats.studentsCount} <span className="text-[10px] font-semibold text-slate-400">طالب</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs sm:text-lg font-black text-slate-900">
                {stats.freelancersCount} <span className="text-[10px] font-semibold text-slate-400">مستقل</span>
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
              {isRTL ? "توزيع المقاعد" : "Desk shares"}
            </span>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 self-end sm:self-auto">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Card 3: Total Reserved Hours */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 block truncate">
              {isRTL ? "الساعات المحجوزة" : "Reserved Hours"}
            </span>
            <span className="text-base sm:text-2xl font-black text-indigo-600 mt-0.5 sm:mt-1 block">
              {stats.totalHours}{" "}
              <span className="text-[10px] font-semibold text-slate-400">
                {isRTL ? "س" : "hrs"}
              </span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
              {isRTL ? "ساعات المقاعد" : "Confirmed hours"}
            </span>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 self-end sm:self-auto">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Category Selector & Clean Search Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Mobile Category Dropdown (Clean, modern select instead of overflowing tabs) */}
          <div className="block sm:hidden w-full">
            <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center justify-between">
              <span>{isRTL ? "تصفية الحجوزات حسب الفئة:" : "Filter by Category:"}</span>
              <span className="text-emerald-700 font-mono text-[10px]">
                {filteredBookings.length} {isRTL ? "حجز معروض" : "shown"}
              </span>
            </label>
            <div className="relative">
              <select
                value={activeCategoryTab}
                onChange={(e) => setActiveCategoryTab(e.target.value as "all" | "student" | "freelancer" | "confirmed" | "attended" | "cancelled")}
                className="w-full py-2.5 ps-3 pe-9 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer shadow-2xs"
              >
                <option value="all">
                  {isRTL ? `جميع الحجوزات (${bookings.length})` : `All Bookings (${bookings.length})`}
                </option>
                <option value="confirmed">
                  {isRTL ? `المؤكدة (${stats.confirmedCount})` : `Confirmed (${stats.confirmedCount})`}
                </option>
                <option value="attended">
                  {isRTL ? `تم الحضور (${stats.attendedCount})` : `Attended (${stats.attendedCount})`}
                </option>
                <option value="cancelled">
                  {isRTL ? `الملغية (${stats.cancelledCount})` : `Cancelled (${stats.cancelledCount})`}
                </option>
                <option value="student">
                  {isRTL ? `الطلاب (${stats.studentsCount})` : `Students (${stats.studentsCount})`}
                </option>
                <option value="freelancer">
                  {isRTL ? `المستقلين (${stats.freelancersCount})` : `Freelancers (${stats.freelancersCount})`}
                </option>
              </select>
            </div>
          </div>

          {/* Desktop Category Navigation Bar (Pill Tabs - hidden on mobile) */}
          <div className="hidden sm:inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveCategoryTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryTab === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isRTL ? "الكل" : "All"} ({bookings.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab("confirmed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryTab === "confirmed"
                  ? "bg-white text-blue-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isRTL ? "المؤكدة" : "Confirmed"} ({stats.confirmedCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab("attended")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeCategoryTab === "attended"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isRTL ? "تم الحضور" : "Attended"}</span>
              <span>({stats.attendedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab("cancelled")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryTab === "cancelled"
                  ? "bg-white text-rose-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isRTL ? "الملغية" : "Cancelled"} ({stats.cancelledCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab("student")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategoryTab === "student"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isRTL ? "الطلاب" : "Students"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategoryTab("freelancer")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategoryTab === "freelancer"
                  ? "bg-white text-teal-800 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>{isRTL ? "المستقلين" : "Freelancers"}</span>
            </button>
          </div>

          {/* Clean Quick Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 right-3 rtl:right-3 rtl:left-auto ltr:left-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? "بحث باسم العضو أو الهاتف..." : "Search member name..."}
              className="w-full text-xs py-2 px-8 bg-[#f8fafc] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 -translate-y-1/2 left-2.5 rtl:left-2.5 rtl:right-auto ltr:right-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Main Content: Bookings Roster Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-500">
              {isRTL ? "جاري تحميل جدول الحجوزات من الخادم..." : "Loading bookings roster..."}
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {isRTL ? "لا توجد حجوزات مسجلة لهذا اليوم" : "No bookings recorded for this day"}
            </p>
            <p className="text-xs text-slate-400">
              {isRTL ? "يمكنك حجز مقعد لعضو عبر زر (حجز مقعد لعضو) أعلاه." : "You can book a seat for a member using the button above."}
            </p>
          </div>
        ) : (
          <>
            {/* ── Mobile Card View (block sm:hidden) ── */}
            <div className="block sm:hidden divide-y divide-slate-100">
              {filteredBookings.map((b) => {
                const user = b.user || {};
                const isStudent = (user.member_type || "student") === "student";
                const isCancelled = b.status === "cancelled";

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedDetailBooking(b)}
                    className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    {/* Member Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                            isStudent
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-teal-50 text-teal-800 border-teal-200"
                          }`}
                        >
                          {user.name ? user.name.charAt(0) : "ع"}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate">
                            {user.name || (isRTL ? "عضو مسجل" : "Registered Member")}
                          </span>
                          {user.phone && (
                            <span className="text-[11px] text-slate-400 font-mono block" dir="ltr">
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-bold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Armchair className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{b.seat_label || (b.seat_number ? `مقعد ${b.seat_number}` : (b.seat?.seat_number ? `مقعد ${b.seat.seat_number}` : "مقعد"))}</span>
                          {(b.seat_code || b.seat?.code) && (
                            <span className="font-mono text-[10px] text-slate-500 font-bold">({b.seat_code || b.seat?.code})</span>
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          {b.status === "attended" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {isRTL ? "تم الحضور" : "Attended"}
                            </span>
                          )}
                          {b.status === "confirmed" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {isRTL ? "مؤكد" : "Confirmed"}
                            </span>
                          )}
                          {isCancelled && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {isRTL ? "ملغي" : "Cancelled"}
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-slate-400">
                            حجز #{b.id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timing and Schedule Info (Polished Mobile Layout) */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-500">
                          {isRTL ? "القاعة المخصصة:" : "Assigned Hall:"}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          {b.room_name || (b.room?.room_key === "female_hall" ? (isRTL ? "صالة الإناث 👩" : "Female Hall") : (isRTL ? "صالة الشباب 🚹" : "Youth Hall"))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-500">
                          {isRTL ? "فترة الحجز:" : "Booking Slot:"}
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                          <span>{cleanBookingDate(b.booking_date)}</span>
                          <span className="text-slate-300">•</span>
                          <span dir="ltr" className="font-mono text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                            {formatHour12(b.start_time)} – {formatHour12(b.end_time)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-0.5 border-t border-slate-100">
                        <span>{isRTL ? "تاريخ تقديم الطلب:" : "Booked At:"}</span>
                        <span className="font-medium text-slate-600">{formatBookingCreatedAt(b.created_at, isRTL)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop Table View (hidden sm:block) ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left text-xs sm:text-sm">
                <thead className="bg-[#f8fafc] text-slate-500 text-[11px] font-bold border-b border-slate-200/80 uppercase">
                  <tr>
                    <th className="py-3 px-4 sm:px-5">{isRTL ? "المقعد والقاعة" : "Desk & Room"}</th>
                    <th className="py-3 px-4 sm:px-5">{isRTL ? "الاسم" : "Member Name"}</th>
                    <th className="py-3 px-4 sm:px-5">{isRTL ? "موعد الحجز" : "Schedule"}</th>
                    <th className="py-3 px-4 sm:px-5">{isRTL ? "متى تم الحجز" : "Booked At"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => {
                    const user = b.user || {};
                    const isStudent = (user.member_type || "student") === "student";
                    const isCancelled = b.status === "cancelled";

                    return (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedDetailBooking(b)}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        title={isRTL ? "انقر لعرض تفاصيل الحجز وإدارته" : "Click to view booking details"}
                      >
                        {/* Desk & Room */}
                        <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200 shrink-0">
                              <Armchair className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 text-xs sm:text-sm">
                                  {b.seat_label || (b.seat_number ? `مقعد ${b.seat_number}` : (b.seat?.seat_number ? `مقعد ${b.seat.seat_number}` : "مقعد غير محدد"))}
                                </span>
                                {(b.seat_code || b.seat?.code) && (
                                  <span className="font-mono text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                                    {b.seat_code || b.seat?.code}
                                  </span>
                                )}
                                {b.status === "attended" && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {isRTL ? "تم الحضور" : "Attended"}
                                  </span>
                                )}
                                {b.status === "confirmed" && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    {isRTL ? "مؤكد" : "Confirmed"}
                                  </span>
                                )}
                                {isCancelled && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                    {isRTL ? "ملغي" : "Cancelled"}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <span>{b.room_name || (b.room?.room_key === "female_hall" ? (isRTL ? "صالة الإناث" : "Female Hall") : (isRTL ? "صالة الشباب" : "Youth Hall"))}</span>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-slate-400">حجز #{b.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Member Name */}
                        <td className="py-3.5 px-4 sm:px-5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                                isStudent
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-teal-50 text-teal-800 border-teal-200"
                              }`}
                            >
                              {user.name ? user.name.charAt(0) : "ع"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{user.name || (isRTL ? "عضو مسجل" : "Registered Member")}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isStudent ? "bg-emerald-50 text-emerald-700" : "bg-teal-50 text-teal-700"}`}>
                                  {isStudent ? (isRTL ? "طالب" : "Student") : (isRTL ? "مستقل" : "Freelancer")}
                                </span>
                              </div>
                              {user.phone && (
                                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Schedule (Date & Time) */}
                        <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{cleanBookingDate(b.booking_date)}</span>
                            </div>
                            <div className="font-mono text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span>{formatHour12(b.start_time)} – {formatHour12(b.end_time)}</span>
                              <span className="text-slate-400">({b.hours_count} س)</span>
                            </div>
                          </div>
                        </td>

                        {/* When Booked (Created At) */}
                        <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap text-xs text-slate-600 font-medium">
                          {formatBookingCreatedAt(b.created_at, isRTL)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Booking Detail & Cancellation Modal ── */}
      {selectedDetailBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <Armchair className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{isRTL ? `تفاصيل الحجز #${selectedDetailBooking.id}` : `Booking Details #${selectedDetailBooking.id}`}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              {/* Booking Status Banner in Modal */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border">
                <span className="text-slate-500 font-bold">{isRTL ? "حالة الحجز الحالية:" : "Current Status:"}</span>
                {selectedDetailBooking.status === "attended" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isRTL ? "تم الحضور (المستفيد داخل المركز)" : "Attended & Checked In"}</span>
                  </span>
                )}
                {selectedDetailBooking.status === "confirmed" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                    <span>{isRTL ? "حجز مؤكد (في انتظار الوصول)" : "Confirmed (Awaiting Arrival)"}</span>
                  </span>
                )}
                {selectedDetailBooking.status === "cancelled" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                    <XCircle className="w-3.5 h-3.5 text-rose-700" />
                    <span>{isRTL ? "حجز ملغي" : "Cancelled"}</span>
                  </span>
                )}
              </div>

              {selectedDetailBooking.status === "cancelled" && selectedDetailBooking.cancellation_reason && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                  <span className="font-bold block mb-0.5">{isRTL ? "سبب الإلغاء:" : "Cancellation Reason:"}</span>
                  <span className="text-rose-700 font-medium">{selectedDetailBooking.cancellation_reason}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">{isRTL ? "المقعد المخصص:" : "Reserved Desk:"}</span>
                <span className="font-black text-emerald-800 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Armchair className="w-4 h-4 text-emerald-600" />
                  <span>{selectedDetailBooking.seat_label || (selectedDetailBooking.seat_number ? `مقعد ${selectedDetailBooking.seat_number}` : (selectedDetailBooking.seat?.seat_number ? `مقعد ${selectedDetailBooking.seat.seat_number}` : "مقعد"))}</span>
                  {(selectedDetailBooking.seat_code || selectedDetailBooking.seat?.code) && (
                    <span className="font-mono text-xs text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded">
                      {selectedDetailBooking.seat_code || selectedDetailBooking.seat?.code}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">{isRTL ? "الصالة / القاعة:" : "Hall / Room:"}</span>
                <span className="font-bold text-slate-900">
                  {selectedDetailBooking.room_name || (selectedDetailBooking.room?.room_key === "female_hall" ? (isRTL ? "صالة الإناث" : "Female Hall") : (isRTL ? "صالة الشباب" : "Youth Hall"))}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">{isRTL ? "رقم مرجع الحجز:" : "Booking Reference:"}</span>
                <span className="font-mono font-bold text-slate-700">#{selectedDetailBooking.id}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">{isRTL ? "اسم العضو:" : "Member Name:"}</span>
                <span className="font-bold text-slate-900">{selectedDetailBooking.user?.name || "عضو مسجل"}</span>
              </div>
              {selectedDetailBooking.user?.phone && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">{isRTL ? "رقم الهاتف:" : "Phone:"}</span>
                  <span className="font-mono font-bold" dir="ltr">{selectedDetailBooking.user.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">{isRTL ? "تاريخ الحجز:" : "Booking Date:"}</span>
                <span className="font-bold">{cleanBookingDate(selectedDetailBooking.booking_date)}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">{isRTL ? "الوقت والساعات:" : "Time & Hours:"}</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {formatHour12(selectedDetailBooking.start_time)} – {formatHour12(selectedDetailBooking.end_time)} ({selectedDetailBooking.hours_count} س)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500">{isRTL ? "متى تم الحجز:" : "Booked At:"}</span>
                <span className="font-medium text-slate-600">{formatBookingCreatedAt(selectedDetailBooking.created_at, isRTL)}</span>
              </div>
              {selectedDetailBooking.notes && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block mb-1">{isRTL ? "ملاحظات:" : "Notes:"}</span>
                  <span className="font-medium text-slate-700">{selectedDetailBooking.notes}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDetailBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {isRTL ? "إغلاق" : "Close"}
              </button>

              {selectedDetailBooking.status === "confirmed" && (
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalBooking(selectedDetailBooking);
                    setSelectedDetailBooking(null);
                    setCancelReason("");
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isRTL ? "إلغاء هذا الحجز" : "Cancel Booking"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Booking Modal ── */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{isRTL ? "تأكيد إلغاء الحجز" : "Confirm Cancellation"}</span>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isRTL
                ? `هل أنت متأكد من رغبتك في إلغاء حجز ${
                    cancelModalBooking.user?.name || "هذا العضو"
                  } ليوم ${cleanBookingDate(cancelModalBooking.booking_date)}؟ سيتم استرداد الساعات المحجوزة لحساب العضو تلقائياً.`
                : `Are you sure you want to cancel the booking for ${
                    cancelModalBooking.user?.name || "this member"
                  }?`}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {isRTL ? "سبب الإلغاء (اختياري):" : "Cancellation Reason (optional):"}
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={
                  isRTL ? "مثال: اعتذار العضو، صيانة طارئة..." : "e.g. Member requested cancellation..."
                }
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                {isRTL ? "تراجع" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isCancelling ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>{isRTL ? "تأكيد الإلغاء" : "Confirm Cancel"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
