"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  History,
  ShieldCheck,
} from "lucide-react";
import { MemberRecord } from "./data";

interface MemberDetailDrawerProps {
  member: MemberRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus?: (id: string) => void;
}

export default function MemberDetailDrawer({
  member,
  isOpen,
  onClose,
  onToggleStatus,
}: MemberDetailDrawerProps) {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen || !member) return null;

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(member.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const cleanPhoneForWa = member.phone.replace(/[^0-9]/g, "");
  const percentage = Math.min(100, Math.round((member.hoursUsed / member.hoursLimit) * 100));

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-2xs transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className={`fixed inset-y-0 ${
          isRTL ? "left-0" : "right-0"
        } max-w-full flex pl-0`}
      >
        <div
          className="w-screen max-w-xl bg-white shadow-2xl border-x border-slate-200 flex flex-col h-full transform transition-transform duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 border ${member.avatarColor}`}
              >
                {member.avatarLetter}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {member.name}
                  </h2>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      member.type === "freelancer"
                        ? "bg-teal-50 text-teal-800 border border-teal-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {member.type === "freelancer"
                      ? isRTL ? "مستقل Freelancer" : "Freelancer"
                      : isRTL ? "طالب جامعي" : "Student"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                  {member.specialty}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/admin/members/${member.id}`}
                className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200/80 transition-colors"
                title={isRTL ? "فتح الملف الكامل (21 حقلاً)" : "Open Full Profile"}
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Quota Progress Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{isRTL ? "استهلاك الرصيد الشهري" : "Monthly Quota Usage"}</span>
                </span>
                <span className="text-slate-900 font-mono text-sm">
                  {member.hoursUsed} / {member.hoursLimit} {isRTL ? "ساعة" : "hrs"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    member.status === "extra_hours"
                      ? "bg-rose-600"
                      : member.status === "near_limit"
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div>
                  {member.extraHours > 0 ? (
                    <span className="text-rose-600 font-bold">
                      +{member.extraHours} {isRTL ? "ساعات إضافية مستحقة" : "extra hours"}
                    </span>
                  ) : (
                    <span>
                      {isRTL ? "المتبقي:" : "Remaining:"}{" "}
                      <strong className="text-slate-800 font-mono">{member.remainingHours}</strong>{" "}
                      {isRTL ? "ساعة" : "hrs"}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  {percentage}% {isRTL ? "مستهلك" : "consumed"}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isRTL ? "بيانات التواصل والعضوية" : "Contact & Membership Info"}
              </h3>

              <div className="p-4 rounded-xl border border-slate-200/90 space-y-3 bg-white">
                {/* Phone */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {isRTL ? "الهاتف / واتساب" : "Phone / WhatsApp"}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 font-mono" dir="ltr">
                        {member.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {cleanPhoneForWa && (
                      <a
                        href={`https://wa.me/${cleanPhoneForWa}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>واتساب</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {copiedPhone ? (isRTL ? "تم النسخ" : "Copied") : (isRTL ? "نسخ" : "Copy")}
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {isRTL ? "البريد الإلكتروني" : "Email"}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-800 font-mono">
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`mailto:${member.email}`}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    {isRTL ? "مراسلة" : "Email"}
                  </a>
                </div>

                {/* Joined & Last Booking */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      {isRTL ? "تاريخ الانضمام" : "Joined"}
                    </span>
                    <span className="font-semibold text-slate-700">{member.joinedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      {isRTL ? "آخر حجز" : "Last Booking"}
                    </span>
                    <span className="font-semibold text-slate-700">{member.lastBooking}</span>
                  </div>
                </div>

                {/* Password / Credentials */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {isRTL ? "أمان الحساب" : "Account Security"}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">
                        {isRTL ? "كلمة المرور خاصة بالعضو ومحمية" : "Private member password"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking History Snippet */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>{isRTL ? "سجل الحجوزات الأخير" : "Recent Bookings"}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {member.history.length} {isRTL ? "حجوزات" : "bookings"}
                </span>
              </div>

              {member.history.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-400">
                  {isRTL ? "لا توجد حجوزات مسجلة لهذا الشهر" : "No bookings recorded this month"}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                  {member.history.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 text-xs flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-800">{item.date}</div>
                        <div className="text-[11px] text-slate-400">{item.purpose}</div>
                      </div>
                      <div className="text-end shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                          {item.duration}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.desk}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
            <Link
              href={`/admin/members/${member.id}`}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm text-center shadow-sm transition-all active:scale-98"
            >
              {isRTL ? "عرض الملف الكامل (21 حقلاً)" : "View Complete Profile (21 fields)"}
            </Link>

            {onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus(member.id)}
                className={`py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  member.status === "suspended"
                    ? "border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {member.status === "suspended"
                  ? isRTL ? "تنشيط العضوية" : "Activate"
                  : isRTL ? "إيقاف العضوية" : "Suspend"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
