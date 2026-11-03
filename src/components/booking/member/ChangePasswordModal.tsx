"use client";

import React, { useState } from "react";
import { KeyRound, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { changeMemberPasswordApi } from "@/services/applications";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  authToken: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  authToken,
}: ChangePasswordModalProps) {
  const { locale } = useLanguage();
  const isRTL = locale === "ar";

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPass) {
      setErrorMsg(isRTL ? "يرجى إدخال كلمة المرور الحالية." : "Please enter your current password.");
      return;
    }
    if (newPass.length < 6) {
      setErrorMsg(
        isRTL
          ? "كلمة المرور الجديدة يجب أن تتكون من 6 خانات على الأقل."
          : "New password must be at least 6 characters."
      );
      return;
    }
    if (newPass !== confirmPass) {
      setErrorMsg(isRTL ? "كلمتا المرور الجديدتان غير متطابقتين." : "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await changeMemberPasswordApi(authToken, currentPass, newPass, confirmPass);
      setSuccessMsg(
        res.message || (isRTL ? "تم تغيير كلمة المرور بنجاح!" : "Password changed successfully!")
      );
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setErrorMsg(
        msg ||
          (isRTL
            ? "تعذر تغيير كلمة المرور، يرجى التأكد من كلمة المرور الحالية."
            : "Failed to change password.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                {isRTL ? "تغيير كلمة المرور" : "Change Password"}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isRTL ? "قم بتعيين كلمة مرور خاصة وسهلة التذكر" : "Set a secure personal password"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRTL ? "كلمة المرور الحالية (المؤقتة):" : "Current (Temporary) Password:"}
            </label>
            <input
              type="password"
              required
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRTL ? "كلمة المرور الجديدة:" : "New Password:"}
            </label>
            <input
              type="password"
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isRTL ? "تأكيد كلمة المرور الجديدة:" : "Confirm New Password:"}
            </label>
            <input
              type="password"
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-400"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRTL ? "جاري التحديث..." : "Updating..."}</span>
                </>
              ) : (
                <span>{isRTL ? "حفظ كلمة المرور الجديدة" : "Save New Password"}</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

