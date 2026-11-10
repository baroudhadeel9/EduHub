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
  Send,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  getMemberSupportTicketsApi,
  createMemberSupportTicketApi,
  SupportTicketItem,
} from "@/services/supportTickets";

export default function MemberSupportTab() {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const bp = t.bookingPortal;

  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State: Only the problem details (تفاصيل المشكلة)
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

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
    // Auto-refresh every 12 seconds so admin replies appear automatically
    const interval = setInterval(() => {
      fetchTickets(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!description.trim() || description.trim().length < 3) {
      setFormError(
        bp?.errDescRequired ||
          (isRTL
            ? "يرجى كتابة تفاصيل المشكلة حتى نتمكن من مساعدتك."
            : "Please describe the problem details.")
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await createMemberSupportTicketApi({
        description: description.trim(),
      });

      if (res.success) {
        setFormSuccess(
          res.message ||
            (isRTL
              ? "تم استلام مشكلتك بنجاح، وسيقوم المشرف بمتابعتها فوراً."
              : "Your ticket was received successfully.")
        );
        setDescription("");
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

      {/* ── New Ticket Form (Only تفاصيل المشكلة) ── */}
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

          {/* Description Field (Only visible field for the student) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              {bp?.descriptionLabel || (isRTL ? "شرح وتفاصيل المشكلة:" : "Problem Details:")}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                bp?.descriptionPlaceholder ||
                (isRTL
                  ? "اكتب ما يواجهك بالتفصيل (مثل: مشكلة في الكهرباء، الشاحن، الإنترنت، المقعد، أو أي استفسار)..."
                  : "Describe what happened in detail so the supervisor can assist immediately...")
              }
              className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-xs sm:text-sm bg-slate-50/50 font-medium transition-all resize-none leading-relaxed"
              maxLength={4000}
              required
              autoFocus
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
              const isResolved = ticket.status === "resolved";
              const isInProgress = ticket.status === "in_progress";

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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{ticket.id}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {ticket.created_at_human || ticket.created_at}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
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

                  {/* Problem Description (Directly visible) */}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60 font-medium whitespace-pre-wrap">
                    {ticket.description}
                  </div>

                  {/* Admin Reply & Solution Box */}
                  {ticket.admin_reply && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/90 text-emerald-950 space-y-2.5 animate-in fade-in duration-200 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100/80 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs sm:text-sm font-black text-emerald-900">
                            {bp?.adminReplyTitle || (isRTL ? "رد وإجراء إدارة إديو هب:" : "EduHub Admin Response:")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
                          {ticket.admin_name && (
                            <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200/70 text-emerald-800">
                              {bp?.adminReplyBy || (isRTL ? "المشرف:" : "Supervisor:")} {ticket.admin_name}
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
                    </div>
                  )}

                  {/* Under Review Notice */}
                  {!isResolved && (
                    <div className="text-[11px] text-amber-700 font-medium pt-0.5">
                      {bp?.underReviewNotice || (isRTL ? "فريق الإدارة في الصالة يتابع مشكلتك" : "The hall team is reviewing your ticket")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
