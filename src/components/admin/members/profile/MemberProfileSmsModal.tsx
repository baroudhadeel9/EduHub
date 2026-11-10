"use client";

import React from "react";
import {
  MessageSquare,
  ShieldCheck,
  Phone,
  Send,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { MemberRecord } from "@/components/admin/members/data";

interface MemberProfileSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberRecord | null;
  isRTL: boolean;
  smsMessage: string;
  setSmsMessage: (msg: string) => void;
  smsSending: boolean;
  smsFeedback: { type: "success" | "error"; text: string } | null;
  onSend: (e: React.FormEvent) => void;
}

export default function MemberProfileSmsModal({
  isOpen,
  onClose,
  member,
  isRTL,
  smsMessage,
  setSmsMessage,
  smsSending,
  smsFeedback,
  onSend,
}: MemberProfileSmsModalProps) {
  if (!isOpen || !member) return null;

  const phone = member.registration?.phone || member.phone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-[#0c2340] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">
                {isRTL ? "إرسال رسالة SMS فورية للطالب" : "Send Live SMS to Member"}
              </h3>
              <p className="text-[11px] text-emerald-200/90">
                {isRTL
                  ? "تسليم رسمي مباشر على شريحة الجوال (Jawwal / Ooredoo)"
                  : "Direct cellular delivery via TweetSMS"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={onSend} className="p-5 sm:p-6 space-y-4">
          
          {/* Recipient Details */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">{member.name}</div>
              <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{phone || (isRTL ? "غير مسجل" : "Unregistered")}</span>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {isRTL ? "شريحة نشطة" : "Active SIM"}
            </span>
          </div>

          {/* Feedback alerts */}
          {smsFeedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                smsFeedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {smsFeedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{smsFeedback.text}</span>
            </div>
          )}

          {/* Quick Preset Templates */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500">
              {isRTL ? "قوالب سريعة جاهزة:" : "Quick Templates:"}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  setSmsMessage(
                    `مرحباً ${member.name}، نود تذكيرك بموعد حجزك اليوم في مساحة إديو هب غزة. نتمنى لك دوام التوفيق.`
                  )
                }
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
              >
                📅 تذكير بالحجز
              </button>
              <button
                type="button"
                onClick={() =>
                  setSmsMessage(
                    `مرحباً ${member.name}، يرجى التفضل بمراجعة إدارة مساحة إديو هب لتسوية المستحقات المالية المتبقية.`
                  )
                }
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
              >
                💳 تسوية المستحقات
              </button>
              <button
                type="button"
                onClick={() =>
                  setSmsMessage(
                    `مرحباً ${member.name}، نتمنى لك يوماً موفقاً ومثمراً في مساحة العمل بإديو هب غزة.`
                  )
                }
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
              >
                ✨ ترحيب عام
              </button>
            </div>
          </div>

          {/* Message Content Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                {isRTL ? "نص الرسالة المرسلة:" : "Message Text:"}
              </label>
              <div className="text-[11px] font-mono text-slate-500 font-bold">
                <span>{smsMessage.length} حرف</span>
                <span className="text-slate-400 mx-1">•</span>
                <span className="text-emerald-700">
                  {Math.max(1, Math.ceil(smsMessage.length / 70))} SMS
                </span>
              </div>
            </div>
            <textarea
              rows={4}
              required
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              placeholder={
                isRTL
                  ? "اكتب نص الرسالة النصية القصيرة هنا..."
                  : "Type the SMS message text here..."
              }
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 hover:bg-white resize-none transition-all leading-relaxed"
            />
          </div>

          {/* Gateway Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isRTL ? "بوابة الإرسال: TweetSMS المعتمدة" : "Gateway: TweetSMS"}</span>
            </div>
            <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              Sender: EDU HUB
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={smsSending}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={smsSending || !smsMessage.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2"
            >
              {smsSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جاري الإرسال الآن..." : "Sending..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isRTL ? "إرسال رسالة SMS الآن" : "Send SMS Now"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

