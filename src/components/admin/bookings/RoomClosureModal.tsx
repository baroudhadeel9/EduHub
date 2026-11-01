"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  Unlock,
  AlertCircle,
  Calendar,
  Loader2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import {
  getAdminRoomClosuresApi,
  createRoomClosureApi,
  deleteRoomClosureApi,
  RoomClosureItem,
} from "@/services/roomSeats";
import { cleanBookingDate } from "@/utils/dateTime";

interface RoomClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  isRTL?: boolean;
}

const PRESET_REASONS = [
  "صيانة طارئة للكهرباء والتكييف",
  "عقد ورشة عمل وتدريب خاصة",
  "أعمال تعقيم وتنظيف دوري للمقر",
  "إجازة إدارية خاصة",
];

export default function RoomClosureModal({
  isOpen,
  onClose,
  onUpdated,
  isRTL = true,
}: RoomClosureModalProps) {
  const [closures, setClosures] = useState<RoomClosureItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [roomKey, setRoomKey] = useState<"male_main" | "female_hall">("male_main");
  const [closureDate, setClosureDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [reason, setReason] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadClosures = async () => {
    setLoading(true);
    try {
      const res = await getAdminRoomClosuresApi();
      if (res && Array.isArray(res.data)) {
        setClosures(res.data);
      }
    } catch (err: unknown) {
      console.warn("Could not fetch closures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadClosures();
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureDate || !reason.trim()) {
      setFeedback({
        type: "error",
        text: isRTL ? "يرجى تحديد التاريخ وكتابة سبب الإغلاق." : "Please select a date and enter a reason.",
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await createRoomClosureApi({
        room_id: roomKey,
        closure_date: closureDate,
        reason: reason.trim(),
      });

      setFeedback({
        type: "success",
        text: res.message || (isRTL ? "تم إغلاق الصالة ومنع الحجز بنجاح." : "Room closed successfully."),
      });
      setReason("");
      loadClosures();
      if (onUpdated) onUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setFeedback({
        type: "error",
        text: msg || (isRTL ? "فشل حفظ إغلاق الصالة." : "Failed to close room."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClosure = async (id: number) => {
    setDeletingId(id);
    setFeedback(null);

    try {
      await deleteRoomClosureApi(id);
      setFeedback({
        type: "success",
        text: isRTL ? "تم فتح الصالة وإعادة إتاحة الحجز بنجاح." : "Room reopened successfully.",
      });
      setClosures((prev) => prev.filter((c) => c.id !== id));
      if (onUpdated) onUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setFeedback({
        type: "error",
        text: msg || (isRTL ? "فشل فتح الصالة." : "Failed to reopen room."),
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {isRTL ? "إغلاق صالة ومنع الحجز في يوم محدد" : "Manage Room Closures"}
              </h2>
              <p className="text-xs text-slate-500">
                {isRTL ? "تحكم كامل بإغلاق صالة الشباب أو صالة الإناث مع إظهار السبب للأعضاء" : "Block desk reservations on specific dates with custom reason"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Form to add closure ── */}
        <form onSubmit={handleCreateClosure} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
          <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{isRTL ? "إضافة إغلاق جديد:" : "Add New Room Closure:"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Room Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">
                {isRTL ? "الصالة المراد إغلاقها:" : "Room to close:"}
              </label>
              <select
                value={roomKey}
                onChange={(e) => setRoomKey(e.target.value as "male_main" | "female_hall")}
                className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="male_main">{isRTL ? "صالة الشباب 🚹" : "Youth Hall (Male)"}</option>
                <option value="female_hall">{isRTL ? "صالة الإناث 👩" : "Women Hall (Female)"}</option>
              </select>
            </div>

            {/* Date Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">
                {isRTL ? "تاريخ الإغلاق:" : "Closure date:"}
              </label>
              <input
                type="date"
                value={closureDate}
                onChange={(e) => setClosureDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 block">
              {isRTL ? "سبب الإغلاق (يظهر للأعضاء عند محاولة الحجز):" : "Closure reason (visible to members):"}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isRTL ? "مثال: صيانة طارئة للكهرباء والتكييف..." : "e.g. Emergency electrical maintenance..."}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400"
            />

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-slate-400 font-semibold">{isRTL ? "اقتراحات سريعة:" : "Presets:"}</span>
              {PRESET_REASONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReason(p)}
                  className="text-[10.5px] px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isRTL ? "تأكيد الإغلاق ومنع الحجز" : "Confirm Room Closure"}</span>
            </button>
          </div>
        </form>

        {/* ── Active Closures List ── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{isRTL ? "قائمة الأيام والصالات المغلقة حالياً:" : "Scheduled Closures:"}</span>
            <span className="text-[11px] text-slate-400 font-mono">({closures.length})</span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-1">
              <Loader2 className="w-4 h-4 animate-spin text-slate-500 mx-auto" />
              <span>{isRTL ? "جاري تحميل القائمة..." : "Loading closures..."}</span>
            </div>
          ) : closures.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-400">
              {isRTL ? "لا توجد صالات مغلقة حالياً. الحجز متاح لجميع الأيام المعتمدة." : "No active room closures."}
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {closures.map((c) => {
                const isYouth = c.room?.room_key === "male_main" || c.room?.gender === "male";
                const isDeleting = deletingId === c.id;

                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                            isYouth
                              ? "bg-sky-50 text-sky-800 border-sky-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {isYouth ? (isRTL ? "صالة الشباب 🚹" : "Youth Hall") : (isRTL ? "صالة الإناث 👩" : "Women Hall")}
                        </span>

                        <span className="text-xs font-bold text-slate-900 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{cleanBookingDate(c.closure_date)}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 truncate max-w-sm">
                        <strong className="text-slate-700 font-semibold">{isRTL ? "السبب:" : "Reason:"}</strong> {c.reason}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteClosure(c.id)}
                      disabled={isDeleting}
                      title={isRTL ? "إلغاء الإغلاق وفتح الصالة" : "Reopen hall"}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>{isRTL ? "إعادة الفتح" : "Reopen"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

