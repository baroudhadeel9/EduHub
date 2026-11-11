"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  Calendar,
  Clock,
  Phone,
  Mail,
  FileText,
  Check,
  XCircle,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Armchair,
} from "lucide-react";
import { VisitorRequest } from "./types";
import { getVisitorPassAvailableSeatsApi } from "@/services/applications";

interface AvailableSeatItem {
  id: number;
  room_id: number;
  room_name: string;
  seat_number: number;
  label: string;
  code?: string;
}

interface AvailableRoomItem {
  id: number;
  name_ar: string;
  room_key: string;
  available_seats: AvailableSeatItem[];
  available_count: number;
}

interface VisitorDetailModalProps {
  request: VisitorRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (req: VisitorRequest, seatId?: number, roomId?: number) => void;
  onOpenReject: (req: VisitorRequest) => void;
  onSendPass: (id: string) => void;
  isPassSent?: boolean;
}

export default function VisitorDetailModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onOpenReject,
  onSendPass,
  isPassSent = false,
}: VisitorDetailModalProps) {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Available seats state
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoomItem[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen || !request || request.status !== "pending") {
      setAvailableRooms([]);
      setSelectedRoomId(null);
      setSelectedSeatId(null);
      return;
    }

    let isMounted = true;
    setLoadingSeats(true);

    getVisitorPassAvailableSeatsApi(request.id)
      .then((res) => {
        if (!isMounted) return;
        const rms = (res.rooms || []) as AvailableRoomItem[];
        setAvailableRooms(rms);

        if (res.recommended_seat) {
          setSelectedSeatId(res.recommended_seat.id);
          setSelectedRoomId(res.recommended_seat.room_id);
        } else if (rms.length > 0 && rms[0].available_seats.length > 0) {
          setSelectedRoomId(rms[0].id);
          setSelectedSeatId(rms[0].available_seats[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch available seats for pass:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingSeats(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, request?.id, request?.status]);

  if (!isOpen || !request) return null;

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(request.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const cleanPhoneForWa = request.phone.replace(/[^0-9]/g, "");

  // Find currently selected room and its seats
  const currentRoom = availableRooms.find((r) => r.id === selectedRoomId) || availableRooms[0];
  const currentRoomSeats = currentRoom?.available_seats || [];
  const selectedSeat = currentRoomSeats.find((s) => s.id === selectedSeatId) ||
    availableRooms.flatMap((r) => r.available_seats).find((s) => s.id === selectedSeatId);

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
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 border ${request.avatarColor}`}
              >
                {request.avatarLetter}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {request.name}
                  </h2>
                  {request.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {isRTL ? "موعد تقديم الطلب:" : "Submitted on:"}{" "}
                    <span className="font-semibold text-slate-700">
                      {request.submittedAt}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Badge */}
              {request.status === "pending" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{isRTL ? "بانتظار القرار" : "Pending"}</span>
                </span>
              )}
              {request.status === "approved" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{isRTL ? "معتمد" : "Approved"}</span>
                </span>
              )}
              {request.status === "rejected" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  <span>{isRTL ? "مرفوض" : "Rejected"}</span>
                </span>
              )}

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
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Quick Visit Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isRTL ? "تاريخ الزيارة المطلوب" : "Visit Date"}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {request.visitDate}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isRTL ? "فترة وتوقيت الزيارة (إجباري)" : "Visit Time Slot"}</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {request.visitTime && request.visitTime !== "-" ? request.visitTime : request.durationLabel}
                </div>
              </div>
            </div>

            {/* Approved Seat Display (If already approved) */}
            {request.status === "approved" && (request.seatLabel || request.seatNumber) && (
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    <Armchair className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-xs text-emerald-700 font-medium">
                      {isRTL ? "المقعد المحجوز للزائر:" : "Reserved Seat:"}
                    </div>
                    <div className="text-sm font-black text-emerald-950">
                      {request.seatLabel || `مقعد ${request.seatNumber}`}
                      {request.roomName ? ` • ${request.roomName}` : ""}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                  {isRTL ? "محجوز ومعتمد ✓" : "Reserved ✓"}
                </span>
              </div>
            )}

            {/* Available Seat Assignment Card for Pending Requests */}
            {request.status === "pending" && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-slate-50 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Armchair className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {isRTL ? "تخصيص مقعد للزائر (حجز مقعد متاح)" : "Assign Available Seat"}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isRTL
                          ? "سيتم حجز هذا المقعد وإدراجه في رسالة القبول للزائر"
                          : "This seat will be booked and sent in confirmation pass"}
                      </p>
                    </div>
                  </div>

                  {loadingSeats && (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  )}
                </div>

                {loadingSeats ? (
                  <div className="py-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>{isRTL ? "جاري فحص المقاعد المتاحة لهذا اليوم..." : "Checking available seats..."}</span>
                  </div>
                ) : availableRooms.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    {isRTL ? "لا توجد مقاعد شاغرة مسجلة في هذا التاريخ." : "No available seats found for this date."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Room Selector Pills */}
                    {availableRooms.length > 1 && (
                      <div className="flex items-center gap-2">
                        {availableRooms.map((rm) => (
                          <button
                            key={rm.id}
                            type="button"
                            onClick={() => {
                              setSelectedRoomId(rm.id);
                              if (rm.available_seats?.length > 0) {
                                setSelectedSeatId(rm.available_seats[0].id);
                              }
                            }}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              selectedRoomId === rm.id
                                ? "bg-emerald-700 text-white shadow-xs"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span>{rm.name_ar}</span>
                            <span className="ms-1 text-[11px] opacity-80">({rm.available_count} متاح)</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Seat Select dropdown */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {isRTL ? "اختر المقعد الشاغر المطلوب:" : "Select Available Seat:"}
                      </label>
                      <select
                        value={selectedSeatId || ""}
                        onChange={(e) => setSelectedSeatId(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all cursor-pointer"
                      >
                        {currentRoomSeats.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.label} ({st.room_name}) • متاح ✓
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedSeat && (
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-semibold shadow-2xs">
                        <span>{isRTL ? "المقعد الذي سيتم اعتماده وحجزه:" : "Seat to be allocated:"}</span>
                        <span className="font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {selectedSeat.label} ({selectedSeat.room_name}) ✓
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Contact Info ── */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isRTL ? "بيانات التواصل" : "Contact Information"}
              </h3>

              <div className="p-4 rounded-xl border border-slate-200/90 space-y-3 bg-white">
                {/* Phone & WhatsApp */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {isRTL ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 font-mono" dir="ltr">
                        {request.phone}
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
                        title="WhatsApp"
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
                        {request.email || (isRTL ? "غير محدد" : "Not provided")}
                      </div>
                    </div>
                  </div>

                  {request.email && (
                    <a
                      href={`mailto:${request.email}`}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                    >
                      {isRTL ? "مراسلة" : "Email"}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ── Purpose and Reason for Visit ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isRTL ? "سبب وتفاصيل الزيارة" : "Visit Purpose & Reason"}
                </h3>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {request.purposeBadge}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isRTL ? "توضيح المتقدم في الطلب:" : "Applicant Statement:"}</span>
                </div>
                <p className="font-normal text-slate-800 whitespace-pre-line">
                  {request.purposeText}
                </p>
              </div>
            </div>
          </div>

          {/* ── Footer Actions ── */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-white">
            {request.status === "pending" && (() => {
              const now = new Date();
              const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
              const isPastDate = request.visitDate !== "-" && request.visitDate < todayStr;

              return (
                <div className="space-y-3">
                  {isPastDate && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>
                        {isRTL
                          ? `موعد الزيارة المحدد (${request.visitDate}) قد مضى بالفعل، لا يمكن اعتماد الطلب بعد انتهاء تاريخه.`
                          : `The scheduled visit date (${request.visitDate}) has already passed. This pass cannot be approved.`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isPastDate}
                      onClick={() => onApprove(request, selectedSeatId || undefined, selectedRoomId || undefined)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all ${
                        isPastDate
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 cursor-pointer"
                      }`}
                      title={isPastDate ? (isRTL ? "تاريخ الزيارة قد مضى" : "Visit date passed") : undefined}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>
                        {isRTL
                          ? (selectedSeat ? `اعتماد الطلب وحجز ${selectedSeat.label}` : "اعتماد الطلب وحجز المقعد")
                          : "Approve & Reserve Seat"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenReject(request)}
                      className="py-3 px-4 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs sm:text-sm transition-all active:scale-98 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{isRTL ? "رفض الطلب" : "Reject"}</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {request.status === "approved" && (
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isRTL
                      ? `الطلب معتمد ومحجوز له (${request.seatLabel || "مقعد"})`
                      : "Request approved and seat reserved"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onSendPass(request.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isRTL ? "إرسال إشعار التصريح (واتساب / بريد)" : "Notify Visitor"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
