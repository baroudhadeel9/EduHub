"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, ArrowUpRight } from "lucide-react";

export default function EventsSection() {
  const { t, locale } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    // IntersectionObserver triggers every time the section enters/leaves view
    // so the animation replays when scrolling down and returning back up
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="events"
      className="py-16 lg:py-24 bg-white relative border-t border-slate-200/90 overflow-hidden"
      aria-labelledby="events-title"
    >
      {/* ── Ambient Background Glow Blobs ── */}
      <div className="absolute top-10 start-10 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 end-10 w-80 h-80 bg-teal-100/35 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ── Reduced Motion Support ── */}
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
        
        {/* Section Header - Animated Entrance */}
        <div
          className={`text-center max-w-3xl mx-auto mb-12 sm:mb-16 anim-header transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isInView
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-6"
          }`}
        >
          <h2 id="events-title" className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy tracking-tight">
            {t.eventsSection.title}
          </h2>
          <div className="w-16 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full mx-auto mt-4" />
        </div>

        {/* Event Cards Grid */}
        <div className={`grid grid-cols-1 ${t.eventsSection.items.length === 2 ? "md:grid-cols-2 max-w-5xl mx-auto" : "md:grid-cols-3"} gap-8`}>
          {t.eventsSection.items.map((event, idx) => {
            const staggerDelay = `${idx * 160}ms`;

            return (
              <div
                key={event.id}
                style={{
                  transitionDelay: isInView ? staggerDelay : "0ms",
                }}
                className={`anim-event-card bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/10 hover:border-emerald-300 hover:-translate-y-2.5 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex flex-col justify-between group cursor-pointer ${
                  isInView
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-[0.95]"
                }`}
              >
                <div>
                  {/* Event Image Container with Sheen & Zoom */}
                  <div className="relative h-56 sm:h-64 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={event.image}
                      alt={`${event.title} workshop at EduHub`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent pointer-events-none" />

                    {/* Subtle Sheen Glare Light Sweep on Hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    {/* Top Date Badge */}
                    <div className="absolute top-4 start-4">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-md border border-white/60 group-hover:bg-white group-hover:shadow-md transition-all">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{event.dateBadge}</span>
                      </span>
                    </div>

                    {/* Floating Corner Arrow on hover */}
                    <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-300 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-emerald-700 shadow-md">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-7">
                    <h3 className="text-xl font-bold text-brand-navy mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-base text-slate-600 leading-relaxed font-normal line-clamp-3">
                      {event.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom Meta Bar */}
                <div className="px-6 sm:px-7 py-4.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-700 group-hover:bg-slate-50 transition-colors">
                  <span className="text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200/80 font-bold text-xs group-hover:bg-emerald-100 group-hover:border-emerald-300 transition-colors">
                    {event.tag}
                  </span>
                  <span className="text-slate-600 font-medium">
                    {event.meta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
