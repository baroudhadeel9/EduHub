"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  Loader2,
  Armchair,
  Zap,
} from "lucide-react";
import { MemberBooking } from "./types";
import { getRoomsOverviewApi, RoomItem, SeatItem } from "@/services/roomSeats";
import ChangePasswordModal from "./member/ChangePasswordModal";
import MemberBookingsList from "./member/MemberBookingsList";
import MemberLoginForm from "./member/MemberLoginForm";
import MemberQuotaHeader from "./member/MemberQuotaHeader";
import MemberAchievementsTab from "./member/MemberAchievementsTab";
import {
  memberLoginApi,
  createMemberBookingApi,
  cancelMemberBookingApi,
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

const cleanBookingDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const s = String(dateStr).trim();
  if (s.includes("T")) return s.split("T")[0];
  if (s.includes(" ")) return s.split(" ")[0];
  return s.replace(/\.0+Z?$/i, "").replace(/Z$/i, "");
};

const formatHour12 = (timeStr?: string): string => {
  if (!timeStr) return "";
  const clean = String(timeStr).trim().replace(/[A-Za-z]/g, "");
  const parts = clean.split(":");
  let hour = parseInt(parts[0], 10);
  if (isNaN(hour)) return timeStr;
  const minute = parts[1] && parts[1].length >= 2 ? parts[1].slice(0, 2) : "00";
  const period = hour >= 12 ? "م" : "ص";
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return minute === "00" ? `${hour} ${period}` : `${hour}:${minute} ${period}`;
};

const getFormattedRoomName = (nameAr: string, roomKey?: string) => {
  if (roomKey === "female_hall" || nameAr?.includes("إناث") || nameAr?.includes("صبايا")) {
    return "صالة الإناث";
  }
  return "صالة الشباب";
};

const mapRawBookingToMemberBooking = (b: Record<string, unknown>): MemberBooking => {
  const bId = String(b.id || b.booking_code || "");
  const startRaw = String(b.startTime || b.start_time || "08:00");
  const endRaw = String(b.endTime || b.end_time || "16:00");
  const duration = Number(b.hours_count ?? b.durationHours ?? b.duration_hours ?? 8);
  const rawDate = String(b.date || b.booking_date || "");
  const cleanDate = rawDate.length >= 10 ? rawDate.substring(0, 10) : rawDate;

  const seatNum = (b.seatNumber ?? b.seat_number ?? (b.seat as Record<string, unknown>)?.seat_number) as number | undefined;
  const seatLbl = (b.seatLabel ?? b.seat_label ?? (b.seat as Record<string, unknown>)?.label) as string | undefined;
  const seatCd = (b.seatCode ?? b.seat_code ?? (b.seat as Record<string, unknown>)?.code) as string | undefined;
  const rmName = (b.roomName ?? b.room_name ?? (b.room as Record<string, unknown>)?.name_ar) as string | undefined;

  const rawStatus = String(b.status || "confirmed");
  const attStatus = String(
    b.attendance_status ||
    b.attendanceStatus ||
    (rawStatus === "attended" ? "attended" : rawStatus === "inside" ? "inside" : rawStatus === "no_show" ? "no_show" : rawStatus === "cancelled" ? "cancelled" : "confirmed")
  );

  return {
    id: bId,
    date: cleanDate,
    startTime: startRaw.substring(0, 5),
    endTime: endRaw.substring(0, 5),
    durationHours: duration,
    status: attStatus,
    notes: String(b.notes || ""),
    canCancel: b.can_cancel !== undefined ? Boolean(b.can_cancel) : (rawStatus === "confirmed" && attStatus === "confirmed"),
    seatNumber: seatNum ? Number(seatNum) : undefined,
    seatLabel: seatLbl ? String(seatLbl) : undefined,
    seatCode: seatCd ? String(seatCd) : undefined,
    roomName: rmName ? String(rmName) : undefined,
    dayName: (b.day_name || b.dayName) as string | undefined,
    bookingDateFormatted: (b.booking_date_formatted || b.bookingDateFormatted) as string | undefined,
    attendanceStatus: attStatus,
    statusBadge: (b.status_badge || b.statusBadge || attStatus) as string,
    statusLabel: (b.status_label || b.statusLabel) as string | undefined,
    attendanceSummary: (b.attendance_summary || b.attendanceSummary) as string | undefined,
    checkInTime: (b.check_in_time || b.checkInTime) as string | undefined,
    checkOutTime: (b.check_out_time || b.checkOutTime) as string | undefined,
    recordedHours: b.recorded_hours !== undefined ? Number(b.recorded_hours) : (b.recordedHours !== undefined ? Number(b.recordedHours) : undefined),
    cancellationReason: (b.cancellation_reason || b.cancellationReason) as string | undefined,
  };
};

export default function MemberBookingTab({ onApplyNewMember }: MemberBookingTabProps) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const bp = t.bookingPortal;

  // 1. MEMBER STATE (Active Member Login, Balance & Direct Booking)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [memberEmail, setMemberEmail] = useState("");
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
  const [memberSubView, setMemberSubView] = useState<"book" | "my_bookings" | "achievements">("book");
  const [todayStr, setTodayStr] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingWarning, setBookingWarning] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Interactive Seat Selection State (Desks 1 to 20)
  const [selectedSeat, setSelectedSeat] = useState<SeatItem | null>(null);
  const [availableRooms, setAvailableRooms] = useState<RoomItem[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [loadingSeats, setLoadingSeats] = useState<boolean>(false);
  const [maxBookingDateStr, setMaxBookingDateStr] = useState<string>("");
  const [windowNotice, setWindowNotice] = useState<string>("");

  const activeRoom = useMemo(() => {
    return availableRooms.find((r) => r.id === selectedRoomId) || availableRooms[0] || null;
  }, [availableRooms, selectedRoomId]);

  // Dynamic Shift & Hourly Time-Slot Sharing State
  const [bookingStartTime, setBookingStartTime] = useState<string>("08:00");
  const [bookingEndTime, setBookingEndTime] = useState<string>("16:00");

  // Change password modal state
  const [changePassOpen, setChangePassOpen] = useState(false);

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
            session.member.bookings.map((b) =>
              mapRawBookingToMemberBooking(b as unknown as Record<string, unknown>)
            )
          );
        }

        // Silently sync latest bookings with full attendance from backend
        getMemberBookingsApi(session.token)
          .then((freshBookings) => {
            if (!isMounted || !Array.isArray(freshBookings) || freshBookings.length === 0) return;
            setBookings(
              freshBookings.map((b: Record<string, unknown>) =>
                mapRawBookingToMemberBooking(b)
              )
            );
          })
          .catch(() => {});
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch available rooms & seats whenever bookingDate or member changes (Direct server consumer)
  useEffect(() => {
    if (!isLoggedIn || !bookingDate) return;
    let isCancelled = false;

    setLoadingSeats(true);
    setBookingError(null);

    getRoomsOverviewApi(bookingDate, undefined, memberData?.gender, authToken, bookingStartTime, bookingEndTime)
      .then((res) => {
        if (isCancelled) return;

        // 1. Sync server-calculated booking window limits & notice
        if (res.booking_window) {
          if (res.booking_window.min_date) setTodayStr(res.booking_window.min_date);
          if (res.booking_window.max_date) setMaxBookingDateStr(res.booking_window.max_date);
          if (res.booking_window.message) setWindowNotice(res.booking_window.message);
          if (res.booking_window.is_friday) {
            setBookingError(
              isRTL
                ? "عذراً، يوم الجمعة عطلة رسمية في مركز EduHub والمقر مغلق. الحجوزات متاحة من السبت إلى الخميس."
                : "Friday is the official weekly day-off."
            );
            setAvailableRooms([]);
            return;
          }
        }

        // 2. Populate available rooms & seats
        if (res.rooms && res.rooms.length > 0) {
          setAvailableRooms(res.rooms);
          setSelectedRoomId((prev) => {
            if (prev && res.rooms.some((r) => r.id === prev)) return prev;
            return res.rooms[0].id;
          });
          // Update selected seat if already picked
          setSelectedSeat((prevSeat) => {
            if (!prevSeat) return null;
            for (const r of res.rooms) {
              const match = r.seats.find((s) => s.id === prevSeat.id);
              if (match && (match.is_available || match.can_book_remaining)) {
                return match;
              }
            }
            return null;
          });
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        const msg = err instanceof Error ? err.message : "";
        if (msg) setBookingError(msg);
      })
      .finally(() => {
        if (!isCancelled) setLoadingSeats(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [bookingDate, bookingStartTime, bookingEndTime, isLoggedIn, memberData?.gender, authToken, isRTL]);

  // Handle member login
  const handleLogin = async (emailInput: string, passwordInput: string) => {
    setLoginError(null);

    if (!emailInput.trim() || !passwordInput.trim()) {
      setLoginError(
        isRTL
          ? "يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور."
          : "Please enter your email or phone and password."
      );
      return;
    }

    setLoginLoading(true);
    try {
      const res = await memberLoginApi(emailInput.trim(), passwordInput);

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
        router.push("/admin");
        return;
      }

      setAuthToken(res.token);
      setMemberData(res.member);
      setIsLoggedIn(true);

      // Persist member session so refresh keeps the user logged in
      setMemberAuthSession({ token: res.token, member: res.member });

      if (res.member.bookings && res.member.bookings.length > 0) {
        setBookings(
          res.member.bookings.map((b) =>
            mapRawBookingToMemberBooking(b as unknown as Record<string, unknown>)
          )
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

    if (!selectedSeat) {
      setBookingError(
        isRTL
          ? "يرجى اختيار مقعدك المفضل من قائمة المقاعد المتاحة أدناه لإتمام الحجز."
          : "Please select your preferred desk from the available desks below to complete your booking."
      );
      return;
    }

    setBookingLoading(true);
    try {
      if (authToken) {
        const durationHours = Math.max(
          1,
          parseInt(bookingEndTime.split(":")[0]) - parseInt(bookingStartTime.split(":")[0])
        );

        const res = await createMemberBookingApi(authToken, {
          date: bookingDate,
          startTime: bookingStartTime,
          endTime: bookingEndTime,
          durationHours,
          notes: bookingNotes,
          seat_id: selectedSeat?.id,
          room_id: selectedRoomId || undefined,
        });

        const b = res.booking || res.data || {};
        const bId = String(b.id || b.booking_code || `BK-${Date.now().toString().slice(-4)}`);

        const seatObj = (b.seat as Record<string, unknown>) || {};
        const roomObj = (b.room as Record<string, unknown>) || {};
        const assignedSeatNum = selectedSeat?.seat_number || (seatObj.seat_number as number | undefined);
        const assignedSeatLabel = selectedSeat?.label || (seatObj.label as string | undefined) || (assignedSeatNum ? `مقعد ${assignedSeatNum}` : undefined);
        const assignedSeatCode = selectedSeat?.code || (seatObj.code as string | undefined);
        const assignedRoomName = (roomObj.name_ar as string | undefined) || (selectedRoomId ? availableRooms.find(r => r.id === selectedRoomId)?.name_ar : undefined);

        const newBooking: MemberBooking = {
          id: bId,
          date: b.date || bookingDate,
          startTime: bookingStartTime,
          endTime: bookingEndTime,
          durationHours: durationHours,
          status: "confirmed",
          notes: b.notes || "",
          canCancel: true,
          seatNumber: assignedSeatNum,
          seatLabel: assignedSeatLabel,
          seatCode: assignedSeatCode,
          roomName: assignedRoomName,
          attendanceStatus: "confirmed",
          statusBadge: "confirmed",
          statusLabel: isRTL ? "حجز مؤكد — بانتظار حضورك" : "Confirmed — Awaiting Visit",
          attendanceSummary: isRTL ? "حجز مقعد مجدول وبانتظار تسجيل الوصول لدى الاستقبال" : "Scheduled desk reservation",
        };

        setBookings((prev) => [newBooking, ...prev]);

        // Refresh rooms overview so the seat map immediately shows updated availability
        getRoomsOverviewApi(bookingDate, undefined, memberData?.gender, authToken, bookingStartTime, bookingEndTime)
          .then((overviewRes) => {
            if (overviewRes && overviewRes.rooms) {
              setAvailableRooms(overviewRes.rooms);
            }
          })
          .catch(() => {});

        if (res.warning) {
          setBookingWarning(res.warning);
        }

        const seatLabel = selectedSeat ? selectedSeat.label : (isRTL ? "مقعد دراسي مخصص" : "Assigned desk");
        setBookingSuccess(
          isRTL
            ? `تم تأكيد حجزك بنجاح (${seatLabel}) لتاريخ (${cleanBookingDate(newBooking.date)}) للفترة (${formatHour12(bookingStartTime)} – ${formatHour12(bookingEndTime)})!`
            : `Booking confirmed successfully (${seatLabel}) for ${cleanBookingDate(newBooking.date)} (${formatHour12(bookingStartTime)} – ${formatHour12(bookingEndTime)})!`
        );
        setSelectedSeat(null);
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
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: "cancelled",
                attendanceStatus: "cancelled",
                statusBadge: "cancelled",
                statusLabel: isRTL ? "ملغي" : "Cancelled",
                attendanceSummary: isRTL ? "تم إلغاء الحجز بواسطة العضو" : "Cancelled by member",
                canCancel: false,
              }
            : b
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setBookingError(msg || (isRTL ? "تعذر إلغاء الحجز." : "Failed to cancel booking."));
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        <MemberLoginForm
          email={memberEmail}
          onEmailChange={setMemberEmail}
          onLogin={handleLogin}
          loading={loginLoading}
          error={loginError}
          onApplyNewMember={onApplyNewMember}
        />
      ) : (
        /* Member Hub: Hours Balance Bar, Booking Form & My Bookings (Single Unified Card) */
        <div className="max-w-4xl w-full mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-8 md:p-10 space-y-6 animate-in fade-in">
          <MemberQuotaHeader
            memberName={memberData?.name || ""}
            memberEmail={memberData?.email || memberEmail}
            hoursUsed={hoursUsed}
            monthlyLimit={monthlyLimit}
            hoursRemaining={hoursRemaining}
            dailyLimit={dailyLimit}
            memberSubView={memberSubView}
            confirmedBookingsCount={bookings.filter((b) => b.status === "confirmed").length}
            onSelectSubView={setMemberSubView}
            onOpenChangePassword={() => setChangePassOpen(true)}
            onLogout={handleLogout}
          />

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
                {/* Important Attendance Rule Notice */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-2.5 text-amber-950 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-amber-950">
                      {isRTL ? "تنبيه هام بشأن سياسة الحضور والالتزام:" : "Important Attendance Policy:"}
                    </div>
                    <p className="text-[11.5px] text-amber-900/90 leading-relaxed font-medium">
                      {isRTL
                        ? "يرجى الالتزام بالحضور في الموعد المحجوز. في حال عدم الحضور وتكرار الغياب لأكثر من 3 أيام خلال الشهر، سيتم إلغاء/توقيف عضويتك حفاظاً على حق باقي الأعضاء في الاستفادة من المقاعد."
                        : "Please adhere to your reserved schedule. Missing your reservations for more than 3 days in a month will result in membership suspension."}
                    </p>
                  </div>
                </div>

                {/* 1. Date Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="member-booking-date" className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>{bp?.bookingDate || (isRTL ? "تاريخ اليوم المطلوب حجزه" : "Reservation Date")}</span>
                    </label>
                    <span className="text-[11px] font-bold text-slate-400 font-mono">
                      {isRTL ? "الدوام: السبت – الخميس (الجمعة عطلة)" : "Sat – Thu (Fri Closed)"}
                    </span>
                  </div>
                  <input
                    id="member-booking-date"
                    type="date"
                    value={bookingDate}
                    min={todayStr}
                    max={maxBookingDateStr || undefined}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      setSelectedSeat(null);
                    }}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 hover:border-slate-300 text-sm font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs bg-white text-slate-800"
                    required
                  />
                  {windowNotice && (
                    <div className="mt-2 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center gap-2 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{windowNotice}</span>
                    </div>
                  )}
                </div>

                {/* 2. Flexible Hourly Time Range Selector */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>{isRTL ? "حدد وقت حضورك وانصرافك بالساعات" : "Choose Your Arrival & Departure Hours"}</span>
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        {isRTL
                          ? "أنت حراً تماماً في اختيار وقتك (مثلاً من 10:00 ص إلى 02:00 م)، ويمكن لأي طالب آخر حجز المقعد قبلك أو بعدك!"
                          : "You are completely free to choose your hours (e.g. from 10:00 AM to 02:00 PM), and other members can reserve the desk before or after you!"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setBookingStartTime("08:00");
                        setBookingEndTime("16:00");
                        setSelectedSeat(null);
                      }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isRTL ? "8 ص – 4 م" : "8 AM – 4 PM"}</span>
                      <span className="opacity-90 font-bold">{isRTL ? "8 ساعات" : "8 hrs"}</span>
                    </button>
                  </div>

                  {/* Two Large Modern Hour Pickers: From and To */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Start Hour Picker */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-emerald-300 transition-all group">
                      <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                          <span className="text-slate-800 font-extrabold">{isRTL ? "وقت الحضور" : "Arrival Time"}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">08:00 ص – 03:00 م</span>
                      </label>
                      <select
                        value={bookingStartTime}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setBookingStartTime(newStart);
                          if (newStart >= bookingEndTime) {
                            const startH = parseInt(newStart.split(":")[0]);
                            const nextH = Math.min(16, startH + 2);
                            setBookingEndTime(`${String(nextH).padStart(2, "0")}:00`);
                          }
                          setSelectedSeat(null);
                        }}
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-black text-slate-800 shadow-2xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer hover:border-slate-300 transition-all"
                      >
                        <option value="08:00">08:00 ص</option>
                        <option value="09:00">09:00 ص</option>
                        <option value="10:00">10:00 ص</option>
                        <option value="11:00">11:00 ص</option>
                        <option value="12:00">12:00 ظهراً</option>
                        <option value="13:00">01:00 م</option>
                        <option value="14:00">02:00 م</option>
                        <option value="15:00">03:00 م</option>
                      </select>
                    </div>

                    {/* End Hour Picker */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-teal-300 transition-all group">
                      <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.5)]" />
                          <span className="text-slate-800 font-extrabold">{isRTL ? "وقت المغادرة" : "Departure Time"}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">حتى 04:00 م</span>
                      </label>
                      <select
                        value={bookingEndTime}
                        onChange={(e) => {
                          setBookingEndTime(e.target.value);
                          setSelectedSeat(null);
                        }}
                        className="w-full bg-white border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-black text-slate-800 shadow-2xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none cursor-pointer hover:border-slate-300 transition-all"
                      >
                        {[
                          { v: "09:00", l: "09:00 ص" },
                          { v: "10:00", l: "10:00 ص" },
                          { v: "11:00", l: "11:00 ص" },
                          { v: "12:00", l: "12:00 ظهراً" },
                          { v: "13:00", l: "01:00 م" },
                          { v: "14:00", l: "02:00 م" },
                          { v: "15:00", l: "03:00 م" },
                          { v: "16:00", l: "04:00 م" },
                        ]
                          .filter((t) => t.v > bookingStartTime)
                          .map((t) => (
                            <option key={t.v} value={t.v}>{t.l}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Interactive Seat Picker (Desks 1 to 20) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Armchair className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          {isRTL ? "اختر مقعدك المفضل (من 1 إلى 20)" : "Select Your Desk (1 to 20)"}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {isRTL
                            ? `المقاعد المتاحة في الفترة (${bookingStartTime} - ${bookingEndTime})`
                            : `Desks available for (${bookingStartTime} - ${bookingEndTime})`}
                        </p>
                      </div>
                    </div>

                    {selectedSeat && (
                      <button
                        type="button"
                        onClick={() => setSelectedSeat(null)}
                        className="text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                      >
                        {isRTL ? "إلغاء التحديد" : "Clear selection"}
                      </button>
                    )}
                  </div>

                  {/* Single Room Header for Youth (1 room) and Females (1 room) */}
                  {availableRooms.length === 1 && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{availableRooms[0].room_key === "female_hall" ? "👩" : "🚹"}</span>
                        <span className="text-xs font-bold text-slate-800">
                          {getFormattedRoomName(availableRooms[0].name_ar, availableRooms[0].room_key)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono font-bold">
                        ({availableRooms[0].total_seats_count || 20} مقعد)
                      </span>
                    </div>
                  )}

                  {/* Fallback multiple rooms toggle if multiple rooms exist */}
                  {availableRooms.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                      {availableRooms.map((rm) => (
                        <button
                          key={rm.id}
                          type="button"
                          onClick={() => {
                            setSelectedRoomId(rm.id);
                            setSelectedSeat(null);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            (selectedRoomId === rm.id || (!selectedRoomId && availableRooms[0]?.id === rm.id))
                              ? "bg-[#0c2340] text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span>{rm.room_key === "female_hall" ? "👩" : "🚹"}</span>
                          <span>{getFormattedRoomName(rm.name_ar, rm.room_key)}</span>
                          <span className="text-[10px] opacity-75 font-mono">({rm.total_seats_count} مقعد)</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {loadingSeats ? (
                    <div className="p-8 rounded-xl border border-slate-100 bg-slate-50/50 text-center space-y-2">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto" />
                      <span className="text-xs text-slate-500 font-medium block">
                        {isRTL ? "جارٍ فحص المقاعد المتاحة في هذه الفترة..." : "Checking available desk slots..."}
                      </span>
                    </div>
                  ) : (() => {
                    const activeRoom = availableRooms.find((r) => r.id === selectedRoomId) || availableRooms[0];
                    if (!activeRoom || !activeRoom.seats || activeRoom.seats.length === 0) {
                      return (
                        <div className="p-6 rounded-xl border border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
                          {isRTL ? "لا توجد مقاعد متاحة في هذا اليوم." : "No desks available."}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {/* Administrative Room Closure Notice */}
                        {(activeRoom.has_full_day_closure || (activeRoom.is_closed && !activeRoom.has_partial_closure)) ? (
                          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 animate-in fade-in">
                            <div className="flex items-center gap-2 font-bold text-amber-950">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>
                                {isRTL
                                  ? `عذراً، ${getFormattedRoomName(activeRoom.name_ar, activeRoom.room_key)} مغلقة طوال هذا اليوم ومنع الحجز بها.`
                                  : `Notice: This room is closed for the entire day.`}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-800 pr-6">
                              {isRTL ? `سبب الإغلاق: ${activeRoom.closure_reason || "أمر إداري طارئ"}` : `Reason: ${activeRoom.closure_reason}`}
                            </p>
                          </div>
                        ) : activeRoom.has_partial_closure ? (
                          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2 animate-in fade-in">
                            <div className="flex items-start gap-2.5">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-amber-950">
                                    {isRTL
                                      ? `إغلاق جزئي مؤقت في ${getFormattedRoomName(activeRoom.name_ar, activeRoom.room_key)}:`
                                      : `Partial Closure in ${getFormattedRoomName(activeRoom.name_ar, activeRoom.room_key)}:`}
                                  </span>
                                  {activeRoom.closure_start_time && activeRoom.closure_end_time && (
                                    <span dir="ltr" className="font-mono bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                      {activeRoom.closure_start_time} – {activeRoom.closure_end_time}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-amber-900 leading-relaxed">
                                  {activeRoom.closure_reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* Status Key Indicator */}
                        <div className="flex flex-wrap items-center justify-end gap-3 text-[10.5px] text-slate-500 font-semibold px-1">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
                            <span>{isRTL ? "متاح بالكامل" : "Fully Available"}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs" />
                            <span>{isRTL ? "محجوز جزئياً" : "Partially Booked"}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 shadow-2xs" />
                            <span>{isRTL ? "غير متاح" : "Unavailable"}</span>
                          </span>
                        </div>

                        {/* Desk grid (4 rows of 5 desks = 20 desks) */}
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-2">
                          {activeRoom.seats.map((seat) => {
                            const isSelected = selectedSeat?.id === seat.id;
                            const isFullClosure = Boolean(activeRoom.has_full_day_closure || (activeRoom.is_closed && !activeRoom.has_partial_closure));
                            const isLocked = seat.is_locked || seat.status === "locked" || isFullClosure;
                            const isFullyBooked = seat.status === "fully_booked" || isFullClosure;
                            const isPartiallyBooked = seat.status === "partially_booked" && !isLocked && !isFullyBooked;
                            const isAvailableForCurrentShift = Boolean(seat.is_available) && !isFullClosure && !isLocked && !isFullyBooked;
                            const canSelect = !isLocked && !isFullyBooked && (isAvailableForCurrentShift || Boolean(seat.can_book_remaining) || (isPartiallyBooked && seat.free_intervals && seat.free_intervals.length > 0));

                            const statusLabel = isSelected
                              ? (isRTL ? "محدد" : "Selected")
                              : isFullClosure
                              ? (isRTL ? "غير متاح" : "Unavailable")
                              : (seat.availability_label || (isAvailableForCurrentShift ? (isRTL ? "متاح بالكامل" : "Fully Available") : (isRTL ? "غير متاح" : "Unavailable")));

                            return (
                              <button
                                key={seat.id}
                                type="button"
                                disabled={!canSelect}
                                onClick={() => {
                                  if (!isAvailableForCurrentShift && isPartiallyBooked && seat.first_free_start && seat.first_free_end) {
                                    setBookingStartTime(seat.first_free_start);
                                    setBookingEndTime(seat.first_free_end);
                                    setSelectedSeat(seat);
                                  } else {
                                    setSelectedSeat(seat);
                                  }
                                }}
                                title={
                                  isFullClosure
                                    ? `الصالة مغلقة: ${activeRoom.closure_reason}`
                                    : isPartiallyBooked
                                    ? `${seat.booked_hours_text || "محجوز جزئياً"} • ${seat.available_hours_text || "متاح في الساعات الشاغرة"}`
                                    : (seat.available_hours_text || statusLabel)
                                }
                                className={`p-2 rounded-xl border transition-all text-center relative select-none flex flex-col items-center justify-between min-h-[86px] ${
                                  isSelected
                                    ? "bg-emerald-600 border-emerald-700 text-white shadow-md ring-2 ring-emerald-500/30 scale-102 cursor-pointer"
                                    : isLocked || isFullyBooked
                                    ? "bg-white border-slate-200 text-slate-400 opacity-60 cursor-not-allowed shadow-none"
                                    : isPartiallyBooked
                                    ? "bg-blue-50/90 border-blue-300 text-blue-950 hover:border-blue-500 hover:bg-blue-100/90 cursor-pointer shadow-xs"
                                    : "bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:border-emerald-500 hover:bg-emerald-100/80 cursor-pointer shadow-2xs"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className={`text-[9px] font-mono ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                                    {seat.code}
                                  </span>
                                  {seat.has_power && (
                                    <Zap className={`w-3 h-3 ${isSelected ? "text-amber-300" : "text-amber-500"}`} />
                                  )}
                                </div>

                                <div className="font-black text-sm my-0.5">
                                  {seat.seat_number < 10 ? `0${seat.seat_number}` : seat.seat_number}
                                </div>

                                <div className="flex flex-col items-center justify-center w-full px-0.5">
                                  {isSelected ? (
                                    <span className="text-[8.5px] leading-tight font-extrabold text-emerald-100">
                                      {isRTL ? "محدد" : "Selected"}
                                    </span>
                                  ) : isLocked || isFullyBooked ? (
                                    <span className="text-[8.5px] leading-tight font-extrabold text-slate-400">
                                      {isLocked ? (isRTL ? "مغلق" : "Locked") : (isRTL ? "غير متاح" : "Unavailable")}
                                    </span>
                                  ) : isPartiallyBooked ? (
                                    <div className="w-full text-center space-y-1 mt-0.5 px-0.5">
                                      {(seat.booked_hours_text || (seat.booked_intervals && seat.booked_intervals.length > 0)) && (
                                        <span
                                          className="text-[7.5px] font-mono text-rose-700 bg-rose-50 border border-rose-200/90 rounded px-1 py-0.5 font-bold block truncate leading-tight shadow-2xs"
                                          title={seat.booked_hours_text || (seat.booked_intervals ? `محجوز ${seat.booked_intervals.map((i) => `من ${i.start} إلى ${i.end}`).join(" و ")}` : "")}
                                        >
                                          {seat.booked_hours_text || (seat.booked_intervals ? `محجوز ${seat.booked_intervals.map((i) => `من ${i.start} إلى ${i.end}`).join(" و ")}` : "")}
                                        </span>
                                      )}
                                      {(seat.available_hours_text || (seat.free_intervals && seat.free_intervals.length > 0)) && (
                                        <span
                                          className="text-[7.5px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200/90 rounded px-1 py-0.5 font-extrabold block truncate leading-tight shadow-2xs"
                                          title={seat.available_hours_text || (seat.free_intervals ? `متاح ${seat.free_intervals.map((i) => `من ${i.start} إلى ${i.end}`).join(" و ")}` : "")}
                                        >
                                          {seat.available_hours_text || (seat.free_intervals ? `متاح ${seat.free_intervals.map((i) => `من ${i.start} إلى ${i.end}`).join(" و ")}` : "")}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[8.5px] leading-tight font-extrabold text-emerald-700">
                                      {isRTL ? "متاح بالكامل" : "Fully Available"}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Seat Confirmation Notice */}
                        {selectedSeat && (
                          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-950 space-y-1.5 animate-in fade-in">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                  {isRTL
                                    ? `المقعد المختار: ${selectedSeat.label} (${getFormattedRoomName(activeRoom.name_ar, activeRoom.room_key)})`
                                    : `Selected Desk: ${selectedSeat.label} (${getFormattedRoomName(activeRoom.name_ar, activeRoom.room_key)})`}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs font-extrabold">
                                {formatHour12(bookingStartTime)} – {formatHour12(bookingEndTime)} ({Math.max(1, parseInt(bookingEndTime.split(":")[0]) - parseInt(bookingStartTime.split(":")[0]))} ساعات)
                              </span>
                            </div>

                            {selectedSeat.booked_hours_text && (
                              <p className="text-[11px] text-emerald-800 font-medium pt-0.5">
                                {isRTL
                                  ? `💡 ملاحظة: هذا المقعد ${selectedSeat.booked_hours_text}، وأنت تحجزه في الفترة المتاحة (${formatHour12(bookingStartTime)} – ${formatHour12(bookingEndTime)}) بعد انتهاء حجز الطالب الأول.`
                                  : `Note: This desk is ${selectedSeat.booked_hours_text}. You are reserving it during available hours (${formatHour12(bookingStartTime)} - ${formatHour12(bookingEndTime)}).`}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
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
                disabled={!bookingDate || !selectedSeat || bookingLoading || Boolean(activeRoom?.is_closed)}
                className={`w-full py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  !bookingDate || !selectedSeat || bookingLoading || Boolean(activeRoom?.is_closed)
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]"
                }`}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isRTL ? "جاري تأكيد الحجز..." : "Confirming reservation..."}</span>
                  </>
                ) : activeRoom?.is_closed ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-200" />
                    <span>{isRTL ? "الصالة مغلقة في هذا اليوم، الحجز غير متاح" : "Hall is closed on this date"}</span>
                  </>
                ) : !selectedSeat ? (
                  <>
                    <Armchair className="w-5 h-5 text-slate-200" />
                    <span>{isRTL ? "يرجى تحديد مقعد من القائمة للمتابعة" : "Select a desk to proceed"}</span>
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
            <MemberBookingsList
              bookings={bookings}
              onCancelBooking={handleCancelBooking}
            />
          )}

          {/* ── Sub-View 3: Member Achievements (Private to Member & Admin) ── */}
          {memberSubView === "achievements" && (
            <MemberAchievementsTab />
          )}

        </div>
      )}

      {/* ── Change Password Modal ── */}
      <ChangePasswordModal
        isOpen={changePassOpen}
        onClose={() => setChangePassOpen(false)}
        authToken={authToken}
      />
    </div>
  );
}
