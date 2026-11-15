"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  EventItem,
  EventAttendee,
  getAdminEventRegistrationsApi,
  updateAttendeeStatusApi,
  notifyAttendeeApi,
  bulkAcceptAttendeesApi,
  deleteAttendeeApi,
} from "@/services/events";
import {
  X,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Download,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
  Trash2,
  Send,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface EventRegistrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  onRefreshEvent?: () => void;
}

export default function EventRegistrationsModal({
  isOpen,
  onClose,
  event,
  onRefreshEvent,
}: EventRegistrationsModalProps) {
  const { locale, dir } = useLanguage();
  const isRTL = locale === "ar" || dir === "rtl";

  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    capacity: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sendEmailOnAccept, setSendEmailOnAccept] = useState(true);

  const loadRegistrations = useCallback(async () => {
    if (!event) return;
    setLoading(true);
    try {
      const res = await getAdminEventRegistrationsApi(event.id, {
        status: statusFilter,
        search: searchQuery,
      });

      if (res.success) {
        setAttendees(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load attendees", err);
    } finally {
      setLoading(false);
    }
  }, [event, statusFilter, searchQuery]);

  useEffect(() => {
    if (isOpen && event) {
      setSelectedIds([]);
      setFeedbackMsg(null);
      loadRegistrations();
    }
  }, [isOpen, event, loadRegistrations]);

  if (!isOpen || !event) return null;

  // Status update (Single)
  const handleUpdateStatus = async (
    attendeeId: number,
    newStatus: "pending" | "accepted" | "rejected",
    sendEmail: boolean = false
  ) => {
    setActionLoadingId(attendeeId);
    setFeedbackMsg(null);
    try {
      const res = await updateAttendeeStatusApi(attendeeId, newStatus, sendEmail);
      if (res.success) {
        setFeedbackMsg({
          type: "success",
          text: isRTL ? "تم تحديث حالة المشترك بنجاح" : "Status updated successfully",
        });
        loadRegistrations();
        if (onRefreshEvent) onRefreshEvent();
      } else {
        throw new Error(res.message);
      }
    } catch (err: unknown) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : (isRTL ? "فشل التعديل" : "Failed to update"),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Notify attendee (WhatsApp or Email)
  const handleNotify = async (attendeeId: number, channel: "email" | "whatsapp") => {
    setActionLoadingId(attendeeId);
    setFeedbackMsg(null);
    try {
      const res = await notifyAttendeeApi(attendeeId, channel);
      if (res.success) {
        if (channel === "whatsapp" && res.whatsapp_link) {
          window.open(res.whatsapp_link, "_blank");
        } else {
          setFeedbackMsg({
            type: "success",
            text: isRTL ? "تم إرسال بريد القبول الرسمي عبر Brevo بنجاح" : "Acceptance email sent via Brevo",
          });
        }
        loadRegistrations();
      } else {
        throw new Error(res.message);
      }
    } catch (err: unknown) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : (isRTL ? "فشل إرسال الإشعار" : "Failed to send notification"),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Bulk Accept
  const handleBulkAccept = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    setFeedbackMsg(null);
    try {
      const res = await bulkAcceptAttendeesApi(event.id, selectedIds, sendEmailOnAccept);
      if (res.success) {
        setFeedbackMsg({
          type: "success",
          text: isRTL
            ? `تم قبول ${res.accepted_count || selectedIds.length} مشتركين بنجاح!`
            : `Accepted ${res.accepted_count || selectedIds.length} attendees!`,
        });
        setSelectedIds([]);
        loadRegistrations();
        if (onRefreshEvent) onRefreshEvent();
      } else {
        throw new Error(res.message);
      }
    } catch (err: unknown) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : (isRTL ? "فشل القبول الجماعي" : "Failed bulk accept"),
      });
    } finally {
      setBulkLoading(false);
    }
  };

  // Delete attendee
  const handleDeleteAttendee = async (attendeeId: number, attendeeName: string) => {
    if (!confirm(isRTL ? `هل أنت متأكد من حذف تسجيل "${attendeeName}"؟` : `Delete registration for "${attendeeName}"?`)) {
      return;
    }

    setActionLoadingId(attendeeId);
    try {
      const res = await deleteAttendeeApi(attendeeId);
      if (res.success) {
        setFeedbackMsg({
          type: "success",
          text: isRTL ? "تم حذف المشترك بنجاح" : "Attendee deleted successfully",
        });
        loadRegistrations();
        if (onRefreshEvent) onRefreshEvent();
      }
    } catch (err: unknown) {
      setFeedbackMsg({
        type: "error",
        text: err instanceof Error ? err.message : (isRTL ? "فشل الحذف" : "Failed to delete"),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === attendees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(attendees.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export to CSV with full applicant details
  const handleExportCSV = () => {
    if (attendees.length === 0) return;

    const headers = [
      "الرقم",
      "الاسم",
      "الهاتف (واتساب)",
      "العمر",
      "الجنس",
      "التخصص",
      "الجامعة",
      "البريد الإلكتروني",
      "سبب الاهتمام بالورشة",
      "إجابات الأسئلة المخصصة",
      "عضو بالمركز",
      "الحالة",
      "ملاحظات",
      "تاريخ التسجيل",
    ];

    const rows = attendees.map((a, idx) => {
      // Format custom answers
      let customAnswersStr = "";
      if (a.custom_answers && typeof a.custom_answers === "object") {
        customAnswersStr = Object.entries(a.custom_answers)
          .map(([qid, ans]) => {
            const qLabel = event.custom_questions?.find((q) => q.id === qid)?.label || qid;
            return `${qLabel}: ${ans}`;
          })
          .join(" | ");
      }

      const genderLabel =
        a.gender === "male"
          ? "ذكر"
          : a.gender === "female"
          ? "أنثى"
          : a.gender || "";

      const cleanCell = (str: string) => `"${(str || "").replace(/"/g, '""').replace(/[\r\n]+/g, " ").trim()}"`;

      return [
        idx + 1,
        cleanCell(a.name || ""),
        cleanCell(a.phone || ""),
        a.age || "",
        cleanCell(genderLabel),
        cleanCell(a.specialty || ""),
        cleanCell(a.university || ""),
        cleanCell(a.email || ""),
        cleanCell(a.motivation || ""),
        cleanCell(customAnswersStr),
        a.is_member ? "نعم" : "لا",
        a.status === "accepted" ? "مقبول" : a.status === "rejected" ? "مرفوض" : "قيد المراجعة",
        cleanCell(a.notes || ""),
        cleanCell(a.registered_at || a.created_at || ""),
      ];
    });

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const cleanTitle = (event.title || `workshop_${event.id}`)
      .replace(/[/\\?%*:|"<>]/g, "_")
      .replace(/\s+/g, "_");
    link.setAttribute(
      "download",
      `workshop_${cleanTitle}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-950 truncate">
                  {isRTL ? "المسجلون في الورشة" : "Workshop Registrations"}
                </h3>
                {stats.capacity > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                    {isRTL ? `السعة: ${stats.capacity}` : `Capacity: ${stats.capacity}`}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                {event.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={attendees.length === 0}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-40"
              title={isRTL ? "تصدير إلى CSV" : "Export CSV"}
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{isRTL ? "تصدير Excel" : "Export"}</span>
            </button>

            <button
              type="button"
              onClick={loadRegistrations}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isRTL ? "تحديث" : "Refresh"}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between border-b ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter and Bulk Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Status Tabs with Live Counters */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl overflow-x-auto">
            {[
              { id: "all", label: isRTL ? "الكل" : "All", count: stats.total },
              { id: "pending", label: isRTL ? "قيد المراجعة" : "Pending", count: stats.pending },
              { id: "accepted", label: isRTL ? "المقبولون" : "Accepted", count: stats.accepted },
              { id: "rejected", label: isRTL ? "المرفوضون" : "Rejected", count: stats.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? "bg-white text-emerald-900 shadow-2xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                    statusFilter === tab.id
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-slate-200/80 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative flex-1 max-w-xs">
            <Search className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? "right-3" : "left-3"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? "بحث بالاسم أو الهاتف..." : "Search name or phone..."}
              className={`w-full py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 ${
                isRTL ? "pr-8 pl-3" : "pl-8 pr-3"
              }`}
            />
          </div>
        </div>

        {/* Bulk Actions Banner (When items selected) */}
        {selectedIds.length > 0 && (
          <div className="px-4 py-2 bg-emerald-50/90 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-2.5 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-950">
                {isRTL
                  ? `تم تحديد ${selectedIds.length} من المشتركين`
                  : `${selectedIds.length} selected`}
              </span>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 cursor-pointer mr-2">
                <input
                  type="checkbox"
                  checked={sendEmailOnAccept}
                  onChange={(e) => setSendEmailOnAccept(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{isRTL ? "إرسال إيميل قبول فوري عبر Brevo" : "Send Brevo email"}</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkAccept}
                disabled={bulkLoading}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isRTL ? "قبول المحددين" : "Accept Selected"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              >
                {isRTL ? "إلغاء التحديد" : "Deselect"}
              </button>
            </div>
          </div>
        )}

        {/* Attendees List / Table */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-emerald-600" />
              <p className="text-xs font-bold">{isRTL ? "جارٍ تحميل قائمة المسجلين..." : "Loading attendees..."}</p>
            </div>
          ) : attendees.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 stroke-[1.5] text-slate-300" />
              <h4 className="text-sm font-bold text-slate-700 mb-1">
                {isRTL ? "لا يوجد مسجلون في هذه القائمة" : "No attendees found"}
              </h4>
              <p className="text-xs text-slate-500">
                {isRTL ? "عندما يقوم الزوار بالتسجيل في الورشة، ستظهر بياناتهم هنا فوراً." : "Registered users will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Select All Checkbox */}
              <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-bold mb-1">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 hover:text-slate-800 cursor-pointer"
                >
                  {selectedIds.length === attendees.length ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{isRTL ? "تحديد الكل" : "Select All"}</span>
                </button>
                <span>{attendees.length} {isRTL ? "مسجل" : "registrations"}</span>
              </div>

              {attendees.map((attendee) => {
                const isSelected = selectedIds.includes(attendee.id);
                const isItemLoading = actionLoadingId === attendee.id;

                return (
                  <div
                    key={attendee.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-emerald-50/50 border-emerald-300 shadow-2xs"
                        : "bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Left Side: Checkbox, Name, Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(attendee.id)}
                          className="mt-1 text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-black text-slate-950">
                              {attendee.name}
                            </span>

                            {/* Age Badge */}
                            {Boolean(attendee.age) && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                {attendee.age} {isRTL ? "سنة" : "yrs"}
                              </span>
                            )}

                            {/* Gender Badge */}
                            {Boolean(attendee.gender) && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                                {attendee.gender === "male"
                                  ? (isRTL ? "ذكر" : "Male")
                                  : attendee.gender === "female"
                                  ? (isRTL ? "أنثى" : "Female")
                                  : attendee.gender}
                              </span>
                            )}

                            {attendee.is_member && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {isRTL ? "عضو مساحة" : "Member"}
                              </span>
                            )}

                            {/* Status Badge */}
                            {attendee.status === "accepted" && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{isRTL ? "مقبول" : "Accepted"}</span>
                              </span>
                            )}
                            {attendee.status === "pending" && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>{isRTL ? "قيد الانتظار" : "Pending"}</span>
                              </span>
                            )}
                            {attendee.status === "rejected" && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>{isRTL ? "مرفوض" : "Rejected"}</span>
                              </span>
                            )}
                          </div>

                          {/* Contact Details & Education */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-mono font-bold text-slate-900" dir="ltr">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{attendee.phone}</span>
                            </span>

                            {attendee.email && (
                              <span className="flex items-center gap-1 font-sans" dir="ltr">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{attendee.email}</span>
                              </span>
                            )}

                            {attendee.university && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{attendee.university}</span>
                              </span>
                            )}

                            {attendee.specialty && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{attendee.specialty}</span>
                              </span>
                            )}
                          </div>

                          {/* Motivation (لماذا مهتم بهذه الورشة) */}
                          {attendee.motivation && (
                            <div className="mt-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-slate-700 leading-relaxed">
                              <span className="font-bold text-emerald-800 block mb-0.5 text-[11px]">
                                {isRTL ? "سبب الاهتمام بالورشة وماذا يأمل أن يتعلم:" : "Why interested in workshop:"}
                              </span>
                              <p className="text-slate-600 font-medium whitespace-pre-wrap">{attendee.motivation}</p>
                            </div>
                          )}

                          {/* Custom Questions Answers (إجابات الأسئلة المخصصة) */}
                          {attendee.custom_answers && Object.keys(attendee.custom_answers).length > 0 && (
                            <div className="mt-2 space-y-1 bg-amber-50/50 border border-amber-200/70 rounded-xl p-2.5 text-xs">
                              <span className="font-bold text-amber-900 block mb-1 text-[11px]">
                                {isRTL ? "إجابات الأسئلة الإضافية المخصصة:" : "Custom Questions Answers:"}
                              </span>
                              {Object.entries(attendee.custom_answers).map(([key, val]) => {
                                const qLabel = event.custom_questions?.find((q) => q.id === key)?.label || key;
                                return (
                                  <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 text-[11px]">
                                    <span className="font-bold text-slate-800">{qLabel}:</span>
                                    <span className="text-slate-700 font-medium">{String(val || "-")}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Notes if any */}
                          {attendee.notes && (
                            <p className="mt-1.5 text-xs text-slate-500 bg-slate-100/70 p-1.5 rounded-lg border border-slate-200/60 leading-relaxed">
                              <span className="font-bold text-slate-700">{isRTL ? "ملاحظة: " : "Note: "}</span>
                              {attendee.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 sm:self-center">
                        {/* WhatsApp Direct Chat */}
                        <button
                          type="button"
                          onClick={() => handleNotify(attendee.id, "whatsapp")}
                          disabled={isItemLoading}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                          title={isRTL ? "مراسلة عبر واتساب" : "Message on WhatsApp"}
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isRTL ? "واتساب" : "WhatsApp"}</span>
                        </button>

                        {/* Send Email via Brevo */}
                        {attendee.email && (
                          <button
                            type="button"
                            onClick={() => handleNotify(attendee.id, "email")}
                            disabled={isItemLoading}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                            title={isRTL ? "إرسال إيميل قبول رسمي عبر Brevo" : "Send Brevo email"}
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>{isRTL ? "إيميل" : "Email"}</span>
                          </button>
                        )}

                        {/* Accept Button */}
                        {attendee.status !== "accepted" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(attendee.id, "accepted", true)}
                            disabled={isItemLoading}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isRTL ? "قبول" : "Accept"}</span>
                          </button>
                        )}

                        {/* Reject Button */}
                        {attendee.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(attendee.id, "rejected", false)}
                            disabled={isItemLoading}
                            className="px-2 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={isRTL ? "رفض الطلب" : "Reject"}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAttendee(attendee.id, attendee.name)}
                          disabled={isItemLoading}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title={isRTL ? "حذف التسجيل" : "Delete"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            {isRTL
              ? "يتم إرسال إشعارات البريد مباشرة عبر Brevo API مع ترويسة إديوهب الرسمية."
              : "Acceptance emails are sent via official Brevo API."}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            {isRTL ? "إغلاق النافذة" : "Close"}
          </button>
        </div>

      </div>
    </div>
  );
}
