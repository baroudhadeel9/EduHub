"use client";

import React, { useState, useEffect, useCallback } from "react";
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

const CATEGORIES: { id: SupportTicketCategory; label: string; icon: React.ElementType }[] = [
  { id: "power_charging", label: "الكهرباء والشواحن", icon: Zap },
  { id: "internet", label: "شبكة الإنترنت", icon: Wifi },
  { id: "booking_seat", label: "المقاعد والحجوزات", icon: Armchair },
  { id: "facility", label: "المرافق والهدوء", icon: Building2 },
  { id: "account_quota", label: "الحساب والرصيد", icon: Clock },
  { id: "general", label: "عام / أخرى", icon: HelpCircle },
];

export default function MemberSupportTab() {
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
      setFormError("يرجى كتابة عنوان للمشكلة (على الأقل 3 أحرف).");
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      setFormError("يرجى توضيح تفاصيل المشكلة حتى نتمكن من مساعدتك وحلها.");
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
        setFormSuccess(res.message || "تم استلام مشكلتك بنجاح.");
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
        setFormError(res.message || "تعذر إرسال المشكلة، يرجى المحاولة لاحقاً.");
      }
    } catch {
      setFormError("حدث خطأ غير متوقع أثناء إرسال المشكلة.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const match = CATEGORIES.find((c) => c.id === cat);
    return match ? match.icon : HelpCircle;
  };

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-300">
      
      {/* ── Top Header Notice & Actions ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-brand-navy to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center font-black text-xl border border-white/10 shadow-xs shrink-0">
            <LifeBuoy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                الدعم الفني ومتابعة المشاكل
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                مباشر مع الإدارة
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              واجهتك أي صعوبة في الكهرباء، الشواحن، الإنترنت أو المقاعد؟ اكتب مشكلتك هنا وسيتابعها المشرف مباشرة لحلها.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => fetchTickets(true)}
            disabled={refreshing || loading}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-all cursor-pointer disabled:opacity-50"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setIsFormOpen((prev) => !prev);
              setFormError(null);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isFormOpen ? "إغلاق النموذج" : "إبلاغ عن مشكلة جديدة"}</span>
          </button>
        </div>
      </div>

      {/* ── New Ticket Form (Collapsible) ── */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 rounded-2xl bg-white border-2 border-emerald-500/30 shadow-lg space-y-4 animate-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                تفاصيل المشكلة أو الاستفسار
              </h4>
            </div>
            <span className="text-xs text-slate-400">ستصل للإدارة فوراً</span>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Category Pills */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-700">
              تصنيف ونوع المشكلة:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/80 text-emerald-900 font-black shadow-xs ring-1 ring-emerald-500/30"
                        : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700 text-xs font-semibold"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-emerald-700" : "text-slate-500"}`} />
                    <span className="text-xs truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-700">
              عنوان المشكلة / الاستفسار:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: انقطاع الكهرباء في فيش طاولة 7، أو بطء في التحميل..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm bg-slate-50/50 font-medium transition-all"
              maxLength={200}
              required
            />
          </div>

          {/* Priority Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <div>
                <span className="text-xs font-bold text-slate-800">أولوية المشكلة:</span>
                <p className="text-[11px] text-slate-500">اختر عاجل إذا كانت المشكلة تعيق عملك حالياً في الصالة</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setPriority("normal")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  priority === "normal"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                عادي
              </button>
              <button
                type="button"
                onClick={() => setPriority("urgent")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  priority === "urgent"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-rose-600"
                }`}
              >
                عاجل 🔴
              </button>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-700">
              شرح وتفاصيل المشكلة:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اشرح ما الذي حدث معك بالتفصيل ليتمكن المشرف من معالجته فوراً..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm bg-slate-50/50 font-medium transition-all resize-none"
              maxLength={4000}
              required
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>إرسال المشكلة للمتابعة</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ── Tickets List ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span>سجل المشاكل والتذاكر المقدمة ({tickets.length}):</span>
          <span>تظهر ردود الإدارة وإجراءات الحل مباشرة هنا</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-bold text-slate-500">جاري تحميل سجل المشاكل...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
              ✨
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">
              لا توجد لديك أي مشاكل أو طلبات دعم مسجلة
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              بيئة عملك مجهزة دائماً، وإذا واجهتك أي صعوبة في أي وقت يمكنك الضغط على زر &quot;إبلاغ عن مشكلة جديدة&quot; أعلاه.
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
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 shadow-2xs ${
                    isResolved
                      ? "bg-white border-emerald-200/90 hover:border-emerald-300"
                      : isInProgress
                      ? "bg-blue-50/20 border-blue-200 hover:border-blue-300"
                      : "bg-amber-50/20 border-amber-200 hover:border-amber-300"
                  }`}
                >
                  {/* Ticket Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                        <CategoryIcon className="w-3.5 h-3.5 text-slate-700" />
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {ticket.subject}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {ticket.category_label}
                      </span>
                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                          عاجل 🔴
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[11px] font-mono text-slate-400">
                        #{ticket.id}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border ${
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
                            <span>جاري المتابعة والحل</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>قيد الانتظار والمراجعة</span>
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
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 space-y-1.5 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between text-xs font-black text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>رد وإجراء إدارة إديو هب:</span>
                        </span>
                        {ticket.admin_name && (
                          <span className="text-[11px] text-emerald-700/80 font-normal">
                            بواسطة: {ticket.admin_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-emerald-900 leading-relaxed">
                        {ticket.admin_reply}
                      </p>
                      {ticket.resolved_at_human && (
                        <div className="text-[10px] text-emerald-700/70 pt-0.5">
                          تاريخ المعالجة: {ticket.resolved_at_human}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission Timestamp Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>تاريخ التقديم: {ticket.created_at_human || ticket.created_at}</span>
                    {!isResolved && (
                      <span className="text-amber-700 font-medium">
                        فريق الإدارة في الصالة يتابع طلبك
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
