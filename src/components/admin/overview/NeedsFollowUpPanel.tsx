"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { AlertCircle, Check, Send } from "lucide-react";
import { getAdminOverviewApi } from "@/services/applications";

interface FollowUpItem {
  avatar?: string;
  avatarColor?: string;
  name?: string;
  alertColor?: string;
  alertText?: string;
  subText?: string;
  badge?: string;
  badgeColor?: string;
  phone?: string;
}

export default function NeedsFollowUpPanel() {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const o = t.admin?.overview;

  const [remindersSent, setRemindersSent] = useState(false);
  const [followUpItems, setFollowUpItems] = useState<FollowUpItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAdminOverviewApi();
        if (res.needsFollowUp) {
          setFollowUpItems(res.needsFollowUp);
        }
      } catch (err) {
        console.warn("Could not load follow up items:", err);
      }
    }
    loadData();
  }, []);

  const handleSendReminders = () => {
    setRemindersSent(true);
    setTimeout(() => {
      setRemindersSent(false);
    }, 3500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300 transition-all">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-1 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-rose-700 tracking-tight">
                {o?.needsFollowUp || (isRTL ? "يحتاج متابعة" : "Needs Follow-Up")}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {o?.needsFollowUpSub || (isRTL ? "تنبيهات الاشتراكات، الساعات الإضافية، والرصيد" : "Subscription alerts, extra hours & balance")}
            </p>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 shrink-0">
            {followUpItems.length} {isRTL ? "أعضاء" : "Members"}
          </span>
        </div>

        {/* Follow-up Items List */}
        <div className="space-y-2.5">
          {followUpItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 font-medium">
              {isRTL ? "جميع اشتراكات الأعضاء منتظمة ولا توجد حالات تستدعي المتابعة." : "All memberships are on track."}
            </div>
          ) : (
            followUpItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 border ${item.avatarColor}`}
                  >
                    {item.avatar}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span className={item.alertColor}>{item.alertText}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400">{item.subText}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold border shrink-0 ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {remindersSent ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 animate-in fade-in">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{o?.remindersSentSuccess || (isRTL ? "تم إرسال التنبيهات بنجاح" : "Reminders dispatched successfully")}</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleSendReminders}
            className="inline-flex items-center gap-1.5 font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer group"
          >
            <Send className="w-3 h-3 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
            <span>{o?.sendRemindersToAll || (isRTL ? "إرسال تذكيرات للجميع" : "Send Reminders to All")}</span>
          </button>
        )}

        <span className="text-slate-400 text-[11px]">
          {isRTL ? "مزامنة مباشرة مع الاشتراكات" : "Direct membership sync"}
        </span>
      </div>
    </div>
  );
}
