"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CalendarCheck, Heart } from "lucide-react";
import { OFFICIAL_ZEFFY_DONATION_URL } from "@/constants/links";

interface CtaBannerProps {
  onOpenBooking: () => void;
  onOpenDonation?: (amount?: number) => void;
}

export default function CtaBanner({ onOpenBooking, onOpenDonation }: CtaBannerProps) {
  const { t } = useLanguage();

  return (
    <section className="py-14 bg-gradient-to-r from-emerald-50/70 via-sky-50/60 to-emerald-50/70 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
          
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
              {t.ctaBanner.title}
            </h2>
            <p className="text-base text-slate-700 leading-relaxed font-normal">
              {t.ctaBanner.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 shrink-0">
            {/* Book seat */}
            <button
              type="button"
              onClick={onOpenBooking}
              className="px-7 py-3.5 rounded-2xl font-extrabold text-base text-white bg-brand-navy hover:bg-brand-navy-hover shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-navy"
            >
              <CalendarCheck className="w-5 h-5 text-emerald-400" />
              <span>{t.ctaBanner.bookBtn}</span>
            </button>

            {/* Donate */}
            <button
              type="button"
              onClick={() =>
                onOpenDonation
                  ? onOpenDonation()
                  : window.open(OFFICIAL_ZEFFY_DONATION_URL, "_blank", "noopener,noreferrer")
              }
              className="px-7 py-3.5 rounded-2xl font-extrabold text-base text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-700/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span>{t.ctaBanner.donateBtn}</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
