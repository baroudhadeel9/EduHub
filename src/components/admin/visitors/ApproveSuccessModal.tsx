"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Check, X, MessageSquare, Send } from "lucide-react";
import { VisitorRequest } from "./types";

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

  if (!isOpen || !request) return null;

  const titleText = isRTL
    ? `تم قبول طلب زيارة ${request.name} بنجاح`
    : `Visit approved for ${request.name}`;

  const descText = isRTL
    ? `تم اعتماد تصريح الزيارة رسمياً ليوم ${request.visitDate}. يمكنك الآن إرسال رسالة التأكيد المباشرة للزائر عبر واتساب أو متابعة القائمة.`
    : `Visit pass officially approved for ${request.visitDate}. You can dispatch the confirmation message via WhatsApp or proceed.`;

  const handleSendWhatsApp = () => {
    if (!request.phone) return;
    const cleanPhone = request.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("05")
      ? "970" + cleanPhone.slice(1)
      : cleanPhone.startsWith("5")
      ? "970" + cleanPhone
      : cleanPhone;

    const msg = `مرحباً ${request.name}،\nيسعدنا إعلامك بأنه تم قبول طلب تصريح الزيارة الخاص بك لمساحة العمل المشترك (EduHub) بنجاح!\n📅 موعد الزيارة: ${request.visitDate}\n⏰ المدة: ${request.durationLabel || "حسب الحجز"}\nنتشرف باستقبالك!`;
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir={dir}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-center overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Checkmark Circle */}
        <div className="mx-auto mb-5 w-16 h-16 rounded-full border-[3px] border-[#0f766e] flex items-center justify-center text-[#0f766e] bg-emerald-50/50 shadow-inner">
          <Check className="w-9 h-9 stroke-[3]" />
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2 tracking-tight">
          {titleText}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto mb-6">
          {descText}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {request.phone && (
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-900/10 cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{isRTL ? "إرسال رسالة القبول عبر واتساب (WhatsApp)" : "Send WhatsApp Confirmation"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            {isRTL ? "متابعة السجل" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
