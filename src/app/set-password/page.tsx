"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { setPasswordApi } from "@/services/applications";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ArrowBackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isLengthValid = password.length >= 8;
  const isMatchValid = password.length > 0 && password === passwordConfirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage(
        isRTL
          ? "رابط التحقق غير صالح أو غير مكتمل (رمز التحقق مفقود). يرجى فتح الرابط من بريدك الإلكتروني ثانية."
          : "Invalid or incomplete verification link (token is missing). Please open the link directly from your email."
      );
      return;
    }

    if (!isLengthValid) {
      setErrorMessage(
        isRTL
          ? "يجب ألا تقل كلمة المرور عن 8 خانات."
          : "Password must be at least 8 characters long."
      );
      return;
    }

    if (!isMatchValid) {
      setErrorMessage(
        isRTL
          ? "كلمتا المرور غير متطابقتين، يرجى التأكد من التطابق."
          : "Passwords do not match."
      );
      return;
    }

    setLoading(true);
    try {
      await setPasswordApi({
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      setErrorMessage(
        message ||
          (isRTL
            ? "تعذر تعيين كلمة المرور. قد يكون الرابط منتهي الصلاحية أو تم استخدامه مسبقاً."
            : "Could not set password. The link might be expired or already used.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#071321] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-white"
    >
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="relative h-10 w-36 brightness-110">
            <Image
              src="/images/logo.png"
              alt="EduHub Logo"
              fill
              className="object-contain object-start transition-transform group-hover:scale-102"
              priority
              unoptimized
            />
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"
        >
          <ArrowBackIcon className="w-3.5 h-3.5" />
          <span>{isRTL ? "العودة للرئيسية" : "Back to Home"}</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6">
          {success ? (
            /* Success State */
            <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {isRTL ? "تم تفعيل حسابك بنجاح! 🎉" : "Account Activated! 🎉"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {isRTL
                    ? "تم تعيين كلمة المرور الخاصة بك بنجاح، يمكنك الآن تسجيل الدخول وحجز ساعاتك الأكاديمية والمهنية."
                    : "Your password has been set successfully. You can now sign in to book your hours."}
                </p>
              </div>

              <div className="pt-3">
                <Link
                  href="/"
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>{isRTL ? "الانتقال إلى بوابة الحجز" : "Go to Booking Portal"}</span>
                  <ArrowBackIcon className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          ) : (
            /* Password Setup Form */
            <>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30 mb-3 shadow-md shadow-emerald-500/10">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {isRTL ? "تعيين كلمة المرور" : "Set Your Password"}
                </h1>
                <p className="text-xs text-slate-400">
                  {isRTL
                    ? "أهلاً بك في مساحة EduHub! يرجى اختيار كلمة مرور آمنة لحسابك لإكمال التفعيل."
                    : "Welcome to EduHub! Please choose a secure password to activate your account."}
                </p>
              </div>

              {!token && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {isRTL
                      ? "تنبيه: لم يتم العثور على رمز التحقق بالرابط. يرجى الضغط على زر 'تعيين كلمة المرور' المرفق في البريد الإلكتروني."
                      : "Notice: Verification token is missing from the URL. Please click the button inside your invitation email."}
                  </span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    {isRTL ? "كلمة المرور الجديدة" : "New Password"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ps-10 pe-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold text-slate-300 mb-1.5"
                  >
                    {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ps-10 pe-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password helper checklist */}
                <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 ${
                      isLengthValid ? "text-emerald-400 font-semibold" : "text-slate-400"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {isRTL ? "على الأقل 8 خانات" : "At least 8 characters"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      isMatchValid ? "text-emerald-400 font-semibold" : "text-slate-400"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {isRTL ? "تطابق كلمتي المرور" : "Passwords match"}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !password || !passwordConfirmation}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRTL ? "جاري الحفظ والتفعيل..." : "Saving..."}</span>
                    </>
                  ) : (
                    <span>{isRTL ? "حفظ كلمة المرور وتفعيل الحساب" : "Set Password & Activate"}</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 z-10">
        © {new Date().getFullYear()} EduHub Coworking Space — Gaza. All rights reserved.
      </footer>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#071321] flex items-center justify-center text-emerald-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <SetPasswordForm />
    </Suspense>
  );
}
