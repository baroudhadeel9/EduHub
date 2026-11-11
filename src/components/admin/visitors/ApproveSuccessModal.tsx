"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Check, X, Send, Mail, MessageSquare, Loader2, CheckCircle2, Sparkles } from "lucide-react";
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

  if (!isOpen || !request) return null;

  const hasPhone = Boolean(request.phone && request.phone.trim());
  const hasEmail = Boolean(request.email && request.email.trim() && request.email.includes("@"));

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

  const handleSendEmail = async () => {
    if (!hasEmail) return;
    setSendingEmail(true);
    setEmailError(null);
    try {
      await sendVisitorPassEmailApi(request.id);
      setEmailSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "تعذر إرسال البريد الإلكتروني";
      setEmailError(msg);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendBoth = async () => {
    handleSendWhatsApp();
    if (hasEmail && !emailSent) {
      await handleSendEmail();
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    setEmailError(null);
    setWhatsAppOpened(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir={dir}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 text-center overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
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
        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1.5 tracking-tight">
          {isRTL
            ? `تم اعتماد طلب زيارة ${request.name} بنجاح`
            : `Visit Approved for ${request.name}`}
        </h3>

        {/* Subtitle description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-5 font-normal">
          {isRTL
            ? `تم تفعيل التصريح رسميـاً ليوم (${request.visitDate}). حدد طريقة إشعار الزائر بتأكيد الحجز:`
            : `Pass officially approved for (${request.visitDate}). Choose how to notify the visitor:`}
        </p>

        {/* Summary Card of Applicant */}
        <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">{isRTL ? "الهاتف:" : "Phone:"}</span>
            <span className="font-bold text-slate-800 font-mono" dir="ltr">
              {request.phone || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">{isRTL ? "المقعد المحجوز:" : "Assigned Seat:"}</span>
            <span className="font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300">
              {seatText}
            </span>
          </div>
        </div>

        {/* Dynamic Notification Status Alert */}
        {emailSent && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isRTL
                ? `تم إرسال بريد التأكيد الرسمي بنجاح إلى (${request.email}) ✓`
                : `Official confirmation email sent to (${request.email}) ✓`}
            </span>
          </div>
        )}

        {emailError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <X className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{emailError}</span>
          </div>
        )}

        {/* Notification Choice Action Buttons */}
        <div className="space-y-2.5">
          {/* Option 1: WhatsApp */}
          <button
            type="button"
            disabled={!hasPhone}
            onClick={handleSendWhatsApp}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-[0.99] cursor-pointer ${
              whatsAppOpened
                ? "bg-emerald-50 border-2 border-emerald-600 text-emerald-800"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="text-start">
                <div>{isRTL ? "إرسال عبر واتساب (WhatsApp)" : "Send via WhatsApp"}</div>
                <div className="text-[11px] font-normal opacity-90">
                  {whatsAppOpened
                    ? (isRTL ? "تم فتح المحادثة ✓ اضغط لإعادة الفتح" : "Chat opened ✓ Click to reopen")
                    : (isRTL ? "فتح محادثة واتساب برسالة تأكيد جاهزة" : "Open WhatsApp chat with prefilled message")}
                </div>
              </div>
            </div>
            <Send className="w-4 h-4 shrink-0 opacity-80" />
          </button>

          {/* Option 2: Email via Brevo API */}
          <button
            type="button"
            disabled={!hasEmail || sendingEmail || emailSent}
            onClick={handleSendEmail}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-[0.99] cursor-pointer ${
              emailSent
                ? "bg-emerald-100/70 border border-emerald-300 text-emerald-800 cursor-default"
                : "bg-[#0c2340] hover:bg-[#13325b] text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                {sendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>
              <div className="text-start">
                <div>
                  {emailSent
                    ? (isRTL ? "تم إرسال الإيميل بنجاح ✓" : "Email Sent Successfully ✓")
                    : (isRTL ? "إرسال بريد إلكتروني رسمي (Email)" : "Send Official Email Pass")}
                </div>
                <div className="text-[11px] font-normal opacity-90">
                  {hasEmail
                    ? (isRTL ? `إرسال رسالة تصريح رسمية إلى ${request.email}` : `Dispatch official pass to ${request.email}`)
                    : (isRTL ? "الزائر لم يُدخل بريداً إلكترونياً" : "No email address provided")}
                </div>
              </div>
            </div>
            <Send className="w-4 h-4 shrink-0 opacity-80" />
          </button>

          {/* Option 3: Both (WhatsApp + Email) */}
          {hasPhone && hasEmail && !emailSent && (
            <button
              type="button"
              disabled={sendingEmail}
              onClick={handleSendBoth}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isRTL ? "إرسال عبر القناتين معاً (واتساب + بريد إلكتروني)" : "Send via Both Channels (WhatsApp + Email)"}</span>
            </button>
          )}

          {/* Option 4: Close / Continue */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            {isRTL ? "متابعة السجل دون إرسال إضافي" : "Close & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
