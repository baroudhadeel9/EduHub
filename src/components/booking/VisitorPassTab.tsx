"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  CheckCircle2,
  Compass,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { submitVisitorRequestApi } from "@/services/applications";

export default function VisitorPassTab() {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const bp = t.bookingPortal;

  // 3. VISITOR ONE-DAY REQUEST STATE (Real backend connection)
  const [visName, setVisName] = useState("");
  const [visPhone, setVisPhone] = useState("");
  const [visEmail, setVisEmail] = useState("");
  const [visDate, setVisDate] = useState("");
  const [startHour, setStartHour] = useState(9); // 09:00 AM
  const [endHour, setEndHour] = useState(12); // 12:00 PM
  const [visReason, setVisReason] = useState("");
  const [visSubmitted, setVisSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState("");

  const allSlots = [
    { hour24: 8, labelAr: "08:00 صباحاً", labelEn: "08:00 AM" },
    { hour24: 8.5, labelAr: "08:30 صباحاً", labelEn: "08:30 AM" },
    { hour24: 9, labelAr: "09:00 صباحاً", labelEn: "09:00 AM" },
    { hour24: 9.5, labelAr: "09:30 صباحاً", labelEn: "09:30 AM" },
    { hour24: 10, labelAr: "10:00 صباحاً", labelEn: "10:00 AM" },
    { hour24: 10.5, labelAr: "10:30 صباحاً", labelEn: "10:30 AM" },
    { hour24: 11, labelAr: "11:00 صباحاً", labelEn: "11:00 AM" },
    { hour24: 11.5, labelAr: "11:30 صباحاً", labelEn: "11:30 AM" },
    { hour24: 12, labelAr: "12:00 ظهراً", labelEn: "12:00 PM" },
    { hour24: 12.5, labelAr: "12:30 بعد الظهر", labelEn: "12:30 PM" },
    { hour24: 13, labelAr: "01:00 بعد الظهر", labelEn: "01:00 PM" },
    { hour24: 13.5, labelAr: "01:30 بعد الظهر", labelEn: "01:30 PM" },
    { hour24: 14, labelAr: "02:00 بعد الظهر", labelEn: "02:00 PM" },
    { hour24: 14.5, labelAr: "02:30 بعد الظهر", labelEn: "02:30 PM" },
    { hour24: 15, labelAr: "03:00 عصراً", labelEn: "03:00 PM" },
    { hour24: 15.5, labelAr: "03:30 عصراً", labelEn: "03:30 PM" },
    { hour24: 16, labelAr: "04:00 عصراً (موعد الإغلاق)", labelEn: "04:00 PM (Closing)" },
  ];

  // Arrival slots: strictly before 4:00 PM (8:00 AM to 3:30 PM)
  const arrivalSlots = allSlots.filter((s) => s.hour24 < 16);

  // Departure slots: strictly after the selected arrival time up to 4:00 PM
  const departureSlots = allSlots.filter((s) => s.hour24 > startHour);

  const handleStartChange = (newStart: number) => {
    setStartHour(newStart);
    if (newStart >= endHour) {
      const nextEnd = Math.min(16, newStart + 2 > 16 ? 16 : newStart + 1);
      setEndHour(nextEnd);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      const today = new Date().toISOString().split("T")[0];
      setTodayStr(today);
      setVisDate(today);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const currentToday = new Date().toISOString().split("T")[0];
    if (visDate < currentToday) {
      setSubmitError(
        isRTL
          ? "لا يمكن تقديم طلب زيارة بتاريخ سابق، يرجى اختيار تاريخ اليوم أو تاريخ قادم."
          : "Visit date cannot be in the past."
      );
      return;
    }

    if (
      !visName.trim() ||
      !visPhone.trim() ||
      !visEmail.trim() ||
      !visDate ||
      !visReason.trim()
    ) {
      return;
    }

    if (endHour <= startHour) {
      setSubmitError(
        isRTL
          ? "يجب أن يكون وقت المغادرة بعد وقت الحضور."
          : "Departure time must be after arrival time."
      );
      return;
    }

    const startSlot = allSlots.find((s) => s.hour24 === startHour);
    const endSlot = allSlots.find((s) => s.hour24 === endHour);
    const duration = Math.max(0.5, endHour - startHour);
    const formattedVisitTime = isRTL
      ? `من ${startSlot?.labelAr} إلى ${endSlot?.labelAr}`
      : `From ${startSlot?.labelEn} to ${endSlot?.labelEn}`;

    setSubmitting(true);
    try {
      await submitVisitorRequestApi({
        name: visName.trim(),
        phone: visPhone.trim(),
        email: visEmail.trim(),
        visitDate: visDate,
        durationHours: Math.round(duration),
        visitTime: formattedVisitTime,
        purpose: visReason.trim(),
      });
      setVisSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setSubmitError(msg || (isRTL ? "تعذر تقديم طلب الزيارة. حاول مجدداً." : "Failed to submit request."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {visSubmitted ? (
        /* Success Message as specified: "تم استلام طلبك" */
        <div className="text-center py-10 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-brand-navy">
            {bp?.visitorReceivedTitle || (isRTL ? "تم استلام طلب الزيارة" : "Visitor Request Received")}
          </h3>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {isRTL
              ? "شكراً لتواصلك. ستقوم إدارة المركز بمراجعة طلب الزيارة والتأكد من توفر مقعد متاح في الموعد المحدد، وسيصلك إشعار بالنتيجة عبر الواتساب أو الإيميل."
              : "Thank you. The management will review desk availability and notify you with the confirmation."}
          </p>
          <div className="pt-4">
            <button
              type="button"
              onClick={() => setVisSubmitted(false)}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              {bp?.submitAnotherVisitor || (isRTL ? "تقديم طلب زيارة آخر" : "Submit Another Pass")}
            </button>
          </div>
        </div>
      ) : (
        /* Visitor Form: All fields are mandatory */
        <form onSubmit={handleVisitorSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="visitor-fullname" className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? "الاسم الكامل" : "Full Name"} *
              </label>
              <input
                id="visitor-fullname"
                type="text"
                value={visName}
                onChange={(e) => setVisName(e.target.value)}
                placeholder={isRTL ? "اسم الزائر..." : "Full Name..."}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="visitor-phone" className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"} *
              </label>
              <input
                id="visitor-phone"
                type="tel"
                value={visPhone}
                onChange={(e) => setVisPhone(e.target.value)}
                placeholder="059xxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all dir-ltr text-start"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email (Required) */}
            <div>
              <label htmlFor="visitor-email" className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? "البريد الإلكتروني" : "Email"} *
              </label>
              <input
                id="visitor-email"
                type="email"
                value={visEmail}
                onChange={(e) => setVisEmail(e.target.value)}
                placeholder="visitor@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
            </div>

            {/* Visit Date */}
            <div>
              <label htmlFor="visitor-date" className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? "تاريخ الزيارة (اليوم أو بعده)" : "Visit Date"} *
              </label>
              <input
                id="visitor-date"
                type="date"
                value={visDate}
                min={todayStr || undefined}
                onChange={(e) => setVisDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Visit Hours Range: Arrival and Departure (8am to 4pm) */}
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isRTL ? "وقت الزيارة (الحضور والمغادرة • من 08:00 ص إلى 04:00 م)" : "Visit Hours (Arrival & Departure • 08:00 AM to 04:00 PM)"}</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md font-mono">
                {isRTL
                  ? `المدة: ${endHour - startHour} ${endHour - startHour === 1 ? "ساعة" : endHour - startHour === 2 ? "ساعتان" : "ساعات"}`
                  : `Duration: ${endHour - startHour} hrs`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Arrival Time */}
              <div>
                <label htmlFor="visitor-arrival" className="block text-xs font-semibold text-slate-600 mb-1">
                  {isRTL ? "وقت الحضور المتوقع" : "Arrival Time"} *
                </label>
                <select
                  id="visitor-arrival"
                  value={startHour}
                  onChange={(e) => handleStartChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white"
                  required
                >
                  {arrivalSlots.map((slot) => (
                    <option key={slot.hour24} value={slot.hour24}>
                      {isRTL ? slot.labelAr : slot.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Departure Time */}
              <div>
                <label htmlFor="visitor-departure" className="block text-xs font-semibold text-slate-600 mb-1">
                  {isRTL ? "وقت المغادرة المتوقع" : "Departure Time"} *
                </label>
                <select
                  id="visitor-departure"
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white"
                  required
                >
                  {departureSlots.map((slot) => (
                    <option key={slot.hour24} value={slot.hour24}>
                      {isRTL ? slot.labelAr : slot.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reason for Visit */}
          <div>
            <label htmlFor="visitor-reason" className="block text-xs font-semibold text-slate-600 mb-1">
              {isRTL ? "سبب الزيارة" : "Reason for Visit"} *
            </label>
            <textarea
              id="visitor-reason"
              rows={2}
              value={visReason}
              onChange={(e) => setVisReason(e.target.value)}
              placeholder={
                isRTL
                  ? "مثال: تقديم امتحان إلكتروني، اجتماع عمل عن بعد، شحن بطارية حاسوب..."
                  : "e.g., Online university exam, remote interview, urgent charging..."
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit Visitor Pass */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white bg-brand-navy hover:bg-brand-navy-hover shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            ) : (
              <Compass className="w-5 h-5 text-emerald-400" />
            )}
            <span>
              {submitting
                ? (isRTL ? "جاري الإرسال..." : "Submitting...")
                : bp?.submitVisitorBtn || (isRTL ? "إرسال طلب الزيارة" : "Submit Visitor Pass Request")}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}
