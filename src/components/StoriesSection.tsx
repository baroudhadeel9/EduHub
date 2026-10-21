"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Sparkles, ChevronRight, ChevronLeft, Quote } from "lucide-react";

export default function StoriesSection() {
  const { t, locale, dir } = useLanguage();
  const items = t.storiesSection.items;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play timer (cycles every 7 seconds, pauses on hover)
  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const current = items[activeIndex] || items[0];

  // RTL-aware arrow buttons
  const NextIcon = dir === "rtl" ? ChevronLeft : ChevronRight;
  const PrevIcon = dir === "rtl" ? ChevronRight : ChevronLeft;

  return (
    <section
      id="gallery"
      className="py-16 lg:py-24 bg-slate-50/80 border-t border-slate-200/90 relative overflow-hidden"
      aria-labelledby="stories-title"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 start-10 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 end-10 w-96 h-96 bg-sky-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 tracking-wide uppercase mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.storiesSection.badge}</span>
            </div>
            <h2
              id="stories-title"
              className={`${locale === "ar" ? "text-3xl sm:text-4xl font-black" : "text-3xl sm:text-4xl font-extrabold"} text-brand-navy tracking-tight mb-2`}
            >
              {t.storiesSection.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
              {t.storiesSection.subtitle}
            </p>
          </div>

          {/* Slider Controls: Counter & Arrows */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Slide Index Counter */}
            <span className="text-sm font-mono font-bold text-slate-600 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              0{activeIndex + 1} <span className="text-slate-300">/</span> 0{items.length}
            </span>

            {/* Prev Button */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label={t.storiesSection.prevStory || (locale === "ar" ? "القصة السابقة" : "Previous Story")}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <PrevIcon className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNext}
              aria-label={t.storiesSection.nextStory || (locale === "ar" ? "القصة التالية" : "Next Story")}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <NextIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Showcase Slide */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-shadow duration-500 overflow-hidden"
        >
          <div
            key={activeIndex}
            className="animate-slide-in grid grid-cols-1 lg:grid-cols-12 items-stretch"
          >
            {/* Student Photo Column (5 cols on lg) */}
            <div className="lg:col-span-5 relative w-full h-72 sm:h-96 lg:h-auto min-h-[320px] lg:min-h-[440px] bg-slate-100 overflow-hidden">
              <Image
                src={current.avatar}
                alt={current.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent flex items-end p-5 lg:hidden">
                <div className="text-white">
                  <h3 className="text-lg font-bold">{current.name}</h3>
                  <p className="text-xs text-slate-200">{current.role}</p>
                </div>
              </div>
            </div>

            {/* Student Story Narrative Column (7 cols on lg) */}
            <div className="lg:col-span-7 p-6 sm:p-9 lg:p-12 flex flex-col justify-between">
              <div>
                {/* Author Info Header (Visible on Desktop) */}
                <div className="hidden lg:flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-brand-navy tracking-tight">
                      {current.name}
                    </h3>
                    <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                      {current.role}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Quote className="w-5 h-5" />
                  </div>
                </div>

                {/* Highlight Quote with prominent green accent start line */}
                <div className="border-s-4 border-emerald-500 ps-4 sm:ps-5 py-1 mb-5">
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-brand-navy leading-snug">
                    &ldquo;{current.highlight || current.quote}&rdquo;
                  </p>
                </div>

                {/* Full Narrative Text */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {current.story || current.quote}
                </p>
              </div>

              {/* Mobile Author Info */}
              <div className="lg:hidden pt-4 border-t border-slate-100 mt-6">
                <h4 className="text-base font-bold text-brand-navy">{current.name}</h4>
                <p className="text-xs font-semibold text-emerald-700">{current.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Tabs (Pills) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {items.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative p-3.5 sm:p-4 rounded-2xl border text-start transition-all duration-300 flex items-center gap-3.5 cursor-pointer ${
                  isActive
                    ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-white/70 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:shadow-xs"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    isActive ? "border-emerald-500 shadow-xs scale-105" : "border-slate-200"
                  }`}
                >
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover object-top"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-sm font-bold truncate ${
                      isActive ? "text-brand-navy" : "text-slate-800"
                    }`}
                  >
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5 font-normal">
                    {item.role}
                  </p>
                </div>

                {/* Live indicator on active pill */}
                {isActive && (
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}

