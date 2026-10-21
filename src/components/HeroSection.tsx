"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import SlicedHeroImage, { DEFAULT_HERO_SLIDES, HeroSlide } from "./SlicedHeroImage";
import {
  CalendarCheck,
  Heart,
  CheckCircle2,
  Sun,
  Wifi,
  Wind,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";

interface HeroSectionProps {
  onOpenBooking: () => void;
  onOpenDonation: (amount?: number) => void;
}

export default function HeroSection({ onOpenBooking, onOpenDonation }: HeroSectionProps) {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const slides: HeroSlide[] = (t.hero.slides as HeroSlide[]) || DEFAULT_HERO_SLIDES;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeLightboxSlide, setActiveLightboxSlide] = useState<HeroSlide>(slides[0]);

  // Close lightbox on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen]);

  return (
    <section
      id="hero"
      className="relative pt-6 pb-16 lg:pt-10 lg:pb-24 overflow-hidden bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/30"
    >
      {/* ─── Hero Dynamic Entrance Animations & Shimmer ─── */}
      <style jsx>{`
        @keyframes shimmer-line {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-accent {
          background: linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 50%, transparent 100%);
          background-size: 200% auto;
          animation: shimmer-line 3s linear infinite;
        }

        /* ── Staggered Side Text Item Entrance (Slow, noticeable and graceful) ── */
        @keyframes textItemFromRight {
          0% {
            opacity: 0;
            transform: translateX(65px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes textItemFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-65px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* ── Slow Image Entrance (Glides in slowly, then settles firmly in place) ── */
        @keyframes heroImageSlowFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-80px) scale(0.92);
          }
          65% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes heroImageSlowFromRight {
          0% {
            opacity: 0;
            transform: translateX(80px) scale(0.92);
          }
          65% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .anim-text-item-rtl {
          animation: textItemFromRight 1.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .anim-text-item-ltr {
          animation: textItemFromLeft 1.25s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .anim-delay-badge { animation-delay: 0.1s; }
        .anim-delay-title { animation-delay: 0.28s; }
        .anim-delay-desc { animation-delay: 0.46s; }
        .anim-delay-ctas { animation-delay: 0.65s; }
        .anim-delay-trust { animation-delay: 0.82s; }

        /* Slow image motion (1.6s) that settles solidly in place */
        .anim-image-slow-rtl {
          animation: heroImageSlowFromLeft 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }
        .anim-image-slow-ltr {
          animation: heroImageSlowFromRight 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-text-item-rtl,
          .anim-text-item-ltr,
          .anim-image-slow-rtl,
          .anim-image-slow-ltr {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ═══════════════════════════════════════════
              TEXT COLUMN: Staggered slow, graceful slide-in
             ═══════════════════════════════════════════ */}
          <div className="lg:col-span-6 flex flex-col items-start text-start space-y-5">

            {/* 1. Mission Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-extrabold shadow-2xs ${
                isRTL ? "anim-text-item-rtl" : "anim-text-item-ltr"
              } anim-delay-badge`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {t.hero.missionBadge || (isRTL
                  ? "مساحة تعليمية وعمل غير ربحية ومجانية للطلاب"
                  : "Non-profit Educational & Work Sanctuary in Gaza")}
              </span>
            </div>

            {/* 2. Main Heading */}
            <h1
              className={`${
                isRTL
                  ? "text-4xl sm:text-5xl xl:text-[3.5rem] font-black leading-[1.25]"
                  : "text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-extrabold leading-[1.15]"
              } tracking-tight text-brand-navy ${
                isRTL ? "anim-text-item-rtl" : "anim-text-item-ltr"
              } anim-delay-title`}
            >
              {t.hero.titlePart1}{" "}
              <span className="relative text-emerald-600 block mt-1.5 sm:mt-2">
                {t.hero.titleHighlight}
                {/* Animated shimmer underline */}
                <span className="absolute -bottom-1.5 start-0 w-full h-[3px] rounded-full shimmer-accent" />
              </span>
            </h1>

            {/* 3. Description */}
            <p
              className={`${
                isRTL
                  ? "text-base sm:text-lg text-slate-700 font-medium"
                  : "text-sm sm:text-base text-slate-600 font-normal"
              } leading-relaxed max-w-xl ${
                isRTL ? "anim-text-item-rtl" : "anim-text-item-ltr"
              } anim-delay-desc`}
            >
              {t.hero.description}
            </p>

            {/* 4. CTAs Action Buttons */}
            <div
              className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-1 ${
                isRTL ? "anim-text-item-rtl" : "anim-text-item-ltr"
              } anim-delay-ctas`}
            >
              <button
                type="button"
                onClick={onOpenBooking}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 active:scale-[0.97] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
              >
                <CalendarCheck className="w-5 h-5 text-emerald-100 shrink-0" />
                <span>{t.hero.bookSeatFreeCta}</span>
                <ArrowIcon className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onOpenDonation()}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white bg-brand-navy hover:bg-brand-navy-hover shadow-lg shadow-slate-900/15 hover:shadow-xl active:scale-[0.97] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-navy whitespace-nowrap"
              >
                <Heart className="w-5 h-5 fill-white text-white shrink-0 group-hover:scale-110 transition-transform" />
                <span>{t.hero.sponsorStudentCta || (isRTL ? "اكفل طالباً في غزة" : "Sponsor a Student")}</span>
              </button>
            </div>

            {/* 5. Trust badge */}
            <div
              className={`flex items-center gap-2 text-xs sm:text-sm text-slate-500 pt-0.5 ${
                isRTL ? "anim-text-item-rtl" : "anim-text-item-ltr"
              } anim-delay-trust`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.hero.trustBadge}</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              IMAGE COLUMN: Glides in slowly, then settles firmly in place
             ═══════════════════════════════════════════ */}
          <div
            className={`lg:col-span-6 relative w-full flex items-center justify-center ${
              isRTL ? "anim-image-slow-rtl" : "anim-image-slow-ltr"
            }`}
          >
            <div className="relative w-full max-w-lg lg:max-w-xl">
              {/* Complete Full-Image Showcase Slider (Clean, borderless & shadowless) */}
              <SlicedHeroImage
                slides={slides}
                holdDurationMs={2800}
                onOpenLightbox={(slide) => {
                  setActiveLightboxSlide(slide);
                  setLightboxOpen(true);
                }}
                isRTL={isRTL}
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            Highlights Bar (4 Core Pillars)
           ═══════════════════════════════════════════ */}
        <div className="mt-12 lg:mt-16 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200/60 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sun className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-sm sm:text-base font-extrabold text-slate-800">
                {t.hero.highlights.solarPower}
              </span>
            </div>
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/70 hover:bg-sky-50/60 border border-slate-100 hover:border-sky-200/60 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Wifi className="w-5 h-5 text-sky-700" />
              </div>
              <span className="text-sm sm:text-base font-extrabold text-slate-800">
                {t.hero.highlights.satelliteInternet}
              </span>
            </div>
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200/60 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Wind className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-sm sm:text-base font-extrabold text-slate-800">
                {t.hero.highlights.quietAcEnv}
              </span>
            </div>
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/70 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200/60 transition-all group">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-indigo-700" />
              </div>
              <span className="text-sm sm:text-base font-extrabold text-slate-800">
                {t.hero.highlights.mentorship}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          Lightbox Modal: High-Res Photo View
         ═══════════════════════════════════════════ */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 end-0 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              aria-label={t.hero.closeLightbox || (isRTL ? "إغلاق" : "Close")}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Expanded Image */}
            <div className="relative w-full aspect-[16/10] max-h-[80vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <Image
                src={activeLightboxSlide.src}
                alt={activeLightboxSlide.alt}
                fill
                sizes="95vw"
                className="object-contain bg-black/50"
                priority
              />
            </div>

            {/* Caption in lightbox */}
            {activeLightboxSlide.caption && (
              <p className="mt-3 text-sm text-slate-300 font-medium text-center">
                {activeLightboxSlide.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
