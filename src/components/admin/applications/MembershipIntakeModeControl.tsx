"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  getMembershipIntakeModeApi,
  updateMembershipIntakeModeApi,
  MembershipIntakeMode,
} from "@/services/applications";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Zap,
  ClipboardList,
  ExternalLink,
  Settings2,
} from "lucide-react";

export default function MembershipIntakeModeControl() {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  const [currentMode, setCurrentMode] = useState<MembershipIntakeMode>("full");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load current mode on mount
  useEffect(() => {
    let mounted = true;
    getMembershipIntakeModeApi()
      .then((mode) => {
        if (mounted) {
          setCurrentMode(mode);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to load intake mode:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectMode = async (mode: MembershipIntakeMode) => {
    if (mode === currentMode || updating) return;

    setUpdating(true);
    setFeedback(null);

    try {
      const res = await updateMembershipIntakeModeApi(mode);
      setCurrentMode(res.mode);
      setFeedback({
        type: "success",
        message:
          mode === "closed"
            ? isRTL
              ? "تم إغلاق باب التقديم بنجاح. سيظهر للزوار رسالة «لا يوجد انضمام عضوية حالياً»."
              : "Membership intake closed. Visitors will now see the closed intake notice."
            : mode === "short"
            ? isRTL
              ? "تم تفعيل النموذج السريع (البيانات الأساسية فقط: الاسم، الجوال، الإيميل، التصنيف، الجنس)."
              : "Express intake mode activated (basic information only)."
            : isRTL
            ? "تم تفعيل النموذج الكامل (4 خطوات مفصلة)."
            : "Full 4-step membership intake form activated.",
      });

      // Clear success feedback after 5 seconds
      setTimeout(() => {
        setFeedback((prev) => (prev?.type === "success" ? null : prev));
      }, 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setFeedback({
        type: "error",
        message: msg || (isRTL ? "تعذر تحديث الإعدادات في الخادم." : "Failed to update intake mode on server."),
      });
    } finally {
      setUpdating(false);
    }
  };

  const modesConfig = [
    {
      id: "full" as const,
      title: isRTL ? "النموذج الكامل (4 خطوات)" : "Full Application (4 Steps)",
      subtitle: isRTL
        ? "النموذج الشامل: البيانات الشخصية، التخصص الأكاديمي، الأجهزة والطاقة، والإقرارات."
        : "Comprehensive intake: personal info, academic status, power needs, and declarations.",
      activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40",
      icon: ClipboardList,
      iconColor: "text-emerald-600 bg-emerald-100",
    },
    {
      id: "short" as const,
      title: isRTL ? "النموذج السريع (بيانات أساسية)" : "Express Form (Basic Info)",
      subtitle: isRTL
        ? "بيانات أساسية فقط: الاسم الكامل، رقم الجوال، الإيميل، طالب أو فريلانسر، والجنس."
        : "Basic essentials only: Full name, phone, email, category (student/freelancer), and gender.",
      activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40",
      icon: Zap,
      iconColor: "text-amber-600 bg-amber-100",
    },
    {
      id: "closed" as const,
      title: isRTL ? "إغلاق باب الانضمام" : "Close Registration",
      subtitle: isRTL
        ? "يظهر للزائر رسالة: «لا يوجد انضمام عضوية حالياً»، ويرفض السيرفر أي تسجيلات جديدة."
        : "Shows 'Applications closed' message to visitors and strictly rejects new submissions.",
      activeBorder: "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40",
      icon: Lock,
      iconColor: "text-rose-600 bg-rose-100",
    },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isRTL ? "التحكم في نموذج استقبال العضويات" : "Membership Intake Control"}
            </h2>
            <p className="text-xs text-slate-500">
              {isRTL
                ? "حدد طريقة استقبال طلبات الانضمام المعروضة في صفحة التسجيل العامة (/join)."
                : "Choose the registration mode active on the public join portal (/join)."}
            </p>
          </div>
        </div>

        {/* Live preview link */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <Link
            href="/join"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title={isRTL ? "فتح صفحة التسجيل في نافذة جديدة" : "Open join page in new tab"}
          >
            <span>{isRTL ? "معاينة صفحة التسجيل" : "Preview /join"}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Loading state indicator */}
      {loading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>{isRTL ? "جاري تحميل الحالة الحالية من الخادم..." : "Fetching intake mode from server..."}</span>
        </div>
      ) : (
        /* The 3 Selection Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {modesConfig.map((item) => {
            const isSelected = currentMode === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectMode(item.id)}
                disabled={updating}
                className={`text-start p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                  isSelected
                    ? item.activeBorder
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white"
                } ${updating ? "opacity-60 cursor-wait" : ""}`}
              >
                {/* Top: Icon */}
                <div className="flex items-center justify-between w-full">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Middle: Title & Description */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{item.title}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.subtitle}</p>
                </div>

                {/* Bottom: Selection status radio pill */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`font-bold ${isSelected ? "text-slate-900" : "text-slate-400"}`}>
                    {isSelected
                      ? isRTL
                        ? "✓ مفعل حالياً"
                        : "✓ Active Now"
                      : isRTL
                      ? "انقر للتفعيل"
                      : "Click to activate"}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
        </div>
      )}
    </div>
  );
}
