"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, LogIn } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface MemberLoginFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  onApplyNewMember?: () => void;
}

export default function MemberLoginForm({
  email,
  onEmailChange,
  onLogin,
  loading,
  error,
  onApplyNewMember,
}: MemberLoginFormProps) {
  const { t, locale } = useLanguage();
  const isRTL = locale === "ar";
  const bp = t.bookingPortal;

  const [password, setPassword] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6 animate-in fade-in">
      <div className="text-center space-y-1.5 pb-2 border-b border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center mb-2 shadow-2xs">
          <LogIn className="w-6 h-6" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900">
          {bp?.loginTitle || (isRTL ? "تسجيل دخول الأعضاء" : "Member Login")}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {isRTL
            ? "أدخل بريدك الإلكتروني أو رقم هاتفك وكلمة المرور لمتابعة حجز المقاعد وإدارة الرصيد."
            : "Enter your registered email or phone and password to book desks."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="member-login-email" className="block text-xs font-bold text-slate-700 mb-1">
            {bp?.emailLabel || (isRTL ? "البريد الإلكتروني أو رقم الهاتف" : "Email Address or Phone")}
          </label>
          <input
            id="member-login-email"
            type="text"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={isRTL ? "example@domain.com أو 059xxxxxxx" : "example@domain.com or 059xxxxxxx"}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-start"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="member-login-password" className="block text-xs font-bold text-slate-700">
              {bp?.passwordLabel || (isRTL ? "كلمة المرور" : "Password")}
            </label>
            <button
              type="button"
              onClick={() => setForgotSent(true)}
              className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              {bp?.forgotPassword || (isRTL ? "نسيت كلمة المرور؟" : "Forgot Password?")}
            </button>
          </div>
          <input
            id="member-login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
          />
          {forgotSent && (
            <p className="mt-1.5 text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {bp?.forgotPasswordAlert ||
                  (isRTL
                    ? "سيصلك رابط إعادة التعيين عبر الإيميل المسجل."
                    : "Reset link sent to registered email.")}
              </span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer text-base active:scale-[0.99] flex items-center justify-center gap-2 disabled:bg-emerald-400"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isRTL ? "جاري التحقق وتسجيل الدخول..." : "Signing in..."}</span>
            </>
          ) : (
            <span>{bp?.signInBtn || (isRTL ? "تسجيل الدخول ومتابعة الحجز" : "Sign In to Book")}</span>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            href="/join"
            onClick={onApplyNewMember}
            className="text-xs text-slate-500 hover:text-emerald-700 font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
          >
            <span>
              {bp?.noAccountApply ||
                (isRTL
                  ? "ليس لديك حساب عضوية؟ قدّم طلب جديد"
                  : "Don't have an account? Apply for membership")}
            </span>
            <span>↗</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
