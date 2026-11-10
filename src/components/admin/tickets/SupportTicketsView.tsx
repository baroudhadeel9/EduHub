"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  Trash2,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  getAdminSupportTicketsApi,
  updateAdminSupportTicketApi,
  deleteAdminSupportTicketApi,
  SupportTicketItem,
  SupportTicketStats,
  SupportTicketStatus,
} from "@/services/supportTickets";

export default function SupportTicketsView() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [stats, setStats] = useState<SupportTicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Ticket being edited / replied to
  const [replyingTicketId, setReplyingTicketId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<SupportTicketStatus>("resolved");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminSupportTicketsApi({
        status: statusFilter,
        search: searchQuery,
      });

      if (res.success) {
        setTickets(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load admin support tickets:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenReply = (ticket: SupportTicketItem) => {
    setReplyingTicketId(ticket.id);
    setReplyText(ticket.admin_reply || "");
    setSelectedStatus(ticket.status === "open" ? "resolved" : ticket.status);
  };

  const handleSaveReply = async (ticketId: number) => {
    setSavingId(ticketId);
    setActionSuccess(null);
    try {
      const res = await updateAdminSupportTicketApi(ticketId, {
        status: selectedStatus,
        admin_reply: replyText.trim(),
      });

      if (res.success) {
        setActionSuccess(res.message || "تم حفظ الرد وتحديث حالة التذكرة بنجاح.");
        setReplyingTicketId(null);
        fetchTickets(true);
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        alert(res.message || "تعذر تحديث التذكرة.");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (ticketId: number) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه المشكلة؟")) return;

    try {
      const res = await deleteAdminSupportTicketApi(ticketId);
      if (res.success) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        fetchTickets(true);
      } else {
        alert(res.message || "تعذر حذف التذكرة.");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالخادم.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* ── Soft & Elegant Top Header ── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl border border-emerald-100/80 shadow-2xs shrink-0">
            <LifeBuoy className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#0c2340]">
                الدعم الفني ومشاكل الطلاب
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                متابعة فورية
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              متابعة مشاكل واستفسارات الطلاب في الصالة، والرد عليها وتوثيق الحل مباشرة في حساب الطالب.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchTickets(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs self-stretch sm:self-auto justify-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
          <span>تحديث القائمة</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-2.5 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── Soft & Pastel Top Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Open / Pending */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-amber-50/40 border border-amber-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-800">قيد الانتظار</span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
              {stats?.open ?? 0}
            </h3>
            <p className="text-[11px] text-amber-700/80 mt-0.5">بانتظار المراجعة</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-blue-50/40 border border-blue-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-800">جاري المتابعة</span>
            <h3 className="text-2xl sm:text-3xl font-black text-blue-900 mt-1">
              {stats?.in_progress ?? 0}
            </h3>
            <p className="text-[11px] text-blue-700/80 mt-0.5">يتم معالجتها حالياً</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-100/80 text-blue-800 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-blue-700" />
          </div>
        </div>

        {/* Resolved */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-emerald-50/40 border border-emerald-100/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800">تم حلها بنجاح</span>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">
              {stats?.resolved ?? 0}
            </h3>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">تم توثيق الرد للطالب</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
        </div>

        {/* Total */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50/60 border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700">إجمالي المشاكل</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
              {stats?.total ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">كافة المشاكل المسجلة</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-slate-600" />
          </div>
        </div>

      </div>

      {/* ── Soft Search & Status Filter Bar ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الطالب، البريد، رقم الهاتف، أو نص المشكلة..."
            className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-xs sm:text-sm bg-slate-50/50 font-medium transition-all"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: "all", label: "الكل" },
            { id: "open", label: "قيد الانتظار" },
            { id: "in_progress", label: "جاري المتابعة" },
            { id: "resolved", label: "تم الحل" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === st.id
                  ? "bg-[#0c2340] text-white shadow-2xs"
                  : "bg-slate-100/80 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tickets List ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-emerald-600" />
            <p className="text-sm font-bold text-slate-600">جاري تحميل مشاكل وتذاكر الطلاب...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
              ✨
            </div>
            <h4 className="text-base font-extrabold text-slate-800">لا توجد تذاكر تطابق هذا الفلتر</h4>
            <p className="text-xs text-slate-500">جرب تغيير شروط البحث أو الفلاتر أعلاه.</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const isResolved = ticket.status === "resolved";
            const isInProgress = ticket.status === "in_progress";
            const isReplying = replyingTicketId === ticket.id;

            return (
              <div
                key={ticket.id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-4 shadow-2xs ${
                  isResolved
                    ? "bg-white border-slate-100 hover:border-slate-200"
                    : isInProgress
                    ? "bg-gradient-to-br from-blue-50/20 via-white to-white border-blue-200/80 hover:border-blue-300"
                    : "bg-gradient-to-br from-amber-50/20 via-white to-white border-amber-200/80 hover:border-amber-300"
                }`}
              >
                {/* ── Student Information & Ticket Status ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/90 pb-3.5">
                  
                  {/* Student Details */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#0c2340] text-emerald-400 flex items-center justify-center font-black text-base shadow-2xs shrink-0">
                      {(ticket.user?.name || "ط").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {ticket.user?.name || "طالب"}
                        </span>
                        {ticket.user?.id && (
                          <Link
                            href={`/admin/members?id=${ticket.user.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200/70 transition-all"
                            title="عرض ملف العضو وسجل الحضور"
                          >
                            <span>ملف العضو</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {ticket.user?.member_type === "freelancer" ? "عمل حر" : "طالب"}
                        </span>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1 flex-wrap">
                        {ticket.user?.email && (
                          <a href={`mailto:${ticket.user.email}`} className="hover:text-emerald-700 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{ticket.user.email}</span>
                          </a>
                        )}
                        {ticket.user?.phone && (
                          <a href={`tel:${ticket.user.phone}`} className="hover:text-emerald-700 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{ticket.user.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Top Action Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                      #{ticket.id}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-2xs ${
                        isResolved
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : isInProgress
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تم الحل ✅</span>
                        </>
                      ) : isInProgress ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                          <span>جاري المتابعة</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>قيد الانتظار</span>
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenReply(ticket)}
                      className="px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      {ticket.admin_reply ? "تعديل الرد والحالة" : "حل المشكلة والرد"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(ticket.id)}
                      className="p-1.5 rounded-xl border border-slate-200/70 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                      title="حذف التذكرة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── Problem Details (Displayed once, purely and softly) ── */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>تفاصيل مشكلة الطالب:</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs sm:text-sm leading-relaxed text-slate-800 font-medium whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>

                {/* ── Existing Admin Reply Box (Visible to Student) ── */}
                {ticket.admin_reply && !isReplying && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white border border-emerald-200/80 space-y-2 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100/80 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-emerald-900">
                          رد وإجراء الإدارة للطالب:
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
                        {ticket.admin_name && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200/70 text-emerald-800">
                            بواسطة: {ticket.admin_name}
                          </span>
                        )}
                        {ticket.resolved_at_human && (
                          <span className="text-emerald-700/80">
                            {ticket.resolved_at_human}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap bg-white/70 p-3 rounded-xl border border-emerald-100/60">
                      {ticket.admin_reply}
                    </p>
                    <div className="text-[11px] text-emerald-700/80 flex items-center gap-1 pt-0.5">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>هذا الرد معروض مباشرة للطالب في حسابه.</span>
                    </div>
                  </div>
                )}

                {/* ── Inline Reply & Resolution Box ── */}
                {isReplying && (
                  <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50/80 border-2 border-emerald-500/80 shadow-sm space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          معالجة المشكلة والرد على الطالب
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          سيظهر ردك وإجراءك للطالب مباشرة في حسابه عند حفظ الرد
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">تذكرة #{ticket.id}</span>
                    </div>

                    {/* Status Options */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">تحديث حالة التذكرة:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedStatus("resolved")}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            selectedStatus === "resolved"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-emerald-50"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تم الحل بنجاح ✅</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedStatus("in_progress")}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            selectedStatus === "in_progress"
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-blue-50"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>جاري المتابعة ⏳</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedStatus("open")}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            selectedStatus === "open"
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-amber-50"
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>قيد الانتظار 🟡</span>
                        </button>
                      </div>
                    </div>

                    {/* Reply Textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        نص الرد والإجراء المتخذ (يظهر للطالب):
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="اكتب توضيحاً أو إجراء تم لحل المشكلة (مثلاً: أهلاً بك، تم معالجة الحجز ولن يتم خصم أي ساعات، أو تم إصلاح فيش الكهرباء)..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-xs sm:text-sm bg-white resize-none font-medium leading-relaxed"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setReplyingTicketId(null)}
                        className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveReply(ticket.id)}
                        disabled={savingId === ticket.id}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {savingId === ticket.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري حفظ الرد...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>حفظ الرد وإرساله للطالب</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Footer Timestamps ── */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100/80">
                  <span>تاريخ التقديم: {ticket.created_at_human || ticket.created_at}</span>
                  {ticket.resolved_at_human && (
                    <span className="text-emerald-700 font-bold">
                      تم الحل في: {ticket.resolved_at_human}
                    </span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
