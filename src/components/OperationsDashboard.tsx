"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Zap,
  Wifi,
  Armchair,
  Users,
  Radio,
} from "lucide-react";
import {
  getHubPublicStatsApi,
  warmupBackendApi,
  HubPublicStats,
} from "@/services/applications";

// ── Smooth Animated Number Counter ──
function AnimatedNumber({
  target,
  duration = 1200,
}: {
  target: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return <span>{count}</span>;
}

export default function OperationsDashboard() {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";

  const [stats, setStats] = useState<HubPublicStats>({
    powerHours: 24,
    internetSpeedMbps: 100,
    availableSeats: 50,
    activeLearnersCount: 1500,
    isLive: false,
  });

  useEffect(() => {
    // 1. Silently warm up Render server on page load
    warmupBackendApi();

    // 2. Fetch live telemetry from backend
    let isMounted = true;
    getHubPublicStatsApi().then((data) => {
      if (isMounted) {
        setStats(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    {
      id: "power",
      title: t.dashboard.powerTitle || (isRTL ? "الطاقة الشمسية" : "Solar Power"),
      numericTarget: stats.powerHours,
      displayPrefix: "",
      displaySuffix: "/7",
      icon: Zap,
      iconBg: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
    },
    {
      id: "internet",
      title: t.dashboard.internetTitle || (isRTL ? "إنترنت فائق السرعة" : "High-Speed Internet Link"),
      numericTarget: stats.internetSpeedMbps,
      displayPrefix: "",
      displaySuffix: isRTL ? " ميجا" : " Mbps",
      icon: Wifi,
      iconBg: "bg-sky-500/10 text-sky-600 group-hover:bg-sky-500 group-hover:text-white",
    },
    {
      id: "capacity",
      title: t.dashboard.seatsTitle || (isRTL ? "المقاعد الدراسية المجهزة" : "Equipped Study Desks"),
      numericTarget: stats.availableSeats,
      displayPrefix: "",
      displaySuffix: "",
      icon: Armchair,
      iconBg: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    },
    {
      id: "beneficiaries",
      title: t.dashboard.beneficiariesTitle || (isRTL ? "الطلاب والمستفيدون" : "Monthly Active Learners"),
      numericTarget: stats.activeLearnersCount,
      displayPrefix: "+",
      displaySuffix: "",
      icon: Users,
      iconBg: "bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
    },
  ];

  return (
    <section
      id="dashboard"
      className="py-10 lg:py-14 bg-slate-50 relative overflow-hidden"
      aria-labelledby="dashboard-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2
            id="dashboard-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-navy tracking-tight"
          >
            {t.dashboard.title || (isRTL
              ? "الأثر والعمليات الميدانية بالأرقام"
              : "Real-Time Telemetry & Impact Metrics")}
          </h2>

          {/* Live indicator badge */}
          <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isRTL ? "بث العمليات الميدانية" : "Live Operational Feed"}</span>
          </div>
        </div>

        {/* 4 Clean Minimal Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/70 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Row: Title & Animated Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
                    {item.title}
                  </span>
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xs ${item.iconBg}`}
                  >
                    <IconComponent className="w-5 h-5 transition-transform" />
                  </div>
                </div>

                {/* Main Metric Value with Animated Counter */}
                <div className="flex items-baseline gap-1 font-mono">
                  {item.displayPrefix && (
                    <span className="text-2xl sm:text-3xl font-black text-brand-navy">
                      {item.displayPrefix}
                    </span>
                  )}
                  <span className="text-4xl sm:text-[2.6rem] font-black text-brand-navy tracking-tight">
                    <AnimatedNumber target={item.numericTarget} duration={1300} />
                  </span>
                  {item.displaySuffix && (
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-500">
                      {item.displaySuffix}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
