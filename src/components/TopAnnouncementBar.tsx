"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import {
  AnnouncementConfig,
  EventItem,
  getPublicAnnouncementApi,
} from "@/services/events";
import EventRegistrationModal from "@/components/events/EventRegistrationModal";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CalendarCheck,
  ExternalLink,
} from "lucide-react";

export default function TopAnnouncementBar() {
  const { locale, dir } = useLanguage();
  const isRTL = locale === "ar" || dir === "rtl";

  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<AnnouncementConfig | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  useEffect(() => {
    setMounted(true);

    try {
      const stored = localStorage.getItem("eduhub_active_announcement");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.enabled || parsed.is_active) && parsed.text) {
          setConfig(parsed);
        }
      }
    } catch {}

    let isMounted = true;

    async function fetchAnnouncement() {
      try {
        const res = await getPublicAnnouncementApi();
        if (!isMounted) return;

        if (res.success) {
          const banner = res.data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isEnabled = Boolean(banner && (banner.enabled || (banner as any).is_active));

          if (isEnabled && banner?.text && banner.text.trim()) {
            setConfig(banner);
            setIsDismissed(false);
            try {
              localStorage.setItem("eduhub_active_announcement", JSON.stringify(banner));
            } catch {}
          } else {
            setConfig(null);
            try {
              localStorage.removeItem("eduhub_active_announcement");
            } catch {}
          }
        }
      } catch {
        // Graceful silent fallback
      }
    }

    fetchAnnouncement();

    const handleSync = () => fetchAnnouncement();
    window.addEventListener("focus", handleSync);
    window.addEventListener("eduhub_announcement_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("eduhub_announcement_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isEnabled = Boolean(config && (config.enabled || (config as any)?.is_active));
  if (!mounted || isDismissed || !config || !isEnabled || !config.text) {
    return null;
  }

  const badgeText =
    (locale === "ar" ? config.badge_ar : config.badge_en) ||
    config.badge ||
    (isRTL ? "ورشة عمل قادمة" : "Workshop Alert");

  const mainText =
    (locale === "ar" ? config.text_ar : config.text_en) || config.text;

  const actionType =
    config.action_type ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any).link_type ||
    "event_registration";

  const btnText =
    (locale === "ar" ? config.button_label_ar : config.button_label_en) ||
    config.button_label ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any).button_text ||
    (actionType === "event_registration"
      ? isRTL
        ? "سجّل الآن"
        : "Register"
      : isRTL
      ? "التفاصيل"
      : "Details");

  const activeEvent: EventItem = config.event || {
    id: config.event_id || 0,
    title: config.text || (isRTL ? "ورشة عمل تدريبية" : "Training Workshop"),
    type: "تدريب عملي",
    tag: "EduHub",
    event_date: new Date().toISOString().split("T")[0],
    image: "/images/hero-workspace.jpg",
    image_url: "/images/hero-workspace.jpg",
    status: "scheduled",
    allow_registration: true,
  };

  return (
    <>
      {/* Sleek, Compact, Cute Announcement Ribbon */}
      <aside
        aria-label={isRTL ? "إشعار الموقع الرسمي" : "Announcement Ribbon"}
        dir={isRTL ? "rtl" : "ltr"}
        className="relative z-50 w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white border-b border-emerald-500/20 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Left/Start: Mini Glowing Badge + Text */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] sm:text-[11px] border border-emerald-400/30 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">{badgeText}</span>
            </span>

            {activeEvent.image_url && (
              <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 border border-emerald-500/30 hidden md:block">
                <Image
                  src={activeEvent.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized={Boolean(activeEvent.image_url.startsWith("/api/"))}
                />
              </div>
            )}

            <p className="font-semibold text-slate-100 text-[11px] sm:text-xs leading-tight truncate">
              {mainText}
            </p>
          </div>

          {/* Right/End: Compact Cute Action Button + Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {actionType === "event_registration" && (
              activeEvent.custom_url ? (
                <a
                  href={activeEvent.custom_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] sm:text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>{btnText}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRegModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] sm:text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <CalendarCheck className="w-3 h-3" />
                  <span>{btnText}</span>
                  {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </button>
              )
            )}

            {actionType === "custom_url" && config.custom_url && (
              <a
                href={config.custom_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] sm:text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span>{btnText}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Quick Cute Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label={isRTL ? "إغلاق الإشعار" : "Close announcement"}
              title={isRTL ? "إغلاق" : "Close"}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </aside>

      {/* Registration Modal */}
      {actionType === "event_registration" && (
        <EventRegistrationModal
          isOpen={isRegModalOpen}
          onClose={() => setIsRegModalOpen(false)}
          event={activeEvent}
        />
      )}
    </>
  );
}
