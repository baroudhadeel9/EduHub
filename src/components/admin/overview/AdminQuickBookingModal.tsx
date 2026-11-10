"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  Calendar,
  CalendarDays,
  Clock,
  Armchair,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Search,
  ChevronDown,
  Sparkles,
  Edit2,
} from "lucide-react";
import { getAdminMembersApi, createAdminBookingForMemberApi } from "@/services/applications";
import { getRoomsOverviewApi, RoomItem, SeatItem } from "@/services/roomSeats";
import { getLocalDateString, getAllowedWeekDates } from "@/utils/dateTime";

interface AdminQuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MemberOption {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  member_type?: string;
  category?: string;
  status?: string;
}

interface AvailableSeatOption {
  id: number;
  seat_number: number;
  label: string;
  room_id: number;
  room_name: string;
  room_key: string;
}

const ALL_TIME_SLOTS = [
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

export default function AdminQuickBookingModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminQuickBookingModalProps) {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);
  const [searchMember, setSearchMember] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const todayStr = useMemo(() => getLocalDateString(0), []);
  const weekInfo = useMemo(() => getAllowedWeekDates(undefined, false), []);
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const isTodayAllowed = weekInfo.currentWeek.some((d) => d.date === todayStr);
    return isTodayAllowed ? todayStr : weekInfo.defaultDate;
  });
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");

  const [availableSeats, setAvailableSeats] = useState<AvailableSeatOption[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeatId, setSelectedSeatId] = useState<string>("");
  const [hallName, setHallName] = useState<string>("");

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Close member search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all members when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoadingMembers(true);
      getAdminMembersApi()
        .then((data) => {
          setMembers(data || []);
        })
        .finally(() => setLoadingMembers(false));
    } else {
      setSelectedMember(null);
      setSearchMember("");
      setSelectedSeatId("");
      setNotes("");
    }
  }, [isOpen]);

  // Fetch available seats dynamically when date, time, or selected member changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingSeats(true);
    setSelectedSeatId("");

    const memberGender = selectedMember?.gender || undefined;

    getRoomsOverviewApi(bookingDate, undefined, memberGender, undefined, startTime, endTime)
      .then((res) => {
        if (!isMounted) return;

        const rooms: RoomItem[] = res?.rooms || [];
        const seatsList: AvailableSeatOption[] = [];
        let detectedHall = "";

        rooms.forEach((r: RoomItem) => {
          // If gender filter applies, match room
          if (memberGender && r.gender && r.gender !== memberGender) return;

          const rName = r.name_ar || (r.gender === "female" ? "صالة الإناث" : "صالة الشباب");
          if (!detectedHall) detectedHall = rName;

          (r.seats || []).forEach((s: SeatItem) => {
            if (s.is_available && !s.is_locked) {
              seatsList.push({
                id: s.id,
                seat_number: s.seat_number,
                label: s.label || `مقعد ${s.seat_number}`,
                room_id: s.room_id || r.id,
                room_name: rName,
                room_key: r.room_key,
              });
            }
          });
        });

        // Sort seats by seat number
        seatsList.sort((a, b) => a.seat_number - b.seat_number);

        setHallName(detectedHall || (isRTL ? "الصالة العامة" : "Workspace Hall"));
        setAvailableSeats(seatsList);
      })
      .catch((err) => {
        console.warn("Could not load available seats overview:", err);
        if (isMounted) setAvailableSeats([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSeats(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, bookingDate, startTime, endTime, selectedMember, isRTL]);

  if (!isOpen) return null;

  // Filtered members for friendly autocomplete
  const filteredMembers = members.filter((m) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase().trim();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q))
    );
  });

  // Calculate start time options (08:00 to 15:00)
  const startTimeOptions = ALL_TIME_SLOTS.slice(0, ALL_TIME_SLOTS.length - 1);

  // End time options: only slots strictly after startTime
  const startHour = parseInt(startTime.split(":")[0], 10);
  const endTimeOptions = ALL_TIME_SLOTS.filter((t) => {
    const h = parseInt(t.split(":")[0], 10);
    return h > startHour;
  });

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    const newStartH = parseInt(newStart.split(":")[0], 10);
    const currentEndH = parseInt(endTime.split(":")[0], 10);

    // If current end time is no longer strictly greater than start time, bump it
    if (currentEndH <= newStartH) {
      const nextH = Math.min(16, newStartH + 2);
      setEndTime(`${String(nextH).padStart(2, "0")}:00`);
    }
  };

  // Calculate duration in hours
  const endHour = parseInt(endTime.split(":")[0], 10);
  const calculatedDuration = Math.max(1, endHour - startHour);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      setErrorMsg(isRTL ? "يرجى اختيار العضو المطلوب أولاً." : "Please select a member first.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const selectedSeatObj = availableSeats.find((s) => String(s.id) === String(selectedSeatId));

      await createAdminBookingForMemberApi({
        userId: selectedMember.id,
        date: bookingDate,
        startTime,
        endTime,
        durationHours: calculatedDuration,
        seat_id: selectedSeatId ? Number(selectedSeatId) : undefined,
        room_id: selectedSeatObj?.room_id,
        notes: notes.trim() || (isRTL ? "حجز يدوي من لوحة الإدارة" : "Manual admin booking"),
      });

      setSuccessMsg(
        isRTL
          ? `تم حجز المقعد بنجاح للعضو ${selectedMember.name}!`
          : `Seat booked successfully for ${selectedMember.name}!`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full my-auto p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-navy text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                {isRTL ? "حجز مقعد لعضو" : "Quick Member Seat Booking"}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {isRTL
                  ? "تحديد المقعد والوقت مباشرة من لوحة التحكم"
                  : "Assign an available seat directly with custom time range"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          
          {/* 1. Member Selection (Friendly Autocomplete Search) */}
          <div className="space-y-1.5" ref={dropdownRef}>
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRTL ? "العضو المستفيد:" : "Select Member:"}</span>
              </span>
              {selectedMember && (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedMember.gender === "female" ? (isRTL ? "صالة الإناث 👩" : "Women Hall") : (isRTL ? "صالة الشباب 🚹" : "Youth Hall")}
                </span>
              )}
            </label>

            {loadingMembers ? (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>{isRTL ? "جاري تحميل قائمة الأعضاء..." : "Loading members..."}</span>
              </div>
            ) : selectedMember ? (
              /* Selected Member Card View */
              <div className="p-3 rounded-2xl bg-slate-50 border border-emerald-200/80 flex items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                    {selectedMember.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {selectedMember.name}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                        {selectedMember.member_type === "freelancer" || selectedMember.category === "freelancer"
                          ? (isRTL ? "مستقل" : "Freelancer")
                          : (isRTL ? "طالب" : "Student")}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 truncate">
                      {selectedMember.phone || selectedMember.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMember(null);
                    setSearchMember("");
                    setIsDropdownOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  <Edit2 className="w-3 h-3 text-slate-400" />
                  <span>{isRTL ? "تغيير" : "Change"}</span>
                </button>
              </div>
            ) : (
              /* Search Input with Friendly Dropdown */
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchMember}
                    onChange={(e) => {
                      setSearchMember(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder={isRTL ? "ابحث باسم العضو، البريد، أو رقم الهاتف..." : "Type member name, email or phone..."}
                    className="w-full ps-9 pe-8 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm font-medium outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                  {searchMember ? (
                    <button
                      type="button"
                      onClick={() => setSearchMember("")}
                      className="absolute end-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute end-3 pointer-events-none" />
                  )}
                </div>

                {/* Dropdown Options */}
                {isDropdownOpen && (
                  <div className="absolute z-20 top-full mt-1.5 start-0 end-0 max-h-56 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 divide-y divide-slate-100 animate-in fade-in duration-150">
                    {filteredMembers.length === 0 ? (
                      <div className="p-3.5 text-center text-xs text-slate-400">
                        {isRTL ? "لا يوجد عضو مطابق للبحث" : "No member found"}
                      </div>
                    ) : (
                      filteredMembers.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedMember(m);
                            setIsDropdownOpen(false);
                            setSearchMember("");
                          }}
                          className="px-3.5 py-2.5 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {m.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-xs truncate">
                                {m.name}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {m.email} {m.phone ? `· ${m.phone}` : ""}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {m.member_type === "freelancer" || m.category === "freelancer"
                                ? (isRTL ? "فريلانسر" : "Freelancer")
                                : (isRTL ? "طالب" : "Student")}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.gender === "female" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"
                            }`}>
                              {m.gender === "female" ? (isRTL ? "أنثى" : "Female") : (isRTL ? "ذكر" : "Male")}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Date Picker (Weekdays: Saturday to Thursday) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isRTL ? "تاريخ الحجز:" : "Booking Date:"}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isRTL ? "الدوام: السبت – الخميس (الجمعة عطلة)" : "Sat – Thu (Fri Closed)"}
              </span>
            </label>
            <select
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 cursor-pointer text-slate-800"
              required
            >
              {weekInfo.currentWeek.map((item) => (
                <option key={item.date} value={item.date}>
                  {isRTL ? item.fullLabelAr : item.fullLabelEn}{" "}
                  {item.isToday ? (isRTL ? "— (اليوم)" : "— (Today)") : ""}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Start Time & End Time (Side by Side) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRTL ? "وقت البداية:" : "Start Time:"}</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold text-xs sm:text-sm outline-none focus:border-emerald-500 cursor-pointer"
              >
                {startTimeOptions.map((time) => {
                  const hourNum = parseInt(time.split(":")[0], 10);
                  const period = hourNum < 12 ? (isRTL ? "صباحاً" : "AM") : (isRTL ? "ظهراً" : "PM");
                  return (
                    <option key={time} value={time}>
                      {time} ({period})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRTL ? "وقت النهاية:" : "End Time:"}</span>
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 bg-white font-bold text-xs sm:text-sm outline-none focus:border-emerald-500 cursor-pointer"
              >
                {endTimeOptions.map((time) => {
                  const hourNum = parseInt(time.split(":")[0], 10);
                  const period = hourNum < 12 ? (isRTL ? "صباحاً" : "AM") : (isRTL ? "ظهراً" : "PM");
                  return (
                    <option key={time} value={time}>
                      {time} ({period})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Duration Pill Indicator */}
          <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
            <span>{isRTL ? "إجمالي ساعات الحجز:" : "Total reservation duration:"}</span>
            <span className="font-extrabold text-brand-navy">
              {calculatedDuration} {isRTL ? (calculatedDuration === 1 ? "ساعة" : calculatedDuration === 2 ? "ساعتان" : "ساعات") : "hrs"}
              <span className="text-slate-400 font-normal ms-1">({startTime} – {endTime})</span>
            </span>
          </div>

          {/* 4. Available Seats Dropdown for this exact window */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Armchair className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRTL ? "المقاعد المتاحة في هذا التوقيت:" : "Available Seats for this Time:"}</span>
              </label>

              {loadingSeats ? (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                  <span>{isRTL ? "جاري الفحص..." : "Checking..."}</span>
                </span>
              ) : (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  availableSeats.length > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {availableSeats.length > 0
                    ? `${availableSeats.length} ${isRTL ? "مقعد متاح" : "seats available"}`
                    : (isRTL ? "لا توجد مقاعد شاغرة" : "No seats available")}
                </span>
              )}
            </div>

            <select
              value={selectedSeatId}
              onChange={(e) => setSelectedSeatId(e.target.value)}
              disabled={loadingSeats || availableSeats.length === 0}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200/90 bg-white font-bold text-xs sm:text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer shadow-2xs"
            >
              <option value="">
                {availableSeats.length > 0
                  ? (isRTL ? `✨ تعيين تلقائي لأول مقعد متاح (${hallName})` : `✨ Auto-assign available seat (${hallName})`)
                  : (isRTL ? "-- لا توجد مقاعد شاغرة في هذه الفترة --" : "-- No available seats in this slot --")}
              </option>
              {availableSeats.map((seat) => (
                <option key={seat.id} value={seat.id}>
                  {seat.label} ({seat.room_name})
                </option>
              ))}
            </select>

            {availableSeats.length === 0 && !loadingSeats && (
              <p className="text-[11px] text-amber-600 font-semibold mt-1">
                {isRTL
                  ? `جميع مقاعد ${hallName} محجوزة في هذه الفترة. يرجى تجربة تغيير وقت البداية أو النهاية.`
                  : "All seats are booked during this time window. Please adjust start/end time."}
              </p>
            )}
          </div>

          {/* 5. Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRTL ? "ملاحظة الحجز (اختياري):" : "Notes (Optional):"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isRTL ? "مثال: حجز عبر اتصال، طاولة هادئة" : "e.g. Phone booking, quiet desk"}
              className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 bg-white outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting || !selectedMember || availableSeats.length === 0}
              className="flex-1 py-3 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xs active:scale-98"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جاري التأكيد..." : "Confirming..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>{isRTL ? "تأكيد حجز المقعد الآن" : "Confirm Seat Reservation"}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
