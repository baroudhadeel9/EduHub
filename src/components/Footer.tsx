"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, Heart } from "lucide-react";
import { OFFICIAL_ZEFFY_DONATION_URL } from "@/constants/links";

interface FooterProps {
  onOpenDonation?: (amount?: number) => void;
}

export default function Footer({ onOpenDonation }: FooterProps) {
  const { t, dir } = useLanguage();

  const quickLinks = [
    {
      label: t.footer.quickLinks[0],
      href: "#booking-section",
    },
    {
      label: t.footer.quickLinks[1],
      href: "#events",
    },
    {
      label: t.footer.quickLinks[2],
      onClick: () =>
        onOpenDonation
          ? onOpenDonation()
          : window.open(OFFICIAL_ZEFFY_DONATION_URL, "_blank", "noopener,noreferrer"),
    },
  ];

  return (
    <footer
      className="bg-brand-navy-dark text-slate-300 pt-12 pb-8 border-t border-slate-800/60"
      dir={dir}
    >
      {/* Container aligned identically to Header (max-w-7xl px-4 sm:px-6 lg:px-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ═══════════════════════════════════════════
            Main Footer Row: Start & End Flush with Header
           ═══════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 lg:gap-14 mb-12">
          {/* ─── Start Edge: Logo + About + Donate (matches Header Logo start) ─── */}
          <div className="max-w-md space-y-4">
            {/* Logo matches Header proportions */}
            <div className="relative h-11 sm:h-12 w-36 sm:w-40 shrink-0">
              <Image
                src="/images/logo-footer.png"
                alt="cehub - Gaza Educational Hub"
                fill
                className="object-contain object-start"
                unoptimized
              />
            </div>

            {/* About description */}
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              {t.footer.aboutDesc}
            </p>

            {/* Non-profit badge & Donate Button */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <Heart className="w-3 h-3 fill-emerald-400 text-emerald-400 shrink-0" />
                {t.footer.nonProfitBadge}
              </span>

              <button
                type="button"
                onClick={() =>
                  onOpenDonation
                    ? onOpenDonation()
                    : window.open(OFFICIAL_ZEFFY_DONATION_URL, "_blank", "noopener,noreferrer")
                }
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-brand-navy-dark bg-emerald-400 hover:bg-emerald-300 shadow-sm hover:shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-brand-navy-dark text-brand-navy-dark shrink-0" />
                {t.footer.donateMonthly || "Donate Monthly"}
              </button>
            </div>
          </div>

          {/* ─── Center: Quick Links ─── */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
              {t.footer.quickLinksTitle}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              {quickLinks.map((item, idx) => (
                <li key={idx}>
                  {item.onClick ? (
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="hover:text-emerald-400 text-start transition-colors block py-0.5 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="hover:text-emerald-400 transition-colors block py-0.5"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ─── End Edge: Connect (matches Header CTA end) ─── */}
          <div className="space-y-4 min-w-[200px]">
            <h4 className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
              {t.footer.contactTitle}
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              {/* Email */}
              <li>
                <a
                  href={`mailto:${t.footer.email}`}
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                >
                  <Mail className="w-[18px] h-[18px] text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
                  <span className="dir-ltr break-all font-normal text-slate-300 group-hover:text-white">
                    {t.footer.email || "eduhubgaza@gmail.com"}
                  </span>
                </a>
              </li>

              {/* Instagram */}
              <li>
                <a
                  href={
                    t.footer.instagramUrl ||
                    "https://www.instagram.com/gaza_edhub?rpxt=dGJjcWtna3pxaHBz"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                >
                  <svg
                    className="w-[18px] h-[18px] text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span className="font-normal text-slate-300 group-hover:text-white">
                    {t.footer.instagram || "Instagram"}
                  </span>
                </a>
              </li>

              {/* LinkedIn */}
              <li>
                <a
                  href={
                    t.footer.linkedinUrl ||
                    "https://www.linkedin.com/company/gaza-edu-hub/"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                >
                  <svg
                    className="w-[18px] h-[18px] text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span className="font-normal text-slate-300 group-hover:text-white">
                    {t.footer.linkedin || "LinkedIn"}
                  </span>
                </a>
              </li>

              {/* Facebook */}
              <li>
                <a
                  href={
                    t.footer.facebookUrl ||
                    "https://www.facebook.com/share/1BrEBigQbH/"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                >
                  <svg
                    className="w-[18px] h-[18px] text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  <span className="font-normal text-slate-300 group-hover:text-white">
                    {t.footer.facebook || "Facebook"}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            Sub-footer Bar with Divider (Flush with Edges)
           ═══════════════════════════════════════════ */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-normal text-center sm:text-start">
          <p className="text-slate-400">{t.footer.rights}</p>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-slate-400 hover:text-emerald-400 font-medium transition-colors"
            >
              {dir === "rtl" ? "لوحة الإدارة" : "Admin Panel"}
            </Link>
            <span className="text-slate-700">•</span>
            <p className="text-slate-400 font-medium tracking-wider uppercase text-[11px] sm:text-xs">
              {t.footer.motto}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
