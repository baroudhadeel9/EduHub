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
  ChevronDown,
} from "lucide-react";

export default function MembershipIntakeModeControl() {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  const [currentMode, setCurrentMode] = useState<MembershipIntakeMode>("full");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const getActiveBadge = () => {
    switch (currentMode) {
      case "short":
        return {
          label: isRTL ? "النموذج السريع" : "Express Form",
          icon: Zap,
          style: "bg-amber-50 text-amber-800 border-amber-300/80",
          iconColor: "text-amber-600",
        };
      case "closed":
        return {
          label: isRTL ? "التسجيل مغلق" : "Registration Closed",
          icon: Lock,
          style: "bg-rose-50 text-rose-800 border-rose-300/80",
          iconColor: "text-rose-600",
        };
      case "full":
      default:
        return {
          label: isRTL ? "النموذج الكامل" : "Full Application",
          icon: ClipboardList,
          style: "bg-emerald-50 text-emerald-800 border-emerald-300/80",
          iconColor: "text-emerald-600",
        };
    }
  };

  const activeBadge = getActiveBadge();
  const ActiveIcon = activeBadge.icon;

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
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs transition-all overflow-hidden">
      {/* Clickable Header Bar (Accordion Trigger) */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-3.5 sm:p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
      >
        {/* Title and Icon */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
            <Settings2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {isRTL ? "نموذج استقبال العضويات" : "Membership Intake Control"}
              </h2>
              {/* Active Mode Pill badge */}
              {!loading && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${activeBadge.style}`}
                >
                  <ActiveIcon className={`w-3.5 h-3.5 ${activeBadge.iconColor}`} />
                  <span>{activeBadge.label}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
              {isRTL
                ? "حدد طريقة استقبال طلبات الانضمام المعروضة في صفحة التسجيل العامة (/join)."
                : "Choose the registration mode active on the public join portal (/join)."}
            </p>
          </div>
        </div>

        {/* Controls: Preview link & Toggle button */}
        <div
          className="flex items-center gap-2 shrink-0 ms-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href="/join"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title={isRTL ? "فتح صفحة التسجيل في نافذة جديدة" : "Open join page in new tab"}
          >
            <span className="hidden xs:inline">{isRTL ? "معاينة" : "Preview"}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer border border-emerald-200/70"
          >
            <span>{isOpen ? (isRTL ? "إغلاق" : "Close") : (isRTL ? "تغيير" : "Change")}</span>
            <ChevronDown
              className={`w-4 h-4 text-emerald-700 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-3.5 sm:p-5 pt-1 border-t border-slate-100 space-y-4 bg-slate-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs text-slate-500 sm:hidden">
            {isRTL
              ? "اختر النموذج الذي يظهر للمتقدمين عند الدخول لصفحة التسجيل (/join):"
              : "Select which form visitors see on the registration page (/join):"}
          </p>

          {/* Loading state indicator */}
          {loading ? (
            <div className="py-6 flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>{isRTL ? "جاري تحميل الحالة الحالية من الخادم..." : "Fetching intake mode from server..."}</span>
            </div>
          ) : (
            /* The 3 Selection Cards */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {modesConfig.map((item) => {
                const isSelected = currentMode === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMode(item.id)}
                    disabled={updating}
                    className={`text-start p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                      isSelected
                        ? item.activeBorder
                        : "border-slate-200 hover:border-slate-300 hover:bg-white bg-white/80"
                    } ${updating ? "opacity-60 cursor-wait" : ""}`}
                  >
                    {/* Top: Icon */}
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">{item.title}</span>
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
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
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
      )}
    </div>
  );
}
