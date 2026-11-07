"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Filter,
  Lock,
} from "lucide-react";
import {
  MemberAchievementItem,
  getMemberAchievementsApi,
  createMemberAchievementApi,
  deleteMemberAchievementApi,
  CreateAchievementPayload,
} from "@/services/achievements";
import {
  AchievementCard,
  AchievementDetailsModal,
  AchievementFormModal,
} from "@/components/achievements/AchievementShowcase";

export default function MemberAchievementsTab() {
  const [achievements, setAchievements] = useState<MemberAchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<MemberAchievementItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const items = await getMemberAchievementsApi();
      setAchievements(items);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const handleCreate = async (payload: CreateAchievementPayload): Promise<boolean> => {
    setSubmitting(true);
    setFeedback(null);

    const res = await createMemberAchievementApi(payload);
    setSubmitting(false);

    if (res.success && res.data) {
      setAchievements((prev) => [res.data!, ...prev]);
      setFeedback({ type: "success", message: res.message || "تم توثيق إنجازك بنجاح وحفظ الصور بالسيرفر!" });
      setTimeout(() => setFeedback(null), 5000);
      return true;
    } else {
      setFeedback({ type: "error", message: res.message || "حدث خطأ أثناء حفظ الإنجاز." });
      return false;
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف إنجاز "${itemTitle}"؟`)) {
      return;
    }

    setDeleteLoadingId(id);
    const res = await deleteMemberAchievementApi(id);
    setDeleteLoadingId(null);

    if (res.success) {
      setAchievements((prev) => prev.filter((a) => a.id !== id));
      if (selectedAchievement?.id === id) {
        setSelectedAchievement(null);
      }
      setFeedback({ type: "success", message: "تم حذف الإنجاز بنجاح." });
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: "error", message: res.message || "تعذر حذف الإنجاز." });
    }
  };

  const filtered = achievements.filter(
    (item) => activeFilter === "all" || item.category === activeFilter
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ── Action Header Banner ── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0c2340] via-slate-900 to-teal-950 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/20">
                <Trophy className="w-5 h-5" />
              </span>
              <h3 className="text-base sm:text-xl font-black text-white">
                معرض إنجازاتك ومشروعاتك في مساحة EduHub
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-medium">
              توثيق رسمي لمشاريعك البرمجية، لقطات الشاشة، الشهادات وعقود العمل الحر مع إمكانية رفع عدة صور واختيار صورة الغلاف.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold pt-0.5">
              <Lock className="w-3 h-3" />
              <span>خاص بك وبإدارة المساحة فقط لقياس الأثر وتوثيق قصص النجاح.</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة إنجاز جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Feedback Message ── */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-2xs ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── Filter Chips ── */}
      {achievements.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold px-1 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>تصفية:</span>
          </span>
          {[
            { id: "all", label: "جميع الإنجازات" },
            { id: "project", label: "مشاريع برمجية" },
            { id: "freelance_job", label: "عقود عمل حر" },
            { id: "certificate", label: "شهادات ودورات" },
            { id: "employment", label: "توظيف وتدريب" },
            { id: "competition", label: "جوائز ومسابقات" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === f.id
                  ? "bg-[#0c2340] text-white shadow-xs ring-1 ring-[#0c2340]"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Achievements Grid ── */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs font-bold">جاري تحميل سجل إنجازاتك من السيرفر...</p>
        </div>
      ) : achievements.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-2xs flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center shadow-2xs">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-base sm:text-lg font-black text-slate-900">
            لم تسجل أي إنجاز بعد في ملفك
          </h4>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            سواء أنهيت مشروعاً، بنيت متجراً إلكترونياً، أنجزت عملاً حراً لعميل، أو حصلت على شهادة؛ وثّق نجاحك الآن مع لقطات شاشته وصورته الغلاف!
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>توثيق أول إنجاز لك الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <AchievementCard
              key={item.id}
              item={item}
              onOpenDetails={(ach) => setSelectedAchievement(ach)}
              onDelete={handleDelete}
              isDeleting={deleteLoadingId === item.id}
              canDelete={true}
            />
          ))}
        </div>
      )}

      {/* ── Details / Showcase Lightbox Modal ── */}
      <AchievementDetailsModal
        item={selectedAchievement}
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        onDelete={handleDelete}
        canDelete={true}
      />

      {/* ── Multi-Image Creation Modal with Cover Selection ── */}
      <AchievementFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={submitting}
        feedback={feedback}
      />
    </div>
  );
}
