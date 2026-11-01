"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldCheck,
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
  Maximize2,
  X,
  BatteryCharging,
  Sun,
} from "lucide-react";

interface TransparencyWallProps {
  onOpenDonation: (amount?: number) => void;
}

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  specs?: string;
}

const itemMeta: Record<
  string,
  {
    icon: React.ElementType;
    colorTheme: {
      arcColor: string;
      softBg: string;
      border: string;
      activeRing: string;
      badge: string;
      iconBg: string;
      barColor: string;
    };
  }
> = {
  volunteers: {
    icon: Users,
    colorTheme: {
      arcColor: "var(--color-chart-emerald)",
      softBg: "bg-emerald-50/40 hover:bg-emerald-50/70",
      border: "border-emerald-100/90 hover:border-emerald-300",
      activeRing: "ring-2 ring-emerald-500 border-emerald-400 shadow-md",
      badge: "bg-emerald-100 text-emerald-800",
      iconBg: "bg-emerald-100 text-emerald-700",
      barColor: "bg-emerald-500",
    },
  },
  rent: {
    icon: Building2,
    colorTheme: {
      arcColor: "var(--color-chart-sky)",
      softBg: "bg-sky-50/40 hover:bg-sky-50/70",
      border: "border-sky-100/90 hover:border-sky-300",
      activeRing: "ring-2 ring-sky-500 border-sky-400 shadow-md",
      badge: "bg-sky-100 text-sky-800",
      iconBg: "bg-sky-100 text-sky-700",
      barColor: "bg-sky-500",
    },
  },
  electricity: {
    icon: Zap,
    colorTheme: {
      arcColor: "var(--color-chart-amber)",
      softBg: "bg-amber-50/40 hover:bg-amber-50/70",
      border: "border-amber-100/90 hover:border-amber-300",
      activeRing: "ring-2 ring-amber-500 border-amber-400 shadow-md",
      badge: "bg-amber-100 text-amber-900",
      iconBg: "bg-amber-100 text-amber-800",
      barColor: "bg-amber-500",
    },
  },
  repairs: {
    icon: Wrench,
    colorTheme: {
      arcColor: "var(--color-chart-violet)",
      softBg: "bg-purple-50/40 hover:bg-purple-50/70",
      border: "border-purple-100/90 hover:border-purple-300",
      activeRing: "ring-2 ring-purple-500 border-purple-400 shadow-md",
      badge: "bg-purple-100 text-purple-900",
      iconBg: "bg-purple-100 text-purple-800",
      barColor: "bg-purple-500",
    },
  },
  internet: {
    icon: Wifi,
    colorTheme: {
      arcColor: "var(--color-chart-cyan)",
      softBg: "bg-cyan-50/40 hover:bg-cyan-50/70",
      border: "border-cyan-100/90 hover:border-cyan-300",
      activeRing: "ring-2 ring-cyan-500 border-cyan-400 shadow-md",
      badge: "bg-cyan-100 text-cyan-900",
      iconBg: "bg-cyan-100 text-cyan-800",
      barColor: "bg-cyan-500",
    },
  },
  water_cleaning: {
    icon: Droplets,
    colorTheme: {
      arcColor: "var(--color-chart-teal)",
      softBg: "bg-teal-50/40 hover:bg-teal-50/70",
      border: "border-teal-100/90 hover:border-teal-300",
      activeRing: "ring-2 ring-teal-400 border-teal-300 shadow-md",
      badge: "bg-teal-100 text-teal-900",
      iconBg: "bg-teal-100 text-teal-800",
      barColor: "bg-teal-500",
    },
  },
};

const galleryCategoryMeta: Record<
  string,
  {
    icon: React.ElementType;
    badgeStyle: string;
  }
> = {
  electricity_meter: {
    icon: Zap,
    badgeStyle: "bg-amber-500 text-white border-amber-400/60",
  },
  internet_litebeam: {
    icon: Wifi,
    badgeStyle: "bg-sky-500 text-white border-sky-400/60",
  },
  battery_inverter: {
    icon: BatteryCharging,
    badgeStyle: "bg-emerald-600 text-white border-emerald-500/60",
  },
  solar_panels: {
    icon: Sun,
    badgeStyle: "bg-amber-600 text-white border-amber-500/60",
  },
};

export default function TransparencyWall({ onOpenDonation }: TransparencyWallProps) {
  const { t, dir } = useLanguage();
  const isRtl = dir === "rtl";
  const tw = t.transparencyWall;

  // Selected category to highlight in the radial ecosystem
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Lightbox Modal State for Field Verification Images
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

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

  // Combine JSON data with UI icons and color styles
  const rawItems = tw?.items || [];
  const budgetItems = rawItems.map((item) => {
    const meta = itemMeta[item.id] || {
      icon: CheckCircle2,
      colorTheme: {
        arcColor: "var(--color-chart-emerald)",
        softBg: "bg-slate-50",
        border: "border-slate-200",
        activeRing: "ring-2 ring-slate-400",
        badge: "bg-slate-100 text-slate-800",
        iconBg: "bg-slate-100 text-slate-700",
        barColor: "bg-slate-500",
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

  const galleryItems: GalleryItem[] = tw?.galleryItems || [];

  return (
    <section
      id="transparency"
      className="py-16 lg:py-24 bg-white border-t border-slate-200/90 relative"
      aria-labelledby="transparency-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 2. LIVE FIELD VERIFICATION GALLERY (Real Equipment from Gaza) */}
        {galleryItems.length > 0 && (
          <div className="mb-20">
            {/* Gallery Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-bold mb-3.5 shadow-2xs">
                <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{tw?.galleryBadge || (isRtl ? "شواهد ميدانية حية من غزة" : "Live Field Evidence from Gaza")}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-navy tracking-tight mb-3">
                {tw?.galleryTitle || (isRtl ? "أين تذهب التبرعات؟ بنيتنا التحتية على أرض الواقع" : "Where Do Donations Go? Our Infrastructure on the Ground")}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                {tw?.gallerySubtitle || (isRtl ? "كل مساهمة تتحول فوراً إلى طاقة نظيفة، إنترنت مستقر، ومعدات حقيقية تعمل 24/7 لدعم شبابنا." : "Every contribution powers real equipment operating 24/7 to keep our youth connected.")}
              </p>
            </div>

            {/* Gallery Grid (High-end 4:5 Portrait Showcase with Natural Framing) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              {galleryItems.map((item) => {
                const meta = galleryCategoryMeta[item.id] || {
                  icon: Sparkles,
                  badgeStyle: "bg-emerald-600 text-white border-emerald-500/60",
                };
                const CategoryIcon = meta.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => setLightboxItem(item)}
                    className="group flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-300 transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    {/* Photo Container with Proper Portrait Aspect (4:5) to showcase equipment without cropping */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900/10">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-top group-hover:scale-106 transition-transform duration-700 ease-out"
                      />

                      {/* Smooth Modern Scrim Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/25 opacity-70 group-hover:opacity-50 transition-opacity duration-300" />

                      {/* Floating Category Pill Badge with Icon */}
                      <div className={`absolute top-3.5 start-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md backdrop-blur-md border ${meta.badgeStyle}`}>
                        <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.category}</span>
                      </div>

                      {/* Hover Zoom CTA Pill Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-brand-navy text-xs font-black shadow-xl backdrop-blur-md transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 border border-white">
                          <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{tw?.galleryExpandPhoto || (isRtl ? "عرض الصورة كاملة" : "Expand Photo")}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Content with Refined Spacing & Typography */}
                    <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 bg-white">
                      <div>
                        <h4 className="text-base font-black text-brand-navy leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h4>

                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      </div>

                      {/* Clean Minimalist Action Link */}
                      <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                        <span>{tw?.galleryViewPhoto || (isRtl ? "تكبير واستعراض" : "View Photo")}</span>
                        <Maximize2 className="w-3.5 h-3.5 group-hover:scale-115 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Soft Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-900 text-xs sm:text-sm font-bold mb-4 shadow-2xs backdrop-blur-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{tw?.badge}</span>
          </div>

          {/* Inspiring Headline */}
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

        {/* 1. The Interactive Sanctuary Ecosystem (Dial + Connected Pillars) */}
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

              {/* Right Column: The 6 Connected Sanctuary Modules */}
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
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
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
                        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? `${item.colorTheme.activeRing} bg-white scale-[1.02]`
                            : "border-slate-200/80 bg-white/80 hover:bg-white hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        <div>
                          {/* Top Row: Icon + Title + Amount */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl ${item.colorTheme.iconBg} flex items-center justify-center shrink-0`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-brand-navy leading-tight">
                                  {item.title}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {item.percentage}% {tw?.ofTotal}
                                </span>
                              </div>
                            </div>

                            <span className="text-base font-black text-brand-navy font-mono">
                              ${item.amount}
                            </span>
                          </div>

                          {/* Dynamic Progress Indicator */}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2.5">
                            <div
                              className={`${item.colorTheme.barColor} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${item.percentage * 2}%` }}
                            />
                          </div>

                          {/* Concise Human Impact Statement */}
                          <p className="text-[11px] text-slate-600 leading-relaxed font-normal mb-3">
                            {item.tagline}
                          </p>
                        </div>

                        {/* Sponsor Item Action Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDonation(item.amount);
                          }}
                          aria-label={`${tw?.sponsorBtn || "Sponsor"}: ${item.title} ($${item.amount})`}
                          className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-brand-navy text-white shadow-xs"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-emerald-500" />
                            <span>{tw?.sponsorBtn}</span>
                          </span>
                          <span className="font-mono font-extrabold text-emerald-600">
                            ${item.amount}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3. Trust Guarantees */}
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
