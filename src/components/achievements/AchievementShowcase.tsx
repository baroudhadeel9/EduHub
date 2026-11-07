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
  Image as ImageIcon,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Star,
  Maximize2,
  Layers,
  Check,
} from "lucide-react";
import {
  MemberAchievementItem,
  AchievementImageItem,
  CreateAchievementPayload,
  compressImageClientSide,
} from "@/services/achievements";

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
   1. ACHIEVEMENT CARD (Portfolio Showcase Style)
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
  const coverUrl = item.cover_image_url || item.image_url || images.find((img) => img.is_cover)?.url || images[0]?.url;
  const imageCount = images.length || (item.has_image ? 1 : 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      
      {/* ── Top Cover Image / Showcase Banner ── */}
      <div
        onClick={() => onOpenDetails(item)}
        className="relative w-full aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-[#0c2340] overflow-hidden cursor-pointer select-none"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/70 bg-gradient-to-br from-[#0c2340] via-teal-950 to-slate-900">
            <CatIcon className="w-12 h-12 text-emerald-400/80 mb-2" />
            <span className="text-xs font-bold text-white/90">{cat.label}</span>
          </div>
        )}

        {/* Floating Category Badge (Top Start) */}
        <div className="absolute top-3 start-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black backdrop-blur-md shadow-sm border ${cat.bg}/90 ${cat.text} ${cat.border}`}
          >
            <CatIcon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </span>
        </div>

        {/* Floating Photo Count Badge (Top End) */}
        {imageCount > 0 && (
          <div className="absolute top-3 end-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{imageCount} {imageCount === 1 ? "صورة" : "صور"}</span>
            </span>
          </div>
        )}

        {/* Hover Action Overlay: "استعراض الإنجاز" */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-black/30 backdrop-blur-[2px]">
          <span className="px-4 py-2 rounded-2xl bg-white/95 text-[#0c2340] text-xs font-extrabold shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>استعراض تفاصيل المشروع</span>
          </span>
        </div>

        {/* Bottom Floating Title Bar on Cover (if image) */}
        {coverUrl && (
          <div className="absolute bottom-2.5 start-3 end-3 z-10 pointer-events-none">
            <p className="text-white text-xs font-bold drop-shadow-md truncate opacity-90">
              {item.title}
            </p>
          </div>
        )}
      </div>

      {/* ── Card Body Details ── */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Header Row: Title & Date */}
          <div className="flex items-start justify-between gap-3">
            <h3
              onClick={() => onOpenDetails(item)}
              className="text-base font-black text-[#0c2340] hover:text-emerald-700 transition-colors cursor-pointer leading-snug line-clamp-2"
            >
              {item.title}
            </h3>
          </div>

          {/* Date */}
          {item.date_achieved && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.date_achieved}</span>
            </div>
          )}

          {/* Description Excerpt */}
          {item.description ? (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
              {item.description}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              لم تتم إضافة وصف تفصيلي لهذا المشروع.
            </p>
          )}

          {/* Skills Chips */}
          {item.skills_used && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {item.skills_used
                .split(/[,،]/)
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 5)
                .map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/70"
                  >
                    <Tag className="w-2.5 h-2.5 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              {item.skills_used.split(/[,،]/).length > 5 && (
                <span className="text-[10px] text-slate-400 font-bold px-1">
                  +{item.skills_used.split(/[,،]/).length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDetails(item)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>معاينة وتفاصيل</span>
            </button>

            {item.link_url && (
              <a
                href={item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 text-xs font-bold transition-all shadow-2xs"
                title="فتح الرابط الخارجي"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>الرابط</span>
              </a>
            )}
          </div>

          {canDelete && onDelete && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(item.id, item.title)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
   2. ELITE LIGHTBOX & SHOWCASE MODAL (Full Behance-Style Details)
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
      >
        {/* ── Modal Top Header ── */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cat.bg} ${cat.text} ${cat.border} shrink-0`}
            >
              <CatIcon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </span>
            <h2 className="text-base sm:text-lg font-black text-[#0c2340] truncate">
              {item.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Content Area ── */}
        <div className="overflow-y-auto flex-1 space-y-6">
          
          {/* ── Media Gallery Viewer Stage (if images exist) ── */}
          {images.length > 0 && currentImage && (
            <div className="bg-slate-950 relative select-none">
              {/* Main Active Image Display */}
              <div className="relative w-full aspect-[16/10] max-h-[520px] flex items-center justify-center overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage.url}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain transition-all duration-300"
                />

                {/* Cover Flag Badge */}
                {currentImage.is_cover && (
                  <div className="absolute top-4 start-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>صورة الغلاف الرسمية للمشروع</span>
                    </span>
                  </div>
                )}

                {/* Photo Counter */}
                {images.length > 1 && (
                  <div className="absolute top-4 end-4 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/70 text-white backdrop-blur-md border border-white/20">
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
                      className="absolute start-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
                      title="الصورة السابقة"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute end-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
                      title="الصورة التالية"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Full-view external button */}
                <a
                  href={currentImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 end-4 z-10 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>عرض الحجم الأصلي</span>
                </a>
              </div>

              {/* Bottom Thumbnail Strip (if multiple images) */}
              {images.length > 1 && (
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
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
          <div className="p-5 sm:p-7 space-y-5">
            {/* Title & Metadata Strip */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <h1 className="text-xl sm:text-2xl font-black text-[#0c2340] leading-snug">
                {item.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                {item.date_achieved && (
                  <div className="flex items-center gap-1.5 font-bold font-mono">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>تاريخ الإنجاز: {item.date_achieved}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>موثق رسمياً في حاضنة إديو هب غزة</span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                تفاصيل ووصف المشروع
              </h4>
              {item.description ? (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
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
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  التقنيات والأدوات المستخدمة
                </h4>
                <div className="flex flex-wrap gap-2">
                  {item.skills_used
                    .split(/[,،]/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs"
                      >
                        <Tag className="w-3 h-3 text-emerald-600" />
                        <span>{skill}</span>
                      </span>
                    ))}
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
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md active:scale-95 transition-all w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>زيارة رابط المشروع المباشر</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
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
   3. MULTI-IMAGE ACHIEVEMENT FORM MODAL (With Cover Photo Picker)
   ════════════════════════════════════════════════════════════════════════ */
interface AchievementFormModalProps {
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
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("project");
  const [dateAchieved, setDateAchieved] = useState(new Date().toISOString().split("T")[0]);
  const [linkUrl, setLinkUrl] = useState("");
  const [skillsUsed, setSkillsUsed] = useState("");
  const [description, setDescription] = useState("");

  // Multiple Images + Cover Index
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setCategory("project");
      setDateAchieved(new Date().toISOString().split("T")[0]);
      setLinkUrl("");
      setSkillsUsed("");
      setDescription("");
      setSelectedFiles([]);
      setPreviews([]);
      setCoverIndex(0);
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

    // Generate previews
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
      images: selectedFiles,
      cover_index: coverIndex,
    };

    const success = await onSubmit(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8 relative animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#0c2340]">
                توثيق إنجاز أو مشروع جديد
              </h3>
              <p className="text-xs text-slate-400">
                {targetName ? `للعضو: ${targetName}` : "سجل أعمالك ومشروعاتك باحترافية"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback / Error */}
        {(feedback || formError) && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              formError || feedback?.type === "error"
                ? "bg-rose-50 text-rose-800 border border-rose-200"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            {formError || feedback?.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{formError || feedback?.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان الإنجاز أو اسم المشروع *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: متجر إلكتروني متكامل أو تطبيق إدارة المهام..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                التصنيف *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاريخ الإنجاز
              </label>
              <input
                type="date"
                value={dateAchieved}
                onChange={(e) => setDateAchieved(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Link & Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رابط المشروع أو العمل المباشر (اختياري)
              </label>
              <input
                type="url"
                placeholder="https://myproject.com أو رابط GitHub"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المهارات والأدوات المستخدمة
              </label>
              <input
                type="text"
                placeholder="Next.js, Laravel, Tailwind, Figma (مفصولة بفاصلة)"
                value={skillsUsed}
                onChange={(e) => setSkillsUsed(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* ── Multiple Images Uploader with Cover Picker ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                صور ولقطات شاشة المشروع (يمكن رفع عدة صور وتحديد الغلاف)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedFiles.length} / 10 صور
              </span>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              id="multiAchievementImages"
              onChange={handleFilesChange}
              className="hidden"
            />

            {/* Dropzone Upload Button */}
            <label
              htmlFor="multiAchievementImages"
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl cursor-pointer bg-slate-50/60 hover:bg-emerald-50/30 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-emerald-600 mb-1.5">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">
                اضغط لاختيار صورة واحدة أو أكثر للمشروع
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, WEBP (يتم ضغطها وتأمينها تلقائياً على السيرفر)
              </span>
            </label>

            {/* Uploaded Images Grid Preview with Cover Selector */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {previews.map((src, idx) => {
                  const isCover = coverIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border-2 transition-all group ${
                        isCover
                          ? "border-amber-400 ring-2 ring-amber-400/40 shadow-sm"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Cover Badge or Set-Cover Button */}
                      {isCover ? (
                        <div className="absolute top-1.5 start-1.5 z-10 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>الغلاف ⭐</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className="absolute top-1.5 start-1.5 z-10 px-2 py-0.5 rounded-lg bg-black/70 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                        >
                          <Star className="w-2.5 h-2.5" />
                          <span>تعيين كغلاف</span>
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 end-1.5 z-10 p-1 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="حذف هذه الصورة"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              شرح وتفاصيل وملاحظات الإنجاز
            </label>
            <textarea
              rows={4}
              placeholder="اشرح مخرجات المشروع، دورك فيه، المشكلة التي حلها، أو النتائج المحققة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white resize-none leading-relaxed"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري التوثيق وحفظ الصور...</span>
                </>
              ) : (
                <span>حفظ وتوثيق الإنجاز</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
