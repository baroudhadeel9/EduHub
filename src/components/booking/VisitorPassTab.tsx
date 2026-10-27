"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  CheckCircle2,
  Compass,
  Loader2,
  AlertCircle,
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
  const [visHours, setVisHours] = useState(2);
  const [visReason, setVisReason] = useState("");
  const [visSubmitted, setVisSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState("");

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
      !visHours ||
      !visReason.trim()
    ) {
      return;
    }

    setSubmitting(true);
    try {
      await submitVisitorRequestApi({
        name: visName.trim(),
        phone: visPhone.trim(),
        email: visEmail.trim(),
        visitDate: visDate,
        durationHours: visHours,
        visitTime: `${visHours} ساعات`,
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
              ? "شكراً لتواصلك. ستقوم إدارة المركز بمراجعة طلب الزيارة والتأكد من توفر مقعد شاغر في الموعد المحدد، وسيصلك إشعار بالنتيجة عبر الواتساب أو الإيميل."
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            {/* Expected Hours (1 to 4) */}
            <div>
              <label htmlFor="visitor-hours" className="block text-xs font-semibold text-slate-600 mb-1">
                {isRTL ? "عدد الساعات (1 إلى 4)" : "Hours (1 to 4)"} *
              </label>
              <select
                id="visitor-hours"
                value={visHours}
                onChange={(e) => setVisHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white font-mono"
                required
              >
                <option value={1}>1 {isRTL ? "ساعة" : "hour"}</option>
                <option value={2}>2 {isRTL ? "ساعتان" : "hours"}</option>
                <option value={3}>3 {isRTL ? "ساعات" : "hours"}</option>
                <option value={4}>4 {isRTL ? "ساعات" : "hours"}</option>
              </select>
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
