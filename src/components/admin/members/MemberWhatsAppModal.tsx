"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, ExternalLink, Copy, Check, Sparkles, Phone, AlertCircle } from "lucide-react";
import { buildWhatsAppLink, formatWhatsAppNumber, WHATSAPP_TEMPLATES } from "@/utils/whatsapp";

interface MemberWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string | number;
    name: string;
    phone?: string;
    email?: string;
    allocatedHours?: number;
    usedHours?: number;
  };
  isRTL?: boolean;
}

export function MemberWhatsAppModal({
  isOpen,
  onClose,
  member,
  isRTL = true,
}: MemberWhatsAppModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("booking_reminder");
  const [messageText, setMessageText] = useState<string>("");
  const [customPhone, setCustomPhone] = useState<string>(member.phone || "");
  const [copied, setCopied] = useState(false);

  const remainingHours = Math.max(0, (member.allocatedHours || 0) - (member.usedHours || 0));

  // Initialize phone and template message on open
  useEffect(() => {
    if (isOpen) {
      setCustomPhone(member.phone || "");
      const tmpl = WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplateId) || WHATSAPP_TEMPLATES[0];
      const initialText = tmpl.generateText({
        memberName: member.name,
        remainingHours,
      });
      setMessageText(initialText);
      setCopied(false);
    }
  }, [isOpen, member, selectedTemplateId, remainingHours]);

  if (!isOpen) return null;

  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = WHATSAPP_TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) {
      const text = tmpl.generateText({
        memberName: member.name,
        remainingHours,
      });
      setMessageText(text);
    }
  };

  const formattedNumber = formatWhatsAppNumber(customPhone);
  const waLink = buildWhatsAppLink(customPhone, messageText);

  const handleOpenWhatsApp = () => {
    if (!waLink) return;
    window.open(waLink, "_blank");
  };

  const handleCopyMessage = () => {
    if (!messageText) return;
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#20ba59] to-[#075E54] text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {isRTL ? "مراسلة العضو عبر واتساب (WhatsApp)" : "WhatsApp Direct Messaging"}
              </h2>
              <p className="text-xs text-white/85 font-medium">
                {isRTL ? `المستلم: ${member.name}` : `Recipient: ${member.name}`}
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Recipient Phone */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>{isRTL ? "رقم الهاتف / واتساب:" : "Phone / WhatsApp Number:"}</span>
              {formattedNumber && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md" dir="ltr">
                  +{formattedNumber}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="059xxxxxxx"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] font-mono"
                dir="ltr"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {!formattedNumber && (
              <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {isRTL ? "يرجى إدخال رقم هاتف صحيح لفتح المحادثة." : "Please enter a valid phone number."}
              </p>
            )}
          </div>

          {/* Template Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isRTL ? "اختيار قالب رسالة جاهز:" : "Select Message Template:"}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WHATSAPP_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`p-2.5 rounded-xl border text-start text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    <div className="truncate">{isRTL ? tmpl.titleAr : tmpl.titleEn}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isRTL ? "نص الرسالة (يمكنك التعديل والإضافة بحرية):" : "Message Text (Editable):"}
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? (isRTL ? "تم النسخ" : "Copied") : (isRTL ? "نسخ النص" : "Copy")}</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3.5 text-xs rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] leading-relaxed resize-none bg-slate-50/50"
              placeholder={isRTL ? "اكتب نص الرسالة هنا..." : "Write message text here..."}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            {isRTL ? "إلغاء" : "Cancel"}
          </button>

          <button
            type="button"
            disabled={!formattedNumber || !messageText.trim()}
            onClick={handleOpenWhatsApp}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] disabled:bg-slate-300 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{isRTL ? "فتح محادثة واتساب الآن" : "Open WhatsApp Chat"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

