"use client";

import React from "react";
import { AlertCircle, Clock } from "lucide-react";
import { MemberRecord } from "@/components/admin/members/data";

interface MemberProfileDuesTabProps {
  member: MemberRecord;
  percentage: number;
  isRTL: boolean;
  onOpenAdjustHours?: () => void;
}

export default function MemberProfileDuesTab({
  member,
  percentage,
  isRTL,
  onOpenAdjustHours,
}: MemberProfileDuesTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-[#0c2340]">
            {isRTL ? "تفاصيل الحصة الشهرية والاستهلاك" : "Monthly Quota & Usage Details"}
          </h3>
          {onOpenAdjustHours && (
            <button
              type="button"
              onClick={onOpenAdjustHours}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isRTL ? "تعديل رصيد الساعات" : "Adjust Hours"}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold">
              {isRTL ? "الحصة المخصصة شهرياً" : "Monthly Limit"}
            </span>
            <div className="text-2xl font-black text-[#0c2340] mt-1">
              {member.hoursLimit} {isRTL ? "ساعة" : "hours"}
            </div>
            <span className="text-[11px] text-slate-400">
              {member.type === "freelancer" ? "35 ساعة للمستقلين" : "25 ساعة للطلاب"}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold">
              {isRTL ? "الساعات المستهلكة" : "Hours Used"}
            </span>
            <div className="text-2xl font-black text-[#0c2340] mt-1">
              {member.hoursUsed} {isRTL ? "ساعة" : "hours"}
            </div>
            <span className="text-[11px] text-slate-400">
              {percentage}% من الحصة الإجمالية
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold">
              {isRTL ? "الساعات الإضافية" : "Extra Hours"}
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {member.extraHours} {isRTL ? "ساعة" : "hours"}
            </div>
            <span className="text-[11px] text-slate-400">
              {member.dueAmount} ₪ مستحق مالي
            </span>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {isRTL
              ? "وفق لائحة تشغيل إديو هب غزة، تُمنح الساعات الأساسية مجاناً بالكامل. في حال تجاوز العضو للحصة المعتمدة ورغب بساعات إضافية لدواعي تسليم مشاريع عاجلة، يتم فرض رسم رمزي قدره 2 شيكل لكل ساعة لدعم تكاليف السولار وصيانة المنظومة."
              : "Core hours are 100% free. Any extra hours requested beyond monthly allocation for critical project delivery cost 2 NIS / hour to offset generator fuel."}
          </span>
        </div>
      </div>
    </div>
  );
}
