"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  submitShortMembershipApplicationApi,
  ShortMembershipApplicationPayload,
} from "@/services/applications";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  LogIn,
} from "lucide-react";

interface CompactMemberFormProps {
  onReturnToHub?: () => void;
}

export default function CompactMemberForm({ onReturnToHub }: CompactMemberFormProps) {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Form State
  const [formData, setFormData] = useState<ShortMembershipApplicationPayload>({
    fullName: "",
    phone: "",
    email: "",
    category: "student",
    gender: "male",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName.trim()) {
      setError(isRTL ? "يرجى إدخال الاسم الكامل ثلاثياً." : "Please enter your full name.");
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 9) {
      setError(isRTL ? "يرجى إدخال رقم هاتف / واتساب صحيح للتواصل." : "Please enter a valid phone number.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError(isRTL ? "يرجى إدخال بريد إلكتروني صالح." : "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await submitShortMembershipApplicationApi(formData);
      setSuccessMessage(
        res.message ||
          (isRTL
            ? "تم استلام طلب عضويتك بنجاح! سيتم مراجعة بياناتك وتفعيل حسابك قريباً."
            : "Your membership application has been received successfully!")
      );
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || (isRTL ? "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة ثانية." : "Failed to submit application."));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6 sm:py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isRTL ? "النموذج السريع المعتمد" : "Fast Intake Processed"}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {isRTL ? "تم استلام طلبك بنجاح!" : "Application Received!"}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {successMessage}
          </p>

          <p className="text-xs text-slate-500 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            {isRTL
              ? "سيتم إشعارك عبر البريد الإلكتروني ورسائل الواتساب بمجرد اعتماد الطلب لتتمكن من حجز مقعدك فوراً."
              : "You will be notified via email & WhatsApp once verified so you can book your desk."}
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{isRTL ? "الانتقال لبوابة تسجيل الدخول" : "Go to Member Login"}</span>
          </Link>

          <Link
            href="/"
            onClick={onReturnToHub}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{isRTL ? "العودة للرئيسية" : "Return Home"}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="text-center space-y-1.5 pb-2 border-b border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isRTL ? "طلب عضوية سريع ومباشر" : "Express Membership Application"}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {isRTL ? "البيانات الأساسية للانضمام" : "Basic Membership Information"}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {isRTL
            ? "أدخل بياناتك الأساسية للتحقق وحجز مقعدك في المساحة."
            : "Enter your essential contact details to verify your membership."}
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="compact-fullname" className="block text-xs font-bold text-slate-700 mb-1">
          {isRTL ? "الاسم الكامل (ثلاثي)" : "Full Name"} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            id="compact-fullname"
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder={isRTL ? "مثال: محمد أحمد علي" : "e.g., Mohammed Ahmed Ali"}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="compact-phone" className="block text-xs font-bold text-slate-700 mb-1">
          {isRTL ? "رقم الجوال / الواتساب" : "Phone / WhatsApp"} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            id="compact-phone"
            type="tel"
            required
            dir="ltr"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="059xxxxxxx / 056xxxxxxx"
            className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white text-start font-mono"
          />
        </div>
      </div>

      {/* Email Address */}
      <div>
        <label htmlFor="compact-email" className="block text-xs font-bold text-slate-700 mb-1">
          {isRTL ? "البريد الإلكتروني" : "Email Address"} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="compact-email"
            type="email"
            required
            dir="ltr"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@example.com"
            className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white text-start font-mono"
          />
        </div>
      </div>

      {/* Category: Student or Freelancer */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {isRTL ? "الصفة الأكاديمية / المهنية" : "Member Category"} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, category: "student" })}
            className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              formData.category === "student"
                ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-2 ring-emerald-500/20"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{isRTL ? "طالب/ة جامعي" : "University Student"}</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, category: "freelancer" })}
            className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              formData.category === "freelancer"
                ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs ring-2 ring-indigo-500/20"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-700 shrink-0" />
            <span>{isRTL ? "مستقل / فريلانسر" : "Freelancer"}</span>
          </button>
        </div>
      </div>

      {/* Gender: Male or Female */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          {isRTL ? "الجنس" : "Gender"} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, gender: "male" })}
            className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              formData.gender === "male"
                ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>{isRTL ? "ذكر" : "Male"}</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, gender: "female" })}
            className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              formData.gender === "female"
                ? "bg-purple-700 border-purple-700 text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span>{isRTL ? "أنثى" : "Female"}</span>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm sm:text-base active:scale-[0.99] flex items-center justify-center gap-2 disabled:bg-emerald-400"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isRTL ? "جاري إرسال الطلب..." : "Submitting..."}</span>
            </>
          ) : (
            <>
              <span>{isRTL ? "إرسال طلب الانضمام الآن" : "Submit Membership Application"}</span>
              <ArrowIcon className="w-4 h-4 shrink-0" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

