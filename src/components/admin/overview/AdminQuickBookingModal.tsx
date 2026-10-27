"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { X, Calendar, Clock, Armchair, AlertCircle, CheckCircle2, Loader2, User } from "lucide-react";
import { getAdminMembersApi, createAdminBookingForMemberApi } from "@/services/applications";

interface AdminQuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MemberOption {
  id: string | number;
  name: string;
  email: string;
  member_type?: string;
  category?: string;
}

export default function AdminQuickBookingModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminQuickBookingModalProps) {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchMember, setSearchMember] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [startTime, setStartTime] = useState("09:00");
  const [durationHours, setDurationHours] = useState(2);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoadingMembers(true);
      getAdminMembersApi()
        .then((data) => {
          setMembers(data || []);
          if (data && data.length > 0 && !selectedUserId) {
            setSelectedUserId(String(data[0].id));
          }
        })
        .finally(() => setLoadingMembers(false));
    }
  }, [isOpen, selectedUserId]);

  if (!isOpen) return null;

  const filteredMembers = members.filter((m) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase().trim();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg(isRTL ? "يرجى اختيار العضو المطلوب." : "Please select a member.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await createAdminBookingForMemberApi({
        userId: selectedUserId,
        date: bookingDate,
        startTime,
        durationHours,
        notes: notes.trim() || (isRTL ? "حجز يدوي من لوحة الإدارة" : "Manual admin booking"),
      });

      setSuccessMsg(
        isRTL
          ? "تم حجز المقعد للعضو بنجاح وإضافته إلى جدول حجوزات اليوم!"
          : "Seat booked successfully for member!"
      );

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setErrorMsg(msg || (isRTL ? "تعذر تأكيد الحجز." : "Failed to confirm booking."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-7 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-navy text-emerald-400 flex items-center justify-center shrink-0">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {isRTL ? "حجز مقعد لعضو (إجراء سريع)" : "Quick Member Seat Booking"}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isRTL ? "حجز موعد عمل أو دراسة لعضو مسجل بناءً على اتصاله أو حضوره" : "Reserve a workspace desk for an active member"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Member Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{isRTL ? "اختر العضو المسجل:" : "Select Member:"}</span>
            </label>

            {loadingMembers ? (
              <div className="p-2.5 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>{isRTL ? "جاري تحميل الأعضاء..." : "Loading members..."}</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder={isRTL ? "ابحث بالاسم أو البريد..." : "Search member by name..."}
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none focus:bg-white focus:border-emerald-500"
                />
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white font-medium text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required
                >
                  <option value="" disabled>
                    {isRTL ? "-- اختر عضواً من القائمة --" : "-- Select a member --"}
                  </option>
                  {filteredMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email}) {m.member_type ? `[${m.member_type}]` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRTL ? "تاريخ الحجز:" : "Date:"}</span>
              </label>
              <input
                type="date"
                min={todayStr}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRTL ? "وقت البداية:" : "Start Time:"}</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-emerald-500"
              >
                {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"].map((time) => (
                  <option key={time} value={time}>
                    {time} {Number(time.slice(0, 2)) < 12 ? (isRTL ? "صباحاً" : "AM") : (isRTL ? "ظهراً" : "PM")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration Hours */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{isRTL ? "مدة الحجز بالساعات:" : "Duration (Hours):"}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setDurationHours(h)}
                  className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                    durationHours === h
                      ? "bg-brand-navy text-white border-brand-navy shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {h} {isRTL ? (h === 1 ? "ساعة" : h === 2 ? "ساعتان" : "ساعات") : `${h}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRTL ? "ملاحظة الحجز (اختياري):" : "Notes (Optional):"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isRTL ? "مثال: حجز عبر اتصال هاتفي، طاولة هادئة" : "e.g. Phone booking, quiet desk"}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-400 shadow-xs active:scale-98"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جاري التأكيد..." : "Confirming..."}</span>
                </>
              ) : (
                <span>{isRTL ? "تأكيد حجز المقعد الآن" : "Confirm Seat Reservation"}</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
