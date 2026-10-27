"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { X, AlertCircle, MessageSquare, Send, Check } from "lucide-react";
import { VisitorRequest } from "./types";

interface RejectReasonModalProps {
  isOpen: boolean;
  request: VisitorRequest | null;
  onClose: () => void;
  onConfirm: (
    requestId: string,
    reason: string,
    notes: string,
    sendMessage: boolean
  ) => void;
}

export default function RejectReasonModal({
  isOpen,
  request,
  onClose,
  onConfirm,
}: RejectReasonModalProps) {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const r = t.admin?.visitorRequests?.rejectModal;

  const reasons = [
    r?.standardReasonDefault ||
      (isRTL
        ? "عدم توفر مقاعد شاغرة في التوقيت والمدة المطلوبة"
        : "No available seats during requested time slot"),
    isRTL
      ? "الوثيقة الرسمية أو إثبات الهوية غير واضحة أو غير مكتملة"
      : "Official document or identity proof is unclear or incomplete",
    isRTL
      ? "الغرض والتبرير المقدم لا يتوافق مع سياسات واستخدام المساحة"
      : "The purpose provided does not meet space policy requirements",
    isRTL
      ? "طلب مكرر لنفس اليوم أو تجاوز الحصة المسموح بها"
      : "Duplicate request for same day or exceeded allowance",
    isRTL ? "أخرى (يرجى مراجعة الملاحظات المرفقة)" : "Other (please review attached notes)",
  ];

  const [selectedReason, setSelectedReason] = useState(reasons[0]);
  const [notes, setNotes] = useState("");
  const [sendMessage, setSendMessage] = useState<boolean>(true);

  if (!isOpen || !request) return null;

  const handleAction = (withMessage: boolean) => {
    onConfirm(request.id, selectedReason, notes, withMessage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir={dir}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center text-xs font-black">
              ✕
            </div>
            <h3 className="text-base sm:text-lg font-bold text-red-700">
              {r?.title || (isRTL ? "تحديد سبب رفض الطلب" : "Specify Request Rejection Reason")}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Target Info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">{isRTL ? "مقدم الطلب:" : "Applicant:"}</span>{" "}
              <span className="font-bold text-slate-800">{request.name}</span>
            </div>
            <div>
              <span className="text-slate-500">{isRTL ? "الهاتف:" : "Phone:"}</span>{" "}
              <span className="font-semibold text-slate-700 font-mono">{request.phone}</span>
            </div>
          </div>

          {/* Standard Reason Select */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {r?.standardReasonLabel || (isRTL ? "التبرير المعياري لرفض الطلب" : "Rejection Reason")}
            </label>
            <div className="relative">
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium appearance-none cursor-pointer"
              >
                {reasons.map((reason, index) => (
                  <option key={index} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <div
                className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 ${
                  isRTL ? "left-4" : "right-4"
                }`}
              >
                <AlertCircle className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Guidance Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {r?.notesLabel || (isRTL ? "ملاحظات إضافية للمتقدم (اختياري)" : "Additional Notes")}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                r?.notesPlaceholder ||
                (isRTL
                  ? "وضح السبب أو أي توجيه للمتقدم..."
                  : "Clarify reason or guidance for applicant...")
              }
              className="w-full bg-[#f8fafc] border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-y placeholder:text-slate-400"
            />
          </div>

          {/* Notification Options Toggle Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {isRTL ? "طريقة الرفض:" : "Rejection Method:"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSendMessage(true)}
                className={`p-3 rounded-xl border text-start font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                  sendMessage
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs ring-1 ring-emerald-500"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] ${
                    sendMessage
                      ? "border-emerald-600 bg-emerald-600 text-white font-black"
                      : "border-slate-300"
                  }`}
                >
                  {sendMessage && "✓"}
                </span>
                <div className="flex flex-col">
                  <span>{isRTL ? "رفض مع إرسال رسالة" : "Reject & Send Message"}</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    {isRTL ? "إرسال نص الاعتذار عبر واتساب/SMS" : "Notify applicant"}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSendMessage(false)}
                className={`p-3 rounded-xl border text-start font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                  !sendMessage
                    ? "border-rose-500 bg-rose-50 text-rose-900 shadow-2xs ring-1 ring-rose-500"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] ${
                    !sendMessage
                      ? "border-rose-600 bg-rose-600 text-white font-black"
                      : "border-slate-300"
                  }`}
                >
                  {!sendMessage && "✓"}
                </span>
                <div className="flex flex-col">
                  <span>{isRTL ? "رفض بدون إرسال رسالة" : "Reject Without Message"}</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    {isRTL ? "تحديث الحالة بالنظام فقط" : "Update status silently"}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-100">
            {sendMessage ? (
              <button
                type="button"
                onClick={() => handleAction(true)}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold active:scale-98 transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isRTL ? "تأكيد الرفض وإرسال الرسالة" : "Reject & Send Notification"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAction(false)}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c5221f] hover:bg-[#b01c19] text-white text-xs sm:text-sm font-bold active:scale-98 transition-all shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>{isRTL ? "تأكيد الرفض بدون إرسال رسالة" : "Confirm Silent Rejection"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-500 text-xs sm:text-sm font-semibold hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {r?.cancelBtn || (isRTL ? "إلغاء" : "Cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
