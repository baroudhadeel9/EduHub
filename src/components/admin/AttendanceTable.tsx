"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  Clock,
  LogIn,
  LogOut,
  Info,
  CheckCircle2,
  User,
  X,
  Loader2,
} from "lucide-react";
import { AttendanceRecord, FilterOption } from "./types";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onCheckIn: (id: string) => Promise<void> | void;
  onCheckOut: (id: string) => Promise<void> | void;
  isToday?: boolean;
}

function getGazaTimeString(): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Gaza",
    }).format(new Date());
  } catch {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
}

export default function AttendanceTable({
  records,
  onCheckIn,
  onCheckOut,
  isToday = true,
}: AttendanceTableProps) {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const f = t.admin?.filters;
  const tb = t.admin?.table;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  // Confirmation Modal state
  const [pendingAction, setPendingAction] = useState<{
    type: "checkIn" | "checkOut";
    record: AttendanceRecord;
    currentTime: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCheckInModal = (record: AttendanceRecord) => {
    setPendingAction({
      type: "checkIn",
      record,
      currentTime: getGazaTimeString(),
    });
  };

  const handleOpenCheckOutModal = (record: AttendanceRecord) => {
    setPendingAction({
      type: "checkOut",
      record,
      currentTime: getGazaTimeString(),
    });
  };

  const handleCancelModal = () => {
    if (isSubmitting) return;
    setPendingAction(null);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (pendingAction.type === "checkIn") {
        await onCheckIn(pendingAction.record.id);
      } else {
        await onCheckOut(pendingAction.record.id);
      }
      setPendingAction(null);
    } catch (err) {
      console.error("Attendance action error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutSummary = useMemo(() => {
    if (!pendingAction || pendingAction.type !== "checkOut") return null;
    const arrTime = pendingAction.record.arrivalTime;
    const curTime = pendingAction.currentTime;
    let durationStr = "-";
    if (arrTime && arrTime.includes(":")) {
      const [ah, am] = arrTime.split(":").map(Number);
      const [ch, cm] = curTime.split(":").map(Number);
      if (!isNaN(ah) && !isNaN(ch)) {
        let diffMins = (ch * 60 + (cm || 0)) - (ah * 60 + (am || 0));
        if (diffMins < 0) diffMins += 24 * 60;
        diffMins = Math.max(1, diffMins);
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        if (h > 0 && m > 0) {
          durationStr = `${h} س و ${m} د`;
        } else if (h > 0) {
          durationStr = h === 1 ? "ساعة واحدة" : h === 2 ? "ساعتان" : `${h} ساعات`;
        } else {
          durationStr = `${m} دقيقة`;
        }
      }
    }
    return {
      arrTime,
      curTime,
      durationStr,
    };
  }, [pendingAction]);

  // Filter Counts
  const counts = useMemo(() => {
    return {
      all: records.length,
      inside: records.filter((r) => r.status === "inside").length,
      waiting: records.filter((r) => r.status === "waiting").length,
      left: records.filter((r) => r.status === "left").length,
      unattended: records.filter((r) => r.status === "unattended").length,
    };
  }, [records]);

  // Filtered Records based on Tab & Search Query
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      // Tab filter
      if (activeFilter !== "all" && item.status !== activeFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSub = item.subText.toLowerCase().includes(query);
        const matchesPhone = item.phone ? item.phone.toLowerCase().includes(query) : false;
        const matchesId = item.nationalId ? item.nationalId.toLowerCase().includes(query) : false;
        return matchesName || matchesSub || matchesPhone || matchesId;
      }
      return true;
    });
  }, [records, activeFilter, searchQuery]);

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* ── Search & Filter Bar (Clean, Balanced & Organized) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={f?.searchPlaceholder || (isRTL ? "بحث سريع بالاسم، رقم الهاتف، أو الهوية..." : "Quick search by name, phone, or ID...")}
            className="w-full ps-10 pe-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filter Tabs */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0"
          role="tablist"
          aria-label="Filter Attendance"
        >
          {/* All */}
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#0c2340] text-white shadow-xs"
                : "text-slate-600 bg-slate-100 hover:bg-slate-200"
            }`}
          >
            {f?.all || (isRTL ? "الكل" : "All")} ({counts.all})
          </button>

          {/* Inside Now */}
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "inside"}
            onClick={() => setActiveFilter("inside")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "inside"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{f?.inside || (isRTL ? "داخل المساحة الآن" : "Inside Now")}</span>
            <span className="opacity-80">({counts.inside})</span>
          </button>

          {/* Awaiting Arrival */}
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "waiting"}
            onClick={() => setActiveFilter("waiting")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === "waiting"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60"
            }`}
          >
            {f?.waiting || (isRTL ? "بانتظار الوصول" : "Awaiting")} ({counts.waiting})
          </button>

          {/* Left */}
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === "left"}
            onClick={() => setActiveFilter("left")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === "left"
                ? "bg-slate-700 text-white shadow-xs"
                : "text-slate-600 bg-slate-100 hover:bg-slate-200"
            }`}
          >
            {f?.left || (isRTL ? "غادروا المركز" : "Left")} ({counts.left})
          </button>

          {/* Unattended / No-Show */}
          {counts.unattended > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={activeFilter === "unattended"}
              onClick={() => setActiveFilter("unattended")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeFilter === "unattended"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/60"
              }`}
            >
              <span>{isRTL ? "لم يلتزم بالحضور" : "Unattended"}</span>
              <span className="opacity-80">({counts.unattended})</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Attendance Table Card (Restful, Clean Typography & Clear Spacing) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs sm:text-sm">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold text-start">
                <th scope="col" className="py-3.5 px-4 text-start font-bold">
                  {tb?.colName || (isRTL ? "الاسم ونوع العضوية" : "Member & Category")}
                </th>
                <th scope="col" className="py-3.5 px-4 text-start font-bold">
                  {tb?.colBooking || (isRTL ? "فترة الحجز المعتمدة" : "Booking Slot")}
                </th>
                <th scope="col" className="py-3.5 px-4 text-start font-bold">
                  {isRTL ? "حالة وتوقيت الحضور" : "Attendance Status & Log"}
                </th>
                <th scope="col" className="py-3.5 px-4 text-center font-bold">
                  {tb?.colAction || (isRTL ? "إجراء الحضور" : "Action")}
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center text-slate-400 font-medium">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center mb-2">
                      <User className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {records.length === 0
                        ? (isRTL
                            ? "لا توجد تسجيلات حضور لهذا اليوم حتى الآن."
                            : "No attendance recorded for today yet.")
                        : (isRTL
                            ? "لا توجد سجلات مطابقة لمعايير البحث أو التصفية الحالية."
                            : "No attendance records found matching criteria.")}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {isRTL
                        ? "يمكنك تسجيل حضور فوري لأي عضو أو زائر عبر زر «تسجيل وصول فوري» بالأعلى."
                        : "Use the 'Fast Check-In' button above to register an instant arrival."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row) => {
                  const isStudent = row.type === "student";
                  const isFreelancer = row.type === "freelancer";

                  const rolePill = isStudent
                    ? { label: isRTL ? "طالب/ة" : "Student", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" }
                    : isFreelancer
                    ? { label: isRTL ? "مستقل Freelancer" : "Freelancer", cls: "bg-teal-50 text-teal-800 border-teal-200" }
                    : { label: isRTL ? "زائر يومي" : "Visitor", cls: "bg-cyan-50 text-cyan-800 border-cyan-200" };

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. Name & Avatar & Category Pill */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                              isStudent
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : isFreelancer
                                ? "bg-teal-50 text-teal-800 border-teal-200"
                                : "bg-cyan-50 text-cyan-800 border-cyan-200"
                            }`}
                          >
                            {row.avatarLetter}
                          </div>

                          <div className="space-y-0.5">
                            <span className="font-bold text-[#0c2340] text-sm block group-hover:text-emerald-700 transition-colors">
                              {row.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${rolePill.cls}`}>
                                {rolePill.label}
                              </span>
                              {row.subText && (
                                <span className="text-[11px] text-slate-400 hidden sm:inline">
                                  • {row.subText}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Scheduled Booking Slot */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-700 font-bold font-mono text-xs">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span dir="ltr" className="inline-block font-mono tracking-tight">{row.bookingTime}</span>
                        </div>
                      </td>

                      {/* 3. Combined Attendance Log & Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {row.status === "waiting" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>{tb?.notArrived || (isRTL ? "بانتظار الوصول" : "Awaiting arrival")}</span>
                          </span>
                        ) : row.status === "unattended" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                            <X className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                            <span>{isRTL ? "لم يلتزم بالحضور (تغيّب)" : "Unattended / No-Show"}</span>
                          </span>
                        ) : row.status === "inside" ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{isRTL ? "داخل المركز منذ:" : "In since:"} <span dir="ltr" className="font-mono">{row.arrivalTime}</span></span>
                            </div>
                            {row.actualDuration !== "-" && (
                              <div className="text-[11px] font-medium text-slate-500 ps-1">
                                {isRTL ? "المدة المنقضية:" : "Elapsed:"} {row.actualDuration}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isRTL ? "حضر وغادر" : "Departed"}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 ps-1">
                              <span>{isRTL ? "دخول:" : "In:"} <span dir="ltr" className="font-semibold text-slate-700">{row.arrivalTime}</span></span>
                              <span className="text-slate-300">•</span>
                              <span>{isRTL ? "خروج:" : "Out:"} <span dir="ltr" className="font-semibold text-slate-700">{row.departureTime}</span></span>
                              {row.actualDuration !== "-" && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="font-semibold text-emerald-700">({row.actualDuration})</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 4. Action Button */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {row.status === "inside" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCheckOutModal(row)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-98"
                            title={tb?.checkOutAction || (isRTL ? "تسجيل مغادرة" : "Check-out")}
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{tb?.checkOutAction || (isRTL ? "تسجيل مغادرة" : "Check-out")}</span>
                          </button>
                        ) : row.status === "waiting" && isToday ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCheckInModal(row)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-xs hover:shadow-md hover:shadow-emerald-900/15 transition-all cursor-pointer active:scale-98"
                            title={tb?.checkInAction || (isRTL ? "تسجيل وصول" : "Check-in")}
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>{tb?.checkInAction || (isRTL ? "تسجيل وصول" : "Check-in")}</span>
                          </button>
                        ) : row.status === "unattended" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                            <X className="w-3.5 h-3.5 text-rose-600" />
                            <span>{isRTL ? "انقضى الموعد" : "Missed"}</span>
                          </span>
                        ) : row.status === "waiting" && !isToday ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            <span>{isRTL ? "حجز قادم" : "Scheduled"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                            <span>{isRTL ? "مكتمل" : "Completed"}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Transparency Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {isRTL
                ? "يتم توثيق فترات الحضور الفعلي وحساب الساعات تلقائياً وإيداعها في تقرير المؤسسة الشهري."
                : "Actual attendance durations are computed automatically and logged into monthly reporting."}
            </span>
          </div>

          <span className="font-mono text-[11px] text-slate-400 font-bold self-end sm:self-auto">
            EduHub Gaza Field System v2.6
          </span>
        </div>
      </div>

      {/* ── Confirmation Modal for Check-in / Check-out ── */}
      {pendingAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
          dir={dir}
          onClick={handleCancelModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`p-4 sm:p-5 flex items-center justify-between border-b ${
                pendingAction.type === "checkIn"
                  ? "bg-emerald-50/70 border-emerald-100 text-emerald-950"
                  : "bg-rose-50/70 border-rose-100 text-rose-950"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    pendingAction.type === "checkIn"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-rose-600 text-white shadow-xs"
                  }`}
                >
                  {pendingAction.type === "checkIn" ? (
                    <LogIn className="w-5 h-5" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {pendingAction.type === "checkIn"
                      ? (isRTL ? "تأكيد تسجيل الوصول" : "Confirm Check-In")
                      : (isRTL ? "تأكيد تسجيل المغادرة" : "Confirm Check-Out")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {pendingAction.type === "checkIn"
                      ? (isRTL ? "توثيق حضور المستفيد في المساحة بالوقت الفعلي" : "Log actual arrival time in hub")
                      : (isRTL ? "إنهاء جلسة الحضور واحتساب المدة الفعلية" : "End session & compute actual duration")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancelModal}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Member Details Card */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                    pendingAction.record.type === "student"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : pendingAction.record.type === "freelancer"
                      ? "bg-teal-50 text-teal-800 border-teal-200"
                      : "bg-cyan-50 text-cyan-800 border-cyan-200"
                  }`}
                >
                  {pendingAction.record.avatarLetter}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900 text-sm">
                    {pendingAction.record.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>{pendingAction.record.subText}</span>
                    {pendingAction.record.bookingTime && (
                      <>
                        <span>•</span>
                        <span dir="ltr" className="font-mono font-semibold">
                          {pendingAction.record.bookingTime}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Details Section */}
              {pendingAction.type === "checkIn" ? (
                <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100/80 space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-600 font-medium">
                      {isRTL ? "وقت الوصول الفعلي (توقيت غزة):" : "Actual Check-In Time (Gaza):"}
                    </span>
                    <span
                      dir="ltr"
                      className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md text-sm"
                    >
                      {pendingAction.currentTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                    {isRTL
                      ? "💡 سيتم اعتماد هذا التوقيت الفعلي وتثبيته في سجل الحضور فوراً دون اختفاء."
                      : "This live timestamp will be saved permanently in the attendance log."}
                  </p>
                </div>
              ) : (
                <div className="bg-rose-50/40 rounded-xl p-3.5 border border-rose-100/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-600 font-medium">
                      {isRTL ? "وقت الدخول المسجل:" : "Recorded Arrival:"}
                    </span>
                    <span
                      dir="ltr"
                      className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-xs sm:text-sm"
                    >
                      {checkoutSummary?.arrTime || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-600 font-medium">
                      {isRTL ? "وقت المغادرة الفعلي (الآن):" : "Actual Departure (Now):"}
                    </span>
                    <span
                      dir="ltr"
                      className="font-mono font-bold text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-md text-sm"
                    >
                      {pendingAction.currentTime}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-rose-100/80 flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-700">
                      {isRTL ? "المدة المستغرقة:" : "Elapsed Duration:"}
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
                      {checkoutSummary?.durationStr}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelModal}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRTL ? "لا / إلغاء" : "No / Cancel"}
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  pendingAction.type === "checkIn"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800"
                    : "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800"
                }`}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {pendingAction.type === "checkIn"
                    ? (isRTL ? "نعم، تأكيد الوصول" : "Yes, Confirm Check-In")
                    : (isRTL ? "نعم، تأكيد المغادرة" : "Yes, Confirm Check-Out")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
