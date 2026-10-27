"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  CalendarCheck,
  Loader2,
  KeyRound,
  X,
} from "lucide-react";
import { MemberBooking } from "./types";
import {
  memberLoginApi,
  createMemberBookingApi,
  cancelMemberBookingApi,
  changeMemberPasswordApi,
  MemberData,
  setMemberAuthSession,
  getMemberAuthSession,
  clearMemberAuthSession,
  getMemberBookingsApi,
  setAdminAuthSession,
} from "@/services/applications";

interface MemberBookingTabProps {
  onApplyNewMember: () => void;
}

const ALL_TIME_SLOTS = [
  { value: "08:00", hour: 8, labelAr: "08:00 صباحاً", labelEn: "08:00 AM" },
  { value: "09:00", hour: 9, labelAr: "09:00 صباحاً", labelEn: "09:00 AM" },
  { value: "10:00", hour: 10, labelAr: "10:00 صباحاً", labelEn: "10:00 AM" },
  { value: "11:00", hour: 11, labelAr: "11:00 صباحاً", labelEn: "11:00 AM" },
  { value: "12:00", hour: 12, labelAr: "12:00 ظهراً", labelEn: "12:00 PM" },
  { value: "13:00", hour: 13, labelAr: "01:00 ظهراً", labelEn: "01:00 PM" },
  { value: "14:00", hour: 14, labelAr: "02:00 ظهراً", labelEn: "02:00 PM" },
  { value: "15:00", hour: 15, labelAr: "03:00 عصراً", labelEn: "03:00 PM" },
];

const getLocalFormattedDate = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function MemberBookingTab({ onApplyNewMember }: MemberBookingTabProps) {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const bp = t.bookingPortal;

  // 1. MEMBER STATE (Active Member Login, Balance & Direct Booking)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [authToken, setAuthToken] = useState<string>("");

  // Member monthly hours limit
  const monthlyLimit = memberData?.monthlyLimit ?? 35;
  const dailyLimit = memberData?.dailyLimit ?? 8;

  // Active bookings list
  const [bookings, setBookings] = useState<MemberBooking[]>([]);

  // Calculate used and remaining hours
  const hoursUsed = memberData?.hoursUsed ?? 0;
  const hoursRemaining = memberData?.hoursRemaining ?? Math.max(0, monthlyLimit - hoursUsed);

  // Day-based Booking Form State for Active Member
  const [memberSubView, setMemberSubView] = useState<"book" | "my_bookings">("book");
  const [todayStr, setTodayStr] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingWarning, setBookingWarning] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Change password modal state
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassError, setChangePassError] = useState<string | null>(null);
  const [changePassSuccess, setChangePassSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      const today = getLocalFormattedDate(0);
      setTodayStr(today);
      setBookingDate(today);

      // ── Restore active member session on page refresh (F5) ──
      const session = getMemberAuthSession();
      if (session && session.token && session.member) {
        setAuthToken(session.token);
        setMemberData(session.member);
        setIsLoggedIn(true);

        if (session.member.bookings && session.member.bookings.length > 0) {
          setBookings(
            session.member.bookings.map((b) => {
              const bId = String(b.id || b.booking_code || "");
              const startRaw = b.startTime || b.start_time || "08:00";
              const endRaw = b.endTime || b.end_time || "16:00";
              const duration = Number(b.durationHours ?? b.duration_hours ?? 8);
              return {
                id: bId,
                date: b.date,
                startTime: startRaw.substring(0, 5),
                endTime: endRaw.substring(0, 5),
                durationHours: duration,
                status: (b.status as "confirmed" | "cancelled") || "confirmed",
                notes: b.notes || "",
                canCancel: b.status === "confirmed",
              };
            })
          );
        }

        // Silently sync latest bookings from backend
        getMemberBookingsApi(session.token)
          .then((freshBookings) => {
            if (!isMounted || !Array.isArray(freshBookings) || freshBookings.length === 0) return;
            setBookings(
              freshBookings.map((b: Record<string, unknown>) => {
                const bId = String(b.id || b.booking_code || "");
                const startRaw = String(b.startTime || b.start_time || "08:00");
                const endRaw = String(b.endTime || b.end_time || "16:00");
                const duration = Number(b.hours_count ?? b.durationHours ?? b.duration_hours ?? 8);
                const bDate = String(b.date || b.booking_date || "");
                return {
                  id: bId,
                  date: bDate.length >= 10 ? bDate.substring(0, 10) : bDate,
                  startTime: startRaw.substring(0, 5),
                  endTime: endRaw.substring(0, 5),
                  durationHours: duration,
                  status: (b.status as "confirmed" | "cancelled") || "confirmed",
                  notes: String(b.notes || ""),
                  canCancel: b.status === "confirmed",
                };
              })
            );
          })
          .catch(() => {});
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError(null);
    setChangePassSuccess(null);

    if (!currentPass.trim()) {
      setChangePassError(
        isRTL ? "يرجى إدخال كلمة المرور الحالية." : "Please enter your current password."
      );
      return;
    }
    if (newPass.length < 6) {
      setChangePassError(
        isRTL
          ? "يجب أن لا تقل كلمة المرور الجديدة عن 6 خانات."
          : "New password must be at least 6 characters."
      );
      return;
    }
    if (newPass !== confirmPass) {
      setChangePassError(
        isRTL ? "كلمتا المرور الجديدتان غير متطابقتين." : "Passwords do not match."
      );
      return;
    }

    setChangePassLoading(true);
    try {
      const res = await changeMemberPasswordApi(authToken, currentPass, newPass, confirmPass);
      setChangePassSuccess(
        res.message || (isRTL ? "تم تغيير كلمة المرور بنجاح!" : "Password changed successfully!")
      );
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => {
        setChangePassOpen(false);
        setChangePassSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setChangePassError(
        msg ||
          (isRTL
            ? "تعذر تغيير كلمة المرور. تأكد من كلمة المرور الحالية."
            : "Failed to change password.")
      );
    } finally {
      setChangePassLoading(false);
    }
  };


  // Handle member login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!memberEmail.trim() || !memberPassword.trim()) {
      setLoginError(
        isRTL
          ? "يرجى إدخال البريد الإلكتروني وكلمة المرور."
          : "Please enter your email and password."
      );
      return;
    }

    setLoginLoading(true);
    try {
      const res = await memberLoginApi(memberEmail.trim(), memberPassword);

      // ── Single Unified Login: If authenticated user is Admin, redirect to /admin ──
      const userRole = res.user?.role || (res.member as unknown as { role?: string })?.role;
      if (userRole === "admin") {
        setAdminAuthSession({
          token: res.token,
          admin: {
            id: Number(res.user?.id || res.member?.id || 1),
            name: res.user?.name || res.member?.name || "مدير النظام",
            email: res.user?.email || res.member?.email || memberEmail,
            role: "admin",
          },
        });
        window.location.href = "/admin";
        return;
      }

      setAuthToken(res.token);
      setMemberData(res.member);
      setIsLoggedIn(true);

      // Persist member session so refresh keeps the user logged in
      setMemberAuthSession({ token: res.token, member: res.member });

      if (res.member.bookings && res.member.bookings.length > 0) {
        setBookings(
          res.member.bookings.map((b) => {
            const bId = String(b.id || b.booking_code || "");
            const startRaw = b.startTime || b.start_time || "09:00";
            const endRaw = b.endTime || b.end_time || "13:00";
            const duration = Number(b.durationHours ?? b.duration_hours ?? 0);
            return {
              id: bId,
              date: b.date,
              startTime: startRaw.substring(0, 5),
              endTime: endRaw.substring(0, 5),
              durationHours: duration,
              status: (b.status as "confirmed" | "cancelled") || "confirmed",
              notes: b.notes || "",
              canCancel: b.status === "confirmed",
            };
          })
        );
      } else {
        setBookings([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setLoginError(
        msg ||
          (isRTL
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يتم اعتماد عضويتك بعد."
            : "Invalid credentials or membership not approved yet.")
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearMemberAuthSession();
    setIsLoggedIn(false);
    setAuthToken("");
    setMemberData(null);
    setMemberPassword("");
    setBookings([]);
    setBookingError(null);
    setBookingSuccess(null);
  };

  // Handle day-based booking submit
  const handleMemberBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingWarning(null);
    setBookingSuccess(null);

    // Business Rule 0: Past date check
    const localToday = getLocalFormattedDate(0);
    if (bookingDate < localToday) {
      setBookingError(
        isRTL
          ? "لا يمكن حجز موعد لتاريخ سابق. يرجى اختيار تاريخ اليوم أو تاريخ مستقبلي."
          : "Cannot book for a past date. Please select today or a future date."
      );
      return;
    }

    // Business Rule: One booking per day check
    const hasBookingOnSameDay = bookings.some(
      (b) => b.date === bookingDate && b.status === "confirmed"
    );
    if (hasBookingOnSameDay) {
      setBookingError(
        isRTL
          ? "لديك حجز مؤكد بالفعل في هذا التاريخ. خطة العضوية تسمح بحجز واحد باليوم."
          : "You already have a confirmed booking on this day."
      );
      return;
    }

    setBookingLoading(true);
    try {
      if (authToken) {
        const res = await createMemberBookingApi(authToken, {
          date: bookingDate,
          notes: bookingNotes,
        });

        const b = res.booking || res.data || {};
        const bId = String(b.id || b.booking_code || `BK-${Date.now().toString().slice(-4)}`);

        const newBooking: MemberBooking = {
          id: bId,
          date: b.date || bookingDate,
          startTime: "08:00",
          endTime: "16:00",
          durationHours: 8,
          status: "confirmed",
          notes: b.notes || "",
          canCancel: true,
        };

        setBookings((prev) => [newBooking, ...prev]);

        if (res.warning) {
          setBookingWarning(res.warning);
        }

        setBookingSuccess(
          isRTL
            ? `تم تأكيد حجز مقعدك بنجاح لتاريخ (${newBooking.date})! يمكنك الحضور في أي وقت بين 08:00 ص و 04:00 م، وسيبدأ احتساب الساعات عند وصولك الفعلي وحتى خروجك.`
            : `Booking confirmed successfully for ${newBooking.date}! Hours will start counting from your actual check-in.`
        );
        setBookingNotes("");
      } else {
        throw new Error(
          isRTL
            ? "جلسة الدخول غير صالحة. يرجى تسجيل الدخول مجدداً لإتمام الحجز من السيرفر."
            : "Session invalid. Please sign in again to book from the server."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setBookingError(msg || (isRTL ? "فشل تأكيد الحجز." : "Failed to confirm booking."));
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel booking handler
  const handleCancelBooking = async (bookingId: string) => {
    try {
      if (authToken) {
        const res = await cancelMemberBookingApi(authToken, bookingId);
        if (res.member) {
          setMemberData(res.member);
          setMemberAuthSession({ token: authToken, member: res.member });
        } else if (memberData) {
          const updatedMember: MemberData = {
            ...memberData,
            bookings: memberData.bookings.map((b) =>
              b.id === bookingId ? { ...b, status: "cancelled" } : b
            ),
          };
          setMemberData(updatedMember);
          setMemberAuthSession({ token: authToken, member: updatedMember });
        }
      }
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled", canCancel: false } : b))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setBookingError(msg || (isRTL ? "تعذر إلغاء الحجز." : "Failed to cancel booking."));
    }
  };

  return (
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

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label htmlFor="member-login-email" className="block text-xs font-bold text-slate-700 mb-1">
                {bp?.emailLabel || (isRTL ? "البريد الإلكتروني أو اسم المستخدم" : "Email Address or Username")}
              </label>
              <input
                id="member-login-email"
                type="text"
                autoComplete="username"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder={isRTL ? "example@domain.com أو admin" : "example@domain.com or admin"}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-start"
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
                required
                value={memberPassword}
                onChange={(e) => setMemberPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
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
              disabled={loginLoading}
              className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer text-base active:scale-[0.99] flex items-center justify-center gap-2 disabled:bg-emerald-400"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جاري التحقق وتسجيل الدخول..." : "Signing in..."}</span>
                </>
              ) : (
                <span>{bp?.signInBtn || (isRTL ? "تسجيل الدخول ومتابعة الحجز" : "Sign In to Book")}</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/join"
                onClick={onApplyNewMember}
                className="text-xs text-slate-500 hover:text-emerald-700 font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
              >
                <span>{bp?.noAccountApply || (isRTL ? "ليس لديك حساب عضوية؟ قدّم طلب جديد" : "Don't have an account? Apply for membership")}</span>
                <span>↗</span>
              </Link>
            </div>
          </form>
        </div>
      ) : (
        /* Member Hub: Hours Balance Bar, Booking Form & My Bookings */
        <div className="space-y-6">
          
          {/* Member Top Bar: Identity & Quota */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-navy to-slate-800 text-emerald-400 flex items-center justify-center font-black text-base shadow-2xs ring-1 ring-emerald-500/20 shrink-0">
                {(memberData?.name || "M").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                  {memberData?.name || (isRTL ? "عضو مسجل" : "Registered Member")}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                  {memberData?.email || memberEmail}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              {/* Change Password Button */}
              <button
                type="button"
                onClick={() => {
                  setChangePassOpen(true);
                  setChangePassError(null);
                  setChangePassSuccess(null);
                  setCurrentPass("");
                  setNewPass("");
                  setConfirmPass("");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                title={isRTL ? "تغيير كلمة المرور الخاصة بك" : "Change your password"}
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isRTL ? "تغيير كلمة المرور" : "Change Password"}</span>
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                title={bp?.logoutTitle || (isRTL ? "تسجيل الخروج والعودة لشاشة الدخول" : "Log out")}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{bp?.logout || (isRTL ? "تسجيل خروج" : "Log out")}</span>
              </button>
            </div>
          </div>

          {/* ── Monthly Quota Balance Bar ── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border border-emerald-100/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold text-brand-navy">
                  {isRTL
                    ? `استخدمت ${hoursUsed} من ${monthlyLimit} ساعة هذا الشهر`
                    : `Used ${hoursUsed} of ${monthlyLimit} hours this month`}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-white/95 px-3 py-1 rounded-full border border-emerald-200/80 shadow-2xs self-start sm:self-auto">
                {isRTL
                  ? `الرصيد المتبقي: ${hoursRemaining} ${hoursRemaining >= 3 && hoursRemaining <= 10 ? "ساعات" : "ساعة"}`
                  : `Remaining: ${hoursRemaining} hours`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-emerald-100/80 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (hoursUsed / monthlyLimit) * 100)}%` }}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 mt-2.5 font-medium">
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
          <div className="p-1 bg-slate-100/80 rounded-2xl border border-slate-200/70 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMemberSubView("book")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                memberSubView === "book"
                  ? "bg-brand-navy text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <span>{bp?.bookNewDesk || (isRTL ? "حجز موعد مقعد جديد" : "Book a New Desk")}</span>
            </button>
            <button
              type="button"
              onClick={() => setMemberSubView("my_bookings")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                memberSubView === "my_bookings"
                  ? "bg-brand-navy text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <span>{bp?.myBookings || (isRTL ? "حجوزاتي" : "My Bookings")}</span>
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                memberSubView === "my_bookings"
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-100 text-emerald-800"
              }`}>
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

              {bookingWarning && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{bookingWarning}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* 1. Date Selector */}
                <div>
                  <label htmlFor="member-booking-date" className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{bp?.bookingDate || (isRTL ? "تاريخ اليوم المطلوب حجزه" : "Reservation Date")}</span>
                  </label>
                  <input
                    id="member-booking-date"
                    type="date"
                    value={bookingDate}
                    min={todayStr}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 hover:border-slate-300 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs bg-white text-slate-800"
                    required
                  />
                </div>

                {/* 2. Flexible Attendance & Working Hours Policy Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-slate-50 to-white border border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{isRTL ? "حجز مقعد مرن ليوم كامل" : "Full-Day Flexible Seat Booking"}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600 font-mono">
                      08:00 ص – 04:00 م
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {isRTL
                      ? "• لا يشترط وقت حضور محدد، يمكنك الوصول في أي وقت يناسبك خلال ساعات الدوام."
                      : "• You can arrive at any convenient time during center hours."}
                    <br />
                    {isRTL
                      ? "• يبدأ احتساب الساعات عند وصولك الفعلي وتسجيل دخولك بالاستقبال وحتى مغادرتك (بحد أقصى 8 ساعات)."
                      : "• Hours count starts upon your actual check-in until check-out (up to 8 hours daily)."}
                    <br />
                    {isRTL
                      ? "• لن يتم خصم أي ساعات مسبقاً من رصيدك، الخصم يتم فقط على وقت تواجدك الفعلي."
                      : "• No hours are deducted in advance; deductions reflect actual time spent."}
                  </p>
                </div>
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
                      ? "مثال: أحتاج مقعداً هادئاً للمذاكرة..."
                      : "e.g., Study session, quiet desk needed..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 hover:border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs bg-white"
                />
              </div>

              {/* Submit Direct Booking */}
              <button
                type="submit"
                disabled={!bookingDate || bookingLoading}
                className={`w-full py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  !bookingDate || bookingLoading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]"
                }`}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isRTL ? "جاري تأكيد الحجز..." : "Confirming reservation..."}</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-5 h-5 text-emerald-100" />
                    <span>{bp?.confirmBtn || (isRTL ? "تأكيد حجز المقعد الآن" : "Confirm Desk Reservation")}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Sub-View 2: Member Bookings & Cancellation ── */}
          {memberSubView === "my_bookings" && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  {isRTL
                    ? "سياسة الإلغاء: مسموح بإلغاء حجز المقعد في أي وقت قبل تسجيل الدخول الفعلي أو قبل انتهاء يوم العمل (16:00)."
                    : "Cancellation policy: You can cancel your desk reservation anytime before check-in or before 16:00."}
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
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isConfirmed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {isConfirmed
                                ? (isRTL ? "حجز مقعد مؤكد — بانتظار حضورك" : "Confirmed — Awaiting Visit")
                                : (isRTL ? "ملغي / لم يحضر" : "Cancelled / No-Show")}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-extrabold text-brand-navy">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {booking.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono text-slate-600 font-normal text-xs">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {isRTL ? "08:00 ص – 04:00 م (حسب وقت حضورك الفعلي)" : "08:00 – 16:00 (counted on arrival)"}
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
                            {isRTL ? "إلغاء حجز المقعد" : "Cancel Reservation"}
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

      {/* ── Change Password Modal ── */}
      {changePassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {isRTL ? "تغيير كلمة المرور" : "Change Password"}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isRTL ? "قم بتعيين كلمة مرور خاصة وسهلة التذكر" : "Set a secure personal password"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChangePassOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {changePassError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{changePassError}</span>
              </div>
            )}

            {changePassSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{changePassSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "كلمة المرور الحالية (المؤقتة):" : "Current (Temporary) Password:"}
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "كلمة المرور الجديدة:" : "New Password:"}
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRTL ? "تأكيد كلمة المرور الجديدة:" : "Confirm New Password:"}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={changePassLoading}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-400"
                >
                  {changePassLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRTL ? "جاري التحديث..." : "Updating..."}</span>
                    </>
                  ) : (
                    <span>{isRTL ? "حفظ كلمة المرور الجديدة" : "Save New Password"}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setChangePassOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
