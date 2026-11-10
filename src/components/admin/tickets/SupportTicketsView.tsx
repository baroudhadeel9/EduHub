"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Zap,
  Wifi,
  Armchair,
  Building2,
  HelpCircle,
  Send,
  Loader2,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  User as UserIcon,
  ShieldAlert,
  Trash2,
  Check,
} from "lucide-react";
import {
  getAdminSupportTicketsApi,
  updateAdminSupportTicketApi,
  deleteAdminSupportTicketApi,
  SupportTicketItem,
  SupportTicketStats,
  SupportTicketStatus,
  SupportTicketCategory,
} from "@/services/supportTickets";

const CATEGORIES: { id: SupportTicketCategory; label: string; icon: React.ElementType }[] = [
  { id: "power_charging", label: "الكهرباء والشواحن", icon: Zap },
  { id: "internet", label: "شبكة الإنترنت", icon: Wifi },
  { id: "booking_seat", label: "المقاعد والحجوزات", icon: Armchair },
  { id: "facility", label: "المرافق والهدوء", icon: Building2 },
  { id: "account_quota", label: "الحساب والرصيد", icon: Clock },
  { id: "general", label: "عام / أخرى", icon: HelpCircle },
];

export default function SupportTicketsView() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [stats, setStats] = useState<SupportTicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
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
        category: categoryFilter,
        priority: priorityFilter,
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
  }, [statusFilter, categoryFilter, priorityFilter, searchQuery]);

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
        setActionSuccess(res.message || "تم حفظ الرد وتحديث الحالة بنجاح.");
        setReplyingTicketId(null);
        fetchTickets(true);
        setTimeout(() => setActionSuccess(null), 3000);
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
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه التذكرة؟")) return;

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

  const getCategoryIcon = (cat: string) => {
    const match = CATEGORIES.find((c) => c.id === cat);
    return match ? match.icon : HelpCircle;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ── Soft & Elegant Top Header ── */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xl border border-rose-100 shadow-2xs shrink-0">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#0c2340]">
                إدارة تذاكر الدعم ومشاكل الطلاب
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                متابعة وحل المشاكل
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              رصد كافة المشاكل والاستفسارات المقدمة من الطلاب والأعضاء، ومعرفة من قدمها وحلها مع توثيق الرد.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchTickets(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-2xs self-stretch sm:self-auto justify-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
          <span>تحديث القائمة</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── Top Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Urgent Pending */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              مشاكل عاجلة قيد الانتظار
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5">
              {stats?.urgent_pending ?? 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Total Open / Pending */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700">قيد المراجعة والانتظار</span>
            <h3 className="text-xl sm:text-2xl font-black text-amber-800 mt-0.5">
              {stats?.open ?? 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-700">جاري المتابعة والحل</span>
            <h3 className="text-xl sm:text-2xl font-black text-blue-800 mt-0.5">
              {stats?.in_progress ?? 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Loader2 className="w-5 h-5" />
          </div>
        </div>

        {/* Resolved */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700">تم حلها بنجاح</span>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">
              {stats?.resolved ?? 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الطالب، البريد، رقم الهاتف، أو نص المشكلة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm bg-slate-50/50"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 focus:border-emerald-500"
          >
            <option value="all">جميع التصنيفات</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 focus:border-emerald-500"
          >
            <option value="all">جميع الأولويات</option>
            <option value="urgent">🔴 عاجل فقط</option>
            <option value="normal">عادي</option>
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 shrink-0 ml-2">الحالة:</span>
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === st.id
                  ? "bg-brand-navy text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
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
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-emerald-600" />
            <p className="text-sm font-bold text-slate-600">جاري تحميل تذاكر ومشاكل الطلاب...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <h4 className="text-base font-extrabold text-slate-800">لا توجد تذاكر تطابق هذا الفلتر</h4>
            <p className="text-xs text-slate-500">جرب تغيير شروط البحث أو الفلاتر أعلاه.</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const CategoryIcon = getCategoryIcon(ticket.category);
            const isResolved = ticket.status === "resolved";
            const isInProgress = ticket.status === "in_progress";
            const isUrgent = ticket.priority === "urgent";
            const isReplying = replyingTicketId === ticket.id;

            return (
              <div
                key={ticket.id}
                className={`p-4 sm:p-6 rounded-2xl border transition-all space-y-4 shadow-xs ${
                  isUrgent && !isResolved
                    ? "bg-rose-50/20 border-rose-300 ring-1 ring-rose-400/30"
                    : isResolved
                    ? "bg-white border-slate-200 hover:border-slate-300"
                    : isInProgress
                    ? "bg-blue-50/20 border-blue-200 hover:border-blue-300"
                    : "bg-amber-50/20 border-amber-200 hover:border-amber-300"
                }`}
              >
                {/* ── Top Bar: Submitter Student Info & Status ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  
                  {/* Student Details (من قدمها) */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-navy to-slate-800 text-emerald-400 flex items-center justify-center font-black text-base shadow-xs shrink-0">
                      {(ticket.user?.name || "S").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {ticket.user?.name || "طالب غير معروف"}
                        </span>
                        {ticket.user?.id && (
                          <Link
                            href={`/admin/members?id=${ticket.user.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition-all"
                            title="عرض الملف الكامل للطالب وسجل الحضور والإنجازات"
                          >
                            <span>ملف العضو</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {ticket.user?.member_type === "freelancer" ? "عمل حر" : "طالب"}
                        </span>
                      </div>
                      
                      {/* Contacts */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5 flex-wrap">
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

                  {/* Status Badge & Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400">
                      تذكرة #{ticket.id}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border ${
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
                      className="px-3 py-1 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      {ticket.admin_reply ? "تعديل الرد والحالة" : "حل المشكلة والرد"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(ticket.id)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                      title="حذف التذكرة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ── Problem Title & Classification ── */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <CategoryIcon className="w-4 h-4 text-slate-700" />
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {ticket.subject}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {ticket.category_label}
                  </span>
                  {isUrgent && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-300 animate-pulse">
                      عاجل 🔴
                    </span>
                  )}
                </div>

                {/* Problem Description */}
                <div className="text-xs sm:text-sm text-slate-800 bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                  {ticket.description}
                </div>

                {/* Existing Admin Reply Box */}
                {ticket.admin_reply && !isReplying && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/90 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-black text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>رد وإجراء الإدارة المسجل:</span>
                      </span>
                      {ticket.admin_name && (
                        <span className="text-[11px] text-emerald-700/80 font-normal">
                          بواسطة المشرف: {ticket.admin_name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed">
                      {ticket.admin_reply}
                    </p>
                    {ticket.resolved_at_human && (
                      <div className="text-[10px] text-emerald-700/70 pt-0.5">
                        تاريخ الحل: {ticket.resolved_at_human}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Reply / Resolution Form (When Activated) ── */}
                {isReplying && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-emerald-500 shadow-md space-y-3.5 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-800">
                        معالجة المشكلة وكتابة الرد للطالب:
                      </span>
                      <span className="text-[11px] text-slate-400">سيظهر للطالب في حسابه</span>
                    </div>

                    {/* Status Changer */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">تحديث الحالة إلى:</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "resolved", label: "تم الحل والإغلاق ✅", color: "bg-emerald-50 text-emerald-800 border-emerald-300" },
                          { id: "in_progress", label: "جاري المتابعة 🔵", color: "bg-blue-50 text-blue-800 border-blue-300" },
                          { id: "open", label: "قيد الانتظار 🟡", color: "bg-amber-50 text-amber-800 border-amber-300" },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedStatus(s.id as SupportTicketStatus)}
                            className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                              selectedStatus === s.id
                                ? `${s.color} font-black shadow-xs ring-1 ring-emerald-500/30`
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reply Textarea */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        نص الرد والإجراء المتخذ:
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="اكتب توضيحاً للطالب عن كيفية حل المشكلة أو الإجراء الذي تم في الصالة..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm bg-slate-50/50 resize-none font-medium"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setReplyingTicketId(null)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveReply(ticket.id)}
                        disabled={savingId === ticket.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {savingId === ticket.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري الحفظ...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>حفظ الرد وتحديث الحالة</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer Timestamps */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
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

