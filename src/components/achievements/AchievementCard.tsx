"use client";

import React from "react";
import { sanitizeExternalUrl } from "@/utils/url";
import {
  ExternalLink,
  Trash2,
  Calendar,
  Sparkles,
  Tag,
  Eye,
  Layers,
  Loader2,
} from "lucide-react";
import { MemberAchievementItem } from "@/services/achievements";
import { CATEGORY_METAS } from "./AchievementShowcase";

/* ════════════════════════════════════════════════════════════════════════
   1. ACHIEVEMENT CARD (Mobile-Optimized Showcase Card)
   ════════════════════════════════════════════════════════════════════════ */
export interface AchievementCardProps {
  item: MemberAchievementItem;
  onOpenDetails: (item: MemberAchievementItem) => void;
  onDelete?: (id: string, title: string) => void;
  isDeleting?: boolean;
  canDelete?: boolean;
}

export function AchievementCard({
  item,
  onOpenDetails,
  onDelete,
  isDeleting,
  canDelete = true,
}: AchievementCardProps) {
  const cat = CATEGORY_METAS[item.category] || CATEGORY_METAS.other;
  const CatIcon = cat.icon;

  const images = item.images && item.images.length > 0 ? item.images : [];
  const coverUrl =
    item.cover_image_url ||
    item.image_url ||
    images.find((img) => img.is_cover)?.url ||
    images[0]?.url;
  const imageCount = images.length || (item.has_image ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      
      {/* ── Top Cover Image / Showcase Banner ── */}
      <div
        onClick={() => onOpenDetails(item)}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-[#0c2340] overflow-hidden cursor-pointer select-none"
      >
        {coverUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center text-white/70 bg-gradient-to-br from-[#0c2340] via-teal-950 to-slate-900">
            <CatIcon className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400/80 mb-1.5" />
            <span className="text-xs font-bold text-white/90">{cat.label}</span>
          </div>
        )}

        {/* Floating Category Badge (Top Start) */}
        <div className="absolute top-2.5 start-2.5 sm:top-3 sm:start-3 z-10 max-w-[65%]">
          <span
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black backdrop-blur-md shadow-sm border ${cat.bg}/95 ${cat.text} ${cat.border} truncate`}
          >
            <CatIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{cat.label}</span>
          </span>
        </div>

        {/* Floating Photo Count Badge (Top End) */}
        {imageCount > 0 && (
          <div className="absolute top-2.5 end-2.5 sm:top-3 sm:end-3 z-10">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-black/65 text-white backdrop-blur-md border border-white/20 shadow-sm">
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span>{imageCount} {imageCount === 1 ? "صورة" : "صور"}</span>
            </span>
          </div>
        )}

        {/* Mobile Tap-To-View Hint Pill (Visible on mobile, hidden on desktop hover) */}
        <div className="absolute bottom-2.5 start-2.5 z-10 sm:hidden">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 text-white text-[10px] font-bold backdrop-blur-md border border-white/20">
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>عرض المشروع</span>
          </span>
        </div>

        {/* Desktop Hover Action Overlay */}
        <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-black/35 backdrop-blur-[2px]">
          <span className="px-4 py-2 rounded-2xl bg-white/95 text-[#0c2340] text-xs font-extrabold shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>استعراض تفاصيل المشروع</span>
          </span>
        </div>
      </div>

      {/* ── Card Body Details ── */}
      <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div className="space-y-2">
          {/* Header Row: Title */}
          <h3
            onClick={() => onOpenDetails(item)}
            className="text-sm sm:text-base font-black text-[#0c2340] hover:text-emerald-700 transition-colors cursor-pointer leading-snug line-clamp-2"
          >
            {item.title}
          </h3>

          {/* Date */}
          {item.date_achieved && (
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium font-mono">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{item.date_achieved}</span>
            </div>
          )}

          {/* Description Excerpt */}
          {item.description ? (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {item.description}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              لم تتم إضافة وصف تفصيلي لهذا المشروع.
            </p>
          )}

          {/* Skills Chips */}
          {item.skills_used && (
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-0.5">
              {item.skills_used
                .split(/[,،]/)
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 4)
                .map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/70"
                  >
                    <Tag className="w-2.5 h-2.5 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              {item.skills_used.split(/[,،]/).length > 4 && (
                <span className="text-[10px] text-slate-400 font-bold px-1">
                  +{item.skills_used.split(/[,،]/).length - 4}
                </span>
              )}
            </div>
          )}

          {/* EduHub Impact Quote Preview in Card */}
          {item.eduhub_impact_note && (
            <div className="pt-2 border-t border-slate-100/90">
              <div className="flex items-center gap-1.5 text-[10.5px] font-black text-emerald-800 mb-1">
                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>أثر حاضنة مساحة EduHub:</span>
              </div>
              <p className="text-[11px] text-slate-600 italic line-clamp-2 bg-emerald-50/60 p-2 sm:p-2.5 rounded-xl border border-emerald-100/80 leading-relaxed font-medium">
                "{item.eduhub_impact_note}"
              </p>
            </div>
          )}
        </div>

        {/* ── Footer Actions (Mobile-Optimized Touch Targets) ── */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => onOpenDetails(item)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>معاينة وتفاصيل</span>
            </button>

            {sanitizeExternalUrl(item.link_url) && (
              <a
                href={sanitizeExternalUrl(item.link_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 text-xs font-bold transition-all shadow-2xs active:scale-95"
                title="فتح الرابط الخارجي"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">الرابط</span>
              </a>
            )}
          </div>

          {canDelete && onDelete && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(item.id, item.title)}
              className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              title="حذف الإنجاز"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
