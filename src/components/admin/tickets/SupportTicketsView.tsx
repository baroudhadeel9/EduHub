"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
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

  // Calculate count of tickets with no admin reply or still open
  const unrepliedCount = useMemo(() => {
    return tickets.filter((t) => !t.admin_reply || t.status === "open").length;
  }, [tickets]);

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
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300 pb-12">
      
      {/* ── Single Unreplied Counter Bar (بدون الصناديق الأربعة العلوية) ── */}
      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold shadow-2xs shrink-0 ${
              unrepliedCount > 0
                ? "bg-amber-50 text-amber-600 border border-amber-200/80"
                : "bg-emerald-50 text-emerald-600 border border-emerald-200/80"
            }`}
          >
            {unrepliedCount > 0 ? (
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                مشاكل لم يتم الرد عليها:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-black border shadow-2xs ${
                  unrepliedCount > 0
                    ? "bg-amber-100 text-amber-900 border-amber-200"
                    : "bg-emerald-100 text-emerald-900 border-emerald-200"
                }`}
              >
                {unrepliedCount}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {unrepliedCount === 0
                ? "تم الرد على جميع المشاكل المقدمة بنجاح ✨"
                : "بانتظار مراجعة المشرف وكتابة الرد للطالب"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchTickets(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
          <span className="hidden sm:inline">تحديث</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-2.5 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── Search & Status Filters Bar (Mobile Optimized) ── */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الطالب، البريد، أو نص المشكلة..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-xs sm:text-sm bg-slate-50/50 font-medium transition-all"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { id: "all", label: "الكل" },
            { id: "open", label: "لم يتم الرد" },
            { id: "resolved", label: "تم الحل" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
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
      <div className="space-y-3.5 sm:space-y-4">
        {loading ? (
          <div className="p-10 sm:p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs sm:text-sm font-bold text-slate-600">جاري تحميل مشاكل وتذاكر الطلاب...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-10 sm:p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3 shadow-2xs">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
              ✨
            </div>
            <h4 className="text-xs sm:text-base font-extrabold text-slate-800">لا توجد تذاكر تطابق هذا الفلتر</h4>
            <p className="text-xs text-slate-500">جرب تغيير شروط البحث أو الفلاتر أعلاه.</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const isResolved = ticket.status === "resolved";
            const isReplying = replyingTicketId === ticket.id;
            const memberProfileUrl = ticket.user?.id ? `/admin/members/${ticket.user.id}` : null;

            return (
              <div
                key={ticket.id}
                className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all space-y-3.5 sm:space-y-4 shadow-2xs ${
                  isResolved
                    ? "bg-white border-slate-100 hover:border-slate-200"
                    : "bg-gradient-to-br from-amber-50/20 via-white to-white border-amber-200/80 hover:border-amber-300"
                }`}
              >
                {/* ── Student Information & Ticket Top Bar ── */}
                <div className="flex flex-col gap-3 border-b border-slate-100/90 pb-3">
                  
                  {/* Student Details Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      
                      {/* Avatar (Clickable to profile) */}
                      {memberProfileUrl ? (
                        <Link
                          href={memberProfileUrl}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0c2340] hover:bg-emerald-800 text-emerald-400 flex items-center justify-center font-black text-sm sm:text-base shadow-2xs shrink-0 transition-colors"
                          title="عرض ملف الطالب"
                        >
                          {(ticket.user?.name || "ط").charAt(0).toUpperCase()}
                        </Link>
                      ) : (
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#0c2340] text-emerald-400 flex items-center justify-center font-black text-sm sm:text-base shadow-2xs shrink-0">
                          {(ticket.user?.name || "ط").charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          {/* Student Name (Clickable to profile) */}
                          {memberProfileUrl ? (
                            <Link
                              href={memberProfileUrl}
                              className="font-extrabold text-slate-900 text-xs sm:text-base hover:text-emerald-700 hover:underline transition-colors"
                            >
                              {ticket.user?.name || "طالب"}
                            </Link>
                          ) : (
                            <span className="font-extrabold text-slate-900 text-xs sm:text-base">
                              {ticket.user?.name || "طالب"}
                            </span>
                          )}

                          {/* Member Profile Direct Link Button */}
                          {memberProfileUrl && (
                            <Link
                              href={memberProfileUrl}
                              className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200/70 transition-all cursor-pointer"
                              title="عرض الملف وسجل الحضور"
                            >
                              <span>ملف العضو</span>
                              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </Link>
                          )}

                          {/* Member Type Badge */}
                          <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {ticket.user?.member_type === "freelancer" ? "عمل حر" : "طالب"}
                          </span>
                        </div>
                        
                        {/* Contacts */}
                        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500 font-mono mt-1 flex-wrap">
                          {ticket.user?.email && (
                            <a
                              href={`mailto:${ticket.user.email}`}
                              className="hover:text-emerald-700 flex items-center gap-1 truncate max-w-[190px] sm:max-w-none"
                            >
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{ticket.user.email}</span>
                            </a>
                          )}
                          {ticket.user?.phone && (
                            <a
                              href={`tel:${ticket.user.phone}`}
                              className="hover:text-emerald-700 flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{ticket.user.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ticket ID Badge */}
                    <span className="text-[10px] sm:text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                      #{ticket.id}
                    </span>
                  </div>

                  {/* Status Badge & Action Buttons Row */}
                  <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1.5 border shadow-2xs ${
                        isResolved
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                          <span>تم الحل ✅</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
                          <span>قيد الانتظار</span>
                        </>
                      )}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenReply(ticket)}
                        className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        {ticket.admin_reply ? "تعديل الرد" : "حل المشكلة والرد"}
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
                </div>

                {/* ── Problem Details (Once, Soft & Mobile Friendly) ── */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-500">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>تفاصيل مشكلة الطالب:</span>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs sm:text-sm leading-relaxed text-slate-800 font-medium whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>

                {/* ── Existing Admin Reply Box (Visible to Student) ── */}
                {ticket.admin_reply && !isReplying && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/80 space-y-2 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-emerald-100/80 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-emerald-900">
                          رد وإجراء الإدارة:
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-emerald-800 font-semibold">
                        {ticket.admin_name && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200/70">
                            {ticket.admin_name}
                          </span>
                        )}
                        {ticket.resolved_at_human && (
                          <span className="text-emerald-700/80">
                            {ticket.resolved_at_human}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap bg-white/70 p-2.5 sm:p-3 rounded-xl border border-emerald-100/60">
                      {ticket.admin_reply}
                    </p>
                  </div>
                )}

                {/* ── Inline Reply & Resolution Box (Mobile Friendly) ── */}
                {isReplying && (
                  <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50/90 border-2 border-emerald-500/80 shadow-sm space-y-3 sm:space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          معالجة المشكلة والرد على الطالب
                        </h4>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                          سيظهر ردك للطالب مباشرة في حسابه فور الحفظ
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">#{ticket.id}</span>
                    </div>

                    {/* Status Options */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-700">تحديث الحالة إلى:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedStatus("resolved")}
                          className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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
                          onClick={() => setSelectedStatus("open")}
                          className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            selectedStatus === "open"
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-amber-50"
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>إبقاء قيد الانتظار 🟡</span>
                        </button>
                      </div>
                    </div>

                    {/* Reply Textarea */}
                    <div className="space-y-1">
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-700">
                        نص الرد والإجراء المتخذ (يظهر في حساب الطالب):
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="اكتب توضيحاً أو إجراء تم لحل المشكلة..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-xs sm:text-sm bg-white resize-none font-medium leading-relaxed"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setReplyingTicketId(null)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveReply(ticket.id)}
                        disabled={savingId === ticket.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {savingId === ticket.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري الحفظ...</span>
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
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1 border-t border-slate-100/80">
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
