"use client";

import React, { useState, useEffect, useCallback } from "react";
import { sanitizeExternalUrl } from "@/utils/url";
import {
  ExternalLink,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Tag,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Maximize2,
  Quote,
} from "lucide-react";
import {
  MemberAchievementItem,
  AchievementImageItem,
} from "@/services/achievements";
import { CATEGORY_METAS } from "./AchievementShowcase";

export interface AchievementDetailsModalProps {
  item: MemberAchievementItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string, title: string) => void;
  canDelete?: boolean;
}

export function AchievementDetailsModal({
  item,
  isOpen,
  onClose,
  onDelete,
  canDelete = true,
}: AchievementDetailsModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images: AchievementImageItem[] =
    item?.images && item.images.length > 0
      ? item.images
      : item?.cover_image_url || item?.image_url
      ? [
          {
            id: "main",
            url: item.cover_image_url || item.image_url || "",
            is_cover: true,
            caption: "صورة الغلاف الرسمية",
          },
        ]
      : [];

  const handlePrevImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, images.length - 1)));
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Reset active image when item changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [item?.id]);

  // Keyboard navigation for image slider
  useEffect(() => {
    if (!isOpen || !item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handleNextImage();
      if (e.key === "ArrowRight") handlePrevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, item, onClose, handleNextImage, handlePrevImage]);

  if (!isOpen || !item) return null;

  const cat = CATEGORY_METAS[item.category] || CATEGORY_METAS.other;
  const CatIcon = cat.icon;

  const currentImage = images[activeImageIndex] || null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="bg-white rounded-none sm:rounded-3xl max-w-4xl w-full shadow-2xl border-0 sm:border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col h-full sm:h-auto sm:max-h-[92vh]"
      >
        {/* ── Modal Top Header ── */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2.5 bg-white shrink-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${cat.bg} ${cat.text} ${cat.border} shrink-0`}
            >
              <CatIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{cat.label}</span>
            </span>
            <h2 className="text-sm sm:text-lg font-black text-[#0c2340] truncate">
              {item.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Content Area ── */}
        <div className="overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          
          {/* ── Media Gallery Viewer Stage (if images exist) ── */}
          {images.length > 0 && currentImage && (
            <div className="bg-slate-950 relative select-none">
              {/* Main Active Image Display */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[300px] sm:max-h-[480px] flex items-center justify-center overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage.url}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain transition-all duration-300"
                />

                {/* Cover Flag Badge */}
                {currentImage.is_cover && (
                  <div className="absolute top-3 start-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-400 text-slate-950 shadow-md">
                      <Star className="w-3 h-3 fill-current" />
                      <span>صورة الغلاف الرسمية</span>
                    </span>
                  </div>
                )}

                {/* Photo Counter */}
                {images.length > 1 && (
                  <div className="absolute top-3 end-3 z-10">
                    <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-black/75 text-white backdrop-blur-md border border-white/20">
                      {activeImageIndex + 1} / {images.length}
                    </span>
                  </div>
                )}

                {/* Left & Right Slider Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute start-2 sm:start-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                      title="الصورة السابقة"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute end-2 sm:end-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                      title="الصورة التالية"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>
                  </>
                )}

                {/* Full-view external button */}
                <a
                  href={currentImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 end-3 z-10 px-2.5 py-1 rounded-lg bg-black/65 hover:bg-black/85 text-white text-[10px] sm:text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1 transition-all shadow-md"
                >
                  <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>عرض الأصل</span>
                </a>
              </div>

              {/* Bottom Thumbnail Strip (if multiple images) */}
              {images.length > 1 && (
                <div className="p-2 sm:p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto touch-pan-x scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-emerald-500 ring-2 ring-emerald-500/40 scale-105"
                          : "border-slate-700 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      {img.is_cover && (
                        <div className="absolute top-0.5 end-0.5 w-3 h-3 rounded-full bg-amber-400 flex items-center justify-center">
                          <Star className="w-2 h-2 text-slate-950 fill-current" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Project Details Container ── */}
          <div className="p-4 sm:p-7 space-y-4 sm:space-y-5">
            {/* Title & Metadata Strip */}
            <div className="space-y-1.5 border-b border-slate-100 pb-3 sm:pb-4">
              <h1 className="text-lg sm:text-2xl font-black text-[#0c2340] leading-snug">
                {item.title}
              </h1>

              <div className="flex items-center gap-3 text-[11px] sm:text-xs text-slate-500 flex-wrap">
                {item.date_achieved && (
                  <div className="flex items-center gap-1 font-bold font-mono">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تاريخ الإنجاز: {item.date_achieved}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>موثق رسمياً في حاضنة إديو هب غزة</span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
                تفاصيل ووصف المشروع
              </h4>
              {item.description ? (
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
                  {item.description}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  لم يتم تدوين وصف إضافي لهذا المشروع.
                </p>
              )}
            </div>

            {/* Skills & Technologies Section */}
            {item.skills_used && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
                  التقنيات والأدوات المستخدمة
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {item.skills_used
                    .split(/[,،]/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs"
                      >
                        <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                        <span>{skill}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* ── EduHub Gaza Impact Showcase Box ── */}
            {item.eduhub_impact_note && (
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-sky-50/60 border border-emerald-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-[#0c2340]">
                        أثر وبصمة مساحة EduHub غزة في تحقيق هذا الإنجاز
                      </h4>
                      <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium">
                        دور بيئة حاضنة EduHub في تمكين العضو وتحقيق هذا الإنجاز
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                    قصة أثر 🌟
                  </span>
                </div>

                <div className="flex items-start gap-3 bg-white/95 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 shadow-2xs">
                  <Quote className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic whitespace-pre-line font-medium">
                    &quot;{item.eduhub_impact_note}&quot;
                  </p>
                </div>
              </div>
            )}

            {/* Live Project URL Button */}
            {sanitizeExternalUrl(item.link_url) && (
              <div className="pt-2">
                <a
                  href={sanitizeExternalUrl(item.link_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>زيارة رابط المشروع المباشر</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          {canDelete && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(item.id, item.title);
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف هذا الإنجاز</span>
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
export default AchievementDetailsModal;
