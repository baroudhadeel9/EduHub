"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { EventItem, createAdminEventApi, updateAdminEventApi } from "@/services/events";
import {
  X,
  Sparkles,
  AlertCircle,
  Eye,
  Sliders,
  CheckCircle2,
  Camera,
  ImageIcon,
  Archive,
  ArrowUpRight,
  Upload,
  Calendar,
} from "lucide-react";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit: EventItem | null;
  onSuccess: () => void;
  isRTL: boolean;
}

export default function EventFormModal({
  isOpen,
  onClose,
  eventToEdit,
  onSuccess,
  isRTL,
}: EventFormModalProps) {
  const { t } = useLanguage();
  const m = (t.admin as Record<string, any>)?.events?.modal;
  const cardT = (t.admin as Record<string, any>)?.events?.card;
  const presetsT = (t.admin as Record<string, any>)?.events?.presets;
  const typesT = (t.admin as Record<string, any>)?.events?.types;

  const isEditing = Boolean(eventToEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active view tab on mobile: 'form' | 'preview'
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");

  // Form state
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [type, setType] = useState("تدريب عملي");
  const [eventDate, setEventDate] = useState("");
  const [status, setStatus] = useState<"completed" | "scheduled" | "archived">("completed");
  const [description, setDescription] = useState("");

  // Single dedicated image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const presetImages = [
    { label: presetsT?.dentistry || (isRTL ? "قاعة طب الأسنان" : "Dentistry Hall"), url: "/images/workshop-dentistry.jpg" },
    { label: presetsT?.chess || (isRTL ? "بطولة الشطرنج" : "Chess Tournament"), url: "/images/workshop-chess.png" },
    { label: presetsT?.workspace || (isRTL ? "مساحة العمل" : "Workspace"), url: "/images/hero-workspace.jpg" },
    { label: presetsT?.coding || (isRTL ? "البرمجة والتطوير" : "Coding & Tech"), url: "/images/hands-coding.jpg" },
    { label: presetsT?.freelance || (isRTL ? "العمل الحر" : "Freelancing"), url: "/images/workshop-freelance.jpg" },
  ];

  const defaultTypes = [
    typesT?.practical || (isRTL ? "تدريب عملي" : "Hands-on Training"),
    typesT?.workshop || (isRTL ? "ورشة عمل" : "Workshop"),
    typesT?.course || (isRTL ? "كورس تدريبي" : "Training Course"),
    typesT?.techSession || (isRTL ? "جلسة تقنية" : "Tech Session"),
    typesT?.tournament || (isRTL ? "بطولة تنافسية" : "Tournament"),
    typesT?.entrepreneurship || (isRTL ? "لقاء ريادي" : "Entrepreneurship Meetup"),
  ];

  // Populate form on edit, or reset to clean empty state on create
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setTag(eventToEdit.tag || "");
      setType(eventToEdit.type || defaultTypes[0] || "تدريب عملي");
      setEventDate(eventToEdit.event_date || "");
      setDescription(eventToEdit.description || eventToEdit.desc || "");
      setStatus(
        eventToEdit.is_archived || eventToEdit.status === "archived"
          ? "archived"
          : eventToEdit.status === "scheduled"
          ? "scheduled"
          : "completed"
      );
      const currentImg = eventToEdit.image_url || eventToEdit.image || "/images/hero-workspace.jpg";
      setImageUrl(currentImg);
      setPreviewSrc(currentImg);
      setImageFile(null);
    } else {
      // Clean, empty state for new workshop
      setTitle("");
      setTag("");
      setType(defaultTypes[0] || "تدريب عملي");
      const today = new Date().toISOString().split("T")[0];
      setEventDate(today);
      setDescription("");
      setStatus("completed");
      setImageUrl("");
      setPreviewSrc("");
      setImageFile(null);
    }
    setErrorMsg("");
    setActiveTab("form");
  }, [eventToEdit, isOpen]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(isRTL ? "حجم الصورة يجب ألا يتجاوز 10 ميجابايت." : "Image must be under 10MB");
        return;
      }
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewSrc(objectUrl);
      setErrorMsg("");
    }
  };

  // Human-friendly date badge for live preview
  const getFormattedDateBadge = (dateStr: string) => {
    if (!dateStr) return isRTL ? "تاريخ الفعالية" : "Event Date";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const monthsAr = [
          "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
          "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
        ];
        const mIdx = parseInt(parts[1], 10) - 1;
        const mName = isRTL ? (monthsAr[mIdx] || parts[1]) : parts[1];
        return `${parseInt(parts[2], 10)} ${mName} ${parts[0]}`;
      }
    } catch {}
    return dateStr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg(isRTL ? "يرجى كتابة عنوان الورشة." : "Please enter event title");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("type", type);
      formData.append("tag", tag.trim() || "EduHub");
      formData.append("event_date", eventDate || new Date().toISOString().split("T")[0]);
      formData.append("description", description.trim());
      formData.append("status", status);

      // Backend handles image storage logic: upload file or ready preset URL
      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image_url", imageUrl || "/images/hero-workspace.jpg");
      }

      let res;
      if (isEditing && eventToEdit) {
        res = await updateAdminEventApi(eventToEdit.id, formData);
      } else {
        res = await createAdminEventApi(formData);
      }

      if (!res.success) {
        throw new Error(res.message || (isRTL ? "فشل حفظ الورشة" : "Failed to save"));
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : (isRTL ? "حدث خطأ أثناء الحفظ" : "Save error"));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-slate-950">
                {isEditing
                  ? m?.editTitle || (isRTL ? "تعديل بيانات الورشة" : "Edit Workshop Details")
                  : m?.addTitle || (isRTL ? "إضافة ورشة جديدة" : "Add New Workshop")}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                {m?.subtitle ||
                  (isRTL
                    ? "قم بتعبئة تفاصيل الورشة، والمنطق يُعالج مباشرة من السيرفر"
                    : "Fill workshop details, handled directly by the server")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile View Switcher Tabs (Form vs Live Preview) */}
        <div className="lg:hidden flex items-center border-b border-slate-200 bg-slate-100/60 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("form")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "form"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{m?.fieldsTab || (isRTL ? "بيانات الورشة" : "Workshop Fields")}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>{m?.previewTab || (isRTL ? "معاينة الكارد" : "Preview Card")}</span>
          </button>
        </div>

        {/* Modal Main Content: 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[78vh] overflow-y-auto">
          {/* Form Inputs (7 Cols on desktop) */}
          <form
            onSubmit={handleSubmit}
            className={`lg:col-span-7 p-4 sm:p-6 space-y-3.5 sm:space-y-4 border-b lg:border-b-0 ${
              isRTL ? "lg:border-l" : "lg:border-r"
            } border-slate-100 ${
              activeTab === "form" ? "block" : "hidden lg:block"
            }`}
          >
            {errorMsg && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {m?.titleLabel || (isRTL ? "عنوان الورشة أو الفعالية *" : "Event Title *")}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  m?.titlePlaceholder ||
                  (isRTL
                    ? "مثال: تحضير الكافيتي للأملجم (Class I & Class II) — طب أسنان"
                    : "e.g. Cavity preparation workshop...")
                }
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900"
              />
            </div>

            {/* 2. Partner Tag & Event Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {m?.tagLabel || (isRTL ? "الجهة الشريكة / الوسم" : "Partner / Tag")}
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder={
                    m?.tagPlaceholder ||
                    (isRTL ? "مثال: Crown Nexus × EduHub أو MCI" : "e.g. Partner × EduHub")
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {m?.typeLabel || (isRTL ? "نوع وتصنيف الفعالية *" : "Event Type *")}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800 bg-white"
                >
                  {defaultTypes.map((tItem) => (
                    <option key={tItem} value={tItem}>
                      {tItem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Event Date & Publication Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {m?.dateLabel || (isRTL ? "تاريخ الفعالية *" : "Event Date *")}
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {m?.statusLabel || (isRTL ? "حالة العرض بالموقع *" : "Publication Status *")}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "completed" | "scheduled" | "archived")}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold bg-white text-slate-800"
                >
                  <option value="completed">{m?.statusLive || (isRTL ? "معروضة بالموقع (ظاهرة للجميع)" : "Live on Site")}</option>
                  <option value="archived">{m?.statusArchived || (isRTL ? "مؤرشفة (مخفية مؤقتاً من الموقع)" : "Archived (Hidden)")}</option>
                </select>
              </div>
            </div>

            {/* 4. Workshop Image (1-Click Presets or Optional Upload) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-800">
                  {m?.imageLabel || (isRTL ? "صورة الورشة الميدانية" : "Workshop Image")}
                </label>
              </div>

              {/* Ready preset photos for 1-click selection */}
              <div className="mb-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {presetImages.map((preset) => {
                    const isSelected = previewSrc === preset.url;
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImageUrl(preset.url);
                          setPreviewSrc(preset.url);
                          setErrorMsg("");
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border active:scale-95 ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {previewSrc ? (
                /* Selected / Uploaded Image View */
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl border border-slate-200 bg-slate-50/70">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-16 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-200 shrink-0 cursor-pointer group shadow-2xs"
                      title={isRTL ? "انقر لتغيير الصورة" : "Click to change photo"}
                    >
                      <Image
                        src={previewSrc}
                        alt="Workshop photo"
                        fill
                        unoptimized={true}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {imageFile
                        ? imageFile.name
                        : presetImages.find((p) => p.url === previewSrc)?.label ||
                          (isRTL ? "صورة محددة" : "Selected Image")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isRTL ? "تغيير" : "Change"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImageUrl("");
                        setPreviewSrc("");
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      {isRTL ? "إزالة" : "Remove"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Clean Empty Upload Prompt */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/20 transition-all cursor-pointer group text-center"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white text-slate-400 group-hover:text-emerald-600 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform border border-slate-200/80">
                    <Upload className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">
                    {isRTL ? "انقر لرفع صورة الورشة" : "Click to upload workshop image"}
                  </span>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* 5. Description */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {m?.descLabel || (isRTL ? "الوصف والأثر الإنساني" : "Description & Impact")}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  m?.descPlaceholder ||
                  (isRTL
                    ? "اكتب نبذة عن التدريب، الفئة المستفيدة، والنتائج العملية المحققة..."
                    : "Write description, target group, and practical outcomes...")
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 leading-relaxed"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {m?.cancel || (isRTL ? "إلغاء" : "Cancel")}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{m?.saving || (isRTL ? "جارٍ الحفظ..." : "Saving...")}</span>
                  </>
                ) : (
                  <span>
                    {isEditing
                      ? m?.saveChanges || (isRTL ? "حفظ التعديلات" : "Save Changes")
                      : m?.publish || (isRTL ? "إضافة ونشر الورشة" : "Publish Workshop")}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Live Public Website Preview (5 Cols on desktop) */}
          <div
            className={`lg:col-span-5 bg-slate-50/75 p-4 sm:p-6 flex flex-col justify-between space-y-4 ${
              activeTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            <div>
              {/* Preview Header Banner */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      {m?.livePreviewTitle || (isRTL ? "معاينة حية للموقع" : "Live Website Preview")}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {m?.livePreviewSub || (isRTL ? "هكذا تظهر البطاقة للطلاب تماماً" : "Exactly how students see it on the website")}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{m?.liveBadge || (isRTL ? "مباشر" : "Live")}</span>
                </span>
              </div>

              {/* Exact Public Website Card Clone */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                <div>
                  {/* Event Image Container with Gradient & Zoom */}
                  <div className="relative h-44 sm:h-52 w-full bg-slate-100 overflow-hidden">
                    {previewSrc ? (
                      <Image
                        src={previewSrc}
                        alt="Preview"
                        fill
                        unoptimized={true}
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/10">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-200">
                          {m?.imageLabel || (isRTL ? "صورة الورشة الميدانية" : "Workshop Image")}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isRTL ? "ارفع صورة لتظهر بالمعاينة" : "Upload an image to preview"}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                    {/* Top Start: Date Badge (Identical to Website) */}
                    <div className="absolute top-3 start-3 sm:top-3.5 start-3.5 z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-md border border-white/60">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{getFormattedDateBadge(eventDate)}</span>
                      </span>
                    </div>

                    {/* Corner publication indicator */}
                    <div className="absolute top-3 end-3 z-10">
                      {status === "archived" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-white shadow-sm backdrop-blur-md">
                          <Archive className="w-3 h-3" />
                          <span>{cardT?.archived || (isRTL ? "مؤرشفة" : "Archived")}</span>
                        </span>
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-emerald-700 shadow-md">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                      {title.trim() || m?.placeholderTitle || (isRTL ? "عنوان الورشة التدريبية..." : "Workshop Title...")}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-3">
                      {description.trim() ||
                        m?.placeholderDesc ||
                        (isRTL
                          ? "دورة تدريبية متخصصة لطلبة المركز تتضمن شرحاً وتطبيقاً عملياً ومتابعة خطوة بخطوة..."
                          : "Hands-on training session for center students...")}
                    </p>
                  </div>
                </div>

                {/* Bottom Meta Bar */}
                <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-bold text-xs truncate max-w-[140px]">
                    {tag.trim() || "EduHub"}
                  </span>
                  <span className="text-slate-600 font-medium">
                    {type}
                  </span>
                </div>
              </div>
            </div>

            {/* Informational Tip */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-900 text-[11px] sm:text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {m?.previewTip ||
                  (isRTL
                    ? "البطاقة المعروضة هنا مطابقة تماماً لما يراه الطلاب."
                    : "Preview is 100% identical to public site.")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
