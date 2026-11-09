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
  updateAdminSupportTicketApi,
  deleteAdminSupportTicketApi,
  SupportTicketItem,
  SupportTicketStatus,
} from "@/services/supportTickets";
import {
  AchievementCard,
  AchievementDetailsModal,
  AchievementFormView,
} from "@/components/achievements/AchievementShowcase";
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
  const [ticketReplyingId, setTicketReplyingId] = useState<number | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [ticketSelectedStatus, setTicketSelectedStatus] = useState<SupportTicketStatus>("resolved");
  const [ticketSavingId, setTicketSavingId] = useState<number | null>(null);

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

  const handleOpenTicketReply = (ticket: SupportTicketItem) => {
    setTicketReplyingId(ticket.id);
    setTicketReplyText(ticket.admin_reply || "");
    setTicketSelectedStatus(ticket.status === "open" ? "resolved" : ticket.status);
  };

  const handleSaveTicketReply = async (ticketId: number) => {
    setTicketSavingId(ticketId);
    try {
      const res = await updateAdminSupportTicketApi(ticketId, {
        status: ticketSelectedStatus,
        admin_reply: ticketReplyText.trim(),
      });
      if (res.success) {
        setTicketReplyingId(null);
        loadMemberTickets();
      } else {
        alert(res.message || "تعذر حفظ رد المشكلة.");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setTicketSavingId(null);
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه التذكرة؟")) return;
    try {
      const res = await deleteAdminSupportTicketApi(ticketId);
      if (res.success) {
        setMemberTickets((prev) => prev.filter((t) => t.id !== ticketId));
      } else {
        alert(res.message || "تعذر حذف التذكرة.");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالخادم.");
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
                      ? `استخدم ${member.hoursUsed} من ${member.hoursLimit} ساعة هذا الشهر`
                      : `Used ${member.hoursUsed} of ${member.hoursLimit} hours this month`}
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
                <span className="font-bold text-slate-800">{isRTL ? "تلقائياً في 1 من كل شهر" : "1st of every month"}</span>
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
                {memberTickets.some((t) => t.status === "open" || t.status === "in_progress") && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </button>

            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════
              TAB 1: MEMBER ACHIEVEMENTS (Private & Verified)
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === "achievements" && (
            achievementModalOpen ? (
              <AchievementFormView
                onBack={() => setAchievementModalOpen(false)}
                onSubmit={handleSaveAchievement}
                targetName={member.name}
                isSubmitting={achievementSubmitting}
                feedback={achievementFeedback}
              />
            ) : (
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
                      <span>{isRTL ? "سجل خاص: مرئي للعضو ولإدارة الحاضنة فقط لتوثيق الأثر والنجاحات المهنية." : "Private portfolio: visible only to this member and workspace administration."}</span>
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
                {(member.achievements || [])
                  .map((item: MemberAchievementItem) => (
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
            )
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 2: BOOKINGS & VISIT HISTORY TABLE
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Today's Active Booking Card (if any) */}
              {member.bookingNote && member.bookingNote.includes("حجز اليوم") && (
                <div className="bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 rounded-2xl border border-emerald-200/90 p-5 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{isRTL ? "حجز نشط اليوم بالمساحة" : "Active Booking Today"}</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      {isRTL ? "طاولة رقم 12 (قاعة المستقلين)" : "Desk #12"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#0c2340]">
                    {member.bookingNote}
                  </p>
                </div>
              )}

              {/* Booking History Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#0c2340]">
                      {isRTL ? "سجل الحجوزات والزيارات" : "Booking & Visit History"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isRTL
                        ? "سجل الجلسات السابقة وساعات الاستخدام في المركز"
                        : "Past sessions and time allocated at the center"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {isRTL ? `${member.history.length} حجوزات مسجلة` : `${member.history.length} Bookings`}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50/70 text-slate-500 text-xs font-bold border-b border-slate-200/60">
                        <th className="py-3 px-5 text-start">{isRTL ? "التاريخ والمدة" : "Date & Duration"}</th>
                        <th className="py-3 px-5 text-start">{isRTL ? "المكان / المقعد" : "Desk / Space"}</th>
                        <th className="py-3 px-5 text-start">{isRTL ? "الغرض من الحجز" : "Purpose"}</th>
                        <th className="py-3 px-5 text-center">{isRTL ? "الحالة" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {member.history.map((h) => {
                        const cleanDate = String(h.date || "").split("T")[0];
                        const dateFormatted = h.date_formatted || (h.day_name ? `${h.day_name}، ${cleanDate}` : cleanDate);
                        const isAttended = h.status === "attended" || (h.status === "completed" && h.attended_range?.includes("حضر"));
                        const isInside = h.status === "inside" || h.status === "active";
                        const isNoShow = h.status === "no_show" || (h.purpose && h.purpose.includes("لم يحضر")) || (h.duration && h.duration.includes("لم يحضر"));
                        const isCancelled = h.status === "cancelled" && !isNoShow;
                        const isConfirmed = h.status === "confirmed";

                        return (
                          <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="font-extrabold text-[#0c2340] flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{dateFormatted}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{h.duration}</div>
                            </td>
                            <td className="py-3.5 px-5 text-slate-700 font-medium">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="font-bold">{h.desk}</span>
                              </div>
                              {h.room && <span className="text-[10px] text-slate-400 block mt-0.5">{h.room}</span>}
                            </td>
                            <td className="py-3.5 px-5 text-slate-600 max-w-sm">
                              {h.attended_range ? (
                                <div className="space-y-0.5">
                                  <span className={`inline-block font-bold text-xs ${
                                    isAttended ? "text-emerald-700" : isInside ? "text-emerald-600" : isNoShow ? "text-amber-800" : "text-slate-700"
                                  }`}>
                                    {h.attended_range}
                                  </span>
                                  {h.purpose && <p className="text-[11px] text-slate-400 truncate">{h.purpose}</p>}
                                </div>
                              ) : (
                                <span>{h.purpose}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-center">
                              {isInside ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white animate-pulse">
                                  {isRTL ? "داخل المساحة الآن 🟢" : "Active Now 🟢"}
                                </span>
                              ) : isAttended ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  {isRTL ? "حضر بنجاح ✓" : "Attended ✓"}
                                </span>
                              ) : isNoShow ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  {isRTL ? "لم يحضر ⚠️" : "No-Show ⚠️"}
                                </span>
                              ) : isCancelled ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  {isRTL ? "ملغي ✕" : "Cancelled ✕"}
                                </span>
                              ) : isConfirmed ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
                                  {isRTL ? "حجز مؤكد ⏳" : "Confirmed ⏳"}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                  {h.status_label || (isRTL ? "مكتمل" : "Completed")}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {member.history.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            {isRTL ? "لا توجد حجوزات مسجلة بعد لهذا العضو" : "No booking history recorded yet"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              TAB 3: QUOTA & POLICY AUDIT
             ═════════════════════════════════════════════════════════════ */}
          {activeTab === "dues" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-[#0c2340]">
                  {isRTL ? "تفاصيل الحصة الشهرية والاستهلاك" : "Monthly Quota & Usage Details"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-semibold">{isRTL ? "الحصة المخصصة شهرياً" : "Monthly Limit"}</span>
                    <div className="text-2xl font-black text-[#0c2340] mt-1">{member.hoursLimit} {isRTL ? "ساعة" : "hours"}</div>
                    <span className="text-[11px] text-slate-400">{member.type === "freelancer" ? "35 ساعة للمستقلين" : "25 ساعة للطلاب"}</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-semibold">{isRTL ? "الساعات المستهلكة" : "Hours Used"}</span>
                    <div className="text-2xl font-black text-[#0c2340] mt-1">{member.hoursUsed} {isRTL ? "ساعة" : "hours"}</div>
                    <span className="text-[11px] text-slate-400">{percentage}% من الحصة الإجمالية</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 font-semibold">{isRTL ? "الساعات الإضافية" : "Extra Hours"}</span>
                    <div className="text-2xl font-black text-rose-600 mt-1">{member.extraHours} {isRTL ? "ساعة" : "hours"}</div>
                    <span className="text-[11px] text-slate-400">{member.dueAmount} ₪ مستحق مالي</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    {isRTL
                      ? "وفق لائحة تشغيل إديو هب غزة، تُمنح الساعات الأساسية مجاناً بالكامل. في حال تجاوز العضو للحصة المعتمدة ورغب بساعات إضافية لدواعي تسليم مشاريع عاجلة، يتم فرض رسم رمزي قدره 2 شيكل لكل ساعة لدعم تكاليف السولار وصيانة المنظومة."
                      : "Core hours are 100% free. Any extra hours requested beyond monthly allocation for critical project delivery cost 2 NIS / hour to offset generator fuel."}
                  </span>
                </div>
              </div>

            </div>
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

              {/* Tickets List */}
              {ticketsLoading ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                  <p className="text-xs font-bold text-slate-500">جاري تحميل تذاكر الطالب...</p>
                </div>
              ) : memberTickets.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-lg">
                    ✨
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">لا توجد أي مشاكل أو شكاوى مسجلة لهذا العضو</h4>
                  <p className="text-xs text-slate-400">لم يقم هذا العضو بتقديم أي تذاكر دعم فني بعد.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberTickets.map((t) => {
                    const isResolved = t.status === "resolved";
                    const isInProgress = t.status === "in_progress";
                    const isUrgent = t.priority === "urgent";
                    const isReplying = ticketReplyingId === t.id;

                    return (
                      <div
                        key={t.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 shadow-2xs ${
                          isResolved
                            ? "bg-white border-slate-200"
                            : isInProgress
                            ? "bg-blue-50/20 border-blue-200"
                            : "bg-amber-50/20 border-amber-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{t.subject}</span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {t.category_label}
                            </span>
                            {isUrgent && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                                عاجل 🔴
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="text-[11px] font-mono text-slate-400">#{t.id}</span>
                            <span
                              className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                                isResolved
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : isInProgress
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {isResolved ? "تم الحل ✅" : isInProgress ? "جاري المتابعة 🔵" : "قيد الانتظار 🟡"}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleOpenTicketReply(t)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all"
                            >
                              {t.admin_reply ? "تعديل الرد" : "حل والرد"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTicket(t.id)}
                              className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="text-xs sm:text-sm text-slate-700 bg-slate-50/60 p-3 rounded-xl border border-slate-200/60 font-medium">
                          {t.description}
                        </div>

                        {/* Existing Admin Reply */}
                        {t.admin_reply && !isReplying && (
                          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                              <span>رد المشرف:</span>
                              {t.admin_name && <span className="font-normal text-[11px]">{t.admin_name}</span>}
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-emerald-900">{t.admin_reply}</p>
                            {t.resolved_at_human && (
                              <div className="text-[10px] text-emerald-700/70 pt-0.5">تاريخ الحل: {t.resolved_at_human}</div>
                            )}
                          </div>
                        )}

                        {/* Reply Form */}
                        {isReplying && (
                          <div className="p-4 rounded-xl bg-white border-2 border-emerald-500 shadow-sm space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                              <span>تحديث حالة التذكرة وكتابة رد للطالب:</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: "resolved", label: "تم الحل ✅" },
                                { id: "in_progress", label: "جاري المتابعة 🔵" },
                                { id: "open", label: "قيد الانتظار 🟡" },
                              ].map((st) => (
                                <button
                                  key={st.id}
                                  type="button"
                                  onClick={() => setTicketSelectedStatus(st.id as SupportTicketStatus)}
                                  className={`p-1.5 rounded-lg text-xs font-bold border transition-all text-center ${
                                    ticketSelectedStatus === st.id
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                                      : "bg-slate-50 border-slate-200 text-slate-600"
                                  }`}
                                >
                                  {st.label}
                                </button>
                              ))}
                            </div>
                            <textarea
                              rows={2}
                              value={ticketReplyText}
                              onChange={(e) => setTicketReplyText(e.target.value)}
                              placeholder="اكتب ردك وتوضيحك للطالب..."
                              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm resize-none focus:border-emerald-500"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setTicketReplyingId(null)}
                                className="px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                              >
                                إلغاء
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveTicketReply(t.id)}
                                disabled={ticketSavingId === t.id}
                                className="px-3.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {ticketSavingId === t.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>جاري الحفظ...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>حفظ الرد والحالة</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span>تاريخ التقديم: {t.created_at_human || t.created_at}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              SMS LIVE DISPATCH MODAL (TweetSMS Gateway)
             ═════════════════════════════════════════════════════════════ */}
          {smsModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
              <div
                dir={dir}
                className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#0c2340]">
                        {isRTL ? "إرسال رسالة SMS للعضو" : "Send SMS to Member"}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {isRTL
                          ? `إلى: ${member.name} (${reg?.phone ? `0${reg.phone.replace(/^0+/, '')}` : member.phone})`
                          : `To: ${member.name} (${member.phone})`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!smsSending) {
                        setSmsModalOpen(false);
                        setSmsFeedback(null);
                      }
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Feedback Toast */}
                {smsFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                      smsFeedback.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {smsFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{smsFeedback.text}</span>
                  </div>
                )}

                <form onSubmit={handleSendSms} className="space-y-4">
                  {/* Quick Preset Templates */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-bold text-slate-700">
                      {isRTL ? "نماذج رسائل سريعة جاهزة للاستخدام:" : "Quick Templates:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSmsMessage(
                            `مرحباً ${member.name}، نود تذكيرك بأن رصيدك من الساعات اقترب من الانتهاء، يمكنك تجديد الحصة عبر مراجعة الاستقبال.`
                          )
                        }
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
                      >
                        ⏱️ تذكير بتجديد الساعات
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSmsMessage(
                            `مرحباً ${member.name}، حجزك اليوم في مساحة العمل بإديو هب غزة مؤكد ونرحب بحضورك!`
                          )
                        }
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
                      >
                        📅 تأكيد حجز اليوم
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSmsMessage(
                            `مرحباً ${member.name}، يرجى التفضل بمراجعة إدارة مساحة إديو هب لتسوية المستحقات المالية المتبقية.`
                          )
                        }
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
                      >
                        💳 تسوية المستحقات
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSmsMessage(
                            `مرحباً ${member.name}، نتمنى لك يوماً موفقاً ومثمراً في مساحة العمل بإديو هب غزة.`
                          )
                        }
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
                      >
                        ✨ ترحيب عام
                      </button>
                    </div>
                  </div>

                  {/* Message Content Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        {isRTL ? "نص الرسالة المرسلة:" : "Message Text:"}
                      </label>
                      <div className="text-[11px] font-mono text-slate-500 font-bold">
                        <span>{smsMessage.length} حرف</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span className="text-emerald-700">
                          {Math.max(1, Math.ceil(smsMessage.length / 70))} SMS
                        </span>
                      </div>
                    </div>
                    <textarea
                      rows={4}
                      required
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder={
                        isRTL
                          ? "اكتب نص الرسالة النصية القصيرة هنا..."
                          : "Type the SMS message text here..."
                      }
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 hover:bg-white resize-none transition-all leading-relaxed"
                    />
                  </div>

                  {/* Gateway Notice */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isRTL ? "بوابة الإرسال: TweetSMS المعتمدة" : "Gateway: TweetSMS"}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Sender: EDU HUB
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={smsSending}
                      onClick={() => {
                        setSmsModalOpen(false);
                        setSmsFeedback(null);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                    >
                      {isRTL ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={smsSending || !smsMessage.trim()}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2"
                    >
                      {smsSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isRTL ? "جاري الإرسال الآن..." : "Sending..."}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{isRTL ? "إرسال رسالة SMS الآن" : "Send SMS Now"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
