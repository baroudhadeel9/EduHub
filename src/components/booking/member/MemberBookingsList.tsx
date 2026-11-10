"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Armchair,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Sparkles,
  Info,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cleanBookingDate, formatHour12, formatBookingDayAndDate } from "@/utils/dateTime";

export interface MemberBookingItem {
  id: string;
  booking_code?: string;
  numericId?: number;
  date: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  status: "confirmed" | "cancelled" | "attended" | "inside" | "no_show" | string;
  roomName?: string;
  roomKey?: string;
  seatNumber?: number;
  seatLabel?: string;
  seatCode?: string;
  notes?: string;
  canCancel?: boolean;
  can_cancel?: boolean;
  // Rich attendance breakdown
  dayName?: string;
  bookingDateFormatted?: string;
  attendanceStatus?: "attended" | "inside" | "no_show" | "cancelled" | "confirmed" | string;
  statusBadge?: "attended" | "inside" | "no_show" | "cancelled" | "confirmed" | string;
  statusLabel?: string;
  attendanceSummary?: string;
  checkInTime?: string;
  checkOutTime?: string;
  recordedHours?: number;
  cancellationReason?: string;
}

interface MemberBookingsListProps {
  bookings: MemberBookingItem[];
  onCancelBooking: (id: string) => void;
  cancellingId?: string | null;
}

type FilterType = "all" | "attended" | "inside" | "confirmed" | "no_show" | "cancelled";

export default function MemberBookingsList({
  bookings,
  onCancelBooking,
  cancellingId,
}: MemberBookingsListProps) {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const bp = t.bookingPortal;

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Helper to determine exact unified status of any booking item
  const getBookingMeta = (b: MemberBookingItem) => {
    const rawStatus = (b.status || "").toLowerCase();
    const attStatus = (b.attendanceStatus || b.statusBadge || "").toLowerCase();

    // 1. Attended and completed
    if (
      attStatus === "attended" ||
      rawStatus === "attended" ||
      (b.checkInTime && b.checkOutTime)
    ) {
      return {
        key: "attended" as const,
        badgeLabel: isRTL ? "حضر بنجاح ✓" : "Attended ✓",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
        cardBorder: "border-emerald-200/90 bg-emerald-50/20",
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
      };
    }

    // 2. Currently inside
    if (
      attStatus === "inside" ||
      rawStatus === "inside" ||
      (b.checkInTime && !b.checkOutTime)
    ) {
      return {
        key: "inside" as const,
        badgeLabel: isRTL ? "داخل المساحة الآن 🟢" : "Inside Now 🟢",
        badgeClass: "bg-emerald-600 text-white border-emerald-700 animate-pulse",
        cardBorder: "border-emerald-400 bg-emerald-50/40 shadow-xs",
        icon: <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />,
      };
    }

    // 3. Explicitly Cancelled or No-Show
    if (attStatus === "no_show" || rawStatus === "no_show") {
      return {
        key: "no_show" as const,
        badgeLabel: isRTL ? "لم يحضر ⚠️" : "No-Show ⚠️",
        badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
        cardBorder: "border-amber-200/80 bg-amber-50/20",
        icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
      };
    }

    if (
      attStatus === "cancelled" ||
      rawStatus === "cancelled" ||
      (b.cancellationReason && !b.cancellationReason.includes("لم يحضر"))
    ) {
      // Check if cancellation reason mentions no-show
      if (b.cancellationReason && (b.cancellationReason.includes("لم يحضر") || b.cancellationReason.includes("تغيّب"))) {
        return {
          key: "no_show" as const,
          badgeLabel: isRTL ? "لم يحضر ⚠️" : "No-Show ⚠️",
          badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
          cardBorder: "border-amber-200/80 bg-amber-50/20",
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
        };
      }
      return {
        key: "cancelled" as const,
        badgeLabel: isRTL ? "ملغي ✕" : "Cancelled ✕",
        badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
        cardBorder: "border-rose-200/70 bg-rose-50/15 opacity-75",
        icon: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
      };
    }

    // 4. Confirmed upcoming or today
    return {
      key: "confirmed" as const,
      badgeLabel: isRTL ? "حجز مؤكد — بانتظار حضورك ⏳" : "Confirmed — Upcoming ⏳",
      badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
      cardBorder: "border-sky-200 bg-white shadow-2xs",
      icon: <Clock className="w-4 h-4 text-sky-600 shrink-0" />,
    };
  };

  // Group counts for filter chips
  const counts = useMemo(() => {
    const res = {
      all: bookings.length,
      attended: 0,
      inside: 0,
      confirmed: 0,
      no_show: 0,
      cancelled: 0,
    };
    bookings.forEach((b) => {
      const meta = getBookingMeta(b);
      res[meta.key]++;
    });
    return res;
  }, [bookings]);

  // Filtered list
  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") return bookings;
    return bookings.filter((b) => getBookingMeta(b).key === activeFilter);
  }, [bookings, activeFilter]);

  return (
    <div className="space-y-4 pt-1">
      {/* ── Policy Notice ── */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
        <Info className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="leading-relaxed">
          {isRTL
            ? "يتم توثيق الحضور والغياب وساعات الاستخدام تلقائياً وفور تسجيل وصولك ومغادرتك لدى استقبال مساحة إديو هب غزة."
            : "Attendance, departure, and used hours are officially recorded upon check-in and check-out at the reception desk."}
        </p>
      </div>

      {/* ── Interactive Category Filter Chips ── */}
      {bookings.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === "all"
                ? "bg-[#0c2340] text-white border-[#0c2340] shadow-xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>{isRTL ? "جميع الحجوزات والزيارات" : "All Records"}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeFilter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {counts.all}
            </span>
          </button>

          {counts.attended > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("attended")}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "attended"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/60"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isRTL ? "حضر بنجاح" : "Attended"}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === "attended" ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-900"
                }`}
              >
                {counts.attended}
              </span>
            </button>
          )}

          {counts.inside > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("inside")}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "inside"
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-xs animate-pulse"
                  : "bg-emerald-100/80 text-emerald-900 border-emerald-300 hover:bg-emerald-200/60"
              }`}
            >
              <span>{isRTL ? "داخل المساحة الآن 🟢" : "Inside Now 🟢"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 text-white">
                {counts.inside}
              </span>
            </button>
          )}

          {counts.confirmed > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("confirmed")}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "confirmed"
                  ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                  : "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/60"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isRTL ? "قادم ومؤكد" : "Upcoming"}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === "confirmed" ? "bg-white/25 text-white" : "bg-sky-100 text-sky-900"
                }`}
              >
                {counts.confirmed}
              </span>
            </button>
          )}

          {counts.no_show > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("no_show")}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "no_show"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/60"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isRTL ? "لم يحضر" : "No-Show"}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === "no_show" ? "bg-white/25 text-white" : "bg-amber-100 text-amber-900"
                }`}
              >
                {counts.no_show}
              </span>
            </button>
          )}

          {counts.cancelled > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter("cancelled")}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "cancelled"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/60"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{isRTL ? "ملغي" : "Cancelled"}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeFilter === "cancelled" ? "bg-white/25 text-white" : "bg-rose-100 text-rose-900"
                }`}
              >
                {counts.cancelled}
              </span>
            </button>
          )}
        </div>
      )}

      {/* ── Bookings & Attendance List ── */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/70 rounded-3xl border border-slate-200/90 space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-extrabold text-slate-700">
            {bookings.length === 0
              ? bp?.noBookings || (isRTL ? "لا توجد حجوزات مسجلة حتى الآن" : "No bookings recorded yet")
              : isRTL
              ? "لا توجد سجلات تطابق الفلتر المحدد"
              : "No records matching this filter"}
          </h4>
          <p className="text-xs text-slate-500">
            {bookings.length === 0
              ? isRTL
                ? "يمكنك حجز مقعد دراسي أو مكتبي من تبويب 'حجز موعد مقعد جديد' بالأعلى."
                : "You can reserve a desk from the 'Book a New Desk' tab above."
              : isRTL
              ? "جرّب اختيار 'جميع الحجوزات والزيارات' لعرض كافة السجلات."
              : "Try switching to 'All Records' to see your complete history."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBookings.map((booking) => {
            const meta = getBookingMeta(booking);
            const isCancelling = cancellingId === booking.id;
            const dateInfo = formatBookingDayAndDate(booking.date, isRTL);
            const dayTitle = booking.dayName
              ? `${booking.dayName}، ${cleanBookingDate(booking.date)}`
              : dateInfo.formattedWithDay || cleanBookingDate(booking.date);

            return (
              <div
                key={booking.id}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all ${meta.cardBorder}`}
              >
                {/* ── Top Bar: Day & Status ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#0c2340]">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>{dayTitle}</span>
                    </span>

                    <span className="font-mono text-[11px] text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-md">
                      #{booking.id.replace("att_", "زيارة-")}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${meta.badgeClass}`}
                    >
                      {meta.badgeLabel}
                    </span>
                  </div>
                </div>

                {/* ── Middle: Desk, Space & Times ── */}
                <div className="py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {/* Seat / Desk */}
                  <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-slate-100">
                    <Armchair className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {isRTL ? "المقعد المحجوز" : "Reserved Desk"}
                      </span>
                      <span className="font-extrabold text-slate-800">
                        {booking.seatLabel || (booking.seatNumber ? `مقعد ${booking.seatNumber}` : "مقعد دراسي")}
                        {booking.seatCode && (
                          <span className="font-mono text-[10px] text-slate-500 ms-1">({booking.seatCode})</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Room / Hall */}
                  <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-slate-100">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {isRTL ? "المكان / الصالة" : "Hall / Room"}
                      </span>
                      <span className="font-bold text-slate-700">
                        {booking.roomName || (isRTL ? "الصالة التعليمية المشتركة" : "Educational Hall")}
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Timeslot */}
                  <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-slate-100">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {isRTL ? "الحجز المجدول" : "Scheduled Slot"}
                      </span>
                      <span className="font-bold text-slate-700 font-mono">
                        {booking.startTime && booking.endTime
                          ? `${formatHour12(booking.startTime)} – ${formatHour12(booking.endTime)}`
                          : isRTL
                          ? "09:00 ص – 04:00 م"
                          : "09:00 AM – 04:00 PM"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Primary Attendance Status Banner (Crucial Requirement) ── */}
                <div className="mt-1 pt-2.5 border-t border-slate-200/50">
                  {meta.key === "attended" && (
                    <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-extrabold text-sm text-emerald-950">
                          {booking.attendanceSummary || (
                            booking.checkInTime && booking.checkOutTime
                              ? isRTL
                                ? `حضر ${booking.dayName || dateInfo.dayName || "في هذا اليوم"} من ${booking.checkInTime} إلى ${booking.checkOutTime}`
                                : `Attended from ${booking.checkInTime} to ${booking.checkOutTime}`
                              : isRTL
                              ? "تم تسجيل حضورك وانصرافك بنجاح"
                              : "Attendance & Departure confirmed"
                          )}
                        </span>
                      </div>
                      {booking.recordedHours !== undefined && (
                        <span className="font-black text-xs bg-emerald-700 text-white px-2.5 py-1 rounded-lg self-start sm:self-auto">
                          {isRTL
                            ? `${booking.recordedHours} ساعة مسجلة من الحصة`
                            : `${booking.recordedHours} hrs recorded`}
                        </span>
                      )}
                    </div>
                  )}

                  {meta.key === "inside" && (
                    <div className="p-3 rounded-xl bg-emerald-600 text-white flex items-center justify-between gap-2 text-xs shadow-xs animate-pulse">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                        <span className="font-extrabold text-sm">
                          {booking.attendanceSummary || (
                            booking.checkInTime
                              ? isRTL
                                ? `تم تسجيل دخولك الساعة ${booking.checkInTime} — أنت متواجد داخل المساحة الآن`
                                : `Checked in at ${booking.checkInTime} — Inside Hub Now`
                              : isRTL
                              ? "داخل المساحة الآن 🟢"
                              : "Inside Hub Now"
                          )}
                        </span>
                      </div>
                      <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-bold">
                        {isRTL ? "بانتظار تسجيل الخروج" : "Pending Checkout"}
                      </span>
                    </div>
                  )}

                  {meta.key === "no_show" && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-extrabold text-sm block text-amber-950">
                          {isRTL ? "لم يحضر في موعد الحجز (تغيّب)" : "Did Not Attend (No-Show)"}
                        </span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          {booking.cancellationReason || (isRTL
                            ? "انقضت ساعات الدوام الرسمي (04:00 م) لهذا اليوم دون تسجيل وصول لدى الاستقبال."
                            : "Working hours ended without check-in at reception.")}
                        </p>
                      </div>
                    </div>
                  )}

                  {meta.key === "cancelled" && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <span className="font-bold text-sm block text-rose-900">
                          {isRTL ? "حجز ملغي" : "Cancelled Reservation"}
                        </span>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          {booking.cancellationReason || (isRTL
                            ? "تم إلغاء حجز المقعد ولم يتم خصم أي ساعات من حصتك الشهرية."
                            : "Reservation cancelled; no hours deducted from your monthly quota.")}
                        </p>
                      </div>
                    </div>
                  )}

                  {meta.key === "confirmed" && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs">
                      <div className="flex items-center gap-2 text-sky-900">
                        <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                        <div>
                          <span className="font-bold text-sm block text-sky-950">
                            {isRTL ? "حجز مؤكد وبانتظار حضورك" : "Confirmed — Awaiting Your Visit"}
                          </span>
                          <p className="text-[11px] text-sky-700 mt-0.5">
                            {isRTL
                              ? "يرجى التوجه إلى موظف الاستقبال فور وصولك لتسجيل الدخول."
                              : "Please check in with the receptionist upon your arrival."}
                          </p>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {booking.canCancel && (
                        <button
                          type="button"
                          onClick={() => onCancelBooking(booking.id)}
                          disabled={isCancelling}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-xs font-bold text-rose-600 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
                        >
                          {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>{isRTL ? "إلغاء حجز المقعد" : "Cancel Reservation"}</span>
                        </button>
                      )}

                      {!booking.canCancel && (
                        <span
                          title={
                            isRTL
                              ? "لا يمكن إلغاء الحجز قبل أقل من ساعة من موعد بدايته"
                              : "Cannot cancel within 1 hour of start time"
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-500 self-end sm:self-auto cursor-help"
                        >
                          {isRTL ? "مغلق للإلغاء (< ساعة)" : "Locked (< 1h)"}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes if provided */}
                {booking.notes && (
                  <p className="text-[11px] text-slate-500 font-normal mt-2 pt-2 border-t border-slate-100 italic">
                    {isRTL ? "ملاحظة الحجز: " : "Note: "}
                    {booking.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
