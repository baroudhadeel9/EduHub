"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { MemberDueItem, adjustMemberDueApi } from "@/services/applications";

export interface AdjustSuccessPayload {
  memberId: string | number;
  action: "increase" | "decrease";
  amount: number;
  newTotal: number;
  notes?: string;
}

interface AdjustDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payload?: AdjustSuccessPayload) => void;
  member: MemberDueItem | null;
  initialAction?: "increase" | "decrease";
  isRTL: boolean;
}

export default function AdjustDueModal({
  isOpen,
  onClose,
  onSuccess,
  member,
  initialAction = "increase",
  isRTL,
}: AdjustDueModalProps) {
  const { t } = useLanguage();
  const adj = t.admin?.dues?.adjustModal;

  const [action, setAction] = useState<"increase" | "decrease">(initialAction);
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAction(initialAction);
      setAmount("");
      setNotes("");
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialAction, member]);

  if (!isOpen || !member) return null;

  const currentDue = Number(member.due_amount || 0);
  const parsedAmount = parseFloat(amount) || 0;
  const newDue =
    action === "increase"
      ? Math.round((currentDue + parsedAmount) * 100) / 100
      : Math.max(0, Math.round((currentDue - parsedAmount) * 100) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (parsedAmount <= 0) {
      setErrorMsg(isRTL ? "يرجى إدخال مبلغ صالح أكبر من الصفر." : "Please enter a valid amount greater than 0");
      return;
    }

    if (action === "decrease" && parsedAmount > currentDue) {
      setErrorMsg(
        isRTL
          ? `لا يمكن خصم مبلغ أكبر من الرصيد الحالي (${currentDue} شيكل).`
          : `Deduct amount cannot exceed current balance (${currentDue} NIS).`
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await adjustMemberDueApi(member.id, {
        action,
        amount: parsedAmount,
        notes: notes.trim() || undefined,
      });

      setSuccessMsg(res.message);

      setTimeout(() => {
        onSuccess({
          memberId: member.id,
          action,
          amount: parsedAmount,
          newTotal: newDue,
          notes: notes.trim() || undefined,
        });
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isRTL ? "فشل تعديل المستحق." : "Failed to adjust due";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isVisitor = member.type === "external" || member.member_type === "external";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                action === "increase"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {action === "increase" ? (
                <Plus className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Minus className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-brand-navy">
                {action === "increase"
                  ? adj?.increaseTitle || (isRTL ? "زيادة على المستحق المالي" : "Add / Increase Due")
                  : adj?.decreaseTitle || (isRTL ? "خصم من المستحق المالي" : "Deduct / Discount Due")}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                {member.name} {isVisitor ? (isRTL ? "(زائر)" : "(Visitor)") : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Switch Tabs (+ vs -) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setAction("increase")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                action === "increase"
                  ? "bg-white text-amber-900 shadow-xs border border-amber-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
              <span>{adj?.addDueMode || (isRTL ? "إضافة (+)" : "Increase (+)")}</span>
            </button>

            <button
              type="button"
              onClick={() => setAction("decrease")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                action === "decrease"
                  ? "bg-white text-rose-900 shadow-xs border border-rose-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Minus className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
              <span>{adj?.deductDueMode || (isRTL ? "خصم (-)" : "Deduct (-)")}</span>
            </button>
          </div>

          {/* Current vs New Balance Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">
                {adj?.currentBalance || (isRTL ? "المبلغ الحالي" : "Current Due")}
              </span>
              <span className="text-base font-black text-slate-800 font-mono">
                {currentDue} ₪
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 rtl:rotate-180" />

            <div className="text-end">
              <span className="text-[11px] font-bold text-slate-500 block">
                {adj?.newBalance || (action === "increase"
                  ? isRTL
                    ? "الرصيد بعد الزيادة"
                    : "After Increase"
                  : isRTL
                  ? "الرصيد بعد الخصم"
                  : "After Deduction")}
              </span>
              <span
                className={`text-base font-black font-mono ${
                  action === "increase"
                    ? "text-amber-700"
                    : newDue === 0
                    ? "text-emerald-600"
                    : "text-rose-700"
                }`}
              >
                {newDue} ₪
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {action === "increase"
                ? adj?.amountLabel || (isRTL ? "المبلغ المراد إضافته (شيكل ₪) *" : "Amount to Add (NIS) *")
                : adj?.deductAmountLabel || (isRTL ? "المبلغ المراد خصمه (شيكل ₪) *" : "Amount to Deduct (NIS) *")}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max={action === "decrease" ? currentDue : undefined}
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base font-black text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pointer-events-none">
                {isRTL ? "شيكل" : "NIS"}
              </span>
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[5, 10, 20, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(String(val))}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  +{val}
                </button>
              ))}
              {action === "decrease" && currentDue > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(currentDue))}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors cursor-pointer"
                >
                  {isRTL ? "خصم كامل الرصيد" : "Deduct All"}
                </button>
              )}
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {adj?.notesLabel || (isRTL ? "سبب التعديل (اختياري):" : "Reason / Notes (Optional):")}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                adj?.notesPlaceholder ||
                (action === "increase"
                  ? isRTL
                    ? "مثال: استهلاك إضافي، خدمات، تلفيات..."
                    : "e.g. Extra usage, services..."
                  : isRTL
                  ? "مثال: دفعة جزئية، خصم تشجيعي، تصحيح رصيد..."
                  : "e.g. Partial payment, discount, correction...")
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {adj?.cancel || (isRTL ? "إلغاء" : "Cancel")}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 ${
                action === "increase"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{adj?.saving || (isRTL ? "جاري التحديث..." : "Updating...")}</span>
                </>
              ) : action === "increase" ? (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{adj?.saveIncrease || (isRTL ? "تأكيد الزيادة (+)" : "Confirm Add (+)")}</span>
                </>
              ) : (
                <>
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                  <span>{adj?.saveDecrease || (isRTL ? "تأكيد الخصم (-)" : "Confirm Deduct (-)")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

