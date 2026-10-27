"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminQuickBookingModal from "@/components/admin/overview/AdminQuickBookingModal";
import {
  getAdminBookingsApi,
  cancelAdminBookingApi,
  checkInAttendanceApi,
  getAdminAttendanceApi,
} from "@/services/applications";
import {
  CalendarDays,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Armchair,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  LogIn,
  ArrowRight,
  ArrowLeft,
  Users,
} from "lucide-react";

interface AdminBookingRecord {
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
  status: "confirmed" | "cancelled";
  created_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

// Helper to get local date string YYYY-MM-DD
function getLocalDateString(offsetDays: number = 0, baseDateStr?: string): string {
  const d = baseDateStr ? new Date(baseDateStr) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AdminBookingsPage() {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);

  // Date selection state
  const todayStr = useMemo(() => getLocalDateString(0), []);
  const tomorrowStr = useMemo(() => getLocalDateString(1), []);
  const yesterdayStr = useMemo(() => getLocalDateString(-1), []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [bookings, setBookings] = useState<AdminBookingRecord[]>([]);
  const [checkedInBookingIds, setCheckedInBookingIds] = useState<Set<number | string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Unified Navbar/Tab Filter: all | students | freelancers | confirmed | cancelled
  const [activeCategoryTab, setActiveCategoryTab] = useState<
    "all" | "student" | "freelancer" | "confirmed" | "cancelled"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
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

  // Load Bookings & checked-in statuses for the selected date
  const loadBookings = useCallback(async (dateToLoad?: string) => {
    const targetDate = dateToLoad || selectedDate;
    setLoading(true);
    try {
      const [bookingsData, attRes] = await Promise.allSettled([
        getAdminBookingsApi(targetDate),
        getAdminAttendanceApi(targetDate),
      ]);

      const rawBookings =
        bookingsData.status === "fulfilled" && Array.isArray(bookingsData.value)
          ? bookingsData.value
          : [];
      setBookings(rawBookings as AdminBookingRecord[]);

      // Extract which bookings have already checked in
      const checkedSet = new Set<number | string>();
      if (attRes.status === "fulfilled" && attRes.value?.data) {
        for (const item of attRes.value.data) {
          if (item.booking_id) {
            checkedSet.add(item.booking_id);
            checkedSet.add(String(item.booking_id));
          }
        }
      }
      setCheckedInBookingIds(checkedSet);
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
  }, [selectedDate, loadBookings]);

  // Handle stepping backwards or forwards by 1 day
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

  // Instant Check-In from booking item
  const handleCheckInBooking = async (booking: AdminBookingRecord) => {
    setActionLoadingId(booking.id);
    try {
      await checkInAttendanceApi(`booking_${booking.id}`, {
        type: "member",
        userId: booking.user_id || booking.user?.id,
        bookingId: booking.id,
        notes: booking.notes || "تسجيل حضور من جدول الحجوزات",
      });
      setCheckedInBookingIds((prev) => new Set([...prev, booking.id, String(booking.id)]));
      setToastMessage({
        type: "success",
        text: isRTL
          ? `تم تسجيل حضور ${booking.user?.name || "العضو"} بنجاح!`
          : `Checked in ${booking.user?.name || "Member"} successfully!`,
      });
      loadBookings(selectedDate);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setToastMessage({
        type: "error",
        text: msg || (isRTL ? "فشل تسجيل حضور العضو." : "Check-in failed."),
      });
    } finally {
      setActionLoadingId(null);
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

  // Statistics for the selected date (Clean & Focused)
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const cancelled = bookings.filter((b) => b.status === "cancelled");
    const students = confirmed.filter((b) => (b.user?.member_type || "student") === "student").length;
    const freelancers = confirmed.filter((b) => b.user?.member_type === "freelancer").length;
    const checkedInCount = confirmed.filter(
      (b) => checkedInBookingIds.has(b.id) || checkedInBookingIds.has(String(b.id))
    ).length;

    return {
      total,
      confirmedCount: confirmed.length,
      cancelledCount: cancelled.length,
      studentsCount: students,
      freelancersCount: freelancers,
      checkedInCount,
    };
  }, [bookings, checkedInBookingIds]);

  // Filtered Bookings List based on unified category navbar & search
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const uType = (b.user?.member_type || "student").toLowerCase();

      if (activeCategoryTab === "student" && uType !== "student") return false;
      if (activeCategoryTab === "freelancer" && uType !== "freelancer") return false;
      if (activeCategoryTab === "confirmed" && b.status !== "confirmed") return false;
      if (activeCategoryTab === "cancelled" && b.status !== "cancelled") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const userName = (b.user?.name || "").toLowerCase();
        const userEmail = (b.user?.email || "").toLowerCase();
        const userPhone = (b.user?.phone || "").toLowerCase();
        const bookingId = String(b.id).toLowerCase();
        const notes = (b.notes || "").toLowerCase();

        return (
          userName.includes(q) ||
          userEmail.includes(q) ||
          userPhone.includes(q) ||
          bookingId.includes(q) ||
          notes.includes(q)
        );
      }

      return true;
    });
  }, [bookings, activeCategoryTab, searchQuery]);

  // Formatted date label for human reading
  const formattedDateTitle = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
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
        currentTab="bookings"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-64 xl:mr-72" : "lg:ml-64 xl:ml-72"
        }`}
      >
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <AdminHeader
            onOpenCheckIn={() => setIsQuickBookingOpen(true)}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

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

          {/* ── Page Header: Title & Quick Booking CTA ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0c2340] tracking-tight">
                {isRTL ? "جدول الحجوزات" : "Bookings Roster"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isRTL
                  ? `استعراض وإدارة حجوزات المقاعد ليوم ${formattedDateTitle}`
                  : `Managing seat reservations for ${formattedDateTitle}`}
              </p>
            </div>

            {/* Focused Action Button */}
            <button
              type="button"
              onClick={() => setIsQuickBookingOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isRTL ? "حجز مقعد لعضو" : "Book for Member"}</span>
            </button>
          </div>

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

            {/* Date Input Picker */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-slate-200 rounded-xl px-2.5 py-1">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => loadBookings(selectedDate)}
                title={isRTL ? "تحديث الحجوزات" : "Refresh"}
                className={`p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0 ${
                  loading ? "animate-spin text-emerald-700" : ""
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── 2. Focused Metric Cards (Booked Hours Removed) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Card 1: Total Bookings */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block">
                  {isRTL ? "إجمالي الحجوزات" : "Total Bookings"}
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {stats.total}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {stats.confirmedCount} {isRTL ? "مؤكد" : "confirmed"}
                  {stats.cancelledCount > 0 && ` • ${stats.cancelledCount} ملغي`}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Students vs Freelancers */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block">
                  {isRTL ? "حسب الفئة" : "By Category"}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-black text-slate-900">
                    {stats.studentsCount} <span className="text-xs font-semibold text-slate-400">طالب</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-lg font-black text-slate-900">
                    {stats.freelancersCount} <span className="text-xs font-semibold text-slate-400">مستقل</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {isRTL ? "توزيع المقاعد المؤكدة" : "Confirmed desk shares"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Actual Hub Attendance */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block">
                  {isRTL ? "الحضور الفعلي للمركز" : "Attendance Recorded"}
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {stats.checkedInCount}{" "}
                  <span className="text-xs font-semibold text-slate-400">
                    / {stats.confirmedCount}
                  </span>
                </span>
                <span className="text-[11px] text-amber-600 font-semibold">
                  {Math.max(0, stats.confirmedCount - stats.checkedInCount)}{" "}
                  {isRTL ? "بانتظار الحضور" : "awaiting arrival"}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ── 3. Category Navbar / Tabs & Clean Search Bar ── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Navigation Bar (Pill Tabs) */}
              <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategoryTab === "all"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isRTL ? "جميع الحجوزات" : "All"} ({bookings.length})
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
                  <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isRTL ? "المستقلين" : "Freelancers"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategoryTab("confirmed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategoryTab === "confirmed"
                      ? "bg-white text-emerald-800 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isRTL ? "المؤكدة" : "Confirmed"} ({stats.confirmedCount})
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

          {/* ── 4. Clean Sleek Bookings Table ── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2.5">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500">
                  {isRTL ? "جاري تحميل جدول الحجوزات..." : "Loading bookings..."}
                </p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-14 px-4 text-center space-y-2">
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                  <Armchair className="w-5 h-5 text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {searchQuery
                    ? isRTL
                      ? "لا توجد نتائج تطابق بحثك"
                      : "No matching bookings found"
                    : isRTL
                    ? `لا توجد حجوزات مسجلة لهذا اليوم`
                    : `No bookings scheduled for this date`}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isRTL
                    ? "يمكن للأعضاء حجز مقاعدهم ذاتياً، أو يمكنك الضغط على 'حجز مقعد لعضو' في الأعلى."
                    : "Members can reserve desks through the portal or you can add one directly."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right rtl:text-right ltr:text-left text-xs sm:text-sm">
                  <thead className="bg-[#f8fafc] text-slate-500 text-[11px] font-bold border-b border-slate-200/80 uppercase">
                    <tr>
                      <th className="py-3 px-4 sm:px-5">{isRTL ? "العضو" : "Member"}</th>
                      <th className="py-3 px-4 sm:px-5">{isRTL ? "الفئة" : "Category"}</th>
                      <th className="py-3 px-4 sm:px-5">{isRTL ? "الموعد والمدة" : "Schedule"}</th>
                      <th className="py-3 px-4 sm:px-5">{isRTL ? "الملاحظات" : "Notes"}</th>
                      <th className="py-3 px-4 sm:px-5">{isRTL ? "الحالة" : "Status"}</th>
                      <th className="py-3 px-4 sm:px-5 text-center">{isRTL ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((b) => {
                      const user = b.user || {};
                      const isStudent = (user.member_type || "student") === "student";
                      const isCheckedIn =
                        checkedInBookingIds.has(b.id) || checkedInBookingIds.has(String(b.id));
                      const isConfirmed = b.status === "confirmed";
                      const isCancelled = b.status === "cancelled";
                      const isLoadingThis = actionLoadingId === b.id;

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Member info */}
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
                                  <span className="text-[10px] text-slate-400 font-mono">#{b.id}</span>
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

                          {/* Member type badge */}
                          <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                            {isStudent ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <GraduationCap className="w-3 h-3 text-emerald-600" />
                                <span>{isRTL ? "طالب" : "Student"}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                <Briefcase className="w-3 h-3 text-teal-600" />
                                <span>{isRTL ? "مستقل" : "Freelancer"}</span>
                              </span>
                            )}
                          </td>

                          {/* Time Slot & Duration merged cleanly */}
                          <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/70 font-mono text-xs font-bold text-slate-800">
                              <Clock className="w-3 h-3 text-emerald-700" />
                              <span>{b.start_time} – {b.end_time}</span>
                              <span className="text-slate-400 text-[10px]">({b.hours_count} س)</span>
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="py-3.5 px-4 sm:px-5 max-w-xs">
                            <span className="text-xs text-slate-500 line-clamp-1">
                              {b.notes || (isRTL ? "حجز مقعد دراسة/عمل" : "Standard booking")}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 sm:px-5 whitespace-nowrap">
                            {isCancelled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>{isRTL ? "ملغي" : "Cancelled"}</span>
                              </span>
                            ) : isCheckedIn ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{isRTL ? "حاضر بالمساحة" : "Checked In"}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>{isRTL ? "مؤكد" : "Confirmed"}</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 sm:px-5 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {isConfirmed && !isCheckedIn && (
                                <button
                                  type="button"
                                  onClick={() => handleCheckInBooking(b)}
                                  disabled={isLoadingThis}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                  title={isRTL ? "تسجيل وصول العضو فوراً" : "Check In"}
                                >
                                  {isLoadingThis ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <LogIn className="w-3 h-3" />
                                  )}
                                  <span>{isRTL ? "تسجيل حضور" : "Check In"}</span>
                                </button>
                              )}

                              {isConfirmed && isCheckedIn && (
                                <span className="text-[11px] text-emerald-700 font-bold px-2 py-1 bg-emerald-50 rounded-md">
                                  {isRTL ? "سُجل حضوره" : "Attended"}
                                </span>
                              )}

                              {isConfirmed && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancelModalBooking(b);
                                    setCancelReason("");
                                  }}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title={isRTL ? "إلغاء هذا الحجز" : "Cancel"}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

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
                  } ليوم ${cancelModalBooking.booking_date}؟ سيتم استرداد الساعات المحجوزة لحساب العضو تلقائياً.`
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

      {/* ── Quick Booking Modal ── */}
      <AdminQuickBookingModal
        isOpen={isQuickBookingOpen}
        onClose={() => setIsQuickBookingOpen(false)}
        onSuccess={() => loadBookings(selectedDate)}
      />
    </div>
  );
}
