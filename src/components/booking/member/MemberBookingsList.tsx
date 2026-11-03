"use client";

import React from "react";
import { Calendar, Clock, Armchair, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cleanBookingDate, formatHour12 } from "@/utils/dateTime";

export interface MemberBookingItem {
  id: string;
  booking_code?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  status: "confirmed" | "cancelled" | "completed";
  roomName?: string;
  roomKey?: string;
  seatNumber?: number;
  seatLabel?: string;
  seatCode?: string;
  notes?: string;
  canCancel?: boolean;
  can_cancel?: boolean;
}

interface MemberBookingsListProps {
  bookings: MemberBookingItem[];
  onCancelBooking: (id: string) => void;
  cancellingId?: string | null;
}

export default function MemberBookingsList({
  bookings,
  onCancelBooking,
  cancellingId,
}: MemberBookingsListProps) {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const bp = t.bookingPortal;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          {isRTL
            ? "سياسة الإلغاء: مسموح بإلغاء حجز المقعد في أي وقت قبل تسجيل الدخول الفعلي أو قبل انتهاء يوم العمل (16:00)."
            : "Cancellation policy: You can cancel your desk reservation anytime before check-in or before 16:00."}
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">
            {bp?.noBookings || (isRTL ? "لا توجد حجوزات مسجلة حالياً" : "No bookings recorded yet")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === "confirmed";
            const isCancelling = cancellingId === booking.id;

            return (
              <div
                key={booking.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isConfirmed
                    ? "bg-white border-slate-200 shadow-xs"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Armchair className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{booking.seatLabel || (booking.seatNumber ? `مقعد ${booking.seatNumber}` : "مقعد")}</span>
                      {booking.seatCode && <span className="font-mono text-[10px] text-slate-500">({booking.seatCode})</span>}
                    </span>
                    {booking.roomName && (
                      <span className="text-xs text-slate-600 font-semibold">
                        • {booking.roomName}
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-slate-400">
                      (حجز #{booking.id})
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isConfirmed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isConfirmed
                        ? (isRTL ? "حجز مقعد مؤكد — بانتظار حضورك" : "Confirmed — Awaiting Visit")
                        : (isRTL ? "ملغي / لم يحضر" : "Cancelled / No-Show")}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-extrabold text-brand-navy">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {cleanBookingDate(booking.date)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-slate-600 font-normal text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {booking.startTime && booking.endTime
                        ? `${formatHour12(booking.startTime)} – ${formatHour12(booking.endTime)}`
                        : (isRTL ? "8 ص – 4 م" : "8 AM – 4 PM")}
                    </span>
                  </div>
                  {booking.notes && (
                    <p className="text-xs text-slate-500 font-normal">
                      {booking.notes}
                    </p>
                  )}
                </div>

                {isConfirmed && booking.canCancel && (
                  <button
                    type="button"
                    onClick={() => onCancelBooking(booking.id)}
                    disabled={isCancelling}
                    className="px-3.5 py-1.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer self-end sm:self-auto disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isCancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isRTL ? "إلغاء حجز المقعد" : "Cancel Reservation"}</span>
                  </button>
                )}

                {isConfirmed && !booking.canCancel && (
                  <span
                    title={isRTL ? "لا يمكن إلغاء الحجز قبل أقل من ساعة من موعد بدايته" : "Cannot cancel within 1 hour of start time"}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-500 self-end sm:self-auto cursor-help"
                  >
                    {isRTL ? "مغلق للإلغاء (< ساعة)" : "Locked (< 1h)"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

