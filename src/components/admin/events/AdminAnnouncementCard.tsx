"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  AnnouncementConfig,
  EventItem,
  getAdminAnnouncementApi,
  updateAdminAnnouncementApi,
} from "@/services/events";
import {
  Sparkles,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Settings2,
  X,
  ExternalLink,
  CalendarCheck,
  Check,
  Save,
} from "lucide-react";

export default function AdminAnnouncementCard({
  onRefreshEvents,
}: {
  onRefreshEvents?: () => void;
}) {
  const { locale, dir } = useLanguage();
  const isRTL = locale === "ar" || dir === "rtl";

  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [savingModal, setSavingModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [config, setConfig] = useState<AnnouncementConfig | null>(null);

  // Modal edit state
  const [badge, setBadge] = useState("ورشة عمل قادمة");
  const [text, setText] = useState("");
  const [actionType, setActionType] = useState<"none" | "event_registration" | "custom_url">("event_registration");
  const [eventId, setEventId] = useState<number | null>(null);
  const [buttonLabel, setButtonLabel] = useState("سجّل الآن مجاناً");
  const [customUrl, setCustomUrl] = useState("");

  const isEnabled = Boolean(config?.enabled || (config as any)?.is_active);
  const activeEvent = events.find((e) => e.id === config?.event_id) || config?.event;

  // Load announcement config
  const loadConfig = async () => {
    try {
      const res = await getAdminAnnouncementApi();
      if (res.success && res.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = res.data as any;
        const cfg: AnnouncementConfig = raw.config || raw;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const evList: EventItem[] = raw.events || (res as any).events || [];

        setConfig(cfg);
        setEvents(evList);

        // Prepopulate modal fields
        setBadge(cfg.badge || (isRTL ? "ورشة عمل قادمة" : "Upcoming Workshop"));
        setText(cfg.text || "");
        setActionType(
          cfg.action_type === "none" || (cfg as any).link_type === "none"
            ? "none"
            : cfg.action_type === "custom_url" || (cfg as any).link_type === "custom_url"
            ? "custom_url"
            : "event_registration"
        );
        setEventId(cfg.event_id || (evList[0]?.id ?? null));
        setButtonLabel(cfg.button_label || (cfg as any).button_text || (isRTL ? "سجّل الآن مجاناً" : "Register Free"));
        setCustomUrl(cfg.custom_url || "");
      }
    } catch (err) {
      console.error("Failed to load announcement config:", err);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [isRTL]);

  // Quick One-Click Toggle for Enable/Disable
  const handleToggle = async () => {
    if (!config) return;
    setToggling(true);
    setFeedback(null);

    const newEnabled = !isEnabled;
    try {
      const payload: Partial<AnnouncementConfig> = {
        ...config,
        enabled: newEnabled,
      };

      const res = await updateAdminAnnouncementApi(payload);
      if (res.success) {
        setConfig((prev) => (prev ? { ...prev, enabled: newEnabled } : null));
        try {
          if (newEnabled) {
            localStorage.setItem("eduhub_active_announcement", JSON.stringify({ ...payload, event: activeEvent }));
          } else {
            localStorage.removeItem("eduhub_active_announcement");
          }
        } catch {}

        setFeedback({
          type: "success",
          text: newEnabled
            ? isRTL
              ? "تم تفعيل شريط الإعلان في أعلى الموقع بنجاح."
              : "Announcement banner enabled."
            : isRTL
            ? "تم إخفاء شريط الإعلان من الموقع."
            : "Announcement banner disabled.",
        });

        if (onRefreshEvents) onRefreshEvents();
      }
    } catch (err) {
      console.error("Failed to toggle announcement banner", err);
    } finally {
      setToggling(false);
    }
  };

  // Save Modal Changes
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setFeedback({
        type: "error",
        text: isRTL ? "يرجى كتابة نص الإعلان." : "Please enter announcement text.",
      });
      return;
    }

    setSavingModal(true);
    try {
      const payload: Partial<AnnouncementConfig> = {
        enabled: true, // Auto-enable when saving edits
        badge: badge.trim(),
        text: text.trim(),
        action_type: actionType,
        event_id: actionType === "event_registration" ? eventId : null,
        button_label: buttonLabel.trim(),
        custom_url: actionType === "custom_url" ? customUrl.trim() : "",
      };

      const res = await updateAdminAnnouncementApi(payload);
      if (res.success) {
        const selected = events.find((e) => e.id === eventId);
        setConfig({ ...payload, enabled: true } as AnnouncementConfig);
        try {
          localStorage.setItem(
            "eduhub_active_announcement",
            JSON.stringify({ ...payload, event: selected || activeEvent })
          );
        } catch {}

        setModalOpen(false);
        setFeedback({
          type: "success",
          text: isRTL ? "تم حفظ إعدادات الإعلان وتحديث الموقع مباشرة!" : "Announcement updated successfully!",
        });
        if (onRefreshEvents) onRefreshEvents();
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : (isRTL ? "فشل الحفظ" : "Save error"),
      });
    } finally {
      setSavingModal(false);
    }
  };

  return (
    <>
      {/* Sleek, Compact Announcement Bar (Takes minimal space, looks ultra-clean) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-3.5 transition-all mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Left/Start: Icon + Status Pill + Announcement Text */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isEnabled
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
            >
              <Megaphone className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-900">
                  {isRTL ? "شريط الإعلان أعلى الموقع:" : "Site Announcement Banner:"}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isEnabled
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  <span>
                    {isEnabled
                      ? isRTL
                        ? "معروض لزوار الموقع"
                        : "Active Live"
                      : isRTL
                      ? "مخفي حالياً"
                      : "Disabled"}
                  </span>
                </span>
              </div>

              {/* Current Active Announcement snippet */}
              <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                {isEnabled ? (
                  <>
                    <span className="font-bold text-emerald-800">
                      [{config?.badge || (isRTL ? "ورشة قادمة" : "Workshop")}]:
                    </span>{" "}
                    {config?.text || (isRTL ? "ورشة العمل الحر والذكاء الاصطناعي" : "AI Workshop")}
                  </>
                ) : (
                  <span className="text-slate-400 italic">
                    {isRTL
                      ? "الشريط معطل ولن يشغل أي مساحة في صفحة الموقع الرئيسية."
                      : "Banner is currently hidden from website visitors."}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right/End: Quick Switch + Edit Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            {/* Quick Master Toggle Button */}
            <button
              type="button"
              onClick={handleToggle}
              disabled={toggling}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs active:scale-95 ${
                isEnabled
                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isEnabled ? "bg-emerald-600" : "bg-slate-400"
                }`}
              />
              <span>
                {isEnabled
                  ? isRTL
                    ? "إيقاف الإعلان"
                    : "Turn Off"
                  : isRTL
                  ? "تفعيل الإعلان"
                  : "Turn On"}
              </span>
            </button>

            {/* Edit Announcement Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                setModalOpen(true);
                setFeedback(null);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{isRTL ? "تعديل نص الإعلان" : "Edit Banner"}</span>
            </button>
          </div>
        </div>

        {/* Temporary Feedback Message */}
        {feedback && (
          <div
            className={`mt-2.5 p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border animate-in fade-in duration-150 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      {/* Clean Edit Modal (Only pops up when admin explicitly clicks "تعديل نص الإعلان") */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-950">
                    {isRTL ? "إعدادات الشريط الإعلاني العلوي" : "Top Banner Settings"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isRTL ? "تخصيص النص والشارة والرابط المعروض للزوار" : "Customize text, badge, and interaction link"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-4 sm:p-6 space-y-4">
              {/* Badge & Text */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "شارة الإعلان البارزة *" : "Banner Badge *"}
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder={isRTL ? "مثال: ورشة جديدة، إعلان هام" : "e.g. New Workshop"}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "نص الإعلان المطلوب عرضه *" : "Announcement Text *"}
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      isRTL
                        ? "مثال: انطلاق ورشة العمل الحر والذكاء الاصطناعي — التسجيل متاح مجاناً الآن"
                        : "Workshop: AI & Freelancing - Free registration open"
                    }
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Action Type */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-800">
                  {isRTL ? "نوع الزر والتفاعل" : "Action Type"}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType("event_registration")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      actionType === "event_registration"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isRTL ? "فورم تسجيل في ورشة" : "Workshop Registration"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType("custom_url")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      actionType === "custom_url"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isRTL ? "رابط خارجي (Google Forms)" : "External Form URL"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActionType("none")}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      actionType === "none"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isRTL ? "نص فقط (بدون زر)" : "Text Only"}
                  </button>
                </div>
              </div>

              {/* Conditional Options */}
              {actionType === "event_registration" && (
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 font-medium">
                  {isRTL
                    ? "سيتم فتح فورم التسجيل المخصص للطلاب مباشرة عند النقر على زر الإعلان في أعلى الموقع."
                    : "The workshop registration form will open directly upon clicking the banner button."}
                </div>
              )}

              {actionType === "custom_url" && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    {isRTL ? "الرابط الخارجي (URL) *" : "External Link URL *"}
                  </label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://docs.google.com/forms/..."
                    dir="ltr"
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              )}

              {actionType !== "none" && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "نص الزر في الشريط" : "Button Label"}
                  </label>
                  <input
                    type="text"
                    value={buttonLabel}
                    onChange={(e) => setButtonLabel(e.target.value)}
                    placeholder={isRTL ? "سجّل الآن مجاناً" : "Register Free"}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-900"
                  />
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={savingModal}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingModal ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isRTL ? "جارٍ الحفظ..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRTL ? "حفظ وتطبيق الإعلان" : "Save & Apply"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
