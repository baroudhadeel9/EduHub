"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlide {
  src: string;
  alt: string;
  caption?: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    src: "/images/hero-main.jpg",
    alt: "Gaza Educational Hub",
    caption: "القاعة الرئيسية — مساحة عمل ودراسة جامعية مجانية متكاملة",
  },
  {
    src: "/images/hero-workspace.jpg",
    alt: "Gaza Educational Hub Workspace",
    caption: "طاقة شمسية مستمرة وإنترنت فضائي دون انقطاع لشباب غزة",
  },
  {
    src: "/images/hero-focus.jpg",
    alt: "Gaza Educational Hub Students",
    caption: "إصرار شباب وطلاب غزة على مواصلة التعلم والابتكار",
  },
];

interface SlicedHeroImageProps {
  slides?: HeroSlide[];
  holdDurationMs?: number; // Time per slide in ms
  onOpenLightbox?: (currentSlide: HeroSlide) => void;
  onSlideChange?: (index: number) => void;
  isRTL?: boolean;
}

export default function SlicedHeroImage({
  slides = DEFAULT_HERO_SLIDES,
  holdDurationMs = 2800,
  onOpenLightbox,
  onSlideChange,
  isRTL = false,
}: SlicedHeroImageProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch gesture tracking for smooth mobile swiping
  const touchStartXRef = useRef<number | null>(null);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Inform parent of slide changes
  useEffect(() => {
    onSlideChange?.(currentSlideIndex);
  }, [currentSlideIndex, onSlideChange]);

  const goToSlide = useCallback(
    (index: number) => {
      const normalized = (index + slides.length) % slides.length;
      setCurrentSlideIndex(normalized);
    },
    [slides.length]
  );

  const handleNextSlide = useCallback(() => {
    goToSlide(currentSlideIndex + 1);
  }, [currentSlideIndex, goToSlide]);

  const handlePrevSlide = useCallback(() => {
    goToSlide(currentSlideIndex - 1);
  }, [currentSlideIndex, goToSlide]);

  // Auto-play timer (pauses when user hovers or browser tab is hidden)
  useEffect(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    autoPlayTimerRef.current = setInterval(() => {
      if (!isHoveredRef.current && !document.hidden) {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      }
    }, holdDurationMs);

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [holdDurationMs, slides.length]);

  // Pause when document is hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Keyboard navigation when focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      if (isRTL) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    } else if (e.key === "ArrowRight") {
      if (isRTL) {
        handlePrevSlide();
      } else {
        handleNextSlide();
      }
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped right
        if (isRTL) {
          handleNextSlide();
        } else {
          handlePrevSlide();
        }
      } else {
        // Swiped left
        if (isRTL) {
          handlePrevSlide();
        } else {
          handleNextSlide();
        }
      }
    }
    touchStartXRef.current = null;
  };

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div
      className="group relative w-full aspect-[4/3] sm:aspect-[4/3.1] select-none cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label={isRTL ? "معرض صور مركز غزة التعليمي" : "Gaza Educational Hub Showcase"}
      onClick={() => onOpenLightbox?.(activeSlide)}
    >
      {/* ── Slide Track: Continuous Full-Image Smooth Sliding Motion ── */}
      <div
        className="flex w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: `translateX(-${currentSlideIndex * 100}%)`,
          direction: "ltr", // Enforces consistent pixel-perfect left-to-right track alignment
        }}
      >
        {slides.map((slide, index) => {
          const isActive = index === currentSlideIndex;
          return (
            <div
              key={`${slide.src}-${index}`}
              className="relative w-full h-full shrink-0 grow-0 basis-full select-none overflow-hidden"
              aria-hidden={!isActive}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover transition-transform duration-1000 ease-out pointer-events-none select-none ${
                  isActive ? "scale-100" : "scale-105"
                }`}
                priority={index === 0}
              />
            </div>
          );
        })}
      </div>

      {/* ── Next / Prev Navigation Arrows (Subtle on hover only) ── */}
      <div className="absolute inset-y-0 inset-x-2.5 sm:inset-x-3.5 z-20 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevSlide();
          }}
          className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/75 hover:bg-emerald-600 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
          aria-label={isRTL ? "الصورة السابقة" : "Previous photo"}
          title={isRTL ? "الصورة السابقة" : "Previous photo"}
        >
          <PrevIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNextSlide();
          }}
          className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/75 hover:bg-emerald-600 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-xl transition-all cursor-pointer hover:scale-110 active:scale-95"
          aria-label={isRTL ? "الصورة التالية" : "Next photo"}
          title={isRTL ? "الصورة التالية" : "Next photo"}
        >
          <NextIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
