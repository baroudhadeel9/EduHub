"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqSection() {
  const { t, locale } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="py-16 lg:py-24 bg-white relative border-t border-slate-200/90"
      aria-labelledby="faq-title"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 tracking-wide uppercase mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.faqSection.badge}</span>
          </div>
          <h2
            id="faq-title"
            className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight"
          >
            {t.faqSection.title}
          </h2>
          <p className="text-base text-slate-700 mt-2 font-normal">
            {t.faqSection.subtitle || (locale === "ar"
              ? "إجابات شافية وشفافة حول كيفية الحجز، مجانية الخدمات، ونظام التبرعات."
              : "Clear answers regarding free desk reservations, satellite connectivity, and donations.")}
          </p>
        </div>

        {/* Accessible Accordion List */}
        <div className="space-y-4">
          {t.faqSection.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            const contentId = `faq-content-${idx}`;
            const buttonId = `faq-btn-${idx}`;

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-emerald-300 bg-slate-50/60 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 sm:p-6 text-start flex items-center justify-between gap-4 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-2xl"
                >
                  <span className="text-base sm:text-lg font-bold text-brand-navy">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "rotate-180 bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 pb-6 sm:px-6 sm:pb-6 pt-1 text-base text-slate-700 leading-relaxed border-t border-slate-200/60 animate-in fade-in duration-200"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
