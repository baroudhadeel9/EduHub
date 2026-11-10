"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  CheckCircle2,
  Clock,
  MessageSquare,
  Trash2,
  Check,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import {
  SupportTicketItem,
  updateAdminSupportTicketApi,
  deleteAdminSupportTicketApi,
} from "@/services/supportTickets";

interface MemberProfileTicketsTabProps {
  tickets: SupportTicketItem[];
  loading: boolean;
  onRefresh: () => void;
}

export default function MemberProfileTicketsTab({
  tickets,
  loading,
  onRefresh,
}: MemberProfileTicketsTabProps) {
  const [ticketReplyingId, setTicketReplyingId] = useState<number | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [ticketSavingId, setTicketSavingId] = useState<number | null>(null);

  const handleOpenTicketReply = (ticket: SupportTicketItem) => {
    setTicketReplyingId(ticket.id);
    setTicketReplyText(ticket.admin_reply || "");
  };

  const handleSaveTicketReply = async (ticketId: number) => {
    setTicketSavingId(ticketId);
    try {
      const res = await updateAdminSupportTicketApi(ticketId, {
        status: "resolved",
        admin_reply: ticketReplyText.trim(),
      });
      if (res.success) {
        setTicketReplyingId(null);
        onRefresh();
      } else {
        alert(res.message || "تعذر حفظ رد المشكلة.");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setTicketSavingId(null);
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه المشكلة؟")) return;
    try {
      const res = await deleteAdminSupportTicketApi(ticketId);
      if (res.success) {
        onRefresh();
      } else {
        alert(res.message || "تعذر حذف التذكرة.");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالخادم.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 space-y-2">
        <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
        <p className="text-xs font-bold text-slate-500">جاري تحميل تذاكر الدعم...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-base">
          ✨
        </div>
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-700">لا توجد تذاكر دعم مسجلة</h4>
        <p className="text-xs text-slate-400">لم يقم هذا العضو بتقديم أي تذاكر دعم فني بعد.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((t) => {
        const isResolved = t.status === "resolved";
        const isUrgent = t.priority === "urgent";
        const isReplying = ticketReplyingId === t.id;

        return (
          <div
            key={t.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 shadow-2xs ${
              isResolved
                ? "bg-white border-slate-200"
                : "bg-amber-50/20 border-amber-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono text-slate-400">#{t.id}</span>
                {isUrgent && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                    عاجل 🔴
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                    isResolved
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {isResolved ? "تم الحل ✅" : "قيد الانتظار 🟡"}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenTicketReply(t)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all cursor-pointer"
                >
                  {t.admin_reply ? "تعديل الرد" : "حل والرد"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTicket(t.id)}
                  className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs sm:text-sm text-slate-700 bg-slate-50/60 p-3 rounded-xl border border-slate-200/60 font-medium whitespace-pre-wrap">
              {t.description}
            </div>

            {/* Existing Admin Reply */}
            {t.admin_reply && !isReplying && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                  <span>رد المشرف:</span>
                  {t.admin_name && <span className="font-normal text-[11px]">{t.admin_name}</span>}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-900 leading-relaxed whitespace-pre-wrap">
                  {t.admin_reply}
                </p>
                {t.resolved_at_human && (
                  <div className="text-[10px] text-emerald-700/70 pt-0.5">
                    تاريخ الحل: {t.resolved_at_human}
                  </div>
                )}
              </div>
            )}

            {/* Reply Form */}
            {isReplying && (
              <div className="p-4 rounded-xl bg-white border-2 border-emerald-500 shadow-sm space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>كتابة رد المشرف للطالب:</span>
                </div>
                <textarea
                  rows={2}
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  placeholder="اكتب ردك وتوضيحك للطالب..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm resize-none focus:border-emerald-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setTicketReplyingId(null)}
                    className="px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveTicketReply(t.id)}
                    disabled={ticketSavingId === t.id}
                    className="px-3.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {ticketSavingId === t.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ الرد وإرساله للطالب</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>تاريخ التقديم: {t.created_at_human || t.created_at}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

