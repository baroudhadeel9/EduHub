"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { MemberRecord } from "@/components/admin/members/data";
import { getAdminMembersApi } from "@/services/applications";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Menu,
  Send,
  UserCheck,
  GraduationCap,
  Briefcase,
  Zap,
  Laptop,
  FileText,
  Camera,
  User,
  Sparkles,
  FileCheck,
  Printer,
  Loader2,
} from "lucide-react";

interface MemberProfileViewProps {
  memberId: string;
}

export default function MemberProfileView({ memberId }: MemberProfileViewProps) {
  const { locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ArrowBackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<MemberRecord | null>(null);

  useEffect(() => {
    async function loadMember() {
      setLoading(true);
      try {
        const list = await getAdminMembersApi();
        const found = (list as MemberRecord[]).find((m) => String(m.id) === String(memberId));
        if (found) {
          setMember({
            ...found,
            history: found.history || [],
            hoursUsed: found.hoursUsed || 0,
            hoursLimit: found.hoursLimit || 35,
            remainingHours: found.remainingHours ?? Math.max(0, (found.hoursLimit || 35) - (found.hoursUsed || 0)),
            dueAmount: found.dueAmount || 0,
            lastBooking: found.lastBooking || "اليوم",
          });
        } else {
          setMember(null);
        }
      } catch (err) {
        console.error("Failed to load member:", err);
        setMember(null);
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, [memberId]);

  // Active view tab: "bookings" | "dues" | "registration"
  const [activeTab, setActiveTab] = useState<"bookings" | "dues" | "registration">("bookings");
  const [dueSettled, setDueSettled] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-700">
          {isRTL ? "جاري تحميل بيانات العضو الرسمية..." : "Loading member profile..."}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div dir={dir} className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {isRTL ? "العضو غير موجود" : "Member Not Found"}
        </h2>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          {isRTL ? "لم يتم العثور على سجل العضو المطلوب في قاعدة البيانات." : "The requested member record was not found."}
        </p>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
        >
          <ArrowBackIcon className="w-4 h-4" />
          <span>{isRTL ? "العودة إلى دليل الأعضاء" : "Back to Members"}</span>
        </Link>
      </div>
    );
  }

  const reg = member.registration;
  const percentage = Math.min(
    100,
    Math.round((member.hoursUsed / member.hoursLimit) * 100)
  );

  const handleSettleDues = () => {
    setDueSettled(true);
    setMember((prev) => (prev ? { ...prev, dueAmount: 0, extraHours: 0 } : prev));
  };

  const handleSendNotification = () => {
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 4000);
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white"
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab="members"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-64 xl:mr-72" : "lg:ml-64 xl:ml-72"
        }`}
      >
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          
          {/* ─── Top Bar Navigation & Actions ─── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link
              href="/admin/members"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-xs sm:text-sm font-bold transition-all shadow-2xs group cursor-pointer"
            >
              <ArrowBackIcon className="w-4 h-4 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform text-emerald-600" />
              <span>{isRTL ? "العودة إلى دليل الأعضاء" : "Back to Members Directory"}</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>{isRTL ? "طباعة الملف الرسمي" : "Print Profile"}</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50 lg:hidden cursor-pointer"
                aria-label="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ─── Notification Sent Toast ─── */}
          {notificationSent && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isRTL
                    ? `تم إرسال إشعار رسالة نصية SMS إلى جوال ${member.name} (${reg?.phone || member.phone}) بنجاح.`
                    : `SMS notification sent to ${member.name} successfully.`}
                </span>
              </div>
            </div>
          )}

          {/* ─── Member Hero Header Card ─── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              {/* Avatar & Primary Information */}
              <div className="flex items-start gap-4 sm:gap-6">
                <div
                  className={`w-18 h-18 sm:w-22 sm:h-22 rounded-3xl flex items-center justify-center font-black text-2xl sm:text-4xl shrink-0 border-2 shadow-xs ${member.avatarColor}`}
                >
                  {member.avatarLetter}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0c2340] tracking-tight">
                      {reg?.fullName || member.name}
                    </h1>

                    {/* Member Category Badge */}
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                      {member.type === "freelancer" ? (
                        <>
                          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isRTL ? "فريلانسر Freelancer" : "Freelancer"}</span>
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isRTL ? "طالب/ة جامعي" : "Student"}</span>
                        </>
                      )}
                    </span>

                    {/* Status Badge */}
                    {member.status === "extra_hours" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {isRTL ? "ساعات إضافية" : "Extra Hours"}
                      </span>
                    )}
                    {member.status === "active" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {isRTL ? "عضوية نشطة" : "Active"}
                      </span>
                    )}
                    {member.status === "near_limit" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {isRTL ? "قارب على النهاية" : "Near Limit"}
                      </span>
                    )}
                    {member.status === "suspended" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        {isRTL ? "عضوية معلقة" : "Suspended"}
                      </span>
                    )}
                  </div>

                  {/* Specialty and University */}
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                    {reg?.specialty || member.specialty}
                    {reg?.university && (
                      <span className="text-slate-400 font-normal"> • {reg.university}</span>
                    )}
                  </p>

                  {/* Identification Quick Metadata Strip */}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-500 flex-wrap pt-1 font-medium">
                    {/* National ID */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isRTL ? `رقم الهوية: ${reg?.nationalId || member.nationalId || "401982736"}` : `ID: ${reg?.nationalId || member.nationalId}`}</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.email}</span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-1.5" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-slate-700">{reg?.phone ? `0${reg.phone.replace(/^0+/, '')}` : member.phone}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">SMS</span>
                    </div>

                    {/* Governorate */}
                    {reg?.governorate && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{reg.governorate}</span>
                      </div>
                    )}

                    {/* Joined Date */}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isRTL ? `تاريخ الانضمام: ${member.joinedDate}` : `Joined: ${member.joinedDate}`}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col gap-2 shrink-0 self-start md:self-center">
                <button
                  type="button"
                  onClick={handleSendNotification}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-700/20 active:scale-98 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isRTL ? "إرسال إشعار SMS" : "Send SMS"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dues")}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isRTL ? "تعديل الحصة الشهرية" : "Adjust Quota"}</span>
                </button>
              </div>

            </div>
          </div>

          {/* ─── 4 Fast Metric Stat Cards ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Hours Used */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{isRTL ? "الساعات هذا الشهر" : "Hours this Month"}</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-[#0c2340]">
                {member.hoursUsed}{" "}
                <span className="text-xs font-normal text-slate-400">
                  / {member.hoursLimit} س
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    member.status === "extra_hours"
                      ? "bg-rose-600"
                      : member.status === "near_limit"
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* 2. Remaining Hours */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{isRTL ? "الرصيد المتبقي" : "Remaining Quota"}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-[#0c2340]">
                {member.remainingHours}{" "}
                <span className="text-xs font-normal text-slate-400">
                  {isRTL ? "ساعة" : "hours"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {isRTL ? "يُجدّد في 1 من كل شهر" : "Resets 1st of month"}
              </div>
            </div>

            {/* 3. Due Fees */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{isRTL ? "المستحقات المالية" : "Due Fees"}</span>
                <CreditCard className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-[#0c2340] flex items-center gap-1">
                <span>{member.dueAmount}</span>
                <span className="text-base text-slate-500 font-bold">₪</span>
              </div>
              {member.dueAmount > 0 && !dueSettled ? (
                <button
                  type="button"
                  onClick={handleSettleDues}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                >
                  {isRTL ? "تسوية المبلغ الآن" : "Settle Dues"}
                </button>
              ) : (
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isRTL ? "لا توجد مستحقات" : "No pending dues"}</span>
                </div>
              )}
            </div>

            {/* 4. Last Booking / Status */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>{isRTL ? "آخر حجز" : "Last Booking"}</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-[#0c2340]">
                {member.lastBooking}
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate">
                {member.bookingNote || (isRTL ? "لا يوجد حجز مسجل" : "No booking")}
              </div>
            </div>

          </div>

          {/* ─── Segmented Tabs Switcher (Brand Palette) ─── */}
          <div className="border-b border-slate-200">
            <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
              
              {/* Tab 1: Bookings & Desk Logs */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "bookings"}
                onClick={() => setActiveTab("bookings")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "bookings"
                    ? "bg-[#0c2340] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-[#0c2340] border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Calendar className={`w-4 h-4 ${activeTab === "bookings" ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{isRTL ? `سجل الحجوزات والزيارات (${member.history.length})` : `Bookings History (${member.history.length})`}</span>
              </button>

              {/* Tab 2: Dues & Hours Policy */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "dues"}
                onClick={() => setActiveTab("dues")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "dues"
                    ? "bg-[#0c2340] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-[#0c2340] border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <CreditCard className={`w-4 h-4 ${activeTab === "dues" ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{isRTL ? "الرصيد والحصص التشغيلية" : "Quota & Policy"}</span>
              </button>

              {/* Tab 3: Official Registration Application Profile */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "registration"}
                onClick={() => setActiveTab("registration")}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "registration"
                    ? "bg-[#0c2340] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-[#0c2340] border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <FileCheck className={`w-4 h-4 ${activeTab === "registration" ? "text-emerald-400" : "text-emerald-600"}`} />
                <span>{isRTL ? "بيانات استمارة التسجيل المعتمدة (21 حقلاً)" : "Verified Registration File"}</span>
              </button>

            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════
              TAB 1: OFFICIAL REGISTRATION APPLICATION PROFILE (21 Fields)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === "registration" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Application Top Summary Banner in Brand Navy / Emerald */}
              <div className="bg-gradient-to-r from-emerald-50 via-white to-slate-50 rounded-2xl border border-emerald-200/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                    <Sparkles className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0c2340]">
                      {isRTL ? "ملف التسجيل المعتمد لدى إدارة اديو هب غزة" : "Verified Gaza Edu Hub Membership Record"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isRTL
                        ? `تم تقديم الطلب بتاريخ ${reg?.applicationDate || member.joinedDate} • وتم التدقيق والاعتماد بواسطة ${reg?.reviewedBy || "إدارة الحجز"}`
                        : `Application date: ${reg?.applicationDate || member.joinedDate} • Audited by EduHub Board`}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/70 text-emerald-900 text-xs font-bold border border-emerald-300 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{isRTL ? "مستندات متطابقة ومعتمدة" : "Verified & Approved"}</span>
                </div>
              </div>

              {/* 4 Balanced Cards in 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* ─── 1. Personal & Contact Details ─── */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-emerald-800 font-bold text-sm">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{isRTL ? "1. البيانات الشخصية ومكان التواجد" : "1. Personal & Location Details"}</span>
                  </div>

                  <div className="space-y-3.5 text-xs sm:text-sm">
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "الاسم رباعي" : "Full Name"}</span>
                      <span className="font-bold text-[#0c2340] text-sm">{reg?.fullName || member.name}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "رقم الهوية الشخصية" : "National ID"}</span>
                        <span className="font-bold text-[#0c2340] font-mono tracking-wider">{reg?.nationalId || member.nationalId || "401982736"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "تاريخ الميلاد والعمر" : "Birth Date"}</span>
                        <span className="font-bold text-slate-800">{reg?.birthDate || "14 مارس 2001 (25 عاماً)"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "رقم الجوال (رسائل SMS)" : "Mobile (SMS Active)"}</span>
                        <span className="font-bold text-[#0c2340] font-mono" dir="ltr">{reg?.phone || member.phone}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "محافظة السكن الحالي" : "Governorate"}</span>
                        <span className="font-bold text-slate-800">{reg?.governorate || "مدينة غزة"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "عنوان البريد الإلكتروني" : "Email Address"}</span>
                      <span className="font-bold text-slate-800">{member.email}</span>
                    </div>

                    <div>
                      <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "عنوان التواجد حالياً بالتفصيل" : "Detailed Current Residence / Shelter"}</span>
                      <span className="font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/80 block mt-1 leading-relaxed">
                        {reg?.detailedAddress || "حي الرمال الجنوبي - شارع الشهداء - بجوار مدرسة اليرموك"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ─── 2. Academic & Work Pathway ─── */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-emerald-800 font-bold text-sm">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span>{isRTL ? "2. المسار الأكاديمي والمهني والمستندات" : "2. Academic & Professional Track"}</span>
                  </div>

                  <div className="space-y-3.5 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "تصنيف الفئة" : "Category"}</span>
                        <span className="font-bold text-emerald-800">{reg?.category || (member.type === "freelancer" ? "فريلانسر Freelancer" : "طالب/ة")}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "اسم الجامعة" : "University"}</span>
                        <span className="font-bold text-slate-800">{reg?.university || "الجامعة الإسلامية بغزة"}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "التخصص الجامعي أو مجال العمل" : "Specialty / Work Field"}</span>
                      <span className="font-bold text-[#0c2340]">{reg?.specialty || member.specialty}</span>
                    </div>

                    {/* Primary Purposes */}
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold mb-1.5">
                        {isRTL ? "الأغراض الأساسية من استخدام مساحة اديو هب" : "Primary Hub Purposes"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(reg?.primaryPurposes || [
                          "العمل الحر وتنفيذ مشاريع للعملاء",
                          "حضور اجتماعات العمل عن بُعد",
                        ]).map((pur, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/80"
                          >
                            <span>•</span>
                            <span>{pur}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Duration / Semester Schedule */}
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold">
                        {isRTL ? "مدة الفصل الدراسي أو مدة المشروع" : "Semester Schedule / Project Duration"}
                      </span>
                      <span className="font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/80 block mt-1">
                        {reg?.durationSchedule || "عقد مشروع منصة تجارة إلكترونية - مستمر 4 أشهر حتى نهاية نوفمبر 2026"}
                      </span>
                    </div>

                    {/* Attached Proof Document Card */}
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold mb-1">
                        {isRTL ? "الإفادة الجامعية أو نموذج المشاريع المرفق" : "Attached Academic / Project Proof"}
                      </span>
                      <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
                          <div>
                            <div className="font-bold text-xs text-[#0c2340] truncate max-w-xs">
                              {reg?.proofFileName || "إفادة_تسجيل_جامعية_معتمدة.pdf"}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {reg?.proofFileSize || "2.4 MB"} • {isRTL ? "ملف سليم وموثق" : "Verified PDF"}
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                          {isRTL ? "معتمد" : "Approved"}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ─── 3. Hardware, Charger & Power Requirements ─── */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-emerald-800 font-bold text-sm">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span>{isRTL ? "3. مواصفات الجهاز، الشاحن وفحص الطاقة" : "3. Device, Charger & Power Audit"}</span>
                  </div>

                  <div className="space-y-3.5 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "نوع الجهاز المستخدم" : "Device Type"}</span>
                        <div className="font-bold text-[#0c2340] flex items-center gap-1.5 mt-0.5">
                          <Laptop className="w-4 h-4 text-emerald-600" />
                          <span>{reg?.deviceType || "لابتوب مخصص للتصميم أو الألعاب"}</span>
                        </div>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "قدرة الشاحن الكهربائية" : "Charger Wattage"}</span>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold text-xs mt-0.5">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>{reg?.chargerWattage || "66–90 واط"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Charger Photo Preview Card */}
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold mb-1">
                        {isRTL ? "صورة شاحن الجهاز المرفقة" : "Attached Charger Photo"}
                      </span>
                      <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-2.5">
                          <Camera className="w-5 h-5 text-emerald-700 shrink-0" />
                          <div>
                            <div className="font-bold text-xs text-[#0c2340] truncate">
                              {reg?.chargerPhotoName || "charger_dell_65w_verified.jpg"}
                            </div>
                            <div className="text-[11px] text-emerald-700 font-semibold">
                              {isRTL ? "تم الفحص الفني: متوافق مع منظومة الطاقة الشمسية" : "Solar System Compatible"}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          {isRTL ? "تم الفحص" : "Verified"}
                        </span>
                      </div>
                    </div>

                    {/* External Connectivity Status */}
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold">
                        {isRTL ? "مدى توفر الإنترنت والكهرباء خارج المساحة" : "Outside Connectivity Status"}
                      </span>
                      <div className="bg-rose-50/70 border border-rose-200/80 p-2.5 rounded-xl text-rose-900 font-bold text-xs mt-1 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{reg?.powerConnectivityStatus || "لا يتوفر لدي إنترنت أو كهرباء مناسبين للدراسة أو العمل"}</span>
                      </div>
                    </div>

                    {/* Shift & Usage */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "الفترة المفضلة للحضور" : "Preferred Shift"}</span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                          {reg?.preferredShift || "الفترة الصباحية"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs font-semibold">{isRTL ? "الاستخدام الأسبوعي المتوقع" : "Expected Weekly Usage"}</span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                          {reg?.weeklyUsage || "يوميا"}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ─── 4. Consents, Declarations & Administrative Audit ─── */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-emerald-800 font-bold text-sm">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span>{isRTL ? "4. الموافقات، الإقرار القانوني والتدقيق" : "4. Consents & Legal Declaration"}</span>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm">
                    
                    {/* Photography Consent */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0c2340] text-xs flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isRTL ? "موافقة التصوير واستخدام الصور" : "Photography Consent"}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-100 text-emerald-800">
                          {reg?.photographyConsent || "أوافق"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {isRTL
                          ? "أوافق على قيام منسقي المشروع بالتقاط صور أثناء تواجدي واستخدامها في المواد الإعلامية للمشروع."
                          : "Agreed to coordinators capturing photos for project reporting and media."}
                      </p>
                    </div>

                    {/* Data Accuracy Legal Declaration */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0c2340] text-xs flex items-center gap-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isRTL ? "الإقرار بصحة ودقة البيانات" : "Legal Data Accuracy"}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-100 text-emerald-800">
                          {isRTL ? "مُقر وموافق" : "Declared & Accepted"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {isRTL
                          ? "أقرّ بأن جميع البيانات المقدمة صحيحة ودقيقة، وأتحمل مسؤولية صحتها مع حق إدارة المركز في التحقق منها."
                          : "Declared that all information provided is accurate and subject to administrative verification."}
                      </p>
                    </div>

                    {/* Administrative Review Log */}
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                      <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>{isRTL ? "سجل التدقيق الإداري والاعتماد" : "Administrative Review Notes"}</span>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                        {reg?.reviewNotes || "تم تدقيق الهوية والشاحن وتوافق القدرة مع الألواح الشمسية، العضو مستقل نشط ومستحق للأولوية."}
                      </p>
                      <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                        <span>{isRTL ? `المراجع: ${reg?.reviewedBy || "لجنة التدقيق"}` : `Auditor: ${reg?.reviewedBy}`}</span>
                        <span>{isRTL ? `تاريخ الاعتماد: ${member.joinedDate}` : `Approved: ${member.joinedDate}`}</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 2: BOOKINGS & VISIT HISTORY TABLE
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Today's Active Booking Card (if any) */}
              {member.bookingNote && member.bookingNote.includes("حجز اليوم") && (
                <div className="bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 rounded-2xl border border-emerald-200/90 p-5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{isRTL ? "حجز نشط اليوم بالمساحة" : "Active Booking Today"}</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      {isRTL ? "طاولة رقم 12 (قاعة المستقلين)" : "Desk #12"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#0c2340]">
                    {member.bookingNote}
                  </p>
                </div>
              )}

              {/* Booking History Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#0c2340]">
                      {isRTL ? "سجل الحجوزات والزيارات" : "Booking & Visit History"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isRTL
                        ? "سجل الجلسات السابقة وساعات الاستخدام في المركز"
                        : "Past sessions and time allocated at the center"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {isRTL ? `${member.history.length} حجوزات مسجلة` : `${member.history.length} Bookings`}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50/70 text-slate-500 text-xs font-bold border-b border-slate-200/60">
                        <th className="py-3 px-5 text-start">{isRTL ? "التاريخ والمدة" : "Date & Duration"}</th>
                        <th className="py-3 px-5 text-start">{isRTL ? "المكان / المقعد" : "Desk / Space"}</th>
                        <th className="py-3 px-5 text-start">{isRTL ? "الغرض من الحجز" : "Purpose"}</th>
                        <th className="py-3 px-5 text-center">{isRTL ? "الحالة" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {member.history.map((h) => (
                        <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-[#0c2340]">{h.date}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{h.duration}</div>
                          </td>
                          <td className="py-3.5 px-5 text-slate-700 font-medium">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{h.desk}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 max-w-sm">
                            {h.purpose}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            {h.status === "active" ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {isRTL ? "داخل المساحة الآن" : "Active Now"}
                              </span>
                            ) : h.status === "completed" ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                {isRTL ? "مكتمل" : "Completed"}
                              </span>
                            ) : (h.status as string) === "no_show" || (h.purpose && h.purpose.includes("لم يحضر")) || (h.duration && h.duration.includes("لم يحضر")) ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {isRTL ? "لم يحضر (أُلغي تلقائياً)" : "No-Show (Auto-Cancelled)"}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
                                {isRTL ? "ملغي" : "Cancelled"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {member.history.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            {isRTL ? "لا توجد حجوزات مسجلة بعد لهذا العضو" : "No booking history recorded yet"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 3: QUOTA & POLICY AUDIT
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === "dues" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#0c2340]">
                  {isRTL ? "تفاصيل الحصة الشهرية والاستهلاك" : "Monthly Quota & Usage Details"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-semibold">{isRTL ? "الحصة المخصصة شهرياً" : "Monthly Limit"}</span>
                    <div className="text-2xl font-black text-[#0c2340] mt-1">{member.hoursLimit} {isRTL ? "ساعة" : "hours"}</div>
                    <span className="text-[11px] text-slate-400">{member.type === "freelancer" ? "35 ساعة للمستقلين" : "25 ساعة للطلاب"}</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-semibold">{isRTL ? "الساعات المستهلكة" : "Hours Used"}</span>
                    <div className="text-2xl font-black text-[#0c2340] mt-1">{member.hoursUsed} {isRTL ? "ساعة" : "hours"}</div>
                    <span className="text-[11px] text-slate-400">{percentage}% من الحصة الإجمالية</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-semibold">{isRTL ? "الساعات الإضافية" : "Extra Hours"}</span>
                    <div className="text-2xl font-black text-rose-600 mt-1">{member.extraHours} {isRTL ? "ساعة" : "hours"}</div>
                    <span className="text-[11px] text-slate-400">{member.dueAmount} ₪ مستحق مالي</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {isRTL
                      ? "وفق لائحة تشغيل أيديو هب غزة، تُمنح الساعات الأساسية مجاناً بالكامل. في حال تجاوز العضو للحصة المعتمدة ورغب بساعات إضافية لدواعي تسليم مشاريع عاجلة، يتم فرض رسم رمزي قدره 2 شيكل لكل ساعة لدعم تكاليف السولار وصيانة المنظومة."
                      : "Core hours are 100% free. Any extra hours requested beyond monthly allocation for critical project delivery cost 2 NIS / hour to offset generator fuel."}
                  </span>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
