"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { MemberRecord } from "@/components/admin/members/data";
import {
  getAdminMembersApi,
  getAdminMemberDetailsApi,
  updateAdminMemberApi,
  sendSingleSmsApi,
} from "@/services/applications";
import {
  createAdminMemberAchievementApi,
  deleteAdminMemberAchievementApi,
  CreateAchievementPayload,
  MemberAchievementItem,
} from "@/services/achievements";
import {
  getAdminMemberSupportTicketsApi,
  SupportTicketItem,
} from "@/services/supportTickets";
import MemberProfileTicketsTab from "@/components/admin/members/profile/MemberProfileTicketsTab";
import MemberProfileSmsModal from "@/components/admin/members/profile/MemberProfileSmsModal";
import MemberProfileAchievementsTab from "@/components/admin/members/profile/MemberProfileAchievementsTab";
import MemberProfileBookingsTab from "@/components/admin/members/profile/MemberProfileBookingsTab";
import MemberProfileDuesTab from "@/components/admin/members/profile/MemberProfileDuesTab";
import { MemberResendActivationModal } from "@/components/admin/members/MemberResendActivationModal";
import { MemberWhatsAppModal } from "@/components/admin/members/MemberWhatsAppModal";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Menu,
  Send,
  MessageSquare,
  KeyRound,
  UserCheck,
  UserX,
  GraduationCap,
  Briefcase,
  Zap,
  Loader2,
  Trophy,
  ExternalLink,
  Lock,
  Tag,
  Code2,
  Plus,
  Trash2,
  Filter,
  Image as ImageIcon,
  Upload,
  X,
  Sparkles,
  LifeBuoy,
  HelpCircle,
  Wifi,
  Armchair,
  Building2,
  Check,
  RefreshCw,
} from "lucide-react";

interface MemberProfileViewProps {
  memberId: string;
}

export default function MemberProfileView({ memberId }: MemberProfileViewProps) {
  const { locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ArrowBackIcon = isRTL ? ArrowRight : ArrowLeft;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<MemberRecord | null>(null);

  useEffect(() => {
    async function loadMember() {
      setLoading(true);
      try {
        const details = await getAdminMemberDetailsApi(memberId);
        if (details) {
          setMember({
            ...details,
            history: details.history || [],
            hoursUsed: details.hoursUsed || 0,
            hoursLimit: details.hoursLimit || 35,
            remainingHours: details.remainingHours ?? Math.max(0, (details.hoursLimit || 35) - (details.hoursUsed || 0)),
            dueAmount: details.dueAmount || 0,
            lastBooking: details.lastBooking || (isRTL ? "لا يوجد حجز بعد" : "No bookings yet"),
            registration: details.registration || undefined,
            achievements: details.achievements || [],
            achievementsCount: details.achievementsCount || (details.achievements?.length ?? 0),
          });
        } else {
          // Fallback to list search if details endpoint was unreachable
          const list = await getAdminMembersApi();
          const found = (list as MemberRecord[]).find((m) => String(m.id) === String(memberId));
          if (found) {
            setMember({
              ...found,
              history: found.history || [],
              hoursUsed: found.hoursUsed || 0,
              hoursLimit: found.hoursLimit || 35,
              remainingHours: found.remainingHours ?? Math.max(0, (found.hoursLimit || 35) - (found.hoursUsed || 0)),
              dueAmount: found.dueAmount || 0,
              lastBooking: found.lastBooking || (isRTL ? "لا يوجد حجز بعد" : "No bookings yet"),
              achievements: found.achievements || [],
              achievementsCount: found.achievementsCount || (found.achievements?.length ?? 0),
            });
          } else {
            setMember(null);
          }
        }
      } catch (err) {
        console.error("Failed to load member:", err);
        setMember(null);
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, [memberId, isRTL]);

  // Active view tab: "achievements" | "bookings" | "dues" | "tickets"
  const [activeTab, setActiveTab] = useState<"achievements" | "bookings" | "dues" | "tickets">("achievements");
  const [dueSettled, setDueSettled] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Member Support Tickets & Complaints State
  const [memberTickets, setMemberTickets] = useState<SupportTicketItem[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const loadMemberTickets = async () => {
    if (!memberId) return;
    try {
      setTicketsLoading(true);
      const res = await getAdminMemberSupportTicketsApi(memberId);
      if (res.success) {
        setMemberTickets(res.data);
      }
    } catch (err) {
      console.error("Failed to load member tickets:", err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    loadMemberTickets();
  }, [memberId]);

  // SMS Modal State (Live TweetSMS Delivery)
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const [smsSending, setSmsSending] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Activation Link & Password Setup Modal State
  const [activationModalOpen, setActivationModalOpen] = useState(false);

  // WhatsApp Messaging Modal State
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);

  const handleOpenSmsModal = () => {
    setSmsMessage(`مرحباً ${member?.name || ""}، نود إعلامك من مساحة إديو هب غزة: `);
    setSmsFeedback(null);
    setSmsModalOpen(true);
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !smsMessage.trim()) return;

    const phone = member.registration?.phone || member.phone;
    if (!phone) {
      setSmsFeedback({ type: "error", text: "لا يوجد رقم جوال مسجل لهذا العضو." });
      return;
    }

    setSmsSending(true);
    setSmsFeedback(null);

    try {
      const res = await sendSingleSmsApi(phone, smsMessage.trim(), member.name);
      setSmsSending(false);
      if (res.success) {
        setSmsFeedback({ type: "success", text: `تم إرسال رسالة SMS إلى ${member.name} (${phone}) بنجاح!` });
        setTimeout(() => {
          setSmsModalOpen(false);
          setSmsMessage("");
          setSmsFeedback(null);
        }, 2200);
      } else {
        setSmsFeedback({ type: "error", text: res.message || "فشل إرسال الرسالة." });
      }
    } catch (err: unknown) {
      setSmsSending(false);
      const errMsg = err instanceof Error ? err.message : "حدث خطأ أثناء إرسال الرسالة.";
      setSmsFeedback({ type: "error", text: errMsg });
    }
  };

  // Achievements State (Admin management)
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [achievementSubmitting, setAchievementSubmitting] = useState(false);
  const [achievementFilter, setAchievementFilter] = useState<string>("all");
  const [achievementFeedback, setAchievementFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deletingAchievementId, setDeletingAchievementId] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<MemberAchievementItem | null>(null);

  const handleSaveAchievement = async (payload: CreateAchievementPayload): Promise<boolean> => {
    if (!member) return false;

    setAchievementSubmitting(true);
    setAchievementFeedback(null);

    const res = await createAdminMemberAchievementApi(member.id, payload);
    setAchievementSubmitting(false);

    if (res.success && res.data) {
      const updatedList = [res.data, ...(member.achievements || [])];
      setMember({
        ...member,
        achievements: updatedList,
        achievementsCount: updatedList.length,
      });
      setAchievementFeedback({ type: "success", message: "تم توثيق المشروع للعضو بنجاح!" });
      setTimeout(() => setAchievementFeedback(null), 5000);
      return true;
    } else {
      setAchievementFeedback({ type: "error", message: res.message || "فشل حفظ المشروع." });
      return false;
    }
  };

  const handleDeleteAchievement = async (id: string, itemTitle: string) => {
    if (!member) return;
    if (!window.confirm(`هل أنت متأكد من حذف إنجاز "${itemTitle}"؟`)) return;

    setDeletingAchievementId(id);
    const res = await deleteAdminMemberAchievementApi(id);
    setDeletingAchievementId(null);

    if (res.success) {
      const updatedList = (member.achievements || []).filter((a) => a.id !== id);
      setMember({
        ...member,
        achievements: updatedList,
        achievementsCount: updatedList.length,
      });
      if (selectedAchievement?.id === id) {
        setSelectedAchievement(null);
      }
      setAchievementFeedback({ type: "success", message: "تم حذف الإنجاز بنجاح." });
      setTimeout(() => setAchievementFeedback(null), 4000);
    } else {
      setAchievementFeedback({ type: "error", message: res.message || "تعذر حذف الإنجاز." });
    }
  };

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-700">
          {isRTL ? "جاري تحميل بيانات العضو الرسمية..." : "Loading member profile..."}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div dir={dir} className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {isRTL ? "العضو غير موجود" : "Member Not Found"}
        </h2>
        <p className="text-sm text-slate-500 mb-6 max-w-sm">
          {isRTL ? "لم يتم العثور على سجل العضو المطلوب في قاعدة البيانات." : "The requested member record was not found."}
        </p>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
        >
          <ArrowBackIcon className="w-4 h-4" />
          <span>{isRTL ? "العودة إلى دليل الأعضاء" : "Back to Members"}</span>
        </Link>
      </div>
    );
  }

  const reg = member.registration;
  const percentage = Math.min(
    100,
    Math.round((member.hoursUsed / member.hoursLimit) * 100)
  );

  const handleToggleStatus = async () => {
    if (!member) return;
    const newStatus = member.status === "suspended" ? "active" : "suspended";
    setToggleLoading(true);
    try {
      await updateAdminMemberApi(member.id, { status: newStatus });
      setMember((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert(
        msg ||
          (isRTL
            ? "فشل تحديث حالة العضوية على السيرفر."
            : "Failed to update member status on server.")
      );
    } finally {
      setToggleLoading(false);
    }
  };

  const handleSettleDues = () => {
    setDueSettled(true);
    setMember((prev) => (prev ? { ...prev, dueAmount: 0, extraHours: 0 } : prev));
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white"
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab="members"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-72" : "lg:ml-72"
        }`}
      >
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          
          {/* ─── Top Bar Navigation ─── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link
              href="/admin/members"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 text-xs sm:text-sm font-bold transition-all shadow-xs group cursor-pointer"
            >
              <ArrowBackIcon className="w-4 h-4 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform text-emerald-600" />
              <span>{isRTL ? "العودة إلى دليل الأعضاء" : "Back to Members Directory"}</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50 lg:hidden cursor-pointer"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* ─── Member Hero Identity Card (Refined & Softened) ─── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              
              {/* Avatar, Name & Category */}
              <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-xs border border-slate-200/80 ${member.avatarColor}`}
                >
                  {member.avatarLetter}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-2xl font-black text-[#0c2340] tracking-tight truncate">
                      {reg?.fullName || member.name}
                    </h1>

                    {/* Member Category Badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      {member.type === "freelancer" ? (
                        <>
                          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isRTL ? "مستقل / Freelancer" : "Freelancer"}</span>
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isRTL ? "طالب/ة جامعي" : "Student"}</span>
                        </>
                      )}
                    </span>

                    {/* Status Badge */}
                    {member.status === "active" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {isRTL ? "عضوية نشطة" : "Active"}
                      </span>
                    )}
                    {member.status === "suspended" && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {isRTL ? "عضوية موقوفة 🚫" : "Suspended"}
                      </span>
                    )}
                  </div>

                  {/* Specialty and University */}
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed truncate">
                    {reg?.specialty || member.specialty}
                    {reg?.university && (
                      <span className="text-slate-400 font-normal"> • {reg.university}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Admin Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab("dues")}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isRTL ? "تعديل الحصة" : "Adjust Quota"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWhatsAppModalOpen(true)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  title={isRTL ? "مراسلة العضو عبر واتساب" : "Message on WhatsApp"}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isRTL ? "مراسلة واتساب" : "WhatsApp"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivationModalOpen(true)}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${
                    (member.status === "active" || member.hasPassword)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                  title={
                    (member.status === "active" || member.hasPassword)
                      ? isRTL ? "إعادة تعيين كلمة المرور للعضو" : "Reset Password"
                      : isRTL ? "إرسال رابط التفعيل وتعيين كلمة المرور" : "Send Activation Link"
                  }
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>
                    {(member.status === "active" || member.hasPassword)
                      ? isRTL ? "إعادة تعيين كلمة المرور" : "Reset Password"
                      : isRTL ? "إرسال رابط التفعيل" : "Send Activation"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenSmsModal}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isRTL ? "إرسال رسالة SMS" : "Send SMS"}</span>
                </button>

                <button
                  type="button"
                  disabled={toggleLoading}
                  onClick={handleToggleStatus}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                    member.status === "suspended"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  } ${toggleLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {toggleLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : member.status === "suspended" ? (
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <UserX className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>
                    {member.status === "suspended"
                      ? isRTL ? "تنشيط العضوية" : "Activate"
                      : isRTL ? "توقيف العضوية" : "Suspend"}
                  </span>
                </button>
              </div>

            </div>

            {/* Quick Metadata Horizontal Chips */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 flex-wrap pt-2 border-t border-slate-100 font-medium">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/70 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{isRTL ? `الهوية: ${reg?.nationalId || member.nationalId || "401982736"}` : `ID: ${reg?.nationalId || member.nationalId}`}</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/70 font-mono text-[11px]" dir="ltr">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{reg?.phone ? `0${reg.phone.replace(/^0+/, '')}` : member.phone}</span>
                <span className="text-[9px] text-emerald-700 bg-emerald-100/70 px-1 rounded font-bold">SMS</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/70 text-[11px]">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[200px]">{member.email}</span>
              </div>

              {reg?.governorate && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/70 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{reg.governorate}</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 border border-slate-200/70 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{isRTL ? `تاريخ الانضمام: ${member.joinedDate}` : `Joined: ${member.joinedDate}`}</span>
              </div>
            </div>
          </div>

          {/* ─── Harmonious Monthly Quota & Balance Card ─── */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border border-emerald-100/90 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/80 shadow-2xs">
                  <Clock className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#0c2340]">
                    {isRTL
                      ? `استخدم ${member.hoursUsed} من ${member.hoursLimit} ساعة في الدورة الحالية`
                      : `Used ${member.hoursUsed} of ${member.hoursLimit} hours in current cycle`}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isRTL
                      ? `نسبة الاستهلاك ${percentage}% • أقصى حجز مسموح به 8 ساعات يومياً`
                      : `Usage ${percentage}% • Daily limit: 8 hours`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-white px-3.5 py-1.5 rounded-full border border-emerald-200/90 shadow-2xs">
                  {isRTL
                    ? `الرصيد المتبقي: ${member.remainingHours} ${member.remainingHours >= 3 && member.remainingHours <= 10 ? "ساعات" : "ساعة"}`
                    : `Remaining: ${member.remainingHours} hours`}
                </span>
              </div>
            </div>

            {/* Quota Progress Bar */}
            <div className="w-full bg-emerald-100/70 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  member.status === "extra_hours"
                    ? "bg-rose-500"
                    : member.status === "near_limit"
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Bottom 3-Metric Aligned Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-emerald-100/80 text-xs">
              {/* Due Fees */}
              <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/80 px-3.5 py-2.5 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRTL ? "المستحقات المالية:" : "Due Fees:"}</span>
                </div>
                {member.dueAmount > 0 && !dueSettled ? (
                  <div className="flex items-center gap-1.5 font-bold text-rose-600">
                    <span>{member.dueAmount} ₪</span>
                    <button
                      type="button"
                      onClick={handleSettleDues}
                      className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-0.5 rounded border border-rose-200 transition-colors cursor-pointer"
                    >
                      {isRTL ? "تسوية الآن" : "Settle"}
                    </button>
                  </div>
                ) : (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isRTL ? "0 ₪ (لا توجد مستحقات)" : "0 NIS"}</span>
                  </span>
                )}
              </div>

              {/* Last Booking */}
              <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/80 px-3.5 py-2.5 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRTL ? "آخر حجز مسجل:" : "Last Booking:"}</span>
                </div>
                <span className="font-bold text-slate-800">{member.lastBooking}</span>
              </div>

              {/* Renewal Cycle */}
              <div className="flex items-center justify-between sm:justify-start gap-2 bg-white/80 px-3.5 py-2.5 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRTL ? "دورة التجديد:" : "Renewal:"}</span>
                </div>
                <span className="font-bold text-slate-800">
                  {(member as any).renewalDate
                    ? (isRTL
                        ? `يتجدد في ${(member as any).renewalDate} (متبقي ${(member as any).daysUntilRenewal ?? ''} يوم)`
                        : `Renews on ${(member as any).renewalDate}`)
                    : (isRTL ? "شهرياً من تاريخ اعتماد العضوية" : "Monthly on activation date")}
                </span>
              </div>
            </div>
          </div>

          {/* ─── Segmented Navigation Tabs Switcher (4 Tabs: Achievements, Bookings, Quota, Tickets) ─── */}
          <div className="p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5" role="tablist">
              
              {/* Tab 1: Member Achievements */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "achievements"}
                onClick={() => setActiveTab("achievements")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === "achievements"
                    ? "bg-[#0c2340] text-white shadow-xs ring-1 ring-[#0c2340]"
                    : "text-slate-600 hover:text-[#0c2340] hover:bg-white/80"
                }`}
              >
                <Trophy className={`w-4 h-4 ${activeTab === "achievements" ? "text-amber-400" : "text-amber-500"}`} />
                <span>
                  {isRTL
                    ? `إنجازات العضو (${member.achievements?.length || 0})`
                    : `Achievements (${member.achievements?.length || 0})`}
                </span>
              </button>

              {/* Tab 2: Bookings & Visits */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "bookings"}
                onClick={() => setActiveTab("bookings")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === "bookings"
                    ? "bg-[#0c2340] text-white shadow-xs ring-1 ring-[#0c2340]"
                    : "text-slate-600 hover:text-[#0c2340] hover:bg-white/80"
                }`}
              >
                <Calendar className={`w-4 h-4 ${activeTab === "bookings" ? "text-emerald-400" : "text-slate-500"}`} />
                <span>
                  {isRTL
                    ? `سجل الحجوزات (${member.history.length})`
                    : `Bookings (${member.history.length})`}
                </span>
              </button>

              {/* Tab 3: Quota & Policy */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "dues"}
                onClick={() => setActiveTab("dues")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === "dues"
                    ? "bg-[#0c2340] text-white shadow-xs ring-1 ring-[#0c2340]"
                    : "text-slate-600 hover:text-[#0c2340] hover:bg-white/80"
                }`}
              >
                <CreditCard className={`w-4 h-4 ${activeTab === "dues" ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{isRTL ? "الرصيد والحصص" : "Quota & Policy"}</span>
              </button>

              {/* Tab 4: Member Support Tickets & Issues */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "tickets"}
                onClick={() => setActiveTab("tickets")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  activeTab === "tickets"
                    ? "bg-[#0c2340] text-white shadow-xs ring-1 ring-[#0c2340]"
                    : "text-slate-600 hover:text-[#0c2340] hover:bg-white/80"
                }`}
              >
                <LifeBuoy className={`w-4 h-4 ${activeTab === "tickets" ? "text-rose-400" : "text-rose-500"}`} />
                <span>
                  {isRTL
                    ? `تذاكر الدعم والشكاوى (${memberTickets.length})`
                    : `Support Tickets (${memberTickets.length})`}
                </span>
                {memberTickets.some((t) => t.status === "open") && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </button>

            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════
              TAB 1: MEMBER ACHIEVEMENTS (Private & Verified)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === "achievements" && (
            <MemberProfileAchievementsTab
              member={member}
              isRTL={isRTL}
              achievementModalOpen={achievementModalOpen}
              setAchievementModalOpen={setAchievementModalOpen}
              achievementSubmitting={achievementSubmitting}
              achievementFeedback={achievementFeedback}
              handleSaveAchievement={handleSaveAchievement}
              selectedAchievement={selectedAchievement}
              setSelectedAchievement={setSelectedAchievement}
              handleDeleteAchievement={handleDeleteAchievement}
              deletingAchievementId={deletingAchievementId}
            />
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 2: BOOKINGS & VISIT HISTORY TABLE
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === "bookings" && (
            <MemberProfileBookingsTab
              member={member}
              isRTL={isRTL}
            />
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 3: QUOTA & POLICY AUDIT
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === "dues" && (
            <MemberProfileDuesTab
              member={member}
              percentage={percentage}
              isRTL={isRTL}
            />
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 4: MEMBER SUPPORT TICKETS & COMPLAINTS
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === "tickets" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header Box */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                    <LifeBuoy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0c2340]">
                      {isRTL ? `سجل مشاكل وتذاكر الدعم الخاصة بـ (${member.name})` : `Support Tickets for (${member.name})`}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isRTL
                        ? "كافة المشاكل والاستفسارات التي قدمها هذا الطالب من حسابه مع إمكانية الرد والحل المباشر."
                        : "All tickets submitted by this member with direct resolution tools."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadMemberTickets}
                  disabled={ticketsLoading}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${ticketsLoading ? "animate-spin" : ""}`} />
                  <span>تحديث</span>
                </button>
              </div>

              {/* Tickets Component */}
              <MemberProfileTicketsTab
                tickets={memberTickets}
                loading={ticketsLoading}
                onRefresh={loadMemberTickets}
              />
            </div>
          )}

          {/* SMS Live Dispatch Modal Component */}
          <MemberProfileSmsModal
            isOpen={smsModalOpen}
            onClose={() => {
              if (!smsSending) {
                setSmsModalOpen(false);
                setSmsFeedback(null);
              }
            }}
            member={member}
            isRTL={isRTL}
            smsMessage={smsMessage}
            setSmsMessage={setSmsMessage}
            smsSending={smsSending}
            smsFeedback={smsFeedback}
            onSend={handleSendSms}
          />

          {/* Activation & Password Setup Modal */}
          {member && (
            <MemberResendActivationModal
              isOpen={activationModalOpen}
              onClose={() => setActivationModalOpen(false)}
              member={{
                id: member.id,
                name: member.name,
                email: member.email,
                phone: member.registration?.phone || member.phone,
                hasPassword: member.status === "active" || Boolean(member.hasPassword),
                status: member.status,
              }}
              isRTL={isRTL}
              onSuccess={(updated) => {
                setMember((prev) =>
                  prev
                    ? {
                        ...prev,
                        email: updated.email,
                        phone: updated.phone || prev.phone,
                        registration: prev.registration
                          ? {
                              ...prev.registration,
                              email: updated.email,
                              phone: updated.phone || prev.registration.phone,
                            }
                          : prev.registration,
                      }
                    : prev
                );
              }}
            />
          )}

          {/* WhatsApp Direct Messaging Modal */}
          {member && (
            <MemberWhatsAppModal
              isOpen={whatsAppModalOpen}
              onClose={() => setWhatsAppModalOpen(false)}
              member={{
                id: member.id,
                name: member.name,
                phone: member.registration?.phone || member.phone,
                email: member.email,
                allocatedHours: member.hoursLimit,
                usedHours: member.hoursUsed,
              }}
              isRTL={isRTL}
            />
          )}
        </main>
      </div>
    </div>
  );
}
