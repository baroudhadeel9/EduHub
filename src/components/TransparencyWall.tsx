"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import {
  Zap,
  Wifi,
  Users,
  Building2,
  Wrench,
  Droplets,
  CheckCircle2,
  Sparkles,
  Heart,
  Lightbulb,
  Camera,
  X,
} from "lucide-react";

interface TransparencyWallProps {
  onOpenDonation: (amount?: number) => void;
}

interface ItemModalDetail {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
}

const itemMeta: Record<
  string,
  {
    icon: React.ElementType;
    image: string;
    imageAlt: string;
    colorTheme: {
      arcColor: string;
      softBg: string;
      border: string;
      activeRing: string;
      badge: string;
      iconBg: string;
      barColor: string;
      lightOverlay: string;
    };
  }
> = {
  volunteers: {
    icon: Users,
    image: "/images/transparency/team-volunteers.jpg",
    imageAlt: "فريق الإشراف والمتطوعين في مركز غزة",
    colorTheme: {
      arcColor: "var(--color-chart-emerald)",
      softBg: "bg-emerald-50/40 hover:bg-emerald-50/70",
      border: "border-emerald-200/90 hover:border-emerald-400",
      activeRing: "ring-2 ring-emerald-500 border-emerald-400 shadow-md",
      badge: "bg-emerald-100 text-emerald-800",
      iconBg: "bg-emerald-100 text-emerald-700",
      barColor: "bg-emerald-500",
      lightOverlay: "from-white/95 via-white/70 to-emerald-50/30",
    },
  },
  rent: {
    icon: Building2,
    image: "/images/transparency/space-rent.jpg",
    imageAlt: "مقر ومساحة مركز غزة التعليمي المجهزة",
    colorTheme: {
      arcColor: "var(--color-chart-sky)",
      softBg: "bg-sky-50/40 hover:bg-sky-50/70",
      border: "border-sky-200/90 hover:border-sky-400",
      activeRing: "ring-2 ring-sky-500 border-sky-400 shadow-md",
      badge: "bg-sky-100 text-sky-800",
      iconBg: "bg-sky-100 text-sky-700",
      barColor: "bg-sky-500",
      lightOverlay: "from-white/95 via-white/70 to-sky-50/30",
    },
  },
  electricity: {
    icon: Zap,
    image: "/images/transparency/solar-panels.jpg",
    imageAlt: "مصفوفة ألواح الطاقة الشمسية لمركز غزة",
    colorTheme: {
      arcColor: "var(--color-chart-amber)",
      softBg: "bg-amber-50/40 hover:bg-amber-50/70",
      border: "border-amber-200/90 hover:border-amber-400",
      activeRing: "ring-2 ring-amber-500 border-amber-400 shadow-md",
      badge: "bg-amber-100 text-amber-900",
      iconBg: "bg-amber-100 text-amber-800",
      barColor: "bg-amber-500",
      lightOverlay: "from-white/95 via-white/70 to-amber-50/30",
    },
  },
  repairs: {
    icon: Wrench,
    image: "/images/transparency/battery-inverter.jpg",
    imageAlt: "محولات وبطاريات الطاقة والمعدات التقنية",
    colorTheme: {
      arcColor: "var(--color-chart-violet)",
      softBg: "bg-purple-50/40 hover:bg-purple-50/70",
      border: "border-purple-200/90 hover:border-purple-400",
      activeRing: "ring-2 ring-purple-500 border-purple-400 shadow-md",
      badge: "bg-purple-100 text-purple-900",
      iconBg: "bg-purple-100 text-purple-800",
      barColor: "bg-purple-500",
      lightOverlay: "from-white/95 via-white/70 to-purple-50/30",
    },
  },
  internet: {
    icon: Wifi,
    image: "/images/transparency/internet-litebeam.jpg",
    imageAlt: "هوائي الإنترنت اللاسلكي فائق السرعة",
    colorTheme: {
      arcColor: "var(--color-chart-cyan)",
      softBg: "bg-cyan-50/40 hover:bg-cyan-50/70",
      border: "border-cyan-200/90 hover:border-cyan-400",
      activeRing: "ring-2 ring-cyan-500 border-cyan-400 shadow-md",
      badge: "bg-cyan-100 text-cyan-900",
      iconBg: "bg-cyan-100 text-cyan-800",
      barColor: "bg-cyan-500",
      lightOverlay: "from-white/95 via-white/70 to-cyan-50/30",
    },
  },
  water_cleaning: {
    icon: Droplets,
    image: "/images/transparency/water-sanitation.jpg",
    imageAlt: "محطة مياه الشرب النقية ومستلزمات التعقيم",
    colorTheme: {
      arcColor: "var(--color-chart-teal)",
      softBg: "bg-teal-50/40 hover:bg-teal-50/70",
      border: "border-teal-200/90 hover:border-teal-400",
      activeRing: "ring-2 ring-teal-400 border-teal-300 shadow-md",
      badge: "bg-teal-100 text-teal-900",
      iconBg: "bg-teal-100 text-teal-800",
      barColor: "bg-teal-500",
      lightOverlay: "from-white/95 via-white/70 to-teal-50/30",
    },
  },
};

export default function TransparencyWall({ onOpenDonation }: TransparencyWallProps) {
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const tw = t.transparencyWall;

  // Selected category to highlight in the radial ecosystem
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Lightbox Modal State for Field Verification Images
  const [lightboxItem, setLightboxItem] = useState<ItemModalDetail | null>(null);

  // Handle escape key and lock body scroll when Lightbox is open
  useEffect(() => {
    if (lightboxItem) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setLightboxItem(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [lightboxItem]);

  // Combine JSON data with UI icons, images and color styles
  const rawItems = tw?.items || [];
  const budgetItems = rawItems.map((item) => {
    const meta = itemMeta[item.id] || {
      icon: CheckCircle2,
      image: "/images/hero-workspace.jpg",
      imageAlt: item.title,
      colorTheme: {
        arcColor: "var(--color-chart-emerald)",
        softBg: "bg-slate-50",
        border: "border-slate-200",
        activeRing: "ring-2 ring-slate-400",
        badge: "bg-slate-100 text-slate-800",
        iconBg: "bg-slate-100 text-slate-700",
        barColor: "bg-slate-500",
        lightOverlay: "from-white/92 via-white/85 to-slate-50/80",
      },
    };
    return {
      ...item,
      ...meta,
    };
  });

  const activeItem = budgetItems.find((b) => b.id === activeCategoryId);

  // Pre-calculate SVG arcs for the Donut Chart
  const radius = 110;
  const circumference = 2 * Math.PI * radius; // ~691.15
  const gap = 5; // Gap between segments in px
  const totalGaps = gap * (budgetItems.length || 6); // 30
  const usableCircumference = circumference - totalGaps; // 661.15

  const arcs = budgetItems.reduce<
    Array<{ id: string; arcLength: number; offset: number; color: string }>
  >((acc, item) => {
    const arcLength = (item.amount / 2500) * usableCircumference;
    const offset =
      acc.length === 0
        ? 0
        : acc[acc.length - 1].offset + acc[acc.length - 1].arcLength + gap;
    acc.push({
      id: item.id,
      arcLength,
      offset,
      color: item.colorTheme.arcColor,
    });
    return acc;
  }, []);

  return (
    <section
      id="transparency"
      className="py-16 lg:py-24 bg-white border-t border-slate-200/90 relative"
      aria-labelledby="transparency-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header: Inspiring Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2
            id="transparency-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-3 tracking-tight leading-tight"
          >
            {tw?.title}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            {tw?.subtitle}
          </p>
        </div>

        {/* The Interactive Sanctuary Ecosystem (Dial + Connected Pillars) */}
        <div className="mb-16">
          <div className="bg-slate-50/60 rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Interactive Radial Ecosystem Dial (SVG Donut Chart) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div
                  className="relative w-full max-w-[290px] aspect-square flex items-center justify-center"
                  onMouseLeave={() => setActiveCategoryId(null)}
                >
                  {/* SVG Donut */}
                  <svg
                    viewBox="0 0 320 320"
                    className="w-full h-full drop-shadow-xs"
                    aria-label="Interactive Budget Dial"
                  >
                    {/* Background Track */}
                    <circle
                      cx="160"
                      cy="160"
                      r={radius}
                      fill="none"
                      stroke="var(--color-brand-border)"
                      strokeWidth="24"
                    />

                    {/* Interactive Arcs */}
                    {arcs.map((arc) => {
                      const isSelected = activeCategoryId === arc.id;
                      const isAnySelected = activeCategoryId !== null;
                      return (
                        <circle
                          key={arc.id}
                          cx="160"
                          cy="160"
                          r={radius}
                          fill="none"
                          stroke={arc.color}
                          strokeWidth={isSelected ? 32 : 22}
                          strokeDasharray={`${arc.arcLength} ${circumference - arc.arcLength}`}
                          strokeDashoffset={-arc.offset}
                          strokeLinecap="round"
                          transform="rotate(-90 160 160)"
                          className="cursor-pointer transition-all duration-300"
                          style={{
                            opacity: isSelected ? 1 : isAnySelected ? 0.35 : 0.92,
                            filter: isSelected ? `drop-shadow(0 0 8px ${arc.color}66)` : "none",
                          }}
                          onMouseEnter={() => setActiveCategoryId(arc.id)}
                          onMouseLeave={() => setActiveCategoryId(null)}
                          onClick={() => setActiveCategoryId(activeCategoryId === arc.id ? null : arc.id)}
                        />
                      );
                    })}
                  </svg>

                  {/* Dynamic Center Stage Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                    {activeItem ? (
                      <div className="space-y-1 animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          {activeItem.title}
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-brand-navy font-mono tracking-tight">
                          ${activeItem.amount}
                        </div>
                        <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-800">
                          {activeItem.percentage}% {tw?.ofBudget}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          {tw?.monthlyTotal}
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-800 font-mono tracking-tight">
                          $2,500
                        </div>
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {tw?.pillarsCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-Dial Prompt / Direct Sponsor Trigger */}
                <div className="mt-4 text-center">
                  {activeItem ? (
                    <button
                      type="button"
                      onClick={() => onOpenDonation(activeItem.amount)}
                      className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      <span>{`${tw?.sponsorThisItemPrefix} ($${activeItem.amount})`}</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{tw?.hoverHint}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: The 6 Connected Sanctuary Modules with Real Background Photos */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{tw?.pillarsTitle}</span>
                  </h3>
                  {activeCategoryId !== null && (
                    <button
                      type="button"
                      onClick={() => setActiveCategoryId(null)}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                      aria-label={tw?.resetView || "Reset selection"}
                    >
                      {tw?.resetView}
                    </button>
                  )}
                </div>

                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                  onMouseLeave={() => setActiveCategoryId(null)}
                >
                  {budgetItems.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = activeCategoryId === item.id;
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setActiveCategoryId(item.id)}
                        onMouseLeave={() => setActiveCategoryId(null)}
                        onClick={() => setActiveCategoryId(isSelected ? null : item.id)}
                        className={`group relative p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden ${
                          isSelected
                            ? `${item.colorTheme.activeRing} scale-[1.02] shadow-md`
                            : `${item.colorTheme.border} bg-white hover:border-slate-300 hover:shadow-xs`
                        }`}
                      >
                        {/* ── Background Photo with Soft Tint Overlay ── */}
                        {item.image && (
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.imageAlt || item.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                              className={`object-cover object-center transition-all duration-700 ease-out ${
                                isSelected
                                  ? "scale-105 opacity-92"
                                  : "scale-100 opacity-80 group-hover:opacity-92 group-hover:scale-104"
                              }`}
                            />
                            {/* Light Gradient Overlay: soft bottom gradient allowing the photo to be clearly visible while guaranteeing text contrast */}
                            <div
                              className={`absolute inset-0 bg-gradient-to-t ${item.colorTheme.lightOverlay} transition-opacity duration-300 ${
                                isSelected ? "opacity-85" : "opacity-90 group-hover:opacity-82"
                              }`}
                            />
                          </div>
                        )}

                        <div className="relative z-10">
                          {/* Top Row: Icon + Title & Percentage + Photo Preview Button (No duplicate price) */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-xl ${item.colorTheme.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-black text-brand-navy leading-tight truncate">
                                  {item.title}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-500">
                                  {item.percentage}% {tw?.ofTotal}
                                </span>
                              </div>
                            </div>

                            {item.image && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxItem({
                                    id: item.id,
                                    title: item.title,
                                    category: `${item.percentage}% ${tw?.ofTotal || "من الميزانية"}`,
                                    description: item.tagline,
                                    image: item.image,
                                  });
                                }}
                                title={isRtl ? "معاينة الصورة الميدانية بالحجم الكامل" : "View full photo"}
                                className="p-1 rounded-lg bg-white/70 hover:bg-white text-slate-500 hover:text-emerald-700 border border-slate-200/60 shadow-2xs flex items-center justify-center transition-all cursor-pointer shrink-0"
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Dynamic Progress Indicator */}
                          <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden mb-2 shadow-inner">
                            <div
                              className={`${item.colorTheme.barColor} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${item.percentage * 2}%` }}
                            />
                          </div>

                          {/* Concise Human Impact Statement (Direct & clean without enclosing white box) */}
                          <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed font-semibold mb-3">
                            {item.tagline}
                          </p>
                        </div>

                        {/* Sponsor Item Action Button */}
                        <div className="relative z-10 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDonation(item.amount);
                            }}
                            aria-label={`${tw?.sponsorBtn || "Sponsor"}: ${item.title} ($${item.amount})`}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer shadow-xs ${
                              isSelected
                                ? "bg-brand-navy text-white shadow-md ring-2 ring-emerald-500/50"
                                : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 hover:border-emerald-500"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Heart className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{tw?.sponsorBtn}</span>
                            </span>
                            <span className="font-mono font-black text-emerald-600 text-sm">
                              ${item.amount}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Trust Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(tw?.guarantees || []).map((guarantee, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-brand-navy">
                  {guarantee.title}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {guarantee.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {lightboxItem.category}
                </span>
                <span className="text-white text-sm font-bold">{lightboxItem.title}</span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label={tw?.galleryClose || (isRtl ? "إغلاق" : "Close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Res Image Display */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[65vh] bg-black flex items-center justify-center">
              <Image
                src={lightboxItem.image}
                alt={lightboxItem.title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>

            {/* Modal Caption & Description */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 text-white">
              <h3 className="text-lg sm:text-xl font-black text-white mb-1.5">
                {lightboxItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {lightboxItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
