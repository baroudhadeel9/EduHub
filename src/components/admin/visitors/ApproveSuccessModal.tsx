"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Check, X, Mail, MessageSquare, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { VisitorRequest } from "./types";
import { sendVisitorPassEmailApi } from "@/services/applications";

interface ApproveSuccessModalProps {
  isOpen: boolean;
  request: VisitorRequest | null;
  onClose: () => void;
}

export default function ApproveSuccessModal({
  isOpen,
  request,
  onClose,
}: ApproveSuccessModalProps) {
  const { locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [whatsAppOpened, setWhatsAppOpened] = useState(false);
  const lastSentIdRef = useRef<number | string | null>(null);

  const hasPhone = Boolean(request?.phone && request.phone.trim());
  const hasEmail = Boolean(request?.email && request.email.trim() && request.email.includes("@"));

  // ── Auto-send email immediately upon approval ("خليها تصل عالايميل وخلص") ──
  useEffect(() => {
    if (!isOpen || !request || !hasEmail) return;
    if (lastSentIdRef.current === request.id) return; // Prevent duplicate send on re-render

    let isMounted = true;
    lastSentIdRef.current = request.id;
    setSendingEmail(true);
    setEmailError(null);
    setEmailSent(false);

    sendVisitorPassEmailApi(request.id)
      .then(() => {
        if (isMounted) {
          setEmailSent(true);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : (isRTL ? "تعذر إرسال البريد الإلكتروني" : "Failed to send email");
          setEmailError(msg);
        }
      })
      .finally(() => {
        if (isMounted) {
          setSendingEmail(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, request, hasEmail, isRTL]);

  if (!isOpen || !request) return null;

  const cleanPhone = request.phone ? request.phone.replace(/[^0-9]/g, "") : "";
  const formattedPhone = cleanPhone.startsWith("05")
    ? "970" + cleanPhone.slice(1)
    : cleanPhone.startsWith("5")
    ? "970" + cleanPhone
    : cleanPhone;

  const seatInfo = request.seatLabel || (request.seatNumber ? `مقعد ${request.seatNumber}` : "");
  const roomInfo = request.roomName ? ` (${request.roomName})` : "";
  const seatText = seatInfo ? `${seatInfo}${roomInfo}` : (isRTL ? "مقعد مخصص في مساحة العمل" : "Assigned Desk");

  const whatsAppMessage = `مرحباً ${request.name}،\nيسعدنا إعلامك بأنه تم قبول طلب تصريح الزيارة الخاص بك لمساحة العمل المشترك (EduHub) بنجاح! ✓\n\n📌 رقم التصريح: #VIS-${String(request.id).padStart(4, "0")}\n📅 موعد الزيارة: ${request.visitDate}\n⏰ الفترة المحددة: ${request.visitTime || request.durationLabel || "حسب الحجز"}\n💺 المقعد المخصص لك: ${seatText}\n\nنتشرف باستقبالك في أي وقت ضمن ساعات الدوام الرسمي.`;

  const handleSendWhatsApp = () => {
    if (!formattedPhone) return;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsAppMessage)}`;
    window.open(waUrl, "_blank");
    setWhatsAppOpened(true);
  };

  const handleRetryEmail = async () => {
    if (!hasEmail) return;
    setSendingEmail(true);
    setEmailError(null);
    try {
      await sendVisitorPassEmailApi(request.id);
      setEmailSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isRTL ? "تعذر إرسال البريد الإلكتروني" : "Failed to send email");
      setEmailError(msg);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    setEmailError(null);
    setWhatsAppOpened(false);
    lastSentIdRef.current = null;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir={dir}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-center overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Checkmark Circle */}
        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl border-2 border-emerald-500/20 flex items-center justify-center text-emerald-600 bg-emerald-50 shadow-inner">
          <Check className="w-9 h-9 stroke-[3]" />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1.5 tracking-tight">
          {isRTL
            ? `تم اعتماد الزيارة لـ ${request.name}`
            : `Visit Approved for ${request.name}`}
        </h3>

        {/* Subtitle description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-5 font-normal">
          {isRTL
            ? `تم تفعيل تصريح الدخول رسمياً ليوم (${request.visitDate}) بنجاح.`
            : `Entry pass officially activated for (${request.visitDate}).`}
        </p>

        {/* Summary Card of Applicant */}
        <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">{isRTL ? "الهاتف:" : "Phone:"}</span>
            <span className="font-bold text-slate-800 font-mono" dir="ltr">
              {request.phone || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">{isRTL ? "المقعد المخصص:" : "Assigned Seat:"}</span>
            <span className="font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-lg border border-emerald-300">
              {seatText}
            </span>
          </div>
        </div>

        {/* ── Automatic Email Status Block ── */}
        {hasEmail ? (
          <div className="mb-6">
            {sendingEmail && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 shrink-0" />
                <span>
                  {isRTL
                    ? `جاري إرسال تصريح الزيارة وكلمة المرور إلى (${request.email})...`
                    : `Sending official pass and passcode to (${request.email})...`}
                </span>
              </div>
            )}

            {emailSent && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-start">
                  <div>
                    {isRTL
                      ? "تم إرسال تصريح الزيارة وكلمة المرور إلى البريد الإلكتروني بنجاح ✓"
                      : "Official pass and passcode sent to email successfully ✓"}
                  </div>
                  <div className="text-xs font-normal text-emerald-700 font-mono mt-0.5" dir="ltr">
                    {request.email}
                  </div>
                </div>
              </div>
            )}

            {emailError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{emailError}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRetryEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isRTL ? "إعادة المحاولة" : "Retry"}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Visitor has NO email provided -> offer WhatsApp as a fallback */
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm text-start space-y-2">
            <div className="font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{isRTL ? "الزائر لم يُدخل بريداً إلكترونياً" : "No email address provided"}</span>
            </div>
            <p className="text-xs text-amber-700">
              {isRTL
                ? "يمكنك إرسال تفاصيل التصريح للزائر عبر محادثة واتساب المباشرة:"
                : "You can send the pass details via direct WhatsApp chat:"}
            </p>
            {hasPhone && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{whatsAppOpened ? (isRTL ? "تم فتح المحادثة ✓" : "Chat opened ✓") : (isRTL ? "إرسال عبر واتساب" : "Send via WhatsApp")}</span>
              </button>
            )}
          </div>
        )}

        {/* ── Single Action Button: Close & Continue ── */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          {isRTL ? "إغلاق ومتابعة" : "Close & Continue"}
        </button>
      </div>
    </div>
  );
}
