"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { getPublicEventsApi, EventItem } from "@/services/events";
import EventRegistrationModal from "@/components/events/EventRegistrationModal";
import { sanitizeExternalUrl } from "@/utils/url";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MoveRight,
  MoveLeft,
  CalendarCheck,
  CheckCircle2,
  ExternalLink,
  Clock,
  MapPin,
} from "lucide-react";

export default function EventsSection() {
  const { t, dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [isInView, setIsInView] = useState(true);
  const [events, setEvents] = useState<EventItem[]>(() => t.eventsSection.items as unknown as EventItem[]);
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventItem | null>(null);

  // Helper to format Arabic/ISO dates into proper English dates
  const formatEnglishDate = useCallback((raw?: string | null): string => {
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, d] = raw.split("-").map(Number);
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${months[m - 1]} ${d}, ${y}`;
    }
    const arMonths: Record<string, string> = {
      يناير: "January", فبراير: "February", مارس: "March", أبريل: "April",
      مايو: "May", يونيو: "June", يوليو: "July", أغسطس: "August",
      سبتمبر: "September", أكتوبر: "October", نوفمبر: "November", ديسمبر: "December"
    };
    let formatted = raw;
    for (const [ar, en] of Object.entries(arMonths)) {
      if (formatted.includes(ar)) {
        const match = formatted.match(/(\d+)\s+([^\s]+)\s+(\d{4})/);
        if (match) {
          return `${en} ${match[1]}, ${match[3]}`;
        }
        formatted = formatted.replace(ar, en);
      }
    }
    return formatted;
  }, []);

  // Helper to resolve localized event fields based on current language
  const getLocalizedEvent = useCallback(
    (event: EventItem) => {
      if (locale === "ar") {
        return {
          title: event.title,
          desc: event.desc || event.description,
          dateBadge: event.dateBadge || event.event_date,
          tag: event.tag,
          location: "مساحة إديوهب",
        };
      }

      // Locale is English ('en')
      const localItems = (t.eventsSection.items || []) as unknown as Array<{
        id?: string | number;
        title: string;
        desc: string;
        dateBadge?: string;
        tag?: string;
      }>;

      const matched = localItems.find((item) => {
        if (String(item.id) === String(event.id)) return true;
        if (
          item.id === "event-opening" &&
          (String(event.id) === "event-opening" ||
            event.title?.includes("الافتتاح") ||
            event.title?.toLowerCase().includes("opening"))
        ) {
          return true;
        }
        if (
          item.id === "event-dentistry" &&
          (event.id === 1 ||
            event.title?.includes("طب أسنان") ||
            event.title?.includes("الكافيتي") ||
            event.title?.toLowerCase().includes("dentistry") ||
            event.title?.toLowerCase().includes("amalgam"))
        ) {
          return true;
        }
        if (
          item.id === "event-chess" &&
          (event.id === 2 ||
            event.title?.includes("الشطرنج") ||
            event.title?.toLowerCase().includes("chess"))
        ) {
          return true;
        }
        return false;
      });

      if (matched) {
        return {
          title: matched.title,
          desc: matched.desc,
          dateBadge: matched.dateBadge || formatEnglishDate(event.event_date || event.dateBadge),
          tag: matched.tag || event.tag,
          location: "EduHub Space",
        };
      }

      const enDate = formatEnglishDate(event.event_date || event.dateBadge);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyEv = event as any;

      return {
        title: anyEv.title_en || event.title,
        desc: anyEv.desc_en || anyEv.description_en || event.desc || event.description,
        dateBadge: enDate || event.dateBadge,
        tag: anyEv.tag_en || event.tag,
        location: "EduHub Space",
      };
    },
    [locale, t.eventsSection.items, formatEnglishDate]
  );

  // Slider state
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const isOneCard = events.length === 1;
  const isTwoCards = events.length === 2;

  // Touch / mouse swipe gesture tracking
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);
  const mouseStartXRef = useRef(0);
  const mouseScrollLeftRef = useRef(0);

  // Fetch live public events
  const fetchLiveEvents = useCallback(() => {
    getPublicEventsApi()
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Ensure the official opening event is never removed by live API sync
          const hasOpening = res.data.some(
            (ev) =>
              String(ev.id) === "event-opening" ||
              ev.title?.includes("الافتتاح") ||
              ev.title?.toLowerCase().includes("opening")
          );

          if (!hasOpening) {
            const localList = (t.eventsSection.items || []) as unknown as EventItem[];
            const openingCard = localList.find(
              (it) =>
                String(it.id) === "event-opening" ||
                it.title?.includes("الافتتاح") ||
                it.title?.toLowerCase().includes("opening")
            );

            if (openingCard) {
              setEvents([openingCard, ...res.data]);
              return;
            }
          }

          setEvents(res.data);
        }
      })
      .catch((err) => {
        console.warn("Failed to load live events, falling back to local items:", err);
      });
  }, [t.eventsSection.items]);

  // Fetch on mount + auto-sync on window focus or admin update events
  useEffect(() => {
    fetchLiveEvents();

    const handleSync = () => fetchLiveEvents();
    window.addEventListener("focus", handleSync);
    window.addEventListener("eduhub_events_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("eduhub_events_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [fetchLiveEvents]);

  // Intersection observer for section entrance animation
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Update slider boundary state
  const updateSliderState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const absScroll = Math.abs(scrollLeft);

    const overflow = maxScroll > 15;

    // Can scroll boundaries
    setCanScrollPrev(overflow && absScroll > 15);
    setCanScrollNext(overflow && absScroll < maxScroll - 15);

    // Calculate active slide index
    const firstCard = el.firstElementChild as HTMLElement | null;
    const scrollStep = firstCard ? firstCard.offsetWidth + 16 : 320;
    const currentIdx = Math.round(absScroll / scrollStep);
    setActiveIndex(Math.min(events.length - 1, Math.max(0, currentIdx)));
  }, [events.length]);

  useEffect(() => {
    updateSliderState();
    const handleResize = () => updateSliderState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateSliderState, events]);

  // Programmatic scroll handler for Prev / Next arrows (RTL + LTR compliant)
  const handleScroll = useCallback((direction: "prev" | "next") => {
    const el = sliderRef.current;
    if (!el) return;

    const firstCard = el.firstElementChild as HTMLElement | null;
    const scrollStep = firstCard ? firstCard.offsetWidth + 16 : 320;

    let delta = 0;
    if (direction === "next") {
      delta = isRTL ? -scrollStep : scrollStep;
    } else {
      delta = isRTL ? scrollStep : -scrollStep;
    }

    el.scrollBy({ left: delta, behavior: "smooth" });
  }, [isRTL]);

  // Jump to specific slide when clicking pagination dots
  const scrollToCard = (index: number) => {
    const el = sliderRef.current;
    if (!el) return;

    const firstCard = el.firstElementChild as HTMLElement | null;
    const scrollStep = firstCard ? firstCard.offsetWidth + 16 : 320;
    const targetPos = index * scrollStep;

    el.scrollTo({
      left: isRTL ? -targetPos : targetPos,
      behavior: "smooth",
    });
  };

  // Touch Swipe Handlers for mobile (finger gestures)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - touchEndX;
    const diffY = touchStartYRef.current - touchEndY;

    // Trigger only if horizontal swipe dominates and exceeds threshold
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Swiped towards left -> Next card
        handleScroll("next");
      } else {
        // Swiped towards right -> Prev card
        handleScroll("prev");
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Mouse Drag Handlers for desktop trackpads/mice
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;

    const el = sliderRef.current;
    if (!el) return;

    isPointerDownRef.current = true;
    mouseStartXRef.current = e.pageX - el.offsetLeft;
    mouseScrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPointerDownRef.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - mouseStartXRef.current) * 1.2;
    sliderRef.current.scrollLeft = mouseScrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isPointerDownRef.current = false;
  };

  return (
    <section
      ref={sectionRef}
      id="events"
      className="py-12 sm:py-16 lg:py-24 bg-white relative border-t border-slate-200/90 overflow-hidden"
      aria-labelledby="events-title"
    >
      {/* -- Ambient Background Glow Blobs -- */}
      <div className="absolute top-10 start-10 w-72 sm:w-80 h-72 sm:h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 end-10 w-72 sm:w-80 h-72 sm:h-80 bg-teal-100/35 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* -- Reduced Motion Support -- */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .anim-event-card,
          .anim-header {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* -- Centered Section Header -- */}
        <div
          className={`text-center max-w-3xl mx-auto mb-8 sm:mb-12 anim-header transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isInView ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
            }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 mb-2.5 sm:mb-3.5 shadow-2xs">
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600 shrink-0" />
            <span>{t.eventsSection.badge}</span>
          </div>

          <h2
            id="events-title"
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-navy tracking-tight leading-snug"
          >
            {t.eventsSection.title}
          </h2>
          <div className="w-14 sm:w-16 h-1 sm:h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full mx-auto mt-3 sm:mt-4" />
        </div>

        {/* -- Slider Top Navigation Bar (Mobile-friendly, responsive & properly aligned) -- */}
        {events.length > 1 && (
          <div className={`flex items-center justify-end mb-4 sm:mb-6 px-1 max-w-5xl mx-auto ${isTwoCards ? "sm:hidden" : ""}`}>
            {/* Grouped Counter & Navigation Arrows */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Clean Arabic / English Page Counter */}
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-100/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200/80 shadow-2xs font-mono">
                {isRTL
                  ? `${activeIndex + 1} من ${events.length}`
                  : `${activeIndex + 1} of ${events.length}`}
              </span>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleScroll("prev")}
                  disabled={!canScrollPrev}
                  aria-label={t.eventsSection.prev || (isRTL ? "الورشة السابقة" : "Previous Workshop")}
                  title={isRTL ? "السابق" : "Previous"}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  {isRTL ? (
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleScroll("next")}
                  disabled={!canScrollNext}
                  aria-label={t.eventsSection.next || (isRTL ? "الورشة التالية" : "Next Workshop")}
                  title={isRTL ? "التالي" : "Next"}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:bg-emerald-600 hover:border-emerald-600 text-slate-700 hover:text-white shadow-2xs hover:shadow-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  {isRTL ? (
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -- Horizontal Scrollable Carousel Container with Smooth Mobile Touch & Drag -- */}
        <div className="relative">
          <div
            ref={sliderRef}
            onScroll={updateSliderState}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex items-stretch overflow-x-auto scrollbar-none snap-x snap-mandatory pt-1 pb-6 touch-pan-x cursor-grab active:cursor-grabbing select-none ${isTwoCards
                ? "justify-start sm:justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-7xl mx-auto -mx-4 sm:mx-auto px-4 sm:px-2"
                : isOneCard
                  ? "justify-center gap-4 max-w-xl mx-auto px-4"
                  : "justify-start gap-4 sm:gap-6 lg:gap-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
              }`}
            style={{
              scrollPaddingLeft: "1rem",
              scrollPaddingRight: "1rem",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {events.length === 0 ? (
              <div className="w-full py-12 px-4 text-center rounded-3xl bg-slate-50 border border-slate-200/80 mx-auto max-w-lg my-4 shrink-0">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  {isRTL ? "لا توجد ورش عمل معلنة حالياً" : "No workshops currently listed"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  {isRTL
                    ? "ترقبوا الإعلان عن ورش وفعاليات تدريبية نوعية قريباً في مساحة إديوهب غزة."
                    : "Stay tuned for new workshops and events coming soon at EduHub Gaza."}
                </p>
              </div>
            ) : (
              events.map((event, idx) => {
                const loc = getLocalizedEvent(event);
                const staggerDelay = `${Math.min(idx, 4) * 120}ms`;
                const isCompleted =
                  event.status === "completed" ||
                  event.statusBadge === "تمت الورشة" ||
                  event.statusBadge === "Completed" ||
                  event.statusBadge === "توثيق ميداني" ||
                  event.statusBadge === "Field Verified";

                const isRegistrationClosed =
                  isCompleted ||
                  event.is_deadline_passed ||
                  event.is_registration_open === false ||
                  event.allow_registration === false;

                return (
                  <article
                    key={event.id}
                    style={{
                      transitionDelay: isInView ? staggerDelay : "0ms",
                    }}
                    className={`anim-event-card ${isOneCard
                        ? "w-full max-w-[460px] mx-auto"
                        : isTwoCards
                          ? "w-[92vw] max-w-[420px] sm:w-[380px] md:w-[480px] lg:w-[560px] xl:w-[600px] 2xl:w-[620px]"
                          : "w-[85vw] max-w-[340px] sm:w-[360px] md:w-[370px] lg:w-[380px]"
                      } shrink-0 snap-center sm:snap-start bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:shadow-emerald-950/10 hover:border-emerald-300 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between group select-none active:scale-[0.99] ${isCompleted ? "cursor-default" : "cursor-pointer"
                      }`}
                  >
                    <div>
                      {/* Event Image Container with Zoom & Sheen (Sleek widescreen aspect ratio) */}
                      <div className={`relative w-full bg-slate-100 overflow-hidden rounded-t-2xl sm:rounded-t-3xl ${isTwoCards ? "h-36 sm:h-40 md:h-44 lg:h-48" : "h-44 sm:h-52 lg:h-56"
                        }`}>
                        <Image
                          src={event.image || event.image_url || "/images/hero-workspace.jpg"}
                          alt={`${loc.title} workshop at EduHub`}
                          fill
                          draggable={false}
                          quality={92}
                          unoptimized={Boolean(
                            (event.image && event.image.startsWith("/api/")) ||
                            (event.image_url && event.image_url.startsWith("/api/")) ||
                            (event.image && event.image.startsWith("http"))
                          )}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />

                        {/* Top Start: Date Badge (Always visible, frosted glass) */}
                        <div className="absolute top-2.5 start-2.5 sm:top-3.5 sm:start-3.5 z-10 flex items-center gap-1.5 pointer-events-none">
                          <span className={`inline-flex items-center gap-1.5 ${isTwoCards ? "px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-[13px]" : "px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs"} font-bold bg-white/95 text-slate-800 shadow-xs backdrop-blur-md border border-white/70 rounded-full`}>
                            <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600" />
                            <span>{loc.dateBadge}</span>
                          </span>
                        </div>

                        {/* Top End: Status Badge (Hidden when completed as requested; shown only when open or deadline closed) */}
                        {!isCompleted && (
                          <div className="absolute top-2.5 end-2.5 sm:top-3.5 end-3.5 z-10 flex items-center gap-1.5 pointer-events-none">
                            {isRegistrationClosed ? (
                              <span className={`inline-flex items-center gap-1 ${isTwoCards ? "px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-[13px]" : "px-2.5 py-1 text-[11px] sm:text-xs"} font-bold bg-amber-600/95 text-white shadow-xs backdrop-blur-md border border-amber-400/40 rounded-full`}>
                                <Clock className="w-3.5 h-3.5 text-white" />
                                <span>{isRTL ? "انتهى التسجيل" : "Closed"}</span>
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1.5 ${isTwoCards ? "px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-[13px]" : "px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs"} font-bold bg-emerald-600/95 text-white shadow-xs backdrop-blur-md border border-emerald-400/40 rounded-full`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                <span>{isRTL ? "التسجيل متاح" : "Open"}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content Body (Optimized typography and padding for mobile) */}
                      <div className={isTwoCards ? "p-4 sm:p-5 lg:p-6" : "p-4 sm:p-6"}>
                        {/* Micro Category Tag & Location Row */}
                        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
                          {loc.tag ? (
                            <span className={`inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg ${isTwoCards ? "text-xs sm:text-[13px]" : "text-[10px] sm:text-[11px]"} font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/70 truncate max-w-[170px]`}>
                              {loc.tag}
                            </span>
                          ) : <span />}

                          <span className={`inline-flex items-center gap-1 ${isTwoCards ? "text-xs sm:text-[13px]" : "text-[10px] sm:text-[11px]"} font-semibold text-slate-500 shrink-0`}>
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{loc.location}</span>
                          </span>
                        </div>

                        <h3 className={`text-base sm:text-lg ${isTwoCards ? "lg:text-xl font-black mb-1.5 sm:mb-2" : "font-black mb-1.5"} text-brand-navy group-hover:text-emerald-700 transition-colors leading-snug`}>
                          {loc.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {loc.desc}
                        </p>

                        {/* Registration Deadline Warning (Only for active events approaching deadline) */}
                        {!isCompleted && event.registration_deadline && !event.is_deadline_passed && (
                          <div className={`mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50/90 text-amber-900 border border-amber-200/80 ${isTwoCards ? "text-xs" : "text-[10px] sm:text-[11px]"} font-semibold`}>
                            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            <span>
                              {isRTL
                                ? `آخر موعد للتسجيل: ${event.registration_deadline_badge}`
                                : `Deadline: ${event.registration_deadline_badge}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Meta & Action Bar (Compact & Sleek) */}
                    <div className={`px-4 sm:px-6 ${isTwoCards ? "py-2.5 sm:py-3" : "py-3 sm:py-3.5"} bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:bg-slate-50 transition-colors`}>
                      {isCompleted ? (
                        <div className="w-full flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/90">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{event.statusBadge || (isRTL ? "تمت الفعالية" : "Completed")}</span>
                          </span>
                          {event.meta && (
                            <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200/70 shadow-2xs">
                              {event.meta}
                            </span>
                          )}
                        </div>
                      ) : isRegistrationClosed ? (
                        <div className="w-full flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>{isRTL ? "انتهى موعد التسجيل" : "Registration Closed"}</span>
                          </span>
                        </div>
                      ) : sanitizeExternalUrl(event.custom_url) ? (
                        <div className="w-full flex items-center">
                          <a
                            href={sanitizeExternalUrl(event.custom_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{isRTL ? "سجّل الآن في الورشة" : "Register Now"}</span>
                          </a>
                        </div>
                      ) : (
                        <div className="w-full flex items-center">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedEventForReg({
                                ...event,
                                title: loc.title,
                                desc: loc.desc,
                                dateBadge: loc.dateBadge,
                              })
                            }
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>{isRTL ? "سجّل الآن في الورشة" : "Register Now"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* -- Bottom Carousel Indicators (Centered & Responsive for Mobile) -- */}
        {events.length > 1 && (
          <div className={`flex items-center justify-between gap-3 pt-3 px-1 sm:px-2 max-w-5xl mx-auto ${isTwoCards ? "sm:hidden" : ""
            }`}>
            {/* Mobile swipe helper text */}
            <div className="flex items-center gap-1 text-slate-400 text-[11px] sm:text-xs font-medium">
              {isRTL ? (
                <MoveLeft className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              ) : (
                <MoveRight className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              )}
              <span>
                {t.eventsSection.swipeHint ||
                  (isRTL ? "اسحب للتنقل بين الورش" : "Swipe to navigate workshops")}
              </span>
            </div>

            {/* Clickable Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {events.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToCard(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeIndex === i
                      ? "w-6 sm:w-7 bg-emerald-600 shadow-2xs"
                      : "w-2 bg-slate-200 hover:bg-slate-300"
                    }`}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Workshop Registration Modal */}
      <EventRegistrationModal
        isOpen={!!selectedEventForReg}
        onClose={() => setSelectedEventForReg(null)}
        event={selectedEventForReg}
      />
    </section>
  );
}
