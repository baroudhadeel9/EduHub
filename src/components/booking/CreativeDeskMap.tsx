"use client";

import React, { useState, useMemo } from "react";
import {
  Armchair,
  Zap,
  Wifi,
  Coffee,
  Sun,
  DoorOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  LayoutGrid,
  Layers,
  Leaf,
  Laptop,
} from "lucide-react";
import { SeatItem } from "@/services/roomSeats";

interface CreativeDeskMapProps {
  seats: SeatItem[];
  roomName: string;
  roomKey?: string;
  bookingStartTime: string;
  bookingEndTime: string;
  selectedSeat: SeatItem | null;
  onSelectSeat: (seat: SeatItem | null) => void;
  isRTL: boolean;
}

export const CreativeDeskMap: React.FC<CreativeDeskMapProps> = ({
  seats,
  roomName,
  bookingStartTime,
  bookingEndTime,
  selectedSeat,
  onSelectSeat,
  isRTL,
}) => {
  // View mode: "studio" (Architectural Floor Plan) or "smart_finder" (Grouped Smart Cards)
  const [viewMode, setViewMode] = useState<"studio" | "smart_finder">("studio");
  const [smartFilter, setSmartFilter] = useState<"all" | "window" | "power" | "shared" | "free">("all");
  const [inspectingSeat, setInspectingSeat] = useState<SeatItem | null>(null);

  // Group seats by architectural zones:
  // Zone 1: Window Bay (first ~30% of seats or seats 1-6)
  // Zone 2: Focus Island (middle ~40% of seats or seats 7-14)
  // Zone 3: Coffee & Entrance Pod (last ~30% of seats or seats 15-20)
  const { windowDesks, focusIslandDesksRowA, focusIslandDesksRowB, entranceDesks, extraDesks } = useMemo(() => {
    const total = seats.length;
    if (total <= 20) {
      const win = seats.slice(0, 6);
      const focusA = seats.slice(6, 10);
      const focusB = seats.slice(10, 14);
      const ent = seats.slice(14, 20);
      return {
        windowDesks: win,
        focusIslandDesksRowA: focusA,
        focusIslandDesksRowB: focusB,
        entranceDesks: ent,
        extraDesks: [],
      };
    } else {
      // Dynamic split for rooms with > 20 seats
      const win = seats.slice(0, 6);
      const focusA = seats.slice(6, 10);
      const focusB = seats.slice(10, 14);
      const ent = seats.slice(14, 20);
      const extra = seats.slice(20);
      return {
        windowDesks: win,
        focusIslandDesksRowA: focusA,
        focusIslandDesksRowB: focusB,
        entranceDesks: ent,
        extraDesks: extra,
      };
    }
  }, [seats]);

  // Pure server consumer: Uses status and availability pre-calculated by backend server
  const getSeatStatus = (seat: SeatItem) => {
    const isLocked = Boolean(seat.is_locked || seat.status === "locked");
    const isFullyBooked = seat.status === "fully_booked";
    const isPartiallyBooked = seat.status === "partially_booked";
    const isAvailableForShift = Boolean(seat.is_available);
    const hasConflictInShift = Boolean(seat.has_conflict || (!seat.is_available && !isLocked));
    const isSharedAvailable = isAvailableForShift && isPartiallyBooked;
    const isFullyFree = isAvailableForShift && !isPartiallyBooked;

    return {
      isLocked,
      isFullyBooked,
      isPartiallyBooked,
      hasConflictInShift,
      isAvailableForShift,
      isSharedAvailable,
      isFullyFree,
    };
  };

  // Helper to get desk zone title
  const getDeskZoneName = (seatNumber: number) => {
    if (seatNumber <= 6) return isRTL ? "صف النوافذ الطبيعية المطل على الحديقة 🪟" : "Window Garden Bay 🪟";
    if (seatNumber <= 14) return isRTL ? "جزيرة العمل والتركيز العالي 💻" : "Deep Focus Power Island 💻";
    return isRTL ? "جناح ركن القهوة والمدخل ☕" : "Coffee & Lounge Pod ☕";
  };

  // Render a Single Interactive Desk Workstation Station
  const renderWorkstation = (seat: SeatItem, orientation: "north" | "south" | "standard" = "standard") => {
    const status = getSeatStatus(seat);
    const isSelected = selectedSeat?.id === seat.id;
    const isInspecting = inspectingSeat?.id === seat.id;

    // Visual styles based on status
    let deskBg = "bg-white border-slate-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-md";
    let screenGlow = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]";
    let statusLabel = isRTL ? "متاح بالكامل" : "Free all day";
    let badgeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";

    if (isSelected) {
      deskBg = "bg-gradient-to-b from-emerald-600 to-teal-700 border-emerald-800 text-white shadow-lg ring-3 ring-emerald-500/40 scale-105 z-20";
      screenGlow = "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.9)] animate-pulse";
      statusLabel = isRTL ? "مقعدك المختار" : "Selected";
      badgeColor = "text-white bg-white/20 border-white/30";
    } else if (status.isLocked) {
      deskBg = "bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed";
      screenGlow = "bg-slate-400";
      statusLabel = seat.availability_label || (isRTL ? "مغلق" : "Locked");
      badgeColor = "text-slate-500 bg-slate-200/60 border-slate-300";
    } else if (status.hasConflictInShift || status.isFullyBooked) {
      deskBg = "bg-rose-50/70 border-rose-200 text-rose-800 opacity-65 cursor-not-allowed";
      screenGlow = "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]";
      statusLabel = seat.availability_label || (isRTL ? "غير متاح" : "Unavailable");
      badgeColor = "text-rose-700 bg-rose-100/70 border-rose-200";
    } else if (status.isSharedAvailable) {
      deskBg = "bg-gradient-to-b from-indigo-50/90 to-purple-50/70 border-indigo-300 hover:border-indigo-500 text-indigo-950 shadow-xs hover:shadow-md";
      screenGlow = "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]";
      statusLabel = seat.availability_label || (isRTL ? "محجوز جزئياً" : "Partially booked");
      badgeColor = "text-indigo-800 bg-indigo-100/80 border-indigo-200 font-extrabold";
    } else {
      statusLabel = seat.availability_label || (isRTL ? "متاح بالكامل" : "Available");
    }

    return (
      <div
        key={seat.id}
        onClick={() => {
          if (status.isLocked || status.hasConflictInShift) {
            setInspectingSeat(seat);
            return;
          }
          onSelectSeat(seat);
          setInspectingSeat(seat);
        }}
        className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 select-none ${
          isInspecting && !isSelected ? "ring-2 ring-indigo-400/80 rounded-2xl" : ""
        }`}
        title={`${seat.label} - ${statusLabel}`}
      >
        {/* Top Ergonomic Chair (if desk orientation is south facing) */}
        {orientation === "south" && (
          <div
            className={`w-9 h-3.5 rounded-t-lg border transition-all duration-300 mb-0.5 ${
              isSelected
                ? "bg-emerald-800 border-emerald-900 -translate-y-1"
                : status.isLocked || status.hasConflictInShift
                ? "bg-slate-200 border-slate-300 opacity-50"
                : "bg-slate-700 border-slate-800 group-hover:-translate-y-1 shadow-2xs"
            }`}
          />
        )}

        {/* ── Realistic Desk Table Top Station ── */}
        <div
          className={`w-full min-w-[70px] sm:min-w-[80px] h-[78px] sm:h-[84px] rounded-2xl border p-2 flex flex-col justify-between transition-all duration-300 ${deskBg}`}
        >
          {/* Top Bar on Desk: Desk Code & Power Dot */}
          <div className="flex items-center justify-between w-full">
            <span
              className={`text-[10px] font-mono font-black tracking-tight ${
                isSelected ? "text-white/90" : "text-slate-500"
              }`}
            >
              {seat.seat_number < 10 ? `0${seat.seat_number}` : seat.seat_number}
            </span>

            <div className="flex items-center gap-1">
              {seat.has_power && (
                <span
                  title={isRTL ? "مزود بفيش شاحن سريع 220V" : "Fast power outlet"}
                  className={`flex items-center justify-center p-0.5 rounded-full ${
                    isSelected ? "text-amber-300 bg-emerald-800/60" : "text-amber-600 bg-amber-50"
                  }`}
                >
                  <Zap className="w-2.5 h-2.5 fill-current" />
                </span>
              )}
              {/* Starlink dot */}
              <span
                title={isRTL ? "إنترنت فضائي 5G فائق السرعة" : "5G Starlink"}
                className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-400"}`}
              />
            </div>
          </div>

          {/* Center of Desk: Realistic Laptop with Illuminated Screen */}
          <div className="flex items-center justify-center my-auto">
            <div className="relative flex flex-col items-center">
              {/* Laptop Screen */}
              <div
                className={`w-7 sm:w-8 h-4 sm:h-4.5 rounded-t-sm border border-slate-800/80 transition-all ${
                  isSelected ? "bg-slate-900 ring-1 ring-amber-300" : "bg-slate-900"
                } flex items-center justify-center`}
              >
                {/* Glowing LED display */}
                <div className={`w-5 sm:w-6 h-2.5 sm:h-3 rounded-[1px] ${screenGlow} transition-all`} />
              </div>
              {/* Laptop Keyboard Base */}
              <div
                className={`w-9 sm:w-10 h-1 sm:h-1.2 rounded-b-md ${
                  isSelected ? "bg-slate-800" : "bg-slate-700"
                } shadow-2xs`}
              />
            </div>
          </div>

          {/* Bottom Bar: Status Label */}
          <div className="w-full text-center">
            <span
              className={`text-[8.5px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md border truncate block max-w-full leading-none ${badgeColor}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Bottom Ergonomic Chair (Standard / North orientation) */}
        {orientation !== "south" && (
          <div
            className={`w-9 h-3.5 rounded-b-lg border transition-all duration-300 mt-0.5 ${
              isSelected
                ? "bg-emerald-800 border-emerald-900 translate-y-1"
                : status.isLocked || status.hasConflictInShift
                ? "bg-slate-200 border-slate-300 opacity-50"
                : "bg-slate-700 border-slate-800 group-hover:translate-y-1 shadow-2xs"
            }`}
          />
        )}
      </div>
    );
  };

  // Filtered seats for smart finder
  const filteredSmartDesks = useMemo(() => {
    return seats.filter((seat) => {
      const status = getSeatStatus(seat);
      if (smartFilter === "window") return seat.seat_number <= 6 && !status.isLocked && !status.hasConflictInShift;
      if (smartFilter === "power") return seat.has_power && !status.isLocked && !status.hasConflictInShift;
      if (smartFilter === "shared") return status.isSharedAvailable;
      if (smartFilter === "free") return status.isFullyFree;
      return true;
    });
  }, [seats, smartFilter]);

  // Active desk for inspection modal or details card
  const activeFocusDesk = inspectingSeat || selectedSeat;

  return (
    <div className="space-y-4">
      {/* ── Top Bar: Creative Mode Switcher & Stats ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-brand-navy to-slate-900 text-white shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black flex items-center gap-2">
              <span>{isRTL ? "مخطط الصالة التفاعلي" : "Interactive Studio Map"}</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {roomName}
              </span>
            </h4>
            <p className="text-[11px] text-slate-300">
              {isRTL
                ? "تجوّل في الصالة واختر مقعدك كأنك جالس فيه تماماً"
                : "Explore the studio layout and choose your physical desk"}
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Studio Floor Map vs Smart Finder */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl self-start sm:self-auto border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode("studio")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "studio"
                ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isRTL ? "مخطط الاستوديو الواقعي" : "Studio Map"}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("smart_finder")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "smart_finder"
                ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{isRTL ? "المقاعد الذكية والمقترحة" : "Smart Finder"}</span>
          </button>
        </div>
      </div>

      {/* Legend & Key Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-medium text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-white border border-slate-300 shadow-2xs" />
            <span>{isRTL ? "متاح بالكامل" : "Free all day"}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-100 border border-indigo-300" />
            <span className="text-indigo-900 font-bold">{isRTL ? "🔄 متاح لساعاتك (متقاسم)" : "Shared free"}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300" />
            <span>{isRTL ? "محجوز بفترتك" : "Booked in slot"}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-600" />
            <span className="text-emerald-700 font-bold">{isRTL ? "محدد" : "Selected"}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 fill-current" />
            <span>فيش شحن 220V</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span>ستارلينك 5G</span>
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VIEW 1: ARCHITECTURAL STUDIO FLOOR MAP (مخطط الصالة الواقعي)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === "studio" && (
        <div className="relative rounded-3xl border-2 border-slate-200 bg-[#f8fafc] p-4 sm:p-6 space-y-6 overflow-hidden shadow-inner">
          {/* Room Ambient Background Texture */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* ── ZONE 1: Sunlit Window Bay (صف النوافذ الطبيعية المطل على الحديقة) ── */}
          <div className="relative space-y-2">
            {/* Window Glass Top Bar with Sun & Sky Reflection */}
            <div className="relative h-10 rounded-2xl bg-gradient-to-r from-sky-100/90 via-emerald-50/70 to-sky-100/90 border border-sky-200/80 flex items-center justify-between px-4 text-xs font-bold text-sky-950 overflow-hidden shadow-2xs">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                <span>{isRTL ? "واجهة النوافذ الطبيعية المطلة على الحديقة" : "Panoramic Sunlit Window Gallery"}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-800 font-medium">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isRTL ? "إضاءة نهارية هادئة ونباتات طبيعية" : "Natural Daylight & Potted Flora"}</span>
              </div>
              {/* Glass reflection gradient */}
              <div className="absolute top-0 right-1/4 w-32 h-full bg-white/40 skew-x-[-30deg] pointer-events-none" />
            </div>

            {/* Window Desks Row (Desks 1 to 6) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 pt-1">
              {windowDesks.map((seat) => renderWorkstation(seat, "north"))}
            </div>
          </div>

          {/* ── ZONE 2: Deep Focus Bench Island (جزيرة العمل والتركيز العالي) ── */}
          <div className="relative p-4 sm:p-5 rounded-3xl bg-slate-100/80 border border-slate-200/90 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-1 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>{isRTL ? "جزيرة العمل والتركيز المركزية (طاولة مزدوجة)" : "Central Collaborative Island"}</span>
              </div>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-mono">
                {isRTL ? "مجهزة بقنوات شواحن ومآخذ طاقة" : "Power Channels Equipped"}
              </span>
            </div>

            {/* Row A: Facing Downwards (Desks 7 to 10) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {focusIslandDesksRowA.map((seat) => renderWorkstation(seat, "south"))}
            </div>

            {/* Central Divider & Cable Spine with Plants */}
            <div className="h-6 rounded-xl bg-gradient-to-r from-amber-100/90 via-emerald-100/70 to-amber-100/90 border border-amber-200/80 flex items-center justify-center gap-4 text-[10px] font-bold text-amber-900 shadow-inner">
              <span className="flex items-center gap-1 text-emerald-800">
                <Leaf className="w-3 h-3 text-emerald-600" />
                <span>حاجز نباتي عازل للصوت</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-800">
                <Zap className="w-3 h-3 text-amber-600 fill-current" />
                <span>مسار الطاقة والشحن المباشر 220V</span>
              </span>
            </div>

            {/* Row B: Facing Upwards (Desks 11 to 14) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {focusIslandDesksRowB.map((seat) => renderWorkstation(seat, "north"))}
            </div>
          </div>

          {/* ── ZONE 3: Coffee Lounge, Starlink Hub & Entrance (جناح القهوة والمدخل) ── */}
          <div className="relative space-y-3">
            {/* Zone Tag & Amenities Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                  <Coffee className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isRTL ? "ركن المشروبات والقهوة" : "Coffee Station"}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>{isRTL ? "راوتر ستارلينك 5G" : "Starlink Node"}</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <DoorOpen className="w-4 h-4 text-slate-600" />
                <span>{isRTL ? "بوابة الدخول الرئيسية للصالة" : "Main Hall Entrance"}</span>
              </div>
            </div>

            {/* Entrance Desks Row (Desks 15 to 20) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {entranceDesks.map((seat) => renderWorkstation(seat, "north"))}
            </div>

            {/* Any Additional Extra Desks (> 20) */}
            {extraDesks.length > 0 && (
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-500 mb-2">
                  {isRTL ? "المقاعد الإضافية في الصالة:" : "Additional Studio Desks:"}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                  {extraDesks.map((seat) => renderWorkstation(seat, "north"))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 2: SMART FINDER (المقاعد الذكية والمقترحة ببطاقات سريعة)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === "smart_finder" && (
        <div className="space-y-4">
          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
            {[
              { id: "all", label: isRTL ? "كل المقاعد" : "All Desks", icon: "✨" },
              { id: "window", label: isRTL ? "صف النوافذ 🪟" : "Window Desks", icon: "🪟" },
              { id: "power", label: isRTL ? "مزود بشاحن سريع ⚡" : "With Power", icon: "⚡" },
              { id: "shared", label: isRTL ? "متاحة بمشاركة ذكية 🔄" : "Shared Available", icon: "🔄" },
              { id: "free", label: isRTL ? "متاحة بالكامل 🟢" : "Fully Free", icon: "🟢" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSmartFilter(f.id as typeof smartFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  smartFilter === f.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60"
                }`}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Smart Desks Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSmartDesks.map((seat) => {
              const status = getSeatStatus(seat);
              const isSelected = selectedSeat?.id === seat.id;
              const zoneTitle = getDeskZoneName(seat.seat_number);

              return (
                <div
                  key={seat.id}
                  onClick={() => {
                    if (status.isLocked || status.hasConflictInShift) {
                      setInspectingSeat(seat);
                      return;
                    }
                    onSelectSeat(seat);
                    setInspectingSeat(seat);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-3 relative ${
                    isSelected
                      ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
                      : status.isLocked || status.hasConflictInShift
                      ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                      : status.isSharedAvailable
                      ? "bg-indigo-50/60 border-indigo-200 hover:border-indigo-400 hover:shadow-xs"
                      : "bg-white border-slate-200 hover:border-emerald-400 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : status.isSharedAvailable
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {seat.seat_number < 10 ? `0${seat.seat_number}` : seat.seat_number}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{seat.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{seat.code}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : status.isLocked
                          ? "bg-slate-200 text-slate-600 border-slate-300"
                          : status.hasConflictInShift
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : status.isSharedAvailable
                          ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                          : "bg-emerald-100 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      {isSelected
                        ? "محدد"
                        : status.isLocked
                        ? "مغلق"
                        : status.hasConflictInShift
                        ? "محجوز بفترتك"
                        : status.isSharedAvailable
                        ? "🔄 متاح بفترتك"
                        : "متاح بالكامل"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">{zoneTitle}</p>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                    {seat.has_power && (
                      <span className="flex items-center gap-1 text-amber-700 font-semibold">
                        <Zap className="w-3 h-3 fill-current" />
                        <span>شاحن 220V</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Wifi className="w-3 h-3" />
                      <span>واي فاي 5G</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          FLOATING WORKSTATION INSPECTOR (بطاقة المعاينة والتفاصيل للمقعد)
      ───────────────────────────────────────────────────────────── */}
      {activeFocusDesk && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 border-2 border-emerald-300 shadow-md animate-in fade-in slide-in-from-bottom-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                {activeFocusDesk.seat_number < 10 ? `0${activeFocusDesk.seat_number}` : activeFocusDesk.seat_number}
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <span>{activeFocusDesk.label}</span>
                  <span className="text-xs font-mono text-slate-400">({activeFocusDesk.code})</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {getDeskZoneName(activeFocusDesk.seat_number)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedSeat?.id === activeFocusDesk.id ? (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRTL ? "هذا المقعد محدد لحجزك حالياً" : "Currently Selected"}</span>
                </span>
              ) : (
                (() => {
                  const s = getSeatStatus(activeFocusDesk);
                  if (s.isLocked || s.hasConflictInShift) {
                    return (
                      <span className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>{isRTL ? "غير متاح في ساعاتك المطلوبة" : "Unavailable for slot"}</span>
                      </span>
                    );
                  }
                  return (
                    <button
                      type="button"
                      onClick={() => onSelectSeat(activeFocusDesk)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isRTL ? "تأكيد اختيار هذا المقعد" : "Select this Desk"}</span>
                    </button>
                  );
                })()
              )}
            </div>
          </div>

          {/* Workstation Specification Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-current shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">الطاقة والشحن</div>
                <div className="font-bold text-slate-800">فيش 220V + Type-C</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">الإنترنت</div>
                <div className="font-bold text-slate-800">ستارلينك فضائي 5G</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2">
              <Armchair className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">الجلوس</div>
                <div className="font-bold text-slate-800">كرسي شبكي هيدروليك</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">فترة حجزك</div>
                <div className="font-bold text-slate-800 font-mono">
                  {bookingStartTime} – {bookingEndTime}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

