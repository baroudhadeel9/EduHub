"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { MemberBooking } from "./types";
import { getRoomsOverviewApi, RoomItem, SeatItem } from "@/services/roomSeats";
import MemberBookingsList from "./member/MemberBookingsList";
import MemberLoginForm from "./member/MemberLoginForm";
import MemberQuotaHeader from "./member/MemberQuotaHeader";
import MemberBookingForm from "./member/MemberBookingForm";

const ChangePasswordModal = dynamic(() => import("./member/ChangePasswordModal"), { ssr: false });
const MemberAchievementsTab = dynamic(() => import("./member/MemberAchievementsTab"), { ssr: false });
const MemberSupportTab = dynamic(() => import("./member/MemberSupportTab"), { ssr: false });
import {
  memberLoginApi,
  createMemberBookingApi,
  cancelMemberBookingApi,
  MemberData,
  setMemberAuthSession,
  getMemberAuthSession,
  clearMemberAuthSession,
  getMemberBookingsApi,
  getMemberQuotaApi,
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
  const startRaw = String(b.startTime || b.start_time || "09:00");
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
  const [memberSubView, setMemberSubView] = useState<"book" | "my_bookings" | "achievements" | "support">("book");
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
  const [bookingStartTime, setBookingStartTime] = useState<string>("09:00");
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

        const handleAuthExpired = () => {
          clearMemberAuthSession();
          setIsLoggedIn(false);
          setAuthToken("");
          setMemberData(null);
          setBookings([]);
          setLoginError(
            isRTL
              ? "انتهت صلاحية جلسة تسجيل الدخول السابقة لأسباب أمنية. يرجى كتابة كلمة المرور لتسجيل الدخول ومزامنة رصيد ساعاتك وحجوزاتك."
              : "Your previous session has expired. Please log in again to sync your hours and bookings."
          );
        };

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
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : "";
            if (msg.toLowerCase().includes("unauthenticated") || msg.includes("401")) {
              if (isMounted) handleAuthExpired();
            }
          });

        // Silently sync latest quota & hours from backend so used_hours is always 100% fresh!
        getMemberQuotaApi(session.token)
          .then((quotaRes) => {
            if (!isMounted || !quotaRes || !quotaRes.quota) return;
            const q = quotaRes.quota;
            setMemberData((prev) => {
              if (!prev) return prev;
              const updated: MemberData = {
                ...prev,
                hoursUsed: q.used_hours ?? prev.hoursUsed,
                monthlyLimit: q.allocated_hours ?? prev.monthlyLimit,
                hoursRemaining: q.remaining_hours ?? Math.max(0, (q.allocated_hours ?? prev.monthlyLimit) - (q.used_hours ?? 0)),
                extraHours: q.extra_hours ?? prev.extraHours,
                dueAmount: q.extra_amount_due ?? prev.dueAmount,
                renewalDate: q.renewal_date ?? prev.renewalDate,
                renewalDay: q.renewal_day ?? prev.renewalDay,
                daysUntilRenewal: q.days_until_renewal ?? prev.daysUntilRenewal,
              };
              setMemberAuthSession({ token: session.token, member: updated });
              return updated;
            });
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : "";
            if (msg.toLowerCase().includes("unauthenticated") || msg.includes("401")) {
              if (isMounted) handleAuthExpired();
            }
          });
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
        if (msg.toLowerCase().includes("unauthenticated") || msg.includes("401")) {
          clearMemberAuthSession();
          setIsLoggedIn(false);
          setAuthToken("");
          setMemberData(null);
          setBookings([]);
          setLoginError(
            isRTL
              ? "انتهت صلاحية جلسة تسجيل الدخول السابقة لأسباب أمنية. يرجى إدخال كلمة المرور لتسجيل الدخول ومزامنة رصيد ساعاتك وحجوزاتك."
              : "Your previous session has expired. Please log in again to sync your hours and bookings."
          );
          return;
        }
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

      // Silently sync latest live quota from backend immediately upon login
      getMemberQuotaApi(res.token)
        .then((quotaRes) => {
          if (!quotaRes?.quota) return;
          const q = quotaRes.quota;
          setMemberData((prev) => {
            if (!prev) return prev;
            const updated: MemberData = {
              ...prev,
              hoursUsed: q.used_hours ?? prev.hoursUsed,
              monthlyLimit: q.allocated_hours ?? prev.monthlyLimit,
              hoursRemaining: q.remaining_hours ?? Math.max(0, (q.allocated_hours ?? prev.monthlyLimit) - (q.used_hours ?? 0)),
              extraHours: q.extra_hours ?? prev.extraHours,
              dueAmount: q.extra_amount_due ?? prev.dueAmount,
              renewalDate: q.renewal_date ?? prev.renewalDate,
              renewalDay: q.renewal_day ?? prev.renewalDay,
              daysUntilRenewal: q.days_until_renewal ?? prev.daysUntilRenewal,
            };
            setMemberAuthSession({ token: res.token, member: updated });
            return updated;
          });
        })
        .catch(() => {});

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

        if (authToken) {
          getMemberQuotaApi(authToken)
            .then((quotaRes) => {
              if (quotaRes?.quota) {
                const q = quotaRes.quota;
                setMemberData((prev) => {
                  if (!prev) return prev;
                  const updated: MemberData = {
                    ...prev,
                    hoursUsed: q.used_hours ?? prev.hoursUsed,
                    monthlyLimit: q.allocated_hours ?? prev.monthlyLimit,
                    hoursRemaining: q.remaining_hours ?? Math.max(0, (q.allocated_hours ?? prev.monthlyLimit) - (q.used_hours ?? 0)),
                  };
                  setMemberAuthSession({ token: authToken, member: updated });
                  return updated;
                });
              }
            })
            .catch(() => {});
        }
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
    <div className="w-full max-w-4xl min-w-0 overflow-hidden">
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
        <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-3.5 sm:p-8 md:p-10 space-y-5 sm:space-y-6 animate-in fade-in min-w-0 overflow-hidden">
          <MemberQuotaHeader
            memberName={memberData?.name || ""}
            memberEmail={memberData?.email || memberEmail}
            hoursUsed={hoursUsed}
            monthlyLimit={monthlyLimit}
            hoursRemaining={hoursRemaining}
            dailyLimit={dailyLimit}
            renewalDate={memberData?.renewalDate}
            renewalDay={memberData?.renewalDay}
            daysUntilRenewal={memberData?.daysUntilRenewal}
            memberSubView={memberSubView}
            confirmedBookingsCount={bookings.filter((b) => b.status === "confirmed").length}
            onSelectSubView={setMemberSubView}
            onOpenChangePassword={() => setChangePassOpen(true)}
            onLogout={handleLogout}
          />

          {/* ── Sub-View 1: Member Booking Form ── */}
          {memberSubView === "book" && (
            <MemberBookingForm
              bookingDate={bookingDate}
              setBookingDate={setBookingDate}
              todayStr={todayStr}
              maxBookingDateStr={maxBookingDateStr}
              windowNotice={windowNotice}
              bookingStartTime={bookingStartTime}
              setBookingStartTime={setBookingStartTime}
              bookingEndTime={bookingEndTime}
              setBookingEndTime={setBookingEndTime}
              selectedSeat={selectedSeat}
              setSelectedSeat={setSelectedSeat}
              availableRooms={availableRooms}
              selectedRoomId={selectedRoomId}
              setSelectedRoomId={setSelectedRoomId}
              loadingSeats={loadingSeats}
              bookingNotes={bookingNotes}
              setBookingNotes={setBookingNotes}
              bookingLoading={bookingLoading}
              bookingError={bookingError}
              bookingSuccess={bookingSuccess}
              bookingWarning={bookingWarning}
              onSubmit={handleMemberBookingSubmit}
              isRTL={isRTL}
              bp={bp}
            />
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

          {/* ── Sub-View 4: Member Technical Support & Issues ── */}
          {memberSubView === "support" && (
            <MemberSupportTab />
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
