"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Heart, Menu, X, CalendarCheck } from "lucide-react";
import { OFFICIAL_ZEFFY_DONATION_URL } from "@/constants/links";

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenDonation?: (amount?: number) => void;
}

export default function Navbar({ onOpenBooking, onOpenDonation }: NavbarProps) {
  const { t, locale, setLocale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  // ScrollSpy: highlight the currently viewed section in the navigation
  useEffect(() => {
    const sectionIds = ["hero", "dashboard", "transparency", "gallery", "faq"];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;

      // If at the bottom of the page, activate the last section (faq)
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60
      ) {
        setActiveSection("faq");
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            return;
          }
        }
      }
      setActiveSection("hero");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "hero", label: t.nav.home },
    { id: "dashboard", label: t.nav.impact },
    { id: "transparency", label: t.nav.transparency },
    { id: "gallery", label: t.nav.stories },
    { id: "faq", label: t.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 lg:gap-4 xl:gap-6">
          
          {/* Logo & Brand Identity (Clean, prominent logo image without any extra text or badges) */}
          <div className="flex items-center shrink-0">
            <a
              href="#hero"
              className="flex items-center group focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-xl transition-transform active:scale-95"
              aria-label="cehub Gaza Home"
            >
              <div className="relative h-11 sm:h-12 w-36 sm:w-40 shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="cehub - Gaza Educational Hub"
                  fill
                  className="object-contain object-start"
                  priority
                  unoptimized
                />
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links (Dynamic ScrollSpy Highlighting) */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1 xl:gap-2 text-[13px] xl:text-[14px] font-semibold text-slate-700 shrink-0"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setActiveSection(link.id)}
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    isActive
                      ? "text-emerald-700 bg-emerald-50/90 font-bold shadow-2xs"
                      : "text-slate-700 hover:text-brand-navy hover:bg-slate-100/80"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Action Controls & Prominent Language Switcher */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
            
            {/* Prominent Segmented Language Switcher (AR / EN) */}
            <div
              className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/90 shadow-2xs"
              role="group"
              aria-label={t.nav.langAria || (locale === "ar" ? "اختيار لغة الموقع" : "Select website language")}
            >
              <button
                type="button"
                onClick={() => setLocale("ar")}
                aria-pressed={locale === "ar"}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  locale === "ar"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                aria-pressed={locale === "en"}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  locale === "en"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                English
              </button>
            </div>

            {/* Donate Now Button (High-converting CTA) */}
            <button
              type="button"
              onClick={() =>
                onOpenDonation
                  ? onOpenDonation()
                  : window.open(OFFICIAL_ZEFFY_DONATION_URL, "_blank", "noopener,noreferrer")
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs xl:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-700/20 transition-all active:scale-95 group cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Heart className="w-3.5 h-3.5 fill-white text-white group-hover:scale-110 transition-transform shrink-0" />
              <span>{t.nav.donateNow}</span>
            </button>

            {/* Book Seat CTA */}
            <button
              type="button"
              onClick={onOpenBooking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs xl:text-sm font-bold text-white bg-brand-navy hover:bg-brand-navy-hover shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-brand-navy"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t.nav.bookSeat}</span>
            </button>
          </div>

          {/* Mobile Right Controls: Prominent Language Toggle & Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            
            {/* Mobile Prominent Language Switcher */}
            <div
              className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200"
              role="group"
              aria-label={t.nav.langAria || (locale === "ar" ? "اختيار لغة الموقع" : "Language selector")}
            >
              <button
                type="button"
                onClick={() => setLocale("ar")}
                aria-pressed={locale === "ar"}
                aria-label="اللغة العربية"
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  locale === "ar"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600"
                }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                aria-pressed={locale === "en"}
                aria-label="English language"
                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                  locale === "en"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600"
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label={
                mobileMenuOpen
                  ? (locale === "ar" ? "إغلاق القائمة الرئيسية" : "Close main menu")
                  : (locale === "ar" ? "فتح القائمة الرئيسية" : "Open main menu")
              }
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
          
          {/* Status badge in mobile drawer */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span>{t.nav.hubStatus}</span>
          </div>

          <nav className="flex flex-col space-y-1 text-base font-bold text-slate-700">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => {
                    setActiveSection(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-bold border-s-4 border-emerald-500"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 rounded-xl font-bold text-white bg-brand-navy flex items-center justify-center gap-2 cursor-pointer shadow-sm text-base"
            >
              <CalendarCheck className="w-5 h-5 text-emerald-400" />
              <span>{t.nav.bookSeat}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenDonation) onOpenDonation();
                else window.open(OFFICIAL_ZEFFY_DONATION_URL, "_blank", "noopener,noreferrer");
              }}
              className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-base"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span>{t.nav.donateNow}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
