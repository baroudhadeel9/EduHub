"use client";

import React, { useState } from "react";
import { KeyRound, Mail, Phone, Copy, Check, ExternalLink, AlertCircle, RefreshCw, Send, CheckCircle2 } from "lucide-react";
import { resendMemberActivationApi } from "@/services/applications";
import { buildWhatsAppLink, WHATSAPP_TEMPLATES } from "@/utils/whatsapp";

interface MemberResendActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string | number;
    name: string;
    email: string;
    phone?: string;
    hasPassword?: boolean;
    status?: string;
  };
  isRTL?: boolean;
  onSuccess?: (updatedData: { email: string; phone?: string }) => void;
}

export function MemberResendActivationModal({
  isOpen,
  onClose,
  member,
  isRTL = true,
  onSuccess,
}: MemberResendActivationModalProps) {
  const [email, setEmail] = useState(member.email || "");
  const [phone, setPhone] = useState(member.phone || "");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isAccountActive = member.status === "active" || Boolean(member.hasPassword);

  // Reset local state when opened
  React.useEffect(() => {
    if (isOpen) {
      setEmail(member.email || "");
      setPhone(member.phone || "");
      setIsEditing(false);
      setGeneratedUrl(null);
      setFeedback(null);
      setCopied(false);
    }
  }, [isOpen, member]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setFeedback({
        type: "error",
        message: isRTL ? "يرجى إدخال البريد الإلكتروني للعضو." : "Please enter the member email.",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await resendMemberActivationApi(member.id, {
        email: email.trim(),
        phone: phone.trim() || undefined,
      });

      setLoading(false);
      setGeneratedUrl(res.set_password_url);
      setFeedback({
        type: "success",
        message: res.message || (isRTL ? "تم إنشاء وإرسال رابط التفعيل بنجاح!" : "Activation link dispatched successfully!"),
      });

      if (onSuccess) {
        onSuccess({ email: res.email, phone: res.phone });
      }
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : (isRTL ? "حدث خطأ أثناء إرسال الرابط." : "Failed to resend link.");
      setFeedback({ type: "error", message: msg });
    }
  };

  const handleCopyLink = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (!generatedUrl) return;
    let text = "";
    if (isAccountActive) {
      text = `مرحباً ${member.name} 👋\n\nنتواصل معك من إدارة مساحة EduHub غزة.\nبناءً على طلبك، هذا رابط إعادة تعيين كلمة المرور لحسابك:\n\n🔗 ${generatedUrl}\n\n⚠️ ملاحظة: الرابط صالح لمدة 48 ساعة.\nإذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة. ✨`;
    } else {
      const template = WHATSAPP_TEMPLATES.find((t) => t.id === "activation");
      text = template
        ? template.generateText({ memberName: member.name, setPasswordUrl: generatedUrl })
        : `مرحباً ${member.name}، هذا رابط تفعيل حسابك في مساحة EduHub:\n${generatedUrl}`;
    }

    const link = buildWhatsAppLink(phone || member.phone || "", text);
    if (link) {
      window.open(link, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 text-white relative ${
            isAccountActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-700"
              : "bg-gradient-to-r from-emerald-600 to-teal-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {isAccountActive
                  ? isRTL ? "إعادة تعيين كلمة المرور للعضو" : "Reset Member Password"
                  : isRTL ? "إرسال رابط تفعيل الحساب وتعيين كلمة المرور" : "Send Activation Link"}
              </h2>
              <p className="text-xs text-white/80 font-medium">
                {isRTL ? `للعضو: ${member.name}` : `For member: ${member.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 left-5 rtl:left-auto rtl:right-auto rtl:left-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 border ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                  : "bg-red-50 text-red-800 border-red-200/80"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Account Status Info Box */}
          {isAccountActive ? (
            <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block text-blue-950 mb-0.5">
                  {isRTL ? "الحساب مفعل وكلمة المرور معينة مسبقاً ✅" : "Account Active & Password Already Set"}
                </span>
                <span>
                  {isRTL
                    ? "العضو يمتلك كلمة مرور نشطة بالفعل ويمكنه تسجيل الدخول فوراً. لا يحتاج إلى رابط تفعيل جديد، ولكن يمكنك إرسال رابط 'إعادة تعيين كلمة المرور' في حال فقدانها."
                    : "This member already has an active password and can log in directly. Use this to send a password reset link if needed."}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block text-amber-950 mb-0.5">
                  {isRTL ? "الحساب بانتظار التفعيل وتعيين كلمة المرور الأولى ⏳" : "Pending Initial Password Setup"}
                </span>
                <span>
                  {isRTL
                    ? "لم يقم هذا العضو بتعيين كلمة المرور بعد. سيتم إرسال رابط التفعيل الأول للبدء بحجز المقاعد."
                    : "Member has not set an initial password yet. An activation link will be dispatched."}
                </span>
              </div>
            </div>
          )}

          {/* Member Contact Info Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isRTL ? "بيانات استلام الرابط" : "Recipient Details"}
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
              >
                {isEditing ? (isRTL ? "إلغاء التعديل" : "Cancel Edit") : (isRTL ? "تعديل الإيميل / الهاتف" : "Edit Email / Phone")}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    {isRTL ? "البريد الإلكتروني (لتصحيح أي خطأ إملائي):" : "Email Address:"}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                      dir="ltr"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    {isRTL ? "رقم الهاتف / واتساب:" : "Phone / WhatsApp:"}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="059xxxxxxx"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                      dir="ltr"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="block text-[10px] text-slate-400 font-medium">{isRTL ? "البريد الإلكتروني" : "Email"}</span>
                    <span className="font-mono font-bold text-slate-800 truncate block" dir="ltr">{email || "—"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <div className="overflow-hidden">
                    <span className="block text-[10px] text-slate-400 font-medium">{isRTL ? "رقم الهاتف / واتساب" : "Phone"}</span>
                    <span className="font-mono font-bold text-slate-800 truncate block" dir="ltr">{phone || "—"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated Link Box (When available) */}
          {generatedUrl && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                  {isRTL ? "رابط تعيين كلمة المرور النشط (صالح 48 ساعة):" : "Active Set-Password URL (48 hrs):"}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  {isRTL ? "جاهز للمشاركة" : "Ready"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-emerald-300 text-slate-700 font-mono select-all focus:outline-none"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isRTL ? "تم النسخ!" : "Copied!") : (isRTL ? "نسخ" : "Copy")}</span>
                </button>
              </div>

              {/* Instant WhatsApp Send Button */}
              {(phone || member.phone) && (
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isRTL ? "مشاركة الرابط مع العضو عبر واتساب فوراً" : "Share URL via WhatsApp now"}</span>
                </button>
              )}
            </div>
          )}

          {/* Instruction Note */}
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isRTL
              ? "سيقوم النظام بإلغاء أي رمز تحقق قديم وتوليد رابط تفعيل جديد كلياً، ثم إرساله فوراً عبر خدمة البريد الإلكتروني (Brevo). يمكنك أيضاً نسخ الرابط مباشرة لإرساله للعضو عبر واتساب."
              : "The system will invalidate previous tokens and issue a brand-new activation link via Brevo API, and provide a direct link for WhatsApp."}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            {isRTL ? "إغلاق" : "Close"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSend}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed ${
              isAccountActive
                ? "bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
                : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300"
            }`}
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>
              {loading
                ? isRTL
                  ? "جاري المعالجة والإرسال..."
                  : "Dispatching..."
                : isAccountActive
                ? isRTL
                  ? "إرسال رابط إعادة تعيين كلمة المرور"
                  : "Send Password Reset Link"
                : isRTL
                ? "إرسال رابط التفعيل الآن"
                : "Dispatch Activation Link"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

