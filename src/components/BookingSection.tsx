"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  UserCheck,
  UserPlus,
  Compass,
  Briefcase,
  GraduationCap,
  CalendarCheck,
  HelpCircle,
  Check,
} from "lucide-react";

type BookingTab = "member" | "new_member" | "visitor";

interface MemberBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  status: "confirmed" | "cancelled";
  notes?: string;
  canCancel: boolean;
}

export default function BookingSection() {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const bp = t.bookingPortal;

  // Active Main Entry Tab (1. Member Login/Hub, 2. New Member Request, 3. Visitor Request)
  const [activeTab, setActiveTab] = useState<BookingTab>("member");

  // Listen for tab switch events from modals or nav buttons
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<BookingTab>;
      if (
        customEvent.detail &&
        ["member", "new_member", "visitor"].includes(customEvent.detail)
      ) {
        setActiveTab(customEvent.detail);
        const section = document.getElementById("booking-section");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    window.addEventListener("switch-booking-tab", handleSwitchTab);
    return () => {
      window.removeEventListener("switch-booking-tab", handleSwitchTab);
    };
  }, []);

  // ═════════════════════════════════════════════════════════════
  // 1. MEMBER STATE (Active Member Login, Balance & Direct Booking)
  // ═════════════════════════════════════════════════════════════
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [memberEmail, setMemberEmail] = useState("sara.freelancer@eduhub.ps");
  const [memberPassword, setMemberPassword] = useState("••••••••");
  const [forgotSent, setForgotSent] = useState(false);

  // Member monthly hours limit (Freelancer MVP rules: 35h/month, 8h/day)
  const monthlyLimit = 35;
  const dailyLimit = 8;

  // Active bookings list
  const [bookings, setBookings] = useState<MemberBooking[]>([
    {
      id: "BK-1042",
      date: "2026-10-22",
      startTime: "09:00",
      endTime: "13:00",
      durationHours: 4,
      status: "confirmed",
      notes: isRTL ? "مذاكرة لامتحان نهاية الفصل" : "Final term exam prep",
      canCancel: true,
    },
  ]);

  // Calculate used and remaining hours
  const hoursUsed = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.durationHours, 14); // 14 hours previously used + current
  const hoursRemaining = Math.max(0, monthlyLimit - hoursUsed);

  // New Booking Form State for Active Member
  const [memberSubView, setMemberSubView] = useState<"book" | "my_bookings">("book");
  const [bookingDate, setBookingDate] = useState("2026-10-22");
  const [startTime, setStartTime] = useState("09:00");
  const [durationHours, setDurationHours] = useState(3);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Calculate calculated end time: start_time + duration_hours
  const calculateEndTime = (start: string, duration: number) => {
    const [hours] = start.split(":").map(Number);
    const endHour = hours + duration;
    return `${String(endHour).padStart(2, "0")}:00`;
  };

  const calculatedEndTime = calculateEndTime(startTime, durationHours);
  const isOutsideWorkingHours = parseInt(calculatedEndTime.split(":")[0], 10) > 16;

  // Handle direct booking submit
  const handleMemberBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    // Business Rule 1: Working hours check (08:00 - 16:00)
    if (isOutsideWorkingHours) {
      setBookingError(
        isRTL
          ? "يجب أن ينتهي الحجز قبل الساعة 16:00 (ساعات عمل المركز من 08:00 إلى 16:00)."
          : "Booking must end before 16:00 (Center hours are 08:00 to 16:00)."
      );
      return;
    }

    // Business Rule 2: Daily limit check
    if (durationHours > dailyLimit) {
      setBookingError(
        isRTL
          ? `الحد اليومي المسموح لعضوية الفريلانسر هو ${dailyLimit} ساعات.`
          : `Daily limit for freelancers is ${dailyLimit} hours.`
      );
      return;
    }

    // Business Rule 3: Monthly balance check
    if (durationHours > hoursRemaining) {
      setBookingError(
        isRTL
          ? `رصيدك المتبقي لهذا الشهر (${hoursRemaining} ساعة) لا يكفي لحجز ${durationHours} ساعات.`
          : `Insufficient monthly hours. You have ${hoursRemaining}h remaining.`
      );
      return;
    }

    // Business Rule 4: One booking per day check
    const hasBookingOnSameDay = bookings.some(
      (b) => b.date === bookingDate && b.status === "confirmed"
    );
    if (hasBookingOnSameDay) {
      setBookingError(
        isRTL
          ? "لديك حجز مؤكد بالفعل في هذا التاريخ. الخطة تسمح بحجز واحد باليوم."
          : "You already have a confirmed booking on this day."
      );
      return;
    }

    // Success: add new booking
    const newBooking: MemberBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      date: bookingDate,
      startTime,
      endTime: calculatedEndTime,
      durationHours,
      status: "confirmed",
      notes: bookingNotes,
      canCancel: true,
    };

    setBookings([newBooking, ...bookings]);
    setBookingSuccess(
      isRTL
        ? `تم تأكيد حجز مقعدك بنجاح (${newBooking.id})! تم خصم ${durationHours} ساعات من رصيدك الشهري.`
        : `Booking confirmed successfully (${newBooking.id})! Deducted ${durationHours} hours.`
    );
    setBookingNotes("");
  };

  // Cancel booking handler (Rule: refund hours immediately)
  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );
  };

  // ═════════════════════════════════════════════════════════════
  // 2. NEW MEMBERSHIP REQUEST STATE (Student / Freelancer - No Password)
  // ═════════════════════════════════════════════════════════════
  const [reqRole, setReqRole] = useState<"student" | "freelancer">("student");
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqSubmitted, setReqSubmitted] = useState(false);

  const handleMembershipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName || !reqEmail || !reqPhone) return;
    setReqSubmitted(true);
  };

  // ═════════════════════════════════════════════════════════════
  // 3. VISITOR ONE-DAY REQUEST STATE (No account)
  // ═════════════════════════════════════════════════════════════
  const [visName, setVisName] = useState("");
  const [visPhone, setVisPhone] = useState("");
  const [visEmail, setVisEmail] = useState("");
  const [visDate, setVisDate] = useState("2026-10-22");
  const [visHours, setVisHours] = useState(2);
  const [visReason, setVisReason] = useState("");
  const [visSubmitted, setVisSubmitted] = useState(false);

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visName || !visPhone || !visDate) return;
    setVisSubmitted(true);
  };

  return (
    <section
      id="booking-section"
      className="py-16 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-white relative border-t border-slate-200/90"
      aria-labelledby="booking-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-extrabold text-emerald-800 mb-3 shadow-2xs">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {bp?.badge || (isRTL ? "بوابة حجز المقاعد ومساحات العمل" : "EduHub Desk & Sanctuary Reservation")}
            </span>
          </div>

          <h2
            id="booking-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy tracking-tight mb-3"
          >
            {bp?.title || (isRTL ? "اختر مسار حجز مقعدك في أيديو هب" : "Choose Your Booking Path at EduHub")}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            {bp?.subtitle || (isRTL ? "نوفر للطلاب والفريلانسرز في غزة بيئة دراسة وعمل مجهزة بالكهرباء المستقرة والإنترنت الفضائي مجاناً 100% وفق خطة تشغيلية منظمة وعادلة." : "Providing Gaza students and freelancers with a free, stable work sanctuary powered by solar energy and Starlink internet.")}
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            3 MAIN ENTRY POINT TABS (As per Specification Document)
           ═════════════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto mb-8">
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner"
            role="tablist"
            aria-label={bp?.title || (isRTL ? "مسارات الحجز في أيديو هب" : "Booking pathways")}
          >
            
            {/* Tab 1: Member Hub */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "member"}
              onClick={() => setActiveTab("member")}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "member"
                  ? "bg-white text-emerald-800 shadow-sm border border-emerald-500/20 ring-1 ring-emerald-500/10"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bp?.tabMember || (isRTL ? "عضو مفعّل (حجز الساعات)" : "Active Member")}</span>
            </button>

            {/* Tab 2: New Member */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "new_member"}
              onClick={() => setActiveTab("new_member")}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "new_member"
                  ? "bg-white text-emerald-800 shadow-sm border border-emerald-500/20 ring-1 ring-emerald-500/10"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bp?.tabNewMember || (isRTL ? "عضو جديد؟ قدّم طلب عضوية" : "New Member Request")}</span>
            </button>

            {/* Tab 3: Visitor */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "visitor"}
              onClick={() => setActiveTab("visitor")}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "visitor"
                  ? "bg-white text-emerald-800 shadow-sm border border-emerald-500/20 ring-1 ring-emerald-500/10"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{bp?.tabVisitor || (isRTL ? "زائر ليوم واحد (بدون حساب)" : "1-Day Visitor Pass")}</span>
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            TAB CONTENT CONTAINER
           ═════════════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10">

          {/* ───────────────────────────────────────────────────────────
              PATH 1: ACTIVE MEMBER (Login / Quota / Direct Booking / Cancel)
             ─────────────────────────────────────────────────────────── */}
          {activeTab === "member" && (
            <div>
              {!isLoggedIn ? (
                /* Login Screen if not logged in */
                <div className="max-w-md mx-auto py-6">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                      <LogIn className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-brand-navy">
                      {bp?.loginTitle || (isRTL ? "تسجيل دخول الأعضاء" : "Member Login")}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {isRTL
                        ? "سجّل دخولك لحجز ساعاتك الأكاديمية والمهنية مباشرة"
                        : "Sign in to reserve your study hours directly"}
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsLoggedIn(true);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="member-login-email" className="block text-xs font-bold text-slate-700 mb-1">
                        {bp?.emailLabel || (isRTL ? "البريد الإلكتروني" : "Email Address")}
                      </label>
                      <input
                        id="member-login-email"
                        type="email"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        placeholder="sara.freelancer@eduhub.ps"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="member-login-password" className="block text-xs font-bold text-slate-700">
                          {bp?.passwordLabel || (isRTL ? "كلمة المرور" : "Password")}
                        </label>
                        <button
                          type="button"
                          onClick={() => setForgotSent(true)}
                          className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                        >
                          {bp?.forgotPassword || (isRTL ? "نسيت كلمة المرور؟" : "Forgot Password?")}
                        </button>
                      </div>
                      <input
                        id="member-login-password"
                        type="password"
                        value={memberPassword}
                        onChange={(e) => setMemberPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                      {forgotSent && (
                        <p className="mt-1.5 text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {bp?.forgotPasswordAlert ||
                              (isRTL
                                ? "سيصلك رابط إعادة التعيين عبر الإيميل المسجل."
                                : "Reset link sent to registered email.")}
                          </span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer text-base active:scale-[0.99]"
                    >
                      {bp?.signInBtn || (isRTL ? "تسجيل الدخول ومتابعة الحجز" : "Sign In to Book")}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("new_member")}
                        className="text-xs text-slate-500 hover:text-emerald-700 font-semibold cursor-pointer"
                      >
                        {bp?.noAccountApply || (isRTL ? "ليس لديك حساب عضوية؟ قدّم طلب جديد" : "Don't have an account? Apply for membership")}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Member Hub: Hours Balance Bar, Booking Form & My Bookings */
                <div className="space-y-6">
                  
                  {/* Member Top Bar: Identity Locked to Freelancer (35 Hours) */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-brand-navy text-emerald-400 flex items-center justify-center font-bold text-base shadow-xs">
                        F
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {isRTL ? "سارة أحمد" : "Sara Ahmed"}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            {isRTL ? "عضوية فريلانسر (35 ساعة/شهر)" : "Freelancer (35h/mo)"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {memberEmail || "sara.freelancer@eduhub.ps"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Logout Button */}
                      <button
                        type="button"
                        onClick={() => setIsLoggedIn(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                        title={bp?.logoutTitle || (isRTL ? "تسجيل الخروج والعودة لشاشة الدخول" : "Log out")}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{bp?.logout || (isRTL ? "تسجيل خروج" : "Log out")}</span>
                      </button>
                    </div>
                  </div>
                  {/* ── Monthly Quota Balance Bar (Official Spec: "استخدمت X من Y ساعة") ── */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border border-emerald-200/90 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs sm:text-sm font-extrabold text-brand-navy">
                          {isRTL
                            ? `استخدمت ${hoursUsed} من ${monthlyLimit} ساعة هذا الشهر`
                            : `Used ${hoursUsed} of ${monthlyLimit} hours this month`}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs self-start sm:self-auto">
                        {isRTL
                          ? `الرصيد المتبقي: ${hoursRemaining} ساعات`
                          : `Remaining: ${hoursRemaining} hours`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-emerald-200/60 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (hoursUsed / monthlyLimit) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
                      <span>
                        {isRTL
                          ? `الحد اليومي المسموح: حتى ${dailyLimit} ساعات يومياً`
                          : `Daily limit: up to ${dailyLimit}h/day`}
                      </span>
                      <span>
                        {isRTL
                          ? "ساعات العمل: 08:00 صباحاً – 04:00 مساءً"
                          : "Working hours: 08:00 – 16:00"}
                      </span>
                    </div>
                  </div>

                  {/* Sub-Tabs: Direct Booking Form vs My Bookings */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setMemberSubView("book")}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        memberSubView === "book"
                          ? "bg-brand-navy text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {bp?.bookNewDesk || (isRTL ? "حجز موعد مقعد جديد" : "Book a New Desk")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberSubView("my_bookings")}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        memberSubView === "my_bookings"
                          ? "bg-brand-navy text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <span>{bp?.myBookings || (isRTL ? "حجوزاتي" : "My Bookings")}</span>
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono">
                        {bookings.filter((b) => b.status === "confirmed").length}
                      </span>
                    </button>
                  </div>

                  {/* ── Sub-View 1: Member Booking Form ── */}
                  {memberSubView === "book" && (
                    <form onSubmit={handleMemberBookingSubmit} className="space-y-5 pt-2">
                      {bookingError && (
                        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2 animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{bookingError}</span>
                        </div>
                      )}

                      {bookingSuccess && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>{bookingSuccess}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Booking Date */}
                        <div>
                          <label htmlFor="member-booking-date" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{bp?.bookingDate || (isRTL ? "تاريخ الحجز" : "Booking Date")}</span>
                          </label>
                          <input
                            id="member-booking-date"
                            type="date"
                            value={bookingDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            required
                          />
                        </div>

                        {/* Start Time (08:00 to 15:00 on the hour) */}
                        <div>
                          <label htmlFor="member-start-time" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{bp?.startTime || (isRTL ? "وقت البداية" : "Start Time")}</span>
                          </label>
                          <select
                            id="member-start-time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                          >
                            <option value="08:00">08:00 صباحاً</option>
                            <option value="09:00">09:00 صباحاً</option>
                            <option value="10:00">10:00 صباحاً</option>
                            <option value="11:00">11:00 صباحاً</option>
                            <option value="12:00">12:00 ظهراً</option>
                            <option value="13:00">01:00 ظهراً</option>
                            <option value="14:00">02:00 ظهراً</option>
                            <option value="15:00">03:00 عصراً</option>
                          </select>
                        </div>

                        {/* Duration Hours (Rule: 1-4 for student, 1-8 for freelancer) */}
                        <div>
                          <label htmlFor="member-duration-hours" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {isRTL
                                ? `المدة (1 - ${dailyLimit} ساعات)`
                                : `Duration (1 - ${dailyLimit}h)`}
                            </span>
                          </label>
                          <select
                            id="member-duration-hours"
                            value={durationHours}
                            onChange={(e) => setDurationHours(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-mono"
                          >
                            {Array.from({ length: dailyLimit }, (_, i) => i + 1).map((h) => (
                              <option key={h} value={h}>
                                {h} {isRTL ? (h === 1 ? "ساعة واحدة" : h === 2 ? "ساعتان" : "ساعات") : `${h} hours`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Auto-Calculated End Time & Policy Preview */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-600">
                            {isRTL ? "وقت النهاية المحسوب تلقائياً:" : "Auto-Calculated End Time:"}
                          </span>
                          <span className="font-mono font-black text-brand-navy text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                            {calculatedEndTime}
                          </span>
                          {isOutsideWorkingHours && (
                            <span className="text-red-600 font-bold">
                              {isRTL ? "(يتجاوز 16:00 نهاية الدوام)" : "(Exceeds 16:00 close)"}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500">
                          {isRTL
                            ? `سيُخصم: ${durationHours} ساعات من رصيدك`
                            : `Will deduct: ${durationHours}h`}
                        </span>
                      </div>

                      {/* Optional Notes */}
                      <div>
                        <label htmlFor="member-booking-notes" className="block text-xs font-bold text-slate-700 mb-1">
                          {isRTL ? "ملاحظات إضافية (اختياري)" : "Notes (Optional)"}
                        </label>
                        <input
                          id="member-booking-notes"
                          type="text"
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          placeholder={
                            isRTL
                              ? "مثال: أحتاج مقعداً هادئاً لاختبار جامعي..."
                              : "e.g., University exam, quiet desk needed..."
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Submit Direct Booking */}
                      <button
                        type="submit"
                        disabled={isOutsideWorkingHours || durationHours > hoursRemaining}
                        className={`w-full py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                          isOutsideWorkingHours || durationHours > hoursRemaining
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]"
                        }`}
                      >
                        <CalendarCheck className="w-5 h-5 text-emerald-100" />
                        <span>{bp?.confirmBtn || (isRTL ? "تأكيد حجز المقعد الآن" : "Confirm Desk Reservation")}</span>
                      </button>
                    </form>
                  )}

                  {/* ── Sub-View 2: Member Bookings & Cancellation ── */}
                  {memberSubView === "my_bookings" && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                        <span>
                          {isRTL
                            ? "سياسة الإلغاء: مسموح قبل بدء الحجز بساعتين على الأقل، ويُسترجع الرصيد تلقائياً."
                            : "Cancellation policy: Allowed up to 2 hours before start, hours refunded automatically."}
                        </span>
                      </div>

                      {bookings.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                          <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-600">
                            {bp?.noBookings || (isRTL ? "لا توجد حجوزات مسجلة حالياً" : "No bookings recorded yet")}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bookings.map((booking) => {
                            const isConfirmed = booking.status === "confirmed";
                            return (
                              <div
                                key={booking.id}
                                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                  isConfirmed
                                    ? "bg-white border-slate-200 shadow-xs"
                                    : "bg-slate-50 border-slate-200 opacity-60"
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-black text-slate-500">
                                      #{booking.id}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                        isConfirmed
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-slate-200 text-slate-700"
                                      }`}
                                    >
                                      {isConfirmed
                                        ? (isRTL ? "حجز مؤكد" : "Confirmed")
                                        : (isRTL ? "تم الإلغاء" : "Cancelled")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm font-extrabold text-brand-navy">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      {booking.date}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 font-mono">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      {booking.startTime} – {booking.endTime} ({booking.durationHours}h)
                                    </span>
                                  </div>
                                  {booking.notes && (
                                    <p className="text-xs text-slate-500 font-normal">
                                      {booking.notes}
                                    </p>
                                  )}
                                </div>

                                {isConfirmed && booking.canCancel && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="px-3.5 py-1.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer self-end sm:self-auto"
                                  >
                                    {isRTL ? "إلغاء الحجز واسترجاع الساعات" : "Cancel & Refund Hours"}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              PATH 2: NEW MEMBERSHIP REQUEST (Student / Freelancer)
             ─────────────────────────────────────────────────────────── */}
          {activeTab === "new_member" && (
            <div>
              {reqSubmitted ? (
                /* Success Message as specified: "طلبك قيد المراجعة، سيصلك إيميل عند الموافقة" */
                <div className="text-center py-10 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-brand-navy">
                    {bp?.newMemberPendingTitle || (isRTL ? "طلب العضوية قيد المراجعة" : "Membership Request Pending")}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                    {isRTL
                      ? "تم استلام طلبك بنجاح وسيقوم فريق الإدارة بمراجعته. فور الموافقة، سيصلك إيميل رسمي يحتوي على رابط لاختيار كلمة المرور وتفعيل حسابك خلال 72 ساعة."
                      : "Your request is under review. Upon approval, you will receive an email with a link to set your password within 72 hours."}
                  </p>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-mono font-bold text-emerald-800">
                    STATUS: status = pending (EduHub Review Team)
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setReqSubmitted(false);
                        setActiveTab("member");
                      }}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      {bp?.returnToHub || (isRTL ? "العودة لبوابة الحجز" : "Return to Hub")}
                    </button>
                  </div>
                </div>
              ) : (
                /* New Membership Application Form (No password field as per spec) */
                <form onSubmit={handleMembershipSubmit} className="space-y-6">
                  
                  {/* Role Selection Cards: Student vs Freelancer */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                      {bp?.step1Membership || (isRTL ? "1. اختر نوع العضوية المطلوبة" : "1. Choose Membership Category")}
                    </label>
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                      role="radiogroup"
                      aria-label={bp?.step1Membership || (isRTL ? "اختر نوع العضوية المطلوبة" : "Choose Membership Category")}
                    >
                      
                      {/* Student Card */}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={reqRole === "student"}
                        onClick={() => setReqRole("student")}
                        className={`p-4 rounded-2xl border text-start transition-all cursor-pointer relative ${
                          reqRole === "student"
                            ? "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-emerald-700" />
                          </div>
                          {reqRole === "student" && (
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="font-extrabold text-brand-navy text-base">
                          {bp?.studentMembership || (isRTL ? "عضوية طالب جامعي" : "University Student")}
                        </div>
                      </button>

                      {/* Freelancer Card */}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={reqRole === "freelancer"}
                        onClick={() => setReqRole("freelancer")}
                        className={`p-4 rounded-2xl border text-start transition-all cursor-pointer relative ${
                          reqRole === "freelancer"
                            ? "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-sky-700" />
                          </div>
                          {reqRole === "freelancer" && (
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="font-extrabold text-brand-navy text-base">
                          {bp?.freelancerMembership || (isRTL ? "عضوية فريلانسر / مستقل" : "Freelancer / Remote")}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Contact Fields: Name, Email, Phone (No Password) */}
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {bp?.step2Info || (isRTL ? "2. البيانات الشخصية وبيانات التواصل" : "2. Personal & Contact Information")}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Name */}
                      <div>
                        <label htmlFor="new-member-fullname" className="block text-xs font-semibold text-slate-600 mb-1">
                          {isRTL ? "الاسم الكامل" : "Full Name"} *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
                          <input
                            id="new-member-fullname"
                            type="text"
                            value={reqName}
                            onChange={(e) => setReqName(e.target.value)}
                            placeholder={isRTL ? "محمد أحمد..." : "Sara Ahmed..."}
                            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="new-member-email" className="block text-xs font-semibold text-slate-600 mb-1">
                          {isRTL ? "البريد الإلكتروني" : "Email Address"} *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
                          <input
                            id="new-member-email"
                            type="email"
                            value={reqEmail}
                            onChange={(e) => setReqEmail(e.target.value)}
                            placeholder="student@example.com"
                            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="new-member-phone" className="block text-xs font-semibold text-slate-600 mb-1">
                          {isRTL ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"} *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
                          <input
                            id="new-member-phone"
                            type="tel"
                            value={reqPhone}
                            onChange={(e) => setReqPhone(e.target.value)}
                            placeholder="059xxxxxxx"
                            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none dir-ltr text-start"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informational Notice as per Document Rules */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {isRTL
                        ? "ملاحظة: لا حاجة لكلمة مرور الآن. عند مراجعة طلبك وموافقته، سيصلك رابط عبر الإيميل لاختيار كلمة المرور الخاصة بك وتفعيل الحساب مباشرة."
                        : "Note: No password is required now. Upon approval, you will receive an activation email with a link to set your password."}
                    </span>
                  </div>

                  {/* Submit Membership Request */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <UserPlus className="w-5 h-5 text-emerald-100" />
                    <span>
                      {isRTL
                        ? "تقديم طلب العضوية للمراجعة"
                        : "Submit Membership Application"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              PATH 3: VISITOR ONE-DAY PASS (No Account Needed)
             ─────────────────────────────────────────────────────────── */}
          {activeTab === "visitor" && (
            <div>
              {visSubmitted ? (
                /* Success Message as specified: "تم استلام طلبك" */
                <div className="text-center py-10 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-brand-navy">
                    {bp?.visitorReceivedTitle || (isRTL ? "تم استلام طلب الزيارة" : "Visitor Request Received")}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                    {isRTL
                      ? "شكراً لتواصلك. ستقوم إدارة المركز بمراجعة طلب الزيارة والتأكد من توفر مقعد شاغر في الموعد المحدد، وسيصلك إشعار بالنتيجة عبر الواتساب أو الإيميل."
                      : "Thank you. The management will review desk availability and notify you with the confirmation."}
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setVisSubmitted(false)}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      {bp?.submitAnotherVisitor || (isRTL ? "تقديم طلب زيارة آخر" : "Submit Another Pass")}
                    </button>
                  </div>
                </div>
              ) : (
                /* Visitor Form: Name, Phone, Email (optional), Date, Hours (1 to 4), Reason */
                <form onSubmit={handleVisitorSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="visitor-fullname" className="block text-xs font-semibold text-slate-600 mb-1">
                        {isRTL ? "الاسم الكامل" : "Full Name"} *
                      </label>
                      <input
                        id="visitor-fullname"
                        type="text"
                        value={visName}
                        onChange={(e) => setVisName(e.target.value)}
                        placeholder={isRTL ? "اسم الزائر..." : "Full Name..."}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="visitor-phone" className="block text-xs font-semibold text-slate-600 mb-1">
                        {isRTL ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"} *
                      </label>
                      <input
                        id="visitor-phone"
                        type="tel"
                        value={visPhone}
                        onChange={(e) => setVisPhone(e.target.value)}
                        placeholder="059xxxxxxx"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none dir-ltr text-start"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Email (Optional) */}
                    <div>
                      <label htmlFor="visitor-email" className="block text-xs font-semibold text-slate-600 mb-1">
                        {isRTL ? "البريد الإلكتروني (اختياري للإشعار)" : "Email (Optional)"}
                      </label>
                      <input
                        id="visitor-email"
                        type="email"
                        value={visEmail}
                        onChange={(e) => setVisEmail(e.target.value)}
                        placeholder="visitor@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Visit Date */}
                    <div>
                      <label htmlFor="visitor-date" className="block text-xs font-semibold text-slate-600 mb-1">
                        {isRTL ? "تاريخ الزيارة (اليوم أو بعده)" : "Visit Date"} *
                      </label>
                      <input
                        id="visitor-date"
                        type="date"
                        value={visDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setVisDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* Expected Hours (1 to 4) */}
                    <div>
                      <label htmlFor="visitor-hours" className="block text-xs font-semibold text-slate-600 mb-1">
                        {isRTL ? "عدد الساعات (1 إلى 4)" : "Hours (1 to 4)"} *
                      </label>
                      <select
                        id="visitor-hours"
                        value={visHours}
                        onChange={(e) => setVisHours(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-mono"
                      >
                        <option value={1}>1 {isRTL ? "ساعة" : "hour"}</option>
                        <option value={2}>2 {isRTL ? "ساعتان" : "hours"}</option>
                        <option value={3}>3 {isRTL ? "ساعات" : "hours"}</option>
                        <option value={4}>4 {isRTL ? "ساعات" : "hours"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  <div>
                    <label htmlFor="visitor-reason" className="block text-xs font-semibold text-slate-600 mb-1">
                      {isRTL ? "سبب الزيارة (اختياري)" : "Reason for Visit (Optional)"}
                    </label>
                    <textarea
                      id="visitor-reason"
                      rows={2}
                      value={visReason}
                      onChange={(e) => setVisReason(e.target.value)}
                      placeholder={
                        isRTL
                          ? "مثال: تقديم امتحان إلكتروني، اجتماع عمل عن بعد، شحن بطارية حاسوب..."
                          : "e.g., Online university exam, remote interview, urgent charging..."
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Submit Visitor Pass */}
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white bg-brand-navy hover:bg-brand-navy-hover shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Compass className="w-5 h-5 text-emerald-400" />
                    <span>{bp?.submitVisitorBtn || (isRTL ? "إرسال طلب الزيارة" : "Submit Visitor Pass Request")}</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
