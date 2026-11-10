"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
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
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import {
  getMemberSupportTicketsApi,
  createMemberSupportTicketApi,
  SupportTicketItem,
  SupportTicketCategory,
  SupportTicketPriority,
} from "@/services/supportTickets";

export default function MemberSupportTab() {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const bp = t.bookingPortal;

  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory>("power_charging");
  const [priority, setPriority] = useState<SupportTicketPriority>("normal");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const categories: { id: SupportTicketCategory; label: string; icon: React.ElementType }[] = [
    { id: "power_charging", label: bp?.catPowerCharging || (isRTL ? "الكهرباء والشواحن" : "Power & Charging"), icon: Zap },
    { id: "internet", label: bp?.catInternet || (isRTL ? "شبكة الإنترنت" : "Internet & WiFi"), icon: Wifi },
    { id: "booking_seat", label: bp?.catBookingSeat || (isRTL ? "المقاعد والحجوزات" : "Seats & Bookings"), icon: Armchair },
    { id: "facility", label: bp?.catFacility || (isRTL ? "المرافق والهدوء" : "Facility & Quiet"), icon: Building2 },
    { id: "account_quota", label: bp?.catAccountQuota || (isRTL ? "الحساب والرصيد" : "Account & Quota"), icon: Clock },
    { id: "general", label: bp?.catGeneral || (isRTL ? "عام / أخرى" : "General / Other"), icon: HelpCircle },
  ];

  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getMemberSupportTicketsApi();
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!subject.trim() || subject.trim().length < 3) {
      setFormError(bp?.errSubjectRequired || (isRTL ? "يرجى كتابة عنوان للمشكلة (على الأقل 3 أحرف)." : "Please enter an issue title."));
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      setFormError(bp?.errDescRequired || (isRTL ? "يرجى توضيح تفاصيل المشكلة حتى نتمكن من مساعدتك وحلها." : "Please describe the problem details."));
      return;
    }

    setSubmitting(true);
    try {
      const res = await createMemberSupportTicketApi({
        subject: subject.trim(),
        category,
        priority,
        description: description.trim(),
      });

      if (res.success) {
        setFormSuccess(res.message || (isRTL ? "تم استلام مشكلتك بنجاح." : "Your ticket was received successfully."));
        setSubject("");
        setDescription("");
        setPriority("normal");
        setCategory("power_charging");
        setTimeout(() => {
          setIsFormOpen(false);
          setFormSuccess(null);
        }, 1500);
        fetchTickets(true);
      } else {
        setFormError(res.message || (isRTL ? "تعذر إرسال المشكلة، يرجى المحاولة لاحقاً." : "Failed to send ticket."));
      }
    } catch {
      setFormError(isRTL ? "حدث خطأ غير متوقع أثناء إرسال المشكلة." : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const match = categories.find((c) => c.id === cat);
    return match ? match.icon : HelpCircle;
  };

  const getCategoryName = (cat: string) => {
    const match = categories.find((c) => c.id === cat);
    return match ? match.label : cat;
  };

  return (
    <div className="space-y-5 pt-1 animate-in fade-in duration-300">
      
      {/* ── Soft & Elegant Top Header Card ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border border-emerald-100/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white text-emerald-700 flex items-center justify-center font-black text-xl border border-emerald-200/80 shadow-2xs shrink-0">
            <LifeBuoy className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-[#0c2340]">
                {bp?.supportTitle || (isRTL ? "الدعم الفني ومتابعة المشاكل" : "Technical Support & Inquiries")}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200/80 shadow-2xs">
                {bp?.supportBadge || (isRTL ? "مباشر مع المشرف" : "Direct with Supervisor")}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {bp?.supportSubtitle || (isRTL
                ? "واجهتك أي صعوبة في الكهرباء، الشواحن، الإنترنت أو المقاعد؟ اكتب مشكلتك هنا وسيتابعها المشرف مباشرة لحلها."
                : "Facing any hurdles with power, internet, or desks? Write your problem and the team will assist directly.")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-emerald-100/60">
          <button
            type="button"
            onClick={() => fetchTickets(true)}
            disabled={refreshing || loading}
            className="p-2 sm:p-2.5 rounded-xl border border-emerald-200/80 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 transition-all cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95"
            title={bp?.refreshList || (isRTL ? "تحديث القائمة" : "Refresh")}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsFormOpen((prev) => !prev);
              setFormError(null);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {isFormOpen
                ? (bp?.closeFormBtn || (isRTL ? "إغلاق النموذج" : "Close Form"))
                : (bp?.newTicketBtn || (isRTL ? "إبلاغ عن مشكلة جديدة" : "Report an Issue"))}
            </span>
          </button>
        </div>
      </div>

      {/* ── New Ticket Form (Soft Light Card) ── */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-4 animate-in slide-in-from-top-3 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                {bp?.formTitle || (isRTL ? "تفاصيل المشكلة أو الاستفسار" : "Problem Details & Inquiry")}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              {bp?.formSubtitle || (isRTL ? "ستصل لمشرف الصالة للمتابعة الفورية" : "Sent directly to hall supervisor")}
            </span>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-50/80 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Category Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {bp?.categoryLabel || (isRTL ? "تصنيف ونوع المشكلة:" : "Problem Category:")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 font-extrabold shadow-2xs ring-1 ring-emerald-500/20"
                        : "border-slate-200/90 bg-slate-50/60 hover:bg-slate-100 text-slate-700 text-xs font-medium"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-700" : "text-slate-500"}`} />
                    <span className="text-xs truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {bp?.subjectLabel || (isRTL ? "عنوان المشكلة / الاستفسار:" : "Issue Title:")}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={bp?.subjectPlaceholder || (isRTL ? "مثال: انقطاع الكهرباء في فيش طاولة 7، أو بطء في التحميل..." : "e.g., Socket 7 interrupted, slow upload...")}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-xs sm:text-sm bg-slate-50/50 font-medium transition-all"
              maxLength={200}
              required
            />
          </div>

          {/* Priority Toggle */}
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {bp?.priorityLabel || (isRTL ? "أولوية المشكلة:" : "Priority:")}
                </span>
                <p className="text-[11px] text-slate-400">
                  {bp?.priorityHint || (isRTL ? "اختر عاجل إذا كانت المشكلة تعيق عملك حالياً في الصالة" : "Select urgent if this blocks your ongoing work")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setPriority("normal")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  priority === "normal"
                    ? "bg-slate-800 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {bp?.priorityNormal || (isRTL ? "عادي" : "Normal")}
              </button>
              <button
                type="button"
                onClick={() => setPriority("urgent")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  priority === "urgent"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-rose-600"
                }`}
              >
                {bp?.priorityUrgent || (isRTL ? "عاجل 🔴" : "Urgent 🔴")}
              </button>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {bp?.descriptionLabel || (isRTL ? "شرح وتفاصيل المشكلة:" : "Issue Description:")}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={bp?.descriptionPlaceholder || (isRTL ? "اشرح ما الذي حدث معك بالتفصيل ليتمكن المشرف من معالجته فوراً..." : "Describe what happened in detail...")}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-xs sm:text-sm bg-slate-50/50 font-medium transition-all resize-none"
              maxLength={4000}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              {bp?.cancelBtn || (isRTL ? "إلغاء" : "Cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{bp?.submittingBtn || (isRTL ? "جارٍ الإرسال..." : "Submitting...")}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{bp?.submitBtn || (isRTL ? "إرسال المشكلة للمتابعة" : "Submit Issue")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Tickets List ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>
            {bp?.ticketsListTitle || (isRTL ? "سجل المشاكل والتذاكر المقدمة" : "Submitted Issues & Tickets")} ({tickets.length}):
          </span>
          <span className="hidden sm:inline text-slate-400">
            {bp?.ticketsListSubtitle || (isRTL ? "تظهر ردود الإدارة وإجراءات الحل مباشرة هنا" : "Live admin responses appear here")}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 space-y-2">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-bold text-slate-500">
              {bp?.loadingTickets || (isRTL ? "جاري تحميل سجل المشاكل..." : "Loading support tickets...")}
            </p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-7 sm:p-9 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-lg border border-emerald-100/80 shadow-2xs">
              ✨
            </div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800">
              {bp?.emptyTitle || (isRTL ? "لا توجد لديك أي مشاكل أو طلبات دعم مسجلة" : "You have no reported issues")}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {bp?.emptyDesc || (isRTL
                ? "بيئة عملك مجهزة دائماً، وإذا واجهتك أي صعوبة في أي وقت يمكنك الضغط على زر إبلاغ عن مشكلة جديدة أعلاه."
                : "Your workspace is ready. Click Report an Issue above whenever needed.")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const CategoryIcon = getCategoryIcon(ticket.category);
              const isResolved = ticket.status === "resolved";
              const isInProgress = ticket.status === "in_progress";
              const isUrgent = ticket.priority === "urgent";

              return (
                <div
                  key={ticket.id}
                  className={`p-4 sm:p-4.5 rounded-2xl border transition-all space-y-3 shadow-2xs ${
                    isResolved
                      ? "bg-white border-slate-200 hover:border-slate-300"
                      : isInProgress
                      ? "bg-blue-50/20 border-blue-200/80 hover:border-blue-300"
                      : "bg-amber-50/20 border-amber-200/80 hover:border-amber-300"
                  }`}
                >
                  {/* Ticket Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-7 h-7 rounded-lg bg-slate-100/80 flex items-center justify-center text-slate-700 shrink-0 border border-slate-200/60">
                        <CategoryIcon className="w-3.5 h-3.5 text-slate-600" />
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {ticket.subject}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-600">
                        {getCategoryName(ticket.category)}
                      </span>
                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                          {bp?.urgentBadge || (isRTL ? "عاجل 🔴" : "Urgent 🔴")}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">
                        #{ticket.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border ${
                          isResolved
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                            : isInProgress
                            ? "bg-blue-50 text-blue-800 border-blue-200/80"
                            : "bg-amber-50 text-amber-800 border-amber-200/80"
                        }`}
                      >
                        {isResolved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{bp?.statusResolved || (isRTL ? "تم الحل ✅" : "Resolved ✅")}</span>
                          </>
                        ) : isInProgress ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                            <span>{bp?.statusInProgress || (isRTL ? "جاري المتابعة والحل" : "In Progress")}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{bp?.statusOpen || (isRTL ? "قيد الانتظار والمراجعة" : "Pending Review")}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 font-medium">
                    {ticket.description}
                  </div>

                  {/* Admin Reply & Solution Box */}
                  {ticket.admin_reply && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-200/80 text-emerald-950 space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-black text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{bp?.adminReplyTitle || (isRTL ? "رد وإجراء إدارة إديو هب:" : "EduHub Admin Response:")}</span>
                        </span>
                        {ticket.admin_name && (
                          <span className="text-[11px] text-emerald-700/80 font-normal">
                            {bp?.adminReplyBy || (isRTL ? "بواسطة المشرف:" : "Supervisor:")} {ticket.admin_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-900 leading-relaxed">
                        {ticket.admin_reply}
                      </p>
                      {ticket.resolved_at_human && (
                        <div className="text-[10px] text-emerald-700/70 pt-0.5">
                          {bp?.resolvedAtPrefix || (isRTL ? "تاريخ المعالجة:" : "Resolved At:")} {ticket.resolved_at_human}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission Timestamp Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>
                      {bp?.submittedAtPrefix || (isRTL ? "تاريخ التقديم:" : "Submitted At:")} {ticket.created_at_human || ticket.created_at}
                    </span>
                    {!isResolved && (
                      <span className="text-amber-700 font-medium">
                        {bp?.underReviewNotice || (isRTL ? "فريق الإدارة في الصالة يتابع طلبك" : "The hall team is reviewing your ticket")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
