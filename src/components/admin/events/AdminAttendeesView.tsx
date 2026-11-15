"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  EventItem,
  EventAttendee,
  getAllAdminRegistrationsApi,
  updateAttendeeStatusApi,
  deleteAttendeeApi,
} from "@/services/events";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Layers,
  MessageSquare,
  HelpCircle,
  Download,
  Trash2,
  ExternalLink,
  Sliders,
  Sparkles,
  FileQuestion,
  Filter,
  RefreshCw,
  Check,
  X,
  Eye,
  Award,
  UserCheck,
  FileText,
} from "lucide-react";

interface AdminAttendeesViewProps {
  events: EventItem[];
  initialEventId?: number | "all" | "upcoming";
  onOpenFormCustomizer?: (event?: EventItem) => void;
  isRTL?: boolean;
}

export default function AdminAttendeesView({
  events,
  initialEventId = "upcoming",
  onOpenFormCustomizer,
  isRTL = true,
}: AdminAttendeesViewProps) {
  const [attendees, setAttendees] = useState<(EventAttendee & { event_title?: string })[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    attended: 0,
    absent: 0,
  });
  const [loading, setLoading] = useState(true);

  // Separate upcoming active workshops vs past completed workshops
  const upcomingEvents = events.filter((e) => e.status === "scheduled" && !e.is_archived);
  const pastEvents = events.filter((e) => e.status === "completed" || e.status === "archived");

  // Filters: default to 'upcoming' (الورش القادمة والنشطة للتسجيل والقبول)
  const [selectedEventId, setSelectedEventId] = useState<number | "all" | "upcoming">(initialEventId);

  useEffect(() => {
    if (initialEventId !== undefined) {
      setSelectedEventId(initialEventId);
    }
  }, [initialEventId]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Detailed Modal for viewing all answers of an applicant
  const [viewingAttendee, setViewingAttendee] = useState<(EventAttendee & { event_title?: string }) | null>(null);

  // Selected event object if filtered by single event
  const selectedEvent = typeof selectedEventId === "number" ? events.find((e) => e.id === selectedEventId) : null;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAdminRegistrationsApi({
        eventId: selectedEventId,
        status: statusFilter,
        search: searchQuery,
      });

      if (res.success) {
        setAttendees(res.data || []);
        if (res.counts) {
          setCounts({
            total: res.counts.total ?? 0,
            pending: res.counts.pending ?? 0,
            accepted: res.counts.accepted ?? 0,
            rejected: res.counts.rejected ?? 0,
            attended: res.counts.attended ?? 0,
            absent: res.counts.absent ?? 0,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load attendees:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, statusFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Update Application Acceptance Status
  const handleUpdateStatus = async (
    attendeeId: number,
    newStatus: "pending" | "accepted" | "rejected"
  ) => {
    setActionLoadingId(attendeeId);
    setFeedback(null);
    try {
      const res = await updateAttendeeStatusApi(attendeeId, newStatus, false);
      if (res.success) {
        setAttendees((prev) =>
          prev.map((a) => (a.id === attendeeId ? { ...a, status: newStatus } : a))
        );
        loadData();
        setFeedback({
          type: "success",
          text: isRTL ? "تم تحديث حالة المشترك بنجاح" : "Status updated successfully",
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : isRTL ? "فشل التحديث" : "Failed to update",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Update Workshop Attendance Status (تم الحضور / غائب / بانتظار الحضور)
  const handleUpdateAttendance = async (
    attendeeId: number,
    newAttendance: "attended" | "absent" | "registered"
  ) => {
    setActionLoadingId(attendeeId);
    setFeedback(null);
    try {
      const res = await updateAttendeeStatusApi(attendeeId, {
        attendance_status: newAttendance,
      });
      if (res.success) {
        setAttendees((prev) =>
          prev.map((a) =>
            a.id === attendeeId
              ? {
                  ...a,
                  attendance_status: newAttendance,
                  status: "accepted",
                }
              : a
          )
        );
        loadData();
        setFeedback({
          type: "success",
          text:
            newAttendance === "attended"
              ? isRTL
                ? "تم تسجيل وتأكيد الحضور الفعلي للمشترك بنجاح ✓"
                : "Attendance confirmed successfully"
              : newAttendance === "absent"
              ? isRTL
                ? "تم تسجيل المشترك كغائب"
                : "Marked as absent"
              : isRTL
              ? "تمت إعادة ضبط حالة الحضور"
              : "Attendance status reset",
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : isRTL
            ? "فشل تحديث حالة الحضور"
            : "Failed to update attendance",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete registration
  const handleDelete = async (attendeeId: number, name: string) => {
    if (!confirm(isRTL ? `هل أنت متأكد من حذف تسجيل "${name}"؟` : `Delete registration for "${name}"?`)) {
      return;
    }
    setActionLoadingId(attendeeId);
    try {
      const res = await deleteAttendeeApi(attendeeId);
      if (res.success) {
        setAttendees((prev) => prev.filter((a) => a.id !== attendeeId));
        loadData();
        setFeedback({
          type: "success",
          text: isRTL ? "تم حذف التسجيل بنجاح" : "Registration deleted",
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : isRTL ? "فشل الحذف" : "Failed to delete",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // CSV Export (Includes attendance status for permanent record - STRICTLY SINGLE WORKSHOP ONLY)
  const handleExportCSV = () => {
    if (!selectedEvent) {
      setFeedback({
        type: "error",
        text: isRTL
          ? "تصدير كشف الحضور متاح لورشة عمل واحدة فقط. يرجى اختيار الورشة المحددة من القائمة أدناه."
          : "Attendance export is only available for a single workshop. Please select a workshop first.",
      });
      return;
    }

    if (attendees.length === 0) {
      setFeedback({
        type: "error",
        text: isRTL ? "لا يوجد مسجلون في هذه الورشة لتصديرهم." : "No attendees in this workshop to export.",
      });
      return;
    }

    const headers = [
      "الرقم",
      "الاسم",
      "الورشة",
      "الهاتف (واتساب)",
      "العمر",
      "الجنس",
      "التخصص",
      "الجامعة",
      "البريد الإلكتروني",
      "سبب الاهتمام بالورشة",
      "إجابات الأسئلة الإضافية",
      "حالة الطلب",
      "حالة الحضور الفعلي",
      "تاريخ التسجيل",
    ];

    const cleanCell = (str: string) => `"${(str || "").replace(/"/g, '""').replace(/[\r\n]+/g, " ").trim()}"`;

    const rows = attendees.map((a, idx) => {
      let customAnswersStr = "";
      if (a.custom_answers && typeof a.custom_answers === "object") {
        customAnswersStr = Object.entries(a.custom_answers)
          .map(([qid, ans]) => `${qid}: ${ans}`)
          .join(" | ");
      }

      const genderLabel = a.gender === "male" ? "ذكر" : a.gender === "female" ? "أنثى" : a.gender || "";
      const attendanceLabel =
        a.attendance_status === "attended"
          ? "حضر الورشة فعلياً"
          : a.attendance_status === "absent"
          ? "غائب"
          : "بانتظار الحضور";

      return [
        idx + 1,
        cleanCell(a.name || ""),
        cleanCell(a.event_title || selectedEvent.title || ""),
        cleanCell(a.phone || ""),
        a.age || "",
        cleanCell(genderLabel),
        cleanCell(a.specialty || ""),
        cleanCell(a.university || ""),
        cleanCell(a.email || ""),
        cleanCell(a.motivation || ""),
        cleanCell(customAnswersStr),
        a.status === "accepted" ? "مقبول" : a.status === "rejected" ? "مرفوض" : "قيد المراجعة",
        cleanCell(attendanceLabel),
        cleanCell(a.registered_at || a.created_at || ""),
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const cleanTitle = (selectedEvent.title || "workshop").replace(/[/\\?%*:|"<>]/g, "_").replace(/\s+/g, "_");
    const fileName = `attendance_${cleanTitle}_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      
      {/* Top Controls & Customizer Action Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>{isRTL ? "المسجلون في ورش العمل وتوثيق الحضور" : "Workshop Registrants & Attendance"}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isRTL
              ? "متابعة الطلاب المسجلين عبر الموقع، مراجعة طلباتهم، وتأكيد الحضور الفعلي وتوثيق تقرير الورشة"
              : "Review student applications, manage acceptance, mark actual attendance, and generate reports"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Form Customizer Shortcut */}
          {onOpenFormCustomizer && (
            <button
              type="button"
              onClick={() => onOpenFormCustomizer()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FileQuestion className="w-4 h-4 text-emerald-600" />
              <span>{isRTL ? "التحكم في أسئلة فورم التسجيل" : "Customize Form Questions"}</span>
            </button>
          )}

          {/* Export CSV Button (Only for a single selected workshop) */}
          {selectedEvent ? (
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={attendees.length === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-95"
              title={isRTL ? `تصدير كشف حضور ورشة: ${selectedEvent.title}` : `Export attendance for ${selectedEvent.title}`}
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{isRTL ? "تصدير كشف حضور الورشة (Excel)" : "Export Workshop Excel"}</span>
            </button>
          ) : (
            <span
              className="px-3 py-2 rounded-xl text-[11px] font-bold text-slate-500 bg-slate-100/90 border border-slate-200/80 flex items-center gap-1.5 select-none"
              title={isRTL ? "يرجى تحديد ورشة معينة من القائمة بالأسفل لتصدير كشف حضورها" : "Select a workshop below to export"}
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{isRTL ? "تصدير Excel (متاح لورشة واحدة فقط)" : "Export Excel (Single workshop only)"}</span>
            </span>
          )}
        </div>
      </div>



      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Workshop Selector Filter & Scope Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Quick Filter: Upcoming vs All */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedEventId("upcoming")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedEventId === "upcoming"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${selectedEventId === "upcoming" ? "bg-white animate-pulse" : "bg-emerald-500"}`} />
              <span>{isRTL ? "الورش القادمة والنشطة" : "Upcoming Workshops"}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedEventId("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedEventId === "all"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{isRTL ? "كافة الورش" : "All Workshops"}</span>
            </button>
          </div>

          {/* Specific Workshop Dropdown */}
          <select
            value={selectedEventId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedEventId(val === "all" || val === "upcoming" ? val : Number(val));
            }}
            className="w-full sm:w-auto md:w-60 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
          >
            <option value="upcoming">
              {isRTL ? "الورش القادمة والنشطة" : "Upcoming Active Workshops"}
            </option>
            <option value="all">
              {isRTL ? "كافة الورش والفعاليات" : "All Workshops"}
            </option>

            {upcomingEvents.length > 0 && (
              <optgroup label={isRTL ? "--- الورش القادمة والنشطة ---" : "--- Upcoming Active Workshops ---"}>
                {upcomingEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.dateBadge || ev.event_date})
                  </option>
                ))}
              </optgroup>
            )}

            {pastEvents.length > 0 && (
              <optgroup label={isRTL ? "--- الورش المكتملة والموثقة ---" : "--- Completed Workshops ---"}>
                {pastEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.dateBadge || ev.event_date} — مكتملة)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Status Segmented Buttons with Live Counts */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 w-full md:w-auto justify-center overflow-x-auto">
          {[
            { id: "all", label: isRTL ? "الكل" : "All", count: counts.total },
            { id: "pending", label: isRTL ? "قيد المراجعة" : "Pending", count: counts.pending },
            { id: "accepted", label: isRTL ? "المقبولون" : "Accepted", count: counts.accepted },
            { id: "attended", label: isRTL ? "حضروا فعلياً" : "Attended", count: counts.attended },
            { id: "rejected", label: isRTL ? "المرفوضون" : "Rejected", count: counts.rejected },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === st.id
                  ? st.id === "attended"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-white text-emerald-900 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{st.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                  statusFilter === st.id
                    ? st.id === "attended"
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-100 text-emerald-900"
                    : "bg-slate-200/80 text-slate-700"
                }`}
              >
                {st.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? "بحث بالاسم، الهاتف، الجامعة..." : "Search by name, phone..."}
            className="w-full ps-9 pe-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
          />
        </div>

        {/* Soft Minimal Badge when a single workshop is selected */}
        {selectedEvent && (
          <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-bold text-emerald-950 truncate">{selectedEvent.title}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium shrink-0">{selectedEvent.dateBadge || selectedEvent.event_date}</span>
            </div>
            {counts.accepted > 0 && (
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 text-[11px] shrink-0">
                {isRTL ? `الحضور الفعلي: ${counts.attended} من أصل ${counts.accepted}` : `Attended: ${counts.attended}/${counts.accepted}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Temporary Feedback */}
      {feedback && (
        <div
          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in duration-150 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Registrations & Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500">
              {isRTL ? "جارٍ تحميل بيانات المسجلين..." : "Loading registrations..."}
            </span>
          </div>
        ) : attendees.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {isRTL ? "لا توجد تسجيلات مطابقة" : "No Registrations Found"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? isRTL
                  ? "جرب تغيير فلاتر البحث أو اختيار تصنيف آخر."
                  : "Try changing filters to find registrants."
                : isRTL
                ? "عندما يقوم الطلاب بتعبئة فورم التسجيل من الموقع، ستظهر بياناتهم هنا فوراً للقبول وتسجيل الحضور."
                : "When students register from the website, submissions will appear here."}
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-600 font-bold">
                    <th className="py-3 px-4 text-start">{isRTL ? "الطالب المسجل" : "Student"}</th>
                    <th className="py-3 px-4 text-start">{isRTL ? "الورشة" : "Workshop"}</th>
                    <th className="py-3 px-4 text-start">{isRTL ? "الجامعة والتخصص" : "University & Specialty"}</th>
                    <th className="py-3 px-4 text-start">{isRTL ? "العمر والجنس" : "Age & Gender"}</th>
                    <th className="py-3 px-4 text-start">{isRTL ? "سبب الاهتمام" : "Motivation / Answers"}</th>
                    <th className="py-3 px-4 text-start">{isRTL ? "حالة القبول" : "Admission"}</th>
                    <th className="py-3 px-4 text-start">{isRTL ? "حالة الحضور الفعلي" : "Actual Attendance"}</th>
                    <th className="py-3 px-4 text-end">{isRTL ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {attendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                            {attendee.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate text-xs sm:text-sm">
                              {attendee.name}
                            </span>
                            <div className="flex flex-col gap-0.5 mt-0.5 text-[11px]">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 font-mono dir-ltr font-semibold">
                                  {attendee.phone}
                                </span>
                                {attendee.whatsapp_link && (
                                  <a
                                    href={attendee.whatsapp_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-700 hover:text-emerald-800 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 hover:bg-emerald-100 transition-colors inline-block"
                                  >
                                    {isRTL ? "واتساب" : "WhatsApp"}
                                  </a>
                                )}
                              </div>
                              {attendee.email && (
                                <span className="text-slate-500 text-[10px] font-mono truncate max-w-[160px]">
                                  {attendee.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Workshop Name */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block max-w-[170px] truncate">
                            {attendee.event_title || (isRTL ? "ورشة العمل" : "Workshop")}
                          </span>
                          {attendee.event_is_upcoming !== false ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{isRTL ? "ورشة قادمة" : "Upcoming"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                              <span>{isRTL ? "ورشة مكتملة" : "Completed"}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* University & Specialty */}
                      <td className="py-3 px-4">
                        <span className="text-slate-900 font-bold block truncate max-w-[150px]">
                          {attendee.university || "-"}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                          {attendee.specialty || "-"}
                        </span>
                      </td>

                      {/* Age & Gender */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <span>{attendee.age ? `${attendee.age} ${isRTL ? "سنة" : "y/o"}` : "-"}</span>
                        {attendee.gender && (
                          <span className="text-slate-400 mx-1">|</span>
                        )}
                        <span>{attendee.gender === "male" ? "ذكر" : attendee.gender === "female" ? "أنثى" : attendee.gender}</span>
                      </td>

                      {/* Motivation / Custom Answers */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-600 text-[11px] line-clamp-1 italic">
                          &quot;{attendee.motivation || (isRTL ? "لم يكتب سبباً" : "No motivation")}&quot;
                        </p>
                        <button
                          type="button"
                          onClick={() => setViewingAttendee(attendee)}
                          className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold mt-0.5 cursor-pointer underline flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isRTL ? "عرض الإجابات الكاملة" : "View Details"}</span>
                        </button>
                      </td>

                      {/* Admission Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {attendee.status === "accepted" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{isRTL ? "مقبول" : "Accepted"}</span>
                          </span>
                        ) : attendee.status === "rejected" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>{isRTL ? "مرفوض" : "Rejected"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{isRTL ? "قيد المراجعة" : "Pending"}</span>
                          </span>
                        )}
                      </td>

                      {/* Actual Workshop Attendance Column (تم الحضور / غائب) */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {attendee.status === "accepted" ? (
                          <div className="flex flex-col gap-1">
                            {attendee.attendance_status === "attended" ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>{isRTL ? "حضر الورشة بنجاح" : "Attended"}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendance(attendee.id, "absent")}
                                  disabled={actionLoadingId === attendee.id}
                                  title={isRTL ? "تعديل إلى غائب" : "Mark absent"}
                                  className="text-[10px] text-slate-400 hover:text-rose-600 underline font-semibold cursor-pointer"
                                >
                                  {isRTL ? "تعديل لغياب" : "Mark absent"}
                                </button>
                              </div>
                            ) : attendee.attendance_status === "absent" ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                                  <X className="w-3 h-3 text-slate-500" />
                                  <span>{isRTL ? "غائب" : "Absent"}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendance(attendee.id, "attended")}
                                  disabled={actionLoadingId === attendee.id}
                                  title={isRTL ? "تأكيد الحضور" : "Mark attended"}
                                  className="text-[10px] text-emerald-600 hover:text-emerald-700 underline font-bold cursor-pointer"
                                >
                                  {isRTL ? "تأكيد الحضور" : "Mark attended"}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {/* 1-Click Record Attendance */}
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendance(attendee.id, "attended")}
                                  disabled={actionLoadingId === attendee.id}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 group"
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600 group-hover:text-white" />
                                  <span>{isRTL ? "تم الحضور" : "Attended"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendance(attendee.id, "absent")}
                                  disabled={actionLoadingId === attendee.id}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-200 text-slate-600 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
                                >
                                  <span>{isRTL ? "غائب" : "Absent"}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {isRTL ? "يتطلب قبول الطالب أولاً" : "Acceptance required"}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Accept */}
                          {attendee.status !== "accepted" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(attendee.id, "accepted")}
                              disabled={actionLoadingId === attendee.id}
                              title={isRTL ? "قبول المشترك" : "Accept"}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Reject */}
                          {attendee.status !== "rejected" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(attendee.id, "rejected")}
                              disabled={actionLoadingId === attendee.id}
                              title={isRTL ? "رفض المشترك" : "Reject"}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Registration */}
                          <button
                            type="button"
                            onClick={() => handleDelete(attendee.id, attendee.name)}
                            disabled={actionLoadingId === attendee.id}
                            title={isRTL ? "حذف التسجيل" : "Delete"}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Touch-friendly & App-like) */}
            <div className="md:hidden divide-y divide-slate-100">
              {attendees.map((attendee) => (
                <div key={attendee.id} className="p-3.5 space-y-3 hover:bg-slate-50/50 transition-colors">
                  {/* Top: Name, Status badge, and Avatar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                        {attendee.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-950 block truncate text-sm">
                          {attendee.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] mt-0.5">
                          <span className="text-slate-600 font-mono font-semibold dir-ltr">
                            {attendee.phone}
                          </span>
                          {attendee.whatsapp_link && (
                            <a
                              href={attendee.whatsapp_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80"
                            >
                              {isRTL ? "واتساب" : "WhatsApp"}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admission Status */}
                    <div className="shrink-0">
                      {attendee.status === "accepted" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isRTL ? "مقبول" : "Accepted"}</span>
                        </span>
                      ) : attendee.status === "rejected" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>{isRTL ? "مرفوض" : "Rejected"}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{isRTL ? "قيد المراجعة" : "Pending"}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* University, Specialty, and Motivation */}
                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/90 p-2.5 rounded-xl border border-slate-100">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-800 block truncate">
                        {attendee.university || "-"}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {attendee.specialty || "-"} {attendee.age ? `• ${attendee.age} سنة` : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewingAttendee(attendee)}
                      className="text-emerald-700 text-[11px] font-bold underline flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isRTL ? "الإجابات" : "Details"}</span>
                    </button>
                  </div>

                  {/* Attendance & Admission Actions Bar */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                    {attendee.status === "accepted" ? (
                      <div className="flex items-center justify-between w-full gap-2">
                        {attendee.attendance_status === "attended" ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{isRTL ? "حضر الورشة بنجاح" : "Attended"}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateAttendance(attendee.id, "absent")}
                              disabled={actionLoadingId === attendee.id}
                              className="text-xs text-rose-600 font-bold underline px-2 py-1"
                            >
                              {isRTL ? "تعديل لغياب" : "Mark absent"}
                            </button>
                          </div>
                        ) : attendee.attendance_status === "absent" ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                              <X className="w-3.5 h-3.5 text-slate-500" />
                              <span>{isRTL ? "غائب" : "Absent"}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateAttendance(attendee.id, "attended")}
                              disabled={actionLoadingId === attendee.id}
                              className="text-xs text-emerald-700 font-bold underline px-2 py-1"
                            >
                              {isRTL ? "تأكيد الحضور" : "Mark attended"}
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 w-full">
                            <button
                              type="button"
                              onClick={() => handleUpdateAttendance(attendee.id, "attended")}
                              disabled={actionLoadingId === attendee.id}
                              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                              <span>{isRTL ? "تم الحضور" : "Attended"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateAttendance(attendee.id, "absent")}
                              disabled={actionLoadingId === attendee.id}
                              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200"
                            >
                              <span>{isRTL ? "غائب" : "Absent"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(attendee.id, "accepted")}
                            disabled={actionLoadingId === attendee.id}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isRTL ? "قبول" : "Accept"}</span>
                          </button>

                          {attendee.status !== "rejected" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(attendee.id, "rejected")}
                              disabled={actionLoadingId === attendee.id}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{isRTL ? "رفض" : "Reject"}</span>
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(attendee.id, attendee.name)}
                          disabled={actionLoadingId === attendee.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Full Applicant Answers Viewer */}
      {viewingAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-950">
                  {viewingAttendee.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingAttendee(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">
                  {isRTL ? "الورشة المسجل فيها:" : "Workshop:"}
                </span>
                <span className="font-black text-emerald-900 text-sm">
                  {viewingAttendee.event_title}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[11px] text-slate-500 block">{isRTL ? "الهاتف / واتساب" : "Phone"}</span>
                  <span className="font-bold text-slate-900 dir-ltr">{viewingAttendee.phone}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">{isRTL ? "العمر والجنس" : "Age/Gender"}</span>
                  <span className="font-bold text-slate-900">{viewingAttendee.age} سنة | {viewingAttendee.gender === "male" ? "ذكر" : viewingAttendee.gender === "female" ? "أنثى" : viewingAttendee.gender}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">{isRTL ? "الجامعة أو الكلية" : "University"}</span>
                  <span className="font-bold text-slate-900">{viewingAttendee.university || "-"}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">{isRTL ? "التخصص" : "Specialty"}</span>
                  <span className="font-bold text-slate-900">{viewingAttendee.specialty || "-"}</span>
                </div>
              </div>

              {/* Motivation */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">
                  {isRTL ? "لماذا مهتم في هذه الورشة وماذا تأمل أن تتعلم؟" : "Motivation & Goals:"}
                </span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-800 leading-relaxed font-normal border border-slate-200">
                  {viewingAttendee.motivation || (isRTL ? "لا توجد تفاصيل" : "No details")}
                </p>
              </div>

              {/* Custom Questions Answers */}
              {viewingAttendee.custom_answers && Object.keys(viewingAttendee.custom_answers).length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <span className="font-bold text-slate-700 block">
                    {isRTL ? "إجابات الأسئلة الإضافية المخصصة:" : "Custom Questions Answers:"}
                  </span>
                  <div className="space-y-1.5">
                    {Object.entries(viewingAttendee.custom_answers).map(([key, val], idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 block">{key}</span>
                        <span className="font-semibold text-slate-900 mt-0.5 block">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingAttendee(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer"
              >
                {isRTL ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
