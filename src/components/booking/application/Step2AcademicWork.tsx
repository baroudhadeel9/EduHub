"use client";

import React from "react";
import { GraduationCap, Briefcase, User, FileText, UploadCloud, Trash2 } from "lucide-react";
import { Step2AcademicWorkProps, MemberCategory } from "./types";

export default function Step2AcademicWork({
  category,
  setCategory,
  university,
  setUniversity,
  specialty,
  setSpecialty,
  primaryPurposes,
  togglePurpose,
  customPurpose,
  setCustomPurpose,
  durationSchedule,
  setDurationSchedule,
  proofFile,
  setProofFile,
  onFileChange,
  isRTL,
}: Step2AcademicWorkProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
        <GraduationCap className="w-4 h-4" />
        <span>{isRTL ? "2. الفئة، الجامعة، ومجال التخصص" : "2. Category & Academic / Work Field"}</span>
      </div>

      {/* Category Radio Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          {isRTL ? "من أي الفئات تصنف نفسك؟" : "How do you classify yourself?"} <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: "طالب/ة", label: isRTL ? "طالب/ة" : "Student", icon: GraduationCap },
            { id: "فريلانسر Freelancer", label: isRTL ? "فريلانسر Freelancer" : "Freelancer", icon: Briefcase },
            { id: "باحث عن عمل وتطوير مهارات", label: isRTL ? "باحث عن عمل وتطوير مهارات" : "Job Seeker / Skills", icon: User },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id as MemberCategory)}
              className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-2.5 ${
                category === cat.id
                  ? "bg-emerald-50/70 border-emerald-500 text-emerald-900 font-bold shadow-2xs"
                  : "bg-[#f8fafc] border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <cat.icon className={`w-4 h-4 ${category === cat.id ? "text-emerald-700" : "text-slate-400"}`} />
              <span className="text-xs sm:text-sm">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* University & Major */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {isRTL ? "اسم الجامعة (للطلاب والخريجين)" : "University Name"}
          </label>
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder={isRTL ? "مثال: الجامعة الإسلامية، الأزهر، الأقصى..." : "e.g., Islamic University, Al-Azhar..."}
            className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            {isRTL ? "التخصص الجامعي أو مجال عملك فريلانسر" : "Major or Freelance Field"} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder={isRTL ? "مثال: هندسة برمجيات، تصميم جرافيك، طب بشري..." : "e.g., Software Engineering, Graphic Design..."}
            className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
          />
        </div>
      </div>

      {/* Primary Purpose (Multiple Selection Allowed) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            {isRTL ? "الغرض الأساسي من استخدام مساحة اديو هب؟" : "Primary Purpose for Using EduHub Space"} <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-emerald-800 bg-emerald-50 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
            {isRTL ? "يمكنك اختيار أكثر من خيار" : "Multiple selections allowed"}
          </span>
        </div>
        <div className="space-y-2">
          {[
            "حضور المحاضرات الجامعية الدراسة والتحضير للامتحانات وتقديم الاختبارات الإلكترونية",
            "تنفيذ مشاريع التخرج والأبحاث",
            "العمل الحر وتنفيذ مشاريع للعملاء",
            "حضور اجتماعات العمل عن بُعد",
            "البحث عن فرص عمل والتقديم عليها",
            "المشاركة في دورات تدريبية عبر الإنترنت",
            "إدارة متجر أو مشروع إلكتروني",
            "أخرى",
          ].map((purpose, idx) => {
            const isChecked = primaryPurposes.includes(purpose);
            return (
              <label
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                  isChecked
                    ? "bg-emerald-50/70 border-emerald-500 font-bold text-emerald-950 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  value={purpose}
                  checked={isChecked}
                  onChange={() => togglePurpose(purpose)}
                  className="text-emerald-600 focus:ring-emerald-500 rounded h-4 w-4 accent-emerald-600"
                />
                <span className="flex-1">{purpose}</span>
              </label>
            );
          })}
        </div>

        {primaryPurposes.includes("أخرى") && (
          <input
            type="text"
            value={customPurpose}
            onChange={(e) => setCustomPurpose(e.target.value)}
            placeholder={isRTL ? "يرجى توضيح الغرض بالتفصيل..." : "Please clarify your purpose..."}
            className="w-full mt-2 bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        )}
      </div>

      {/* Semester Dates or Project Duration */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          {isRTL
            ? "للطلاب: حدد متى بدأ الفصل الدراسي الحالي ومتى ينتهي / للفريلانسر: مدة المشروع الذي تعمل عليه"
            : "For students: semester start/end date / For freelancers: project duration"} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          value={durationSchedule}
          onChange={(e) => setDurationSchedule(e.target.value)}
          placeholder={isRTL ? "مثال: الفصل بدأ في 1 سبتمبر وينتهي في 15 يناير / أو: مشروع تطبيق مدته 3 أشهر" : "e.g., Semester Sept 1 to Jan 15, or 3-month contract"}
          className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
        />
      </div>

      {/* Proof Attachment (Max 10MB) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          {isRTL ? "أرفق إفادة جامعية أو صورة عن المشاريع الجارية (الحد الأقصى 10 MB)" : "Attach Academic Proof or Client Projects (Max 10MB)"} <span className="text-rose-500">*</span>
        </label>
        
        {proofFile ? (
          <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="truncate">{proofFile.name}</span>
              <span className="text-slate-400 font-normal">({(proofFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
            <button
              type="button"
              onClick={() => setProofFile(null)}
              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl bg-[#f8fafc] cursor-pointer transition-colors group">
            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-700 transition-colors mb-2" />
            <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-emerald-700">
              {isRTL ? "انقر لاختيار ملف (PDF أو صورة JPG/PNG)" : "Click to select a file (PDF, JPG, PNG)"}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              {isRTL ? "يمكنك تحميل ملف واحد متوافق. الحد الأقصى لحجم الملف: 10 MB" : "One compatible file. Maximum size: 10 MB"}
            </span>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => onFileChange(e, setProofFile)}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}

