"use client";

import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { ApplicationSuccessViewProps } from "./types";

export default function ApplicationSuccessView({
  fullName,
  phone,
  email,
  category,
  gender,
  governorate,
  submittedAppNumber,
  onReset,
  isRTL,
}: ApplicationSuccessViewProps) {
  return (
    <div className="text-center py-10 space-y-6 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {isRTL ? "تم استلام طلب عضويتك بنجاح!" : "Membership Application Received!"}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {isRTL
            ? `شكراً لك يا ${fullName.split(" ")[0] || "عضو أديو هب"}. تم توثيق طلبك رسمياً لدى إدارة المركز، وستصلك رسالة نصية SMS على هاتفك (${phone}) وبريد إلكتروني فور مراجعة المستندات واعتماد حصتك الشهرية.`
            : `Thank you, ${fullName.split(" ")[0]}. Your application is being reviewed by the EduHub committee. You will receive an SMS and email notification upon approval.`}
        </p>
      </div>

      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 text-start space-y-1.5 font-medium">
        <div className="font-bold flex items-center justify-between text-emerald-800">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isRTL ? "بيانات الطلب المسجلة:" : "Application Summary:"}</span>
          </div>
          {submittedAppNumber && (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
              {submittedAppNumber}
            </span>
          )}
        </div>
        <div>• {isRTL ? `الفئة: ${category}` : `Category: ${category}`}</div>
        <div>• {isRTL ? `الجنس: ${gender === "female" ? "أنثى" : "ذكر"}` : `Gender: ${gender === "female" ? "Female" : "Male"}`}</div>
        <div>• {isRTL ? `الهاتف: ${phone} | البريد: ${email}` : `Phone: ${phone} | Email: ${email}`}</div>
        <div>• {isRTL ? `المحافظة: ${governorate}` : `Governorate: ${governorate}`}</div>
        <div>• {isRTL ? `حالة الطلب: قيد التدقيق الإداري (Pending Review)` : `Status: Pending Review`}</div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onReset}
          className="px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
        >
          {isRTL ? "العودة لبوابة الحجز" : "Return to Hub"}
        </button>
      </div>
    </div>
  );
}

