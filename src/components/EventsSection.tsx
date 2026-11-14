"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { getPublicEventsApi, EventItem } from "@/services/events";
import {
  Calendar,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MoveRight,
  MoveLeft,
} from "lucide-react";

export default function EventsSection() {
  const { t, dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const [isInView, setIsInView] = useState(false);
  const [events, setEvents] = useState<EventItem[]>(() => t.eventsSection.items as unknown as EventItem[]);

  // Slider state
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Fetch live public events
  useEffect(() => {
    let isMounted = true;
    getPublicEventsApi()
      .then((res) => {
        if (isMounted && res.success && res.data && res.data.length > 0) {
          setEvents(res.data);
        }
      })
      .catch((err) => {
        console.warn("Failed to load live events, falling back to local items:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
    setHasOverflow(overflow);

    // Can scroll boundaries
    setCanScrollPrev(overflow && absScroll > 15);
    setCanScrollNext(overflow && absScroll < maxScroll - 15);

    // Calculate active slide index
    const firstCard = el.firstElementChild as HTMLElement | null;
    const scrollStep = firstCard ? firstCard.offsetWidth + 24 : 360;
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
  const handleScroll = (direction: "prev" | "next") => {
    const el = sliderRef.current;
    if (!el) return;

    const firstCard = el.firstElementChild as HTMLElement | null;
    const scrollStep = firstCard ? firstCard.offsetWidth + 24 : 360;

    let delta = 0;
    if (direction === "next") {
      delta = isRTL ? -scrollStep : scrollStep;
    } else {
      delta = isRTL ? scrollStep : -scrollStep;
    }

    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Jump to specific slide when clicking pagination dots
  const scrollToCard = (index: number) => {
    const el = sliderRef.current;
    if (!el) return;

    const firstCard = el.firstElementChild as HTMLElement | null;
    const scrollStep = firstCard ? firstCard.offsetWidth + 24 : 360;
    const targetPos = index * scrollStep;

    el.scrollTo({
      left: isRTL ? -targetPos : targetPos,
      behavior: "smooth",
    });
  };

  const isTwoCards = events.length === 2;

  return (
    <section
      ref={sectionRef}
      id="events"
      className="py-16 lg:py-24 bg-white relative border-t border-slate-200/90 overflow-hidden"
      aria-labelledby="events-title"
    >
      {/* -- Ambient Background Glow Blobs -- */}
      <div className="absolute top-10 start-10 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 end-10 w-80 h-80 bg-teal-100/35 rounded-full blur-3xl pointer-events-none -z-10" />

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
          className={`text-center max-w-3xl mx-auto mb-10 sm:mb-14 anim-header transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 mb-3.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t.eventsSection.badge}</span>
          </div>

          <h2
            id="events-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy tracking-tight leading-snug"
          >
            {t.eventsSection.title}
          </h2>
          <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full mx-auto mt-4" />
        </div>

        {/* -- Slider Top Navigation Bar (Shown when more than 2 workshops) -- */}
        {!isTwoCards && events.length > 1 && (
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-bold text-slate-500 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200/80 font-mono">
              {activeIndex + 1} / {events.length}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll("prev")}
                disabled={!canScrollPrev}
                aria-label={t.eventsSection.prev || (isRTL ? "الورشة السابقة" : "Previous Workshop")}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 shadow-2xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                {isRTL ? (
                  <ChevronRight className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleScroll("next")}
                disabled={!canScrollNext}
                aria-label={t.eventsSection.next || (isRTL ? "الورشة التالية" : "Next Workshop")}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-emerald-600 hover:border-emerald-600 text-slate-700 hover:text-white shadow-2xs hover:shadow-md hover:shadow-emerald-900/10 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                {isRTL ? (
                  <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <ChevronRight className="w-5 h-5 stroke-[2.2]" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* -- Horizontal Scrollable Carousel Container -- */}
        <div className="relative">
          <div
            ref={sliderRef}
            onScroll={updateSliderState}
            className="flex items-stretch justify-start gap-6 lg:gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory pt-2 pb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scroll-smooth"
            style={{
              scrollPaddingLeft: "1rem",
              scrollPaddingRight: "1rem",
            }}
          >
            {events.map((event, idx) => {
              const staggerDelay = `${Math.min(idx, 4) * 120}ms`;

              return (
                <article
                  key={event.id}
                  style={{
                    transitionDelay: isInView ? staggerDelay : "0ms",
                  }}
                  className={`anim-event-card ${
                    isTwoCards
                      ? "w-[85vw] max-w-[340px] sm:w-[380px] md:w-[calc(50%-1rem)] md:max-w-[560px]"
                      : "w-[84vw] max-w-[340px] sm:w-[350px] md:w-[370px] lg:w-[380px]"
                  } shrink-0 snap-start bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/10 hover:border-emerald-300 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between group cursor-pointer ${
                    isInView
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-10 scale-[0.96]"
                  }`}
                >
                  <div>
                    {/* Event Image Container with Zoom & Sheen (Larger height for 2 cards) */}
                    <div
                      className={`relative ${
                        isTwoCards ? "h-52 sm:h-60 lg:h-68" : "h-48 sm:h-54 lg:h-60"
                      } w-full bg-slate-100 overflow-hidden`}
                    >
                      <Image
                        src={event.image || event.image_url || "/images/hero-workspace.jpg"}
                        alt={`${event.title} workshop at EduHub`}
                        fill
                        unoptimized={Boolean(
                          (event.image && event.image.startsWith("/api/")) ||
                          (event.image_url && event.image_url.startsWith("/api/")) ||
                          (event.image && event.image.startsWith("http"))
                        )}
                        sizes={isTwoCards ? "(max-width: 768px) 85vw, 560px" : "(max-width: 768px) 85vw, 380px"}
                        className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent pointer-events-none" />

                      {/* Sheen Glare Light Sweep on Hover */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                      {/* Top Date Badge */}
                      <div className="absolute top-3.5 start-3.5 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-md border border-white/60">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{event.dateBadge || event.event_date}</span>
                        </span>
                      </div>

                      {/* Floating Corner Arrow */}
                      <div className="absolute top-3.5 end-3.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-emerald-700 shadow-md group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className={isTwoCards ? "p-6 sm:p-7" : "p-5 sm:p-6"}>
                      <h3
                        className={`${
                          isTwoCards ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                        } font-black text-brand-navy mb-2 sm:mb-2.5 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug`}
                      >
                        {event.title}
                      </h3>
                      <p
                        className={`${
                          isTwoCards ? "text-xs sm:text-sm" : "text-xs sm:text-sm"
                        } text-slate-600 leading-relaxed font-normal line-clamp-3`}
                      >
                        {event.desc || event.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Meta Bar */}
                  <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:bg-slate-50 transition-colors">
                    <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-bold text-xs group-hover:bg-emerald-100 group-hover:border-emerald-300 transition-colors truncate max-w-[200px]">
                      {event.tag}
                    </span>
                    <span className="text-slate-600 font-medium text-xs">
                      {event.meta || event.type}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* -- Bottom Carousel Pagination Indicators (On mobile, or for full slider) -- */}
        {events.length > 1 && (
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 ${
              isTwoCards ? "md:hidden" : ""
            }`}
          >
            {/* Mobile swipe helper text */}
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium order-2 sm:order-1">
              {isRTL ? (
                <MoveLeft className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              ) : (
                <MoveRight className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              )}
              <span>
                {t.eventsSection.swipeHint ||
                  (isRTL ? "اسحب أفقياً لتصفح المزيد" : "Swipe horizontally to explore more")}
              </span>
            </div>

            {/* Clickable Pagination Dots */}
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              {events.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToCard(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === i
                      ? "w-7 bg-emerald-600 shadow-2xs"
                      : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
