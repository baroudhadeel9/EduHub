"use client";

import React from "react";
import { Trophy, Lock, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { MemberRecord } from "@/components/admin/members/data";
import { MemberAchievementItem } from "@/services/achievements";
import {
  AchievementCard,
  AchievementDetailsModal,
  AchievementFormView,
} from "@/components/achievements/AchievementShowcase";

interface MemberProfileAchievementsTabProps {
  member: MemberRecord;
  isRTL: boolean;
  achievementModalOpen: boolean;
  setAchievementModalOpen: (open: boolean) => void;
  achievementSubmitting: boolean;
  achievementFeedback: { type: "success" | "error"; message: string } | null;
  handleSaveAchievement: (data: any) => Promise<boolean>;
  selectedAchievement: MemberAchievementItem | null;
  setSelectedAchievement: (item: MemberAchievementItem | null) => void;
  handleDeleteAchievement: (id: string, itemTitle: string) => void | Promise<void>;
  deletingAchievementId: string | number | null;
}

export default function MemberProfileAchievementsTab({
  member,
  isRTL,
  achievementModalOpen,
  setAchievementModalOpen,
  achievementSubmitting,
  achievementFeedback,
  handleSaveAchievement,
  selectedAchievement,
  setSelectedAchievement,
  handleDeleteAchievement,
  deletingAchievementId,
}: MemberProfileAchievementsTabProps) {
  if (achievementModalOpen) {
    return (
      <AchievementFormView
        onBack={() => setAchievementModalOpen(false)}
        onSubmit={handleSaveAchievement}
        targetName={member.name}
        isSubmitting={achievementSubmitting}
        feedback={achievementFeedback}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent rounded-3xl border border-amber-200/70 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#0c2340]">
              {isRTL ? "معرض إنجازات ومشاريع العضو المعتمدة" : "Verified Member Projects & Portfolio"}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {isRTL
                  ? "سجل خاص: مرئي للعضو ولإدارة الحاضنة فقط لتوثيق الأثر والنجاحات المهنية."
                  : "Private portfolio: visible only to this member and workspace administration."}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <span className="text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
            {isRTL ? `إجمالي المشاريع: ${member.achievements?.length || 0}` : `Total: ${member.achievements?.length || 0}`}
          </span>
          <button
            type="button"
            onClick={() => setAchievementModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRTL ? "توثيق مشروع جديد" : "Add Project"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {achievementFeedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-2xs ${
            achievementFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {achievementFeedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{achievementFeedback.message}</span>
        </div>
      )}

      {/* Professional Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {(member.achievements || []).map((item: MemberAchievementItem) => (
          <AchievementCard
            key={item.id}
            item={item}
            onOpenDetails={(ach) => setSelectedAchievement(ach)}
            onDelete={handleDeleteAchievement}
            isDeleting={deletingAchievementId === item.id}
            canDelete={true}
          />
        ))}
      </div>

      {/* Empty State */}
      {(member.achievements || []).length === 0 && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 shadow-2xs">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-black text-[#0c2340]">
              {isRTL ? "لم يسجل العضو أي إنجازات أو مشاريع حتى الآن" : "No achievements recorded yet"}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {isRTL
                ? "يمكن للعضو توثيق مشاريعه البرمجية وصورها وعقود العمل والشهادات من حسابه الخاص، أو يمكنك كإدارة توثيقها هنا مع إمكانية رفع عدة صور واختيار صورة الغلاف."
                : "The member can document projects from their portal, or you can add them directly with multiple photos."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAchievementModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isRTL ? "توثيق أول مشروع للعضو" : "Add First Project"}</span>
          </button>
        </div>
      )}

      {/* Lightbox / Details Modal */}
      <AchievementDetailsModal
        item={selectedAchievement}
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        onDelete={handleDeleteAchievement}
        canDelete={true}
      />
    </div>
  );
}
