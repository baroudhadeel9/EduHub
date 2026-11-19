"use client";

import React from "react";
import {
  Trophy,
  Sparkles,
  Award,
  Briefcase,
  Code2,
  Building2,
  Zap,
  Wifi,
  Target,
  Users,
} from "lucide-react";
import { CreateAchievementPayload } from "@/services/achievements";
import { AchievementCard, AchievementCardProps } from "./AchievementCard";
import { AchievementDetailsModal, AchievementDetailsModalProps } from "./AchievementDetailsModal";
import { AchievementFormView, AchievementFormViewProps } from "./AchievementFormView";

export interface EduhubImpactOption {
  key: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeBg: string;
  border: string;
  textColor: string;
  iconColor: string;
}

export const EDUHUB_IMPACT_OPTIONS: EduhubImpactOption[] = [
  {
    key: "electricity",
    label: "طاقة وكهرباء مستمرة",
    desc: "شحن الأجهزة واستمرار العمل دون انقطاع طوال اليوم",
    icon: Zap,
    badgeBg: "bg-amber-50/90",
    border: "border-amber-200",
    textColor: "text-amber-900",
    iconColor: "text-amber-500",
  },
  {
    key: "internet",
    label: "إنترنت فايبر سريع ومستقر",
    desc: "رفع الكود والملفات وتسليم المشاريع في مواعيدها",
    icon: Wifi,
    badgeBg: "bg-sky-50/90",
    border: "border-sky-200",
    textColor: "text-sky-900",
    iconColor: "text-sky-500",
  },
  {
    key: "focus_environment",
    label: "بيئة تركيز وإنتاجية هادئة",
    desc: "ساعات عمل متواصلة خالية من التشتيت والضغوطات",
    icon: Target,
    badgeBg: "bg-emerald-50/90",
    border: "border-emerald-200",
    textColor: "text-emerald-900",
    iconColor: "text-emerald-600",
  },
  {
    key: "community",
    label: "مجتمع تقني وإرشاد متبادل",
    desc: "تبادل الخبرات وتجاوز التحديات التقنية مع الزملاء",
    icon: Users,
    badgeBg: "bg-indigo-50/90",
    border: "border-indigo-200",
    textColor: "text-indigo-900",
    iconColor: "text-indigo-600",
  },
  {
    key: "job_contract",
    label: "تسليم عميل / مقابلة عمل",
    desc: "إجراء مقابلات العمل عن بُعد وإنجاز متطلبات العملاء",
    icon: Briefcase,
    badgeBg: "bg-rose-50/90",
    border: "border-rose-200",
    textColor: "text-rose-900",
    iconColor: "text-rose-600",
  },
];

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

export { AchievementCard, AchievementDetailsModal, AchievementFormView };
export type { AchievementCardProps, AchievementDetailsModalProps, AchievementFormViewProps };

/* ════════════════════════════════════════════════════════════════════════
   BACKWARD COMPATIBLE MODAL WRAPPER (Falls back to full-view behavior)
   ════════════════════════════════════════════════════════════════════════ */
export interface AchievementFormModalProps {
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-none sm:rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border-0 sm:border border-slate-200 min-h-screen sm:min-h-0 sm:my-6 overflow-y-auto">
        <AchievementFormView
          onBack={onClose}
          onSubmit={onSubmit}
          targetName={targetName}
          isSubmitting={isSubmitting}
          feedback={feedback}
        />
      </div>
    </div>
  );
}
