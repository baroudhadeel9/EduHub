"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { X, Heart, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { OFFICIAL_ZEFFY_DONATION_URL } from "@/constants/links";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
}

export default function DonationModal({
  isOpen,
  onClose,
  initialAmount,
}: DonationModalProps) {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const dm = t.donationModal;

  if (!isOpen) return null;

  const handleProceed = () => {
    window.open(OFFICIAL_ZEFFY_DONATION_URL, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 text-center animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={dm?.closeBtn || (isRTL ? "إغلاق" : "Close")}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Soft Icon Badge */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-100/80">
          <Heart className="w-7 h-7 fill-emerald-500 text-emerald-600 animate-pulse" />
        </div>

        {/* Soft Title */}
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          {dm?.title || (isRTL ? "التبرع لمركز غزة التعليمي" : "Support Gaza Education Hub")}
        </h3>

        {/* Soft Reassurance Description */}
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto mb-6">
          {isRTL
            ? "سيتم تحويلك بأمان إلى استمارة التبرع الرسمية للمركز عبر منصة Zeffy (اقتطاع 0% ليصل 100% من دعمك للطلاب في غزة)."
            : "You will be securely redirected to our official 0% platform-fee donation form on Zeffy, ensuring 100% of your gift reaches students."}
        </p>

        {/* Quick Amount Suggestion Tag (if initialAmount provided) */}
        {initialAmount && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-5 border border-emerald-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isRTL ? `المبلغ المقترح: $${initialAmount}` : `Suggested Amount: $${initialAmount}`}
            </span>
          </div>
        )}

        {/* Action Button: Continue to Zeffy */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleProceed}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>{dm?.proceedBtn || (isRTL ? "المتابعة للتبرع عبر Zeffy" : "Continue to Zeffy Donation")}</span>
            <ExternalLink className="w-4 h-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {dm?.closeBtn || (isRTL ? "إلغاء والعودة للموقع" : "Cancel and Return")}
          </button>
        </div>

        {/* Trust Note */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {isRTL ? "منصة رسمية معتمدة • 0% رسوم إدارية" : "Verified Official Non-Profit • 0% Platform Fees"}
          </span>
        </div>
      </div>
    </div>
  );
}
