"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface TransparencyWallProps {
  onOpenDonation: (amount?: number) => void;
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

export default function TransparencyWall({ onOpenDonation }: TransparencyWallProps) {
  const { t } = useLanguage();
  const tw = t.transparencyWall;

  // Selected category to highlight
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

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
  const circumference = 2 * Math.PI * radius; // 691.15
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

        {/* Creative Innovation: The Interactive Sanctuary Ecosystem (Dial + Connected Pillars) */}
        <div className="mb-14">
          
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

        {/* 4. Trust Guarantees */}
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
    </section>
  );
}
