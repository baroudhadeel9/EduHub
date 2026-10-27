"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { X, LogIn, User, Clock, Tag, FileText } from "lucide-react";
import { AttendanceRecord, MemberType } from "./types";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: AttendanceRecord) => void;
}

export default function CheckInModal({
  isOpen,
  onClose,
  onSubmit,
}: CheckInModalProps) {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const m = t.admin?.modal;

  const [name, setName] = useState("");
  const [role, setRole] = useState<MemberType>("student");
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Pick avatar letter and color
    const firstLetter = name.trim().charAt(0);
    const colors = [
      "bg-[#0c2340]/10 text-[#0c2340]",
      "bg-emerald-100 text-emerald-800",
      "bg-sky-100 text-sky-800",
      "bg-teal-100 text-teal-800",
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const now = new Date();
    const formattedTime = now.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      name: name.trim(),
      avatarLetter: firstLetter,
      avatarColor,
      type: role,
      subText:
        notes.trim() ||
        (role === "student"
          ? isRTL ? "عضوية دراسية مستمرة" : "Active study membership"
          : role === "freelancer"
          ? isRTL ? "مكتب مستقل - حضور فوري" : "Freelancer desk pass"
          : isRTL ? "طلب زيارة فردي معتمد" : "Approved visitor pass"),
      bookingTime: bookingTime || formattedTime,
      arrivalTime: formattedTime,
      departureTime: isRTL ? "لم تغادر بعد" : "Still in hub",
      actualDuration: isRTL ? "الآن" : "Just now",
      status: "inside",
    };

    onSubmit(newRecord);
    setName("");
    setBookingTime("");
    setNotes("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 end-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={m?.cancelBtn || (isRTL ? "إغلاق" : "Close")}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#064e3b]/10 text-[#064e3b] flex items-center justify-center shrink-0">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {m?.title || (isRTL ? "تسجيل وصول فوري (حضور جديد)" : "Fast Check-in")}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              {m?.subtitle || (isRTL ? "إضافة عضو أو زائر متواجد حالياً في المركز إلى سجل الحضور الفوري." : "Add a member or visitor present at the hub.")}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="checkin-name" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{m?.nameLabel || (isRTL ? "الاسم الكامل" : "Full Name")} *</span>
            </label>
            <input
              id="checkin-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={m?.namePlaceholder || (isRTL ? "مثال: أحمد محمود..." : "e.g., Ahmed Mahmoud...")}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Membership Role Type */}
          <div>
            <label htmlFor="checkin-role" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>{m?.roleLabel || (isRTL ? "نوع العضوية / الزيارة" : "Membership / Visitor Type")}</span>
            </label>
            <select
              id="checkin-role"
              value={role}
              onChange={(e) => setRole(e.target.value as MemberType)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
            >
              <option value="student">{m?.roleStudent || (isRTL ? "طالب جامعي" : "University Student")}</option>
              <option value="freelancer">{m?.roleFreelancer || (isRTL ? "مستقل / فريلانسر" : "Freelancer / Remote")}</option>
              <option value="visitor">{m?.roleVisitor || (isRTL ? "زائر ليوم واحد" : "1-Day Visitor")}</option>
            </select>
          </div>

          {/* Booking Slot */}
          <div>
            <label htmlFor="checkin-slot" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{m?.bookingTimeLabel || (isRTL ? "الفترة المحجوزة / المعتمدة" : "Booking Slot")}</span>
            </label>
            <input
              id="checkin-slot"
              type="text"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              placeholder={m?.bookingTimePlaceholder || "2:00 م - 5:00 م"}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="checkin-notes" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{m?.notesLabel || (isRTL ? "تفاصيل أو ملاحظات إضافية" : "Additional Notes")}</span>
            </label>
            <input
              id="checkin-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={m?.notesPlaceholder || (isRTL ? "مثال: عضوية دراسية مستمرة، طاولة رقم 4..." : "e.g., Active pass, desk #4...")}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {m?.cancelBtn || (isRTL ? "إلغاء" : "Cancel")}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-emerald-300" />
              <span>{m?.confirmBtn || (isRTL ? "تأكيد تسجيل الوصول الآن" : "Confirm Check-in")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
