"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Lock,
  Unlock,
  AlertCircle,
  Calendar,
  Clock,
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

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
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

  // Closure mode: "full_day" vs "partial_hours"
  const [closureType, setClosureType] = useState<"full_day" | "partial_hours">("full_day");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");

  const [reason, setReason] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Calculate duration in hours if partial
  const startHour = parseInt(startTime.split(":")[0], 10);
  const endHour = parseInt(endTime.split(":")[0], 10);
  const durationHours = Math.max(1, endHour - startHour);

  // Filter end time options strictly after start time
  const availableEndTimeOptions = useMemo(() => {
    return TIME_SLOTS.filter((t) => {
      const h = parseInt(t.split(":")[0], 10);
      return h > startHour;
    });
  }, [startHour]);

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    const newStartH = parseInt(newStart.split(":")[0], 10);
    const currentEndH = parseInt(endTime.split(":")[0], 10);
    if (currentEndH <= newStartH) {
      const nextH = Math.min(16, newStartH + 2);
      setEndTime(`${String(nextH).padStart(2, "0")}:00`);
    }
  };

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

    if (closureType === "partial_hours" && endHour <= startHour) {
      setFeedback({
        type: "error",
        text: isRTL ? "وقت نهاية الإغلاق يجب أن يكون بعد وقت البداية." : "End time must be after start time.",
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const isFull = closureType === "full_day";
      const res = await createRoomClosureApi({
        room_id: roomKey,
        closure_date: closureDate,
        start_time: isFull ? null : startTime,
        end_time: isFull ? null : endTime,
        is_full_day: isFull,
        reason: reason.trim(),
      });

      setFeedback({
        type: "success",
        text: res.message || (isRTL ? "تم حفظ إغلاق الصالة بنجاح." : "Room closure saved successfully."),
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
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg my-auto p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {isRTL ? "إغلاق صالة ومنع الحجز" : "Manage Room Closures"}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                {isRTL
                  ? "إغلاق ليوم كامل أو لساعات محددة (مع إتاحة باقي اليوم)"
                  : "Close for full day or specific hours (keeping rest of day open)"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
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
            <div className="flex items-center gap-2 min-w-0">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="truncate">{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Form to add closure ── */}
        <form onSubmit={handleCreateClosure} className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>{isRTL ? "إضافة إغلاق جديد:" : "Add New Room Closure:"}</span>
          </div>

          {/* Room & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Room Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">
                {isRTL ? "الصالة المراد إغلاقها:" : "Room to close:"}
              </label>
              <select
                value={roomKey}
                onChange={(e) => setRoomKey(e.target.value as "male_main" | "female_hall")}
                className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
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
                required
              />
            </div>
          </div>

          {/* Closure Type Switcher (Full Day vs Partial Hours) */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-slate-600 block">
              {isRTL ? "نطاق الإغلاق:" : "Closure Scope:"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setClosureType("full_day")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                  closureType === "full_day"
                    ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {isRTL ? "اليوم بالكامل (08:00 - 16:00)" : "Full Day"}
              </button>

              <button
                type="button"
                onClick={() => setClosureType("partial_hours")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer flex items-center justify-center gap-1 ${
                  closureType === "partial_hours"
                    ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isRTL ? "فترة محددة (ساعتين مثلاً)" : "Specific Hours"}</span>
              </button>
            </div>
          </div>

          {/* Partial Hours Pickers (Appears when partial_hours selected) */}
          {closureType === "partial_hours" && (
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-amber-900 block mb-1">
                    {isRTL ? "بداية الإغلاق:" : "Start Time:"}
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-800 outline-none cursor-pointer"
                  >
                    {TIME_SLOTS.slice(0, TIME_SLOTS.length - 1).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-amber-900 block mb-1">
                    {isRTL ? "نهاية الإغلاق:" : "End Time:"}
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-800 outline-none cursor-pointer"
                  >
                    {availableEndTimeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Informative notice */}
              <p className="text-[10.5px] text-amber-900 font-medium leading-relaxed">
                ✨ {isRTL
                  ? (startTime === "08:00"
                      ? `سيتم إغلاق الصالة في بداية الدوام لمدة (${durationHours} ${durationHours === 1 ? "ساعة" : durationHours === 2 ? "ساعتان" : "ساعات"}) فقط (من 08:00 إلى ${endTime})، وتكون الصالة متاحة للحجز بشكل طبيعي بعد انتهاء الإغلاق (من ${endTime} حتى 16:00).`
                      : endTime === "16:00"
                      ? `سيتم إغلاق الصالة في نهاية الدوام لمدة (${durationHours} ${durationHours === 1 ? "ساعة" : durationHours === 2 ? "ساعتان" : "ساعات"}) فقط (من ${startTime} إلى 16:00)، وتكون الصالة متاحة للحجز في بداية اليوم (من 08:00 حتى ${startTime}).`
                      : `سيتم إغلاق الصالة لمدة (${durationHours} ${durationHours === 1 ? "ساعة" : durationHours === 2 ? "ساعتان" : "ساعات"}) فقط من (${startTime} إلى ${endTime})، ويستطيع الطلاب الحجز في الساعات المتاحة (من 08:00 إلى ${startTime}) و (من ${endTime} إلى 16:00) بحرية تامّة.`)
                  : `Room closed for ${durationHours}h only. Students can freely book outside this period.`}
              </p>
            </div>
          )}

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
              required
            />

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-slate-400 font-semibold">{isRTL ? "اقتراحات سريعة:" : "Presets:"}</span>
              {PRESET_REASONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReason(p)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
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
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isRTL ? "تأكيد الإغلاق ومنع الحجز" : "Confirm Room Closure"}</span>
            </button>
          </div>
        </form>

        {/* ── Active Closures List ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{isRTL ? "قائمة الأيام والصالات المغلقة حالياً:" : "Scheduled Closures:"}</span>
            <span className="text-[11px] text-slate-400 font-mono">({closures.length})</span>
          </div>

          {loading ? (
            <div className="p-5 text-center text-xs text-slate-400 space-y-1">
              <Loader2 className="w-4 h-4 animate-spin text-slate-500 mx-auto" />
              <span>{isRTL ? "جاري تحميل القائمة..." : "Loading closures..."}</span>
            </div>
          ) : closures.length === 0 ? (
            <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center text-xs text-slate-400">
              {isRTL ? "لا توجد صالات مغلقة حالياً. الحجز متاح لجميع الأيام المعتمدة." : "No active room closures."}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {closures.map((c) => {
                const isYouth = c.room?.room_key === "male_main" || c.room?.gender === "male";
                const isDeleting = deletingId === c.id;
                const hasCustomHours = c.start_time && c.end_time;

                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-2.5"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            isYouth
                              ? "bg-sky-50 text-sky-800 border-sky-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {isYouth ? (isRTL ? "صالة الشباب 🚹" : "Youth Hall") : (isRTL ? "صالة الإناث 👩" : "Women Hall")}
                        </span>

                        <span className="text-[11px] font-bold text-slate-900 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{cleanBookingDate(c.closure_date)}</span>
                        </span>

                        {hasCustomHours ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span dir="ltr">{c.start_time} - {c.end_time}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {isRTL ? "طوال اليوم" : "Full Day"}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 truncate max-w-xs">
                        <strong className="text-slate-700 font-semibold">{isRTL ? "السبب:" : "Reason:"}</strong> {c.reason}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteClosure(c.id)}
                      disabled={isDeleting}
                      title={isRTL ? "إلغاء الإغلاق وفتح الصالة" : "Reopen hall"}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>{isRTL ? "فتح" : "Reopen"}</span>
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
