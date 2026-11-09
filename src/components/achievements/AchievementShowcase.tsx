"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Plus,
  ExternalLink,
  Trash2,
  Calendar,
  Sparkles,
  Award,
  Briefcase,
  Code2,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Tag,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  Maximize2,
  Layers,
  Zap,
  Wifi,
  Target,
  Users,
  Quote,
  ArrowRight,
} from "lucide-react";
import {
  MemberAchievementItem,
  AchievementImageItem,
  CreateAchievementPayload,
} from "@/services/achievements";

export interface EduhubImpactOption {
  key: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeBg: string;
  border: string;
  textColor: string;
  iconColor: string;
}

export const EDUHUB_IMPACT_OPTIONS: EduhubImpactOption[] = [
  {
    key: "electricity",
    label: "طاقة وكهرباء مستمرة",
    desc: "شحن الأجهزة واستمرار العمل دون انقطاع طوال اليوم",
    icon: Zap,
    badgeBg: "bg-amber-50/90",
    border: "border-amber-200",
    textColor: "text-amber-900",
    iconColor: "text-amber-500",
  },
  {
    key: "internet",
    label: "إنترنت فايبر سريع ومستقر",
    desc: "رفع الكود والملفات وتسليم المشاريع في مواعيدها",
    icon: Wifi,
    badgeBg: "bg-sky-50/90",
    border: "border-sky-200",
    textColor: "text-sky-900",
    iconColor: "text-sky-500",
  },
  {
    key: "focus_environment",
    label: "بيئة تركيز وإنتاجية هادئة",
    desc: "ساعات عمل متواصلة خالية من التشتيت والضغوطات",
    icon: Target,
    badgeBg: "bg-emerald-50/90",
    border: "border-emerald-200",
    textColor: "text-emerald-900",
    iconColor: "text-emerald-600",
  },
  {
    key: "community",
    label: "مجتمع تقني وإرشاد متبادل",
    desc: "تبادل الخبرات وتجاوز التحديات التقنية مع الزملاء",
    icon: Users,
    badgeBg: "bg-indigo-50/90",
    border: "border-indigo-200",
    textColor: "text-indigo-900",
    iconColor: "text-indigo-600",
  },
  {
    key: "job_contract",
    label: "تسليم عميل / مقابلة عمل",
    desc: "إجراء مقابلات العمل عن بُعد وإنجاز متطلبات العملاء",
    icon: Briefcase,
    badgeBg: "bg-rose-50/90",
    border: "border-rose-200",
    textColor: "text-rose-900",
    iconColor: "text-rose-600",
  },
];

export const CATEGORY_METAS: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
> = {
  project: {
    label: "مشروع تطبيقي / برمجي",
    icon: Code2,
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
  },
  freelance_job: {
    label: "عقد عمل حر / عن بُعد",
    icon: Briefcase,
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  certificate: {
    label: "دورة أو شهادة مهنية",
    icon: Award,
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  employment: {
    label: "فرصة توظيف / تدريب مهني",
    icon: Building2,
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
  },
  competition: {
    label: "مسابقة وجائزة تقنية",
    icon: Trophy,
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
  },
  other: {
    label: "إنجاز عام متميز",
    icon: Sparkles,
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-200",
  },
};

/* ════════════════════════════════════════════════════════════════════════
   1. ACHIEVEMENT CARD (Mobile-Optimized Showcase Card)
   ════════════════════════════════════════════════════════════════════════ */
interface AchievementCardProps {
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

            {item.link_url && (
              <a
                href={item.link_url}
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

/* ════════════════════════════════════════════════════════════════════════
   2. ELITE LIGHTBOX & SHOWCASE MODAL (Full-screen on Mobile, Dialog on Desktop)
   ════════════════════════════════════════════════════════════════════════ */
interface AchievementDetailsModalProps {
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
  });

  if (!isOpen || !item) return null;

  const cat = CATEGORY_METAS[item.category] || CATEGORY_METAS.other;
  const CatIcon = cat.icon;

  const images: AchievementImageItem[] =
    item.images && item.images.length > 0
      ? item.images
      : item.cover_image_url || item.image_url
      ? [
          {
            id: "main",
            url: item.cover_image_url || item.image_url || "",
            is_cover: true,
            caption: "صورة الغلاف الرسمية",
          },
        ]
      : [];

  const currentImage = images[activeImageIndex] || null;

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

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
                    "{item.eduhub_impact_note}"
                  </p>
                </div>
              </div>
            )}

            {/* Live Project URL Button */}
            {item.link_url && (
              <div className="pt-2">
                <a
                  href={item.link_url}
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

/* ════════════════════════════════════════════════════════════════════════
   3. FULL-PAGE ACHIEVEMENT FORM VIEW (Spacious, Mobile-Friendly, No Cramped Modal)
   ════════════════════════════════════════════════════════════════════════ */
export interface AchievementFormViewProps {
  onBack: () => void;
  onSubmit: (payload: CreateAchievementPayload) => Promise<boolean>;
  targetName?: string;
  isSubmitting: boolean;
  feedback?: { type: "success" | "error"; message: string } | null;
}

export function AchievementFormView({
  onBack,
  onSubmit,
  targetName,
  isSubmitting,
  feedback,
}: AchievementFormViewProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("project");
  const [dateAchieved, setDateAchieved] = useState(new Date().toISOString().split("T")[0]);
  const [linkUrl, setLinkUrl] = useState("");
  const [skillsUsed, setSkillsUsed] = useState("");
  const [description, setDescription] = useState("");
  const [eduhubImpactNote, setEduhubImpactNote] = useState("");

  // Multiple Images + Cover Index
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 10) {
      setFormError("الحد الأقصى للصور هو 10 صور لكل مشروع.");
      return;
    }

    setFormError(null);
    const updatedFiles = [...selectedFiles, ...files];
    setSelectedFiles(updatedFiles);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);

    if (coverIndex === index) {
      setCoverIndex(0);
    } else if (coverIndex > index) {
      setCoverIndex((prev) => prev - 1);
    }
  };

  const handleSetCover = (index: number) => {
    setCoverIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: CreateAchievementPayload = {
      title: title.trim(),
      category,
      date_achieved: dateAchieved || undefined,
      link_url: linkUrl.trim() || undefined,
      skills_used: skillsUsed.trim() || undefined,
      description: description.trim() || undefined,
      eduhub_impact_note: eduhubImpactNote.trim() || undefined,
      images: selectedFiles,
      cover_index: coverIndex,
    };

    const success = await onSubmit(payload);
    if (success) {
      onBack();
    }
  };

  return (
    <div dir="rtl" className="space-y-4 sm:space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      {/* ── Top Navigation Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
            title="العودة لمعرض الإنجازات"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-xl font-black text-[#0c2340]">
              توثيق إنجاز أو مشروع جديد
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {targetName ? `إضافة مشروع للعضو: ${targetName}` : "سجل أعمالك ومشروعاتك بمساحة مريحة وتفاصيل متكاملة"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
        >
          إلغاء والعودة
        </button>
      </div>

      {/* ── Feedback Message ── */}
      {(feedback || formError) && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-2xs ${
            formError || feedback?.type === "error"
              ? "bg-rose-50 text-rose-800 border border-rose-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          {formError || feedback?.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{formError || feedback?.message}</span>
        </div>
      )}

      {/* ── Main Form ── */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        
        {/* Section 1: Basic Information */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm sm:text-base font-black text-[#0c2340]">
              1. البيانات الأساسية للإنجاز
            </h3>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              عنوان الإنجاز أو اسم المشروع *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: منصة تجارة إلكترونية متكاملة، تطبيق حجز مواعيد، عقد عمل حر مع شركة تقنية..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                تصنيف الإنجاز *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="project">مشروع تطبيقي / برمجي</option>
                <option value="freelance_job">عقد عمل حر (Freelance)</option>
                <option value="certificate">شهادة تدريبية أو مهنية</option>
                <option value="employment">عقد توظيف بدوام</option>
                <option value="competition">جائزة أو مسابقة تقنية</option>
                <option value="other">إنجاز آخر</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                تاريخ الإنجاز
              </label>
              <input
                type="date"
                value={dateAchieved}
                onChange={(e) => setDateAchieved(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                رابط المشروع المباشر أو GitHub (اختياري)
              </label>
              <input
                type="url"
                placeholder="https://... أو رابط مستودع GitHub"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
                التقنيات والأدوات المستخدمة
              </label>
              <input
                type="text"
                placeholder="مثال: React, Next.js, Laravel, Tailwind CSS, Figma"
                value={skillsUsed}
                onChange={(e) => setSkillsUsed(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Photo Gallery & Cover Selection */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm sm:text-base font-black text-[#0c2340]">
                2. صور ولقطات شاشة المشروع
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {selectedFiles.length} / 10 صور محددة
            </span>
          </div>

          <input
            type="file"
            accept="image/*"
            multiple
            id="multiAchievementImagesPage"
            onChange={handleFilesChange}
            className="hidden"
          />

          <label
            htmlFor="multiAchievementImagesPage"
            className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl cursor-pointer bg-slate-50/70 hover:bg-emerald-50/30 transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              اضغط هنا لاختيار صور من جهازك أو هاتفك
            </span>
            <span className="text-xs text-slate-400 mt-1">
              يمكنك رفع حتى 10 صور لمشروعك، مع إمكانية تعيين صورة الغلاف بنقرة واحدة
            </span>
          </label>

          {previews.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-600">
                الصور المرفوعة (اضغط "تعيين كغلاف" على الصورة التي ترغب بظهورها كواجهة للمشروع):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {previews.map((src, idx) => {
                  const isCover = coverIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border-2 transition-all ${
                        isCover
                          ? "border-amber-400 ring-4 ring-amber-400/30 shadow-md"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Cover Badge / Button */}
                      {isCover ? (
                        <div className="absolute top-2 start-2 z-10 px-2 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" />
                          <span>الغلاف الرسمي ⭐</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className="absolute top-2 start-2 z-10 px-2 py-1 rounded-lg bg-black/75 hover:bg-black/90 text-white font-bold text-[10px] sm:text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-md"
                        >
                          <Star className="w-3 h-3 text-amber-300" />
                          <span>تعيين كغلاف</span>
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 end-2 z-10 w-7 h-7 rounded-lg bg-black/75 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
                        title="حذف هذه الصورة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Project Description */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm sm:text-base font-black text-[#0c2340]">
              3. تفاصيل ومخرجات المشروع
            </h3>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              الوصف والمهام المنجزة
            </label>
            <textarea
              rows={4}
              placeholder="اشرح فكرة المشروع، مخرجاته النهائية، دورك فيه، أو المشكلة التي قام بحلها..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Section 4: EduHub Impact */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-emerald-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-200/60">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#0c2340]">
                4. أثر ودور مساحة EduHub في إنجاز هذا المشروع
              </h3>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              كيف ساهمت مساحة EduHub في تحقيق هذا الإنجاز؟ (اختياري)
            </label>
            <textarea
              rows={4}
              placeholder="اكتب كيف ساعدتك مساحة EduHub (الكهرباء المستمرة، الإنترنت السريع، الهدوء وبيئة التركيز، نصائح الزملاء، أو تسليم المشروع في موعده)..."
              value={eduhubImpactNote}
              onChange={(e) => setEduhubImpactNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            إلغاء والعودة
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري حفظ وتوثيق الإنجاز...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ وتوثيق الإنجاز</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   BACKWARD COMPATIBLE MODAL WRAPPER (Falls back to full-view behavior)
   ════════════════════════════════════════════════════════════════════════ */
export interface AchievementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAchievementPayload) => Promise<boolean>;
  targetName?: string;
  isSubmitting: boolean;
  feedback?: { type: "success" | "error"; message: string } | null;
}

export function AchievementFormModal({
  isOpen,
  onClose,
  onSubmit,
  targetName,
  isSubmitting,
  feedback,
}: AchievementFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-none sm:rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border-0 sm:border border-slate-200 min-h-screen sm:min-h-0 sm:my-6 overflow-y-auto">
        <AchievementFormView
          onBack={onClose}
          onSubmit={onSubmit}
          targetName={targetName}
          isSubmitting={isSubmitting}
          feedback={feedback}
        />
      </div>
    </div>
  );
}
