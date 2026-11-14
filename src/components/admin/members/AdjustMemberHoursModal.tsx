"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  Clock,
  Plus,
  Minus,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  updateMemberQuotaApi,
  UpdateMemberQuotaResponse,
} from "@/services/applications";

export interface AdjustMemberHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedData?: UpdateMemberQuotaResponse["data"]) => void;
  memberId: string | number;
  memberName: string;
  memberType?: "student" | "freelancer";
  currentLimit: number;
  currentUsed: number;
  isRTL: boolean;
}

export default function AdjustMemberHoursModal({
  isOpen,
  onClose,
  onSuccess,
  memberId,
  memberName,
  memberType = "student",
  currentLimit,
  currentUsed,
  isRTL,
}: AdjustMemberHoursModalProps) {
  const { locale, dir } = useLanguage();

  // Tab mode:
  // "allowance": Case 1 - Add extra hours to monthly quota allowance (e.g. 25 + 5 = 30)
  // "used": Case 2 - Adjust consumed hours directly (e.g. change 20 to 17)
  // "direct": Comprehensive mode - set both allowance & used directly
  const [tab, setTab] = useState<"allowance" | "used" | "direct">("allowance");

  // Tab 1: Allowance additions
  const [allowanceToAdd, setAllowanceToAdd] = useState<string>("5");

  // Tab 2: Used hours adjustment (initialized with current used)
  const [targetUsed, setTargetUsed] = useState<string>(String(currentUsed));

  // Tab 3: Direct inputs
  const [directLimit, setDirectLimit] = useState<string>(String(currentLimit));
  const [directUsed, setDirectUsed] = useState<string>(String(currentUsed));

  // Reason / Notes
  const [notes, setNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab("allowance");
      setAllowanceToAdd("5");
      setTargetUsed(String(currentUsed));
      setDirectLimit(String(currentLimit));
      setDirectUsed(String(currentUsed));
      setNotes("");
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, currentLimit, currentUsed]);

  if (!isOpen) return null;

  // Live preview calculations
  let previewLimit = currentLimit;
  let previewUsed = currentUsed;

  if (tab === "allowance") {
    const addVal = parseFloat(allowanceToAdd) || 0;
    previewLimit = Math.max(0, currentLimit + addVal);
    previewUsed = currentUsed;
  } else if (tab === "used") {
    previewLimit = currentLimit;
    previewUsed = Math.max(0, parseFloat(targetUsed) || 0);
  } else {
    previewLimit = Math.max(0, parseInt(directLimit, 10) || 0);
    previewUsed = Math.max(0, parseFloat(directUsed) || 0);
  }

  const previewRemaining = Math.max(0, Math.round((previewLimit - previewUsed) * 100) / 100);
  const previewExtra = previewUsed > previewLimit ? Math.round((previewUsed - previewLimit) * 100) / 100 : 0;
  const previewExtraDue = Math.round(previewExtra * 2 * 100) / 100;

  const handleSave = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (submitting) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    let payload: Parameters<typeof updateMemberQuotaApi>[1];

    if (tab === "allowance") {
      const hoursVal = parseFloat(allowanceToAdd);
      if (isNaN(hoursVal) || hoursVal <= 0) {
        setErrorMsg(
          isRTL
            ? "يرجى إدخال عدد ساعات إضافية صالح أكبر من الصفر."
            : "Please enter a valid number of hours greater than 0."
        );
        return;
      }
      payload = {
        action: "add_allowance",
        hours: hoursVal,
        notes: notes.trim() || undefined,
      };
    } else if (tab === "used") {
      const usedVal = parseFloat(targetUsed);
      if (isNaN(usedVal) || usedVal < 0) {
        setErrorMsg(
          isRTL
            ? "يرجى إدخال ساعات مستهلكة صالحة (0 أو أكثر)."
            : "Please enter a valid number of consumed hours (0 or more)."
        );
        return;
      }
      payload = {
        action: "set_values",
        used_hours: usedVal,
        notes: notes.trim() || undefined,
      };
    } else {
      const limVal = parseInt(directLimit, 10);
      const usdVal = parseFloat(directUsed);
      if (isNaN(limVal) || limVal < 0 || isNaN(usdVal) || usdVal < 0) {
        setErrorMsg(
          isRTL
            ? "يرجى إدخال قيم صالحة لكل من الحصة والمستهلك."
            : "Please enter valid values for both allowance and consumed hours."
        );
        return;
      }
      payload = {
        action: "set_values",
        allocated_hours: limVal,
        used_hours: usdVal,
        notes: notes.trim() || undefined,
      };
    }

    setSubmitting(true);

    try {
      const res = await updateMemberQuotaApi(memberId, payload);
      setSuccessMsg(
        res.message ||
          (isRTL
            ? "تم حفظ التعديل وتحديث رصيد الساعات بنجاح!"
            : "Hours quota updated successfully!")
      );

      setTimeout(() => {
        onSuccess(res.data);
        onClose();
      }, 650);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isRTL
          ? "فشل حفظ التعديل."
          : "Failed to save changes";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200 my-8"
        dir={isRTL ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50/90 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-brand-navy">
                {isRTL ? "تعديل رصيد ساعات العضو" : "Adjust Member Hours Quota"}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                {memberName} (
                {memberType === "freelancer"
                  ? isRTL
                    ? "مستقل"
                    : "Freelancer"
                  : isRTL
                  ? "طالب"
                  : "Student"}
                )
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-bold">
            {/* Tab 1: Add to Allowance */}
            <button
              type="button"
              onClick={() => {
                setTab("allowance");
                setErrorMsg(null);
              }}
              className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer text-center ${
                tab === "allowance"
                  ? "bg-white text-emerald-800 shadow-xs border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{isRTL ? "زيادة الحصة (+)" : "Add Allowance"}</span>
            </button>

            {/* Tab 2: Adjust Consumed */}
            <button
              type="button"
              onClick={() => {
                setTab("used");
                setTargetUsed(String(currentUsed));
                setErrorMsg(null);
              }}
              className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer text-center ${
                tab === "used"
                  ? "bg-white text-teal-800 shadow-xs border border-teal-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Minus className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{isRTL ? "تعديل المستهلك" : "Adjust Used"}</span>
            </button>

            {/* Tab 3: Direct Set */}
            <button
              type="button"
              onClick={() => {
                setTab("direct");
                setErrorMsg(null);
              }}
              className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer text-center ${
                tab === "direct"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{isRTL ? "تعديل مباشر" : "Direct Values"}</span>
            </button>
          </div>

          {/* ═══════════ Tab 1: Add to Allowance (+ bonus hours) ═══════════ */}
          {tab === "allowance" && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                {isRTL
                  ? "عدد الساعات المراد إضافتها لحصة العضو الشهرية (ساعة) *"
                  : "Bonus Allowance Hours to Add *"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="200"
                  autoFocus
                  value={allowanceToAdd}
                  onChange={(e) => setAllowanceToAdd(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                  {isRTL ? "ساعة" : "hrs"}
                </span>
              </div>

              {/* Quick shortcut pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[1, 2, 3, 5, 10, 15, 20].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAllowanceToAdd(String(val))}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors cursor-pointer"
                  >
                    +{val}س
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ Tab 2: Adjust Consumed (e.g. from 20 to 17) ═══════════ */}
          {tab === "used" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  {isRTL
                    ? "الساعات المستهلكة الجديدة (ساعة) *"
                    : "New Consumed Hours (hrs) *"}
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  {isRTL ? `المستهلك الحالي: ${currentUsed} س` : `Current: ${currentUsed} hrs`}
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="500"
                  autoFocus
                  value={targetUsed}
                  onChange={(e) => setTargetUsed(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={String(currentUsed)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base font-black text-slate-900 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-mono"
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                  {isRTL ? "ساعة مستهلكة" : "hrs used"}
                </span>
              </div>

              {/* Helpful deduction & zeroing shortcuts */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[1, 2, 3, 5].map((deductVal) => {
                  const calculated = Math.max(0, Math.round((currentUsed - deductVal) * 10) / 10);
                  return (
                    <button
                      key={deductVal}
                      type="button"
                      onClick={() => setTargetUsed(String(calculated))}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 transition-colors cursor-pointer"
                      title={
                        isRTL
                          ? `إنقاص ${deductVal} س لتصبح ${calculated} س`
                          : `Deduct ${deductVal}h to make it ${calculated}h`
                      }
                    >
                      -{deductVal}س ({calculated}س)
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setTargetUsed("0")}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 transition-colors cursor-pointer"
                >
                  {isRTL ? "تصفير (0 س)" : "Zero (0h)"}
                </button>

                <button
                  type="button"
                  onClick={() => setTargetUsed(String(currentUsed))}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={isRTL ? "استعادة القيمة الأصلية" : "Reset to original"}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ═══════════ Tab 3: Direct Set exact values ═══════════ */}
          {tab === "direct" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isRTL ? "الحصة المعتمدة (ساعة) *" : "Total Allowance *"}
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={directLimit}
                  onChange={(e) => setDirectLimit(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {memberType === "freelancer" ? "الافتراضي 35 س" : "الافتراضي 25 س"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isRTL ? "المستهلك الفعلي (ساعة) *" : "Current Used *"}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="500"
                  value={directUsed}
                  onChange={(e) => setDirectUsed(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {isRTL ? "اكتب الرقم مباشرة مثلاً 17" : "Exact consumed hours"}
                </span>
              </div>
            </div>
          )}

          {/* ═══════════ Live Before & After Preview Card ═══════════ */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-700 block">
              {isRTL ? "معاينة الرصيد (قبل التعديل وبعده):" : "Quota Balance Preview:"}
            </span>

            {/* Quota limit comparison */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 text-[11px]">
                {isRTL ? "الحصة المعتمدة:" : "Monthly Allowance:"}
              </span>
              <div className="flex items-center gap-2 font-mono font-bold text-xs">
                <span className="text-slate-600">{currentLimit} س</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180 shrink-0" />
                <span className="text-emerald-700 text-sm">{previewLimit} س</span>
              </div>
            </div>

            {/* Used comparison */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 text-[11px]">
                {isRTL ? "الساعات المستهلكة:" : "Consumed Hours:"}
              </span>
              <div className="flex items-center gap-2 font-mono font-bold text-xs">
                <span className="text-slate-600">{currentUsed} س</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180 shrink-0" />
                <span className="text-teal-700 text-sm">{previewUsed} س</span>
              </div>
            </div>

            {/* Remaining */}
            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold">
                {isRTL ? "الرصيد المتبقي المتاح:" : "Available Remaining:"}
              </span>
              <span className="font-mono font-black text-slate-900 text-sm">
                {previewRemaining} {isRTL ? "ساعة" : "hrs"}
              </span>
            </div>

            {/* Overdue alert if any */}
            {previewExtra > 0 && (
              <div className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 flex items-center justify-between">
                <span>{isRTL ? "ساعات متجاوزة مستحقة:" : "Overdue Extra Hours:"}</span>
                <span className="font-mono">+{previewExtra} س ({previewExtraDue.toFixed(1)} ₪)</span>
              </div>
            )}
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRTL ? "سبب تعديل الرصيد (اختياري):" : "Reason / Notes (Optional):"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isRTL
                  ? "مثال: تعويض انقطاع كهرباء، زيادة ساعات لإنجاز مشروع تخرج..."
                  : "e.g. Outage compensation, project bonus..."
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جاري الحفظ..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>{isRTL ? "حفظ التعديل" : "Save Changes"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
