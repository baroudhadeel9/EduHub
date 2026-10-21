"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Laptop, Wifi, Code2, Users2 } from "lucide-react";

export default function PillarsSection() {
  const { t, locale } = useLanguage();

  const cardThemes: Record<
    string,
    {
      icon: React.ReactNode;
      iconBg: string;
      gradient: string;
      borderColor: string;
      number: string;
    }
  > = {
    workspace: {
      icon: <Laptop className="w-6 h-6 text-indigo-600 transition-transform duration-500 group-hover:scale-110" />,
      iconBg: "bg-indigo-50 border-indigo-200/80 text-indigo-700",
      gradient: "from-indigo-500 via-indigo-400 to-sky-400",
      borderColor: "hover:border-indigo-300 hover:shadow-indigo-500/15",
      number: "01",
    },
    internet: {
      icon: <Wifi className="w-6 h-6 text-emerald-600 transition-transform duration-500 group-hover:scale-110" />,
      iconBg: "bg-emerald-50 border-emerald-200/80 text-emerald-700",
      gradient: "from-emerald-500 via-teal-400 to-cyan-400",
      borderColor: "hover:border-emerald-300 hover:shadow-emerald-500/15",
      number: "02",
    },
    training: {
      icon: <Code2 className="w-6 h-6 text-sky-600 transition-transform duration-500 group-hover:scale-110" />,
      iconBg: "bg-sky-50 border-sky-200/80 text-sky-700",
      gradient: "from-sky-500 via-blue-400 to-indigo-400",
      borderColor: "hover:border-sky-300 hover:shadow-sky-500/15",
      number: "03",
    },
    community: {
      icon: <Users2 className="w-6 h-6 text-teal-600 transition-transform duration-500 group-hover:scale-110" />,
      iconBg: "bg-teal-50 border-teal-200/80 text-teal-700",
      gradient: "from-teal-500 via-emerald-400 to-lime-400",
      borderColor: "hover:border-teal-300 hover:shadow-teal-500/15",
      number: "04",
    },
  };

  return (
    <section id="pillars" className="py-16 lg:py-24 bg-white relative overflow-hidden" aria-labelledby="pillars-title">
      {/* ── Keyframes for Dynamic Card Animations & Hover Sheen ── */}
      <style jsx>{`
        @keyframes cardFadeInUp {
          0% {
            opacity: 0;
            transform: translateY(35px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .anim-card-1 {
          animation: cardFadeInUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .anim-card-2 {
          animation: cardFadeInUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both;
        }
        .anim-card-3 {
          animation: cardFadeInUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.34s both;
        }
        .anim-card-4 {
          animation: cardFadeInUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.46s both;
        }


        @media (prefers-reduced-motion: reduce) {
          .anim-card-1,
          .anim-card-2,
          .anim-card-3,
          .anim-card-4 {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Ambient background soft light spheres */}
      <div className="absolute top-12 start-1/4 w-96 h-96 bg-emerald-100/35 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse [animation-duration:8s]" />
      <div className="absolute bottom-10 end-1/4 w-96 h-96 bg-sky-100/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse [animation-duration:10s]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <h2
            id="pillars-title"
            className={`${locale === "ar" ? "text-3xl sm:text-4xl font-black" : "text-3xl sm:text-4xl font-extrabold"} text-brand-navy mb-4 tracking-tight`}
          >
            {t.pillars.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
            {t.pillars.subtitle}
          </p>
        </div>

        {/* 4 Interactive Animated Cards Grid with Rich Motion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {t.pillars.cards.map((card, idx) => {
            const theme = cardThemes[card.id] || {
              icon: <Laptop className="w-6 h-6 text-emerald-700" />,
              iconBg: "bg-emerald-50 border-emerald-200",
              gradient: "from-emerald-500 to-teal-400",
              borderColor: "hover:border-emerald-300",
              number: `0${idx + 1}`,
            };

            return (
              <div
                key={card.id}
                className={`relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden hover:-translate-y-2 cursor-pointer ${theme.borderColor} anim-card-${idx + 1}`}
              >
                <div>
                  {/* Top Row: Icon with blooming effect + Watermark Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                      {/* Blooming glow aura on hover */}
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-30 blur-md transition-all duration-500 group-hover:scale-130`}
                      />
                      <div
                        className={`relative w-14 h-14 rounded-2xl ${theme.iconBg} border flex items-center justify-center shadow-xs group-hover:scale-115 group-hover:rotate-6 transition-all duration-500`}
                      >
                        {theme.icon}
                      </div>
                    </div>

                    {/* Watermark Index Number with Floating Motion */}
                    <span className="text-3xl sm:text-4xl font-black text-slate-100 group-hover:text-slate-300 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-500 select-none tracking-tighter">
                      {theme.number}
                    </span>
                  </div>

                  {/* Title with smooth color transition and slight shift */}
                  <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-3 group-hover:text-emerald-700 transition-all duration-300 leading-snug">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
