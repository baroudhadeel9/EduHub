"use client";

import React, { useState } from "react";
import {
  Upload,
  X,
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { CreateAchievementPayload } from "@/services/achievements";

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
                الصور المرفوعة (اضغط &quot;تعيين كغلاف&quot; على الصورة التي ترغب بظهورها كواجهة للمشروع):
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
export default AchievementFormView;
