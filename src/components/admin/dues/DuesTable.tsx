"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  getAdminDuesApi,
  settleMemberDuesApi,
  MemberDueItem,
  GetAdminDuesResponse,
} from "@/services/applications";
import {
  CreditCard,
  Search,
  Users,
  Coins,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  ExternalLink,
  X,
  Menu,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import AddDueModal from "./AddDueModal";
import AdjustDueModal, { AdjustSuccessPayload } from "./AdjustDueModal";

interface DuesTableProps {
  onOpenMobileMenu?: () => void;
}

export default function DuesTable({ onOpenMobileMenu }: DuesTableProps = {}) {
  const { locale, dir, t } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const d = t.admin?.dues;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GetAdminDuesResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "student" | "freelancer" | "external">("all");

  // Add due modal state
  const [addDueModalOpen, setAddDueModalOpen] = useState(false);

  // Adjust due modal state (Increase / Decrease)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustMember, setAdjustMember] = useState<MemberDueItem | null>(null);
  const [adjustAction, setAdjustAction] = useState<"increase" | "decrease">("increase");

  // Settlement modal state
  // Settlement confirmation modal state
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberDueItem | null>(null);
  const [settling, setSettling] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await getAdminDuesApi({
        query: searchQuery,
        type: typeFilter,
        onlyDebtors: true,
      });
      setData(res);
    } catch (err: unknown) {
      console.error("Failed to load dues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const filteredMembers = useMemo(() => {
    if (!data?.data) return [];
    // Strictly filter out any member with 0 or negative balance - dues table is exclusively for active claims
    let list = data.data.filter((m) => m.due_amount > 0);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanDigits = q.replace(/\D/g, "");
      list = list.filter((m) => {
        const nameMatch = m.name?.toLowerCase().includes(q);
        const emailMatch = m.email?.toLowerCase().includes(q);
        const rawPhone = m.phone || "";
        const mDigits = rawPhone.replace(/\D/g, "");
        const phoneMatch =
          rawPhone.toLowerCase().includes(q) ||
          (cleanDigits.length >= 4 && mDigits.includes(cleanDigits));
        return nameMatch || emailMatch || phoneMatch;
      });
    }

    if (typeFilter !== "all") {
      list = list.filter((m) => m.type === typeFilter);
    }

    return list;
  }, [data, searchQuery, typeFilter]);

  const handleOpenSettleModal = (member: MemberDueItem) => {
    setSelectedMember(member);
    setActionSuccess(null);
    setActionError(null);
    setSettleModalOpen(true);
  };

  const handleOpenAdjustModal = (member: MemberDueItem, action: "increase" | "decrease" = "increase") => {
    setAdjustMember(member);
    setAdjustAction(action);
    setAdjustModalOpen(true);
  };

  const handleAdjustSuccess = (adjusted?: AdjustSuccessPayload) => {
    if (adjusted) {
      setData((prev) => {
        if (!prev) return prev;
        const diff = adjusted.action === "increase" ? adjusted.amount : -adjusted.amount;
        const prevMember = prev.data.find((m) => m.id === adjusted.memberId);
        const wasZero = (prevMember?.due_amount || 0) <= 0;
        const isNowZero = adjusted.newTotal <= 0;
        let countDelta = 0;
        if (wasZero && !isNowZero) countDelta = 1;
        if (!wasZero && isNowZero) countDelta = -1;

        return {
          ...prev,
          summary: {
            ...prev.summary,
            total_amount: Math.max(0, Math.round((prev.summary.total_amount + diff) * 100) / 100),
            total_members_with_dues: Math.max(0, prev.summary.total_members_with_dues + countDelta),
          },
          data: prev.data.map((m) =>
            m.id === adjusted.memberId
              ? {
                  ...m,
                  due_amount: adjusted.newTotal,
                  reason: adjusted.notes || m.reason,
                  notes: adjusted.notes || m.notes,
                }
              : m
          ),
        };
      });
    }
    // Background fetch to guarantee synchronization
    fetchDues();
  };

  const handleConfirmSettle = async () => {
    if (!selectedMember) return;
    setSettling(true);
    setActionError(null);

    const settledAmt = selectedMember.due_amount;
    const memberIdToSettle = selectedMember.id;

    try {
      const res = await settleMemberDuesApi(memberIdToSettle, {
        amount: settledAmt,
      });

      // Optimistic instant UI update
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          summary: {
            ...prev.summary,
            total_amount: Math.max(0, Math.round((prev.summary.total_amount - settledAmt) * 100) / 100),
            total_members_with_dues: Math.max(0, prev.summary.total_members_with_dues - 1),
          },
          data: prev.data.map((item) =>
            item.id === memberIdToSettle
              ? { ...item, due_amount: 0, reason: null, notes: null }
              : item
          ),
        };
      });

      setActionSuccess(res.message || (isRTL ? "تم تسوية المبلغ وتصفير الرصيد بنجاح!" : "Dues settled and cleared successfully!"));

      setTimeout(() => {
        setSettleModalOpen(false);
        fetchDues();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isRTL ? "فشلت عملية التسوية." : "Settlement failed";
      setActionError(msg);
    } finally {
      setSettling(false);
    }
  };

  const summary = data?.summary || {
    total_amount: 0,
    total_extra_hours: 0,
    total_members_with_dues: 0,
  };

  return (
    <div className="space-y-6">
      {/* -- Header & Actions -- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80 shrink-0 shadow-2xs">
            <Coins className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
              {d?.title || (isRTL ? "المستحقات والتسويات المالية" : "Financial Dues & Settlements")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {d?.subtitle || (isRTL ? "متابعة المطالبات والرسوم وتصفير الأرصدة للأعضاء والزوار" : "Track outstanding claims and settle balances")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setAddDueModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{d?.addDueBtn || (isRTL ? "تسجيل مستحق مالي" : "Record Due")}</span>
          </button>

          <button
            type="button"
            onClick={fetchDues}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
            <span className="hidden sm:inline">{d?.refreshBtn || (isRTL ? "تحديث" : "Refresh")}</span>
          </button>
        </div>
      </div>

      {/* -- KPI Metrics Overview -- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Outstanding Dues */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/40 p-5 rounded-2xl border border-amber-200/70 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden">
          <div className="absolute top-0 end-0 w-24 h-24 bg-amber-500/5 rounded-full -me-8 -mt-8 pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-900">
              {d?.totalDueBalance || (isRTL ? "إجمالي المبالغ المستحقة" : "Total Due Balance")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center border border-amber-200/80">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {summary.total_amount}
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-800">
              {d?.currency || (isRTL ? "₪ شيكل" : "NIS")}
            </span>
          </div>
        </div>

        {/* Debtors Count */}
        <div className="bg-gradient-to-br from-white via-white to-sky-50/30 p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">
              {d?.activeDebtors || (isRTL ? "عدد المطالبات القائمة" : "Active Debtors")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-100/70 text-sky-800 flex items-center justify-center border border-sky-200/80">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {summary.total_members_with_dues}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">
              {isRTL ? (d?.claimsUnit || "شخص / مطالبة") : (d?.claimsUnit || "claims")}
            </span>
          </div>
        </div>

        {/* Overdue Hours */}
        <div className="bg-gradient-to-br from-white via-white to-violet-50/30 p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">
              {d?.billedExtraHours || (isRTL ? "الساعات المتجاوزة المحسوبة" : "Billed Extra Hours")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-100/70 text-violet-800 flex items-center justify-center border border-violet-200/80">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {summary.total_extra_hours}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">
              {isRTL ? (d?.hrsUnit || "ساعة إضافية") : (d?.hrsUnit || "hrs")}
            </span>
          </div>
        </div>
      </div>

      {/* -- Search & Filter Controls -- */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              d?.searchPlaceholder ||
              (isRTL
                ? "بحث باسم العضو، البريد، أو رقم الهاتف..."
                : "Search by name, email, or phone...")
            }
            className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {d?.filterAll || (isRTL ? "الكل" : "All")}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("student")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === "student" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {d?.filterStudents || (isRTL ? "طلاب" : "Students")}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("freelancer")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === "freelancer" ? "bg-white text-teal-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {d?.filterFreelancers || (isRTL ? "مستقلون" : "Freelancers")}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("external")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === "external" ? "bg-white text-amber-800 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {d?.filterVisitors || (isRTL ? "زوار" : "Visitors")}
            </button>
          </div>
        </div>
      </div>

      {/* -- Main Dues Table -- */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              <p className="text-xs sm:text-sm font-bold text-slate-600">
                {isRTL ? "جاري تحميل بيانات المستحقات المالية..." : "Loading dues records..."}
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-base font-black text-slate-800 mb-1">
                {d?.emptyTitle || (isRTL ? "لا توجد أي مبالغ مستحقة معلقة" : "No Outstanding Dues")}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {d?.emptyDesc ||
                  (isRTL
                    ? "رائع! جميع الأعضاء والزوار خالصو الرصيد، ولا توجد أي مبالغ مستحقة للتحصيل حالياً."
                    : "Great! All members and visitors are settled with zero outstanding dues.")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/70 text-slate-600 font-bold text-start text-xs">
                    <th className="py-3.5 px-4 text-start font-bold">
                      {d?.colMemberVisitor || (isRTL ? "العضو / الزائر" : "Member / Visitor")}
                    </th>
                    <th className="py-3.5 px-4 text-start font-bold">
                      {d?.colCategory || (isRTL ? "الفئة" : "Category")}
                    </th>
                    <th className="py-3.5 px-4 text-start font-bold">
                      {d?.colUsage || (isRTL ? "استهلاك الساعات" : "Hours Usage")}
                    </th>
                    <th className="py-3.5 px-4 text-start font-bold">
                      {d?.colExtraHours || (isRTL ? "الساعات المتجاوزة" : "Extra Hours")}
                    </th>
                    <th className="py-3.5 px-4 text-start font-bold">
                      {d?.colDueAmount || (isRTL ? "المبلغ المستحق" : "Due Amount")}
                    </th>
                    <th className="py-3.5 px-4 text-start font-bold">
                      {d?.colReason || (isRTL ? "السبب / البيان" : "Reason")}
                    </th>
                    <th className="py-3.5 px-4 text-center font-bold">
                      {d?.colActions || (isRTL ? "الإجراءات" : "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => {
                    const isExternal = member.type === "external" || member.member_type === "external";
                    const isStudent = member.type === "student";
                    const hasDues = member.due_amount > 0;
                    const isCeilingBreached = member.due_amount >= 50;

                    return (
                      <tr
                        key={member.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isCeilingBreached ? "bg-rose-50/30" : hasDues ? "bg-amber-50/20" : ""
                        }`}
                      >
                        {/* Member / Visitor Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-black flex items-center justify-center shrink-0 border border-slate-200 text-sm">
                              {member.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              {isExternal ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 truncate">{member.name}</span>
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 shrink-0">
                                    {d?.badgeVisitor || (isRTL ? "زائر" : "Visitor")}
                                  </span>
                                </div>
                              ) : (
                                <Link
                                  href={`/admin/members?id=${member.id}`}
                                  className="font-bold text-slate-900 hover:text-brand-navy flex items-center gap-1.5 transition-colors group"
                                >
                                  <span className="truncate">{member.name}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand-navy opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                              )}
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                {member.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span dir="ltr">{member.phone}</span>
                                  </span>
                                )}
                                {member.email && (
                                  <span className="hidden sm:flex items-center gap-1 truncate max-w-[160px]">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span className="truncate">{member.email}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                              isExternal
                                ? "bg-amber-50/80 text-amber-900 border-amber-200/80"
                                : isStudent
                                ? "bg-blue-50/80 text-blue-900 border-blue-200/80"
                                : "bg-teal-50/80 text-teal-900 border-teal-200/80"
                            }`}
                          >
                            {isExternal
                              ? d?.badgeVisitor || (isRTL ? "زائر (غير عضو)" : "Visitor")
                              : isStudent
                              ? d?.badgeStudent || (isRTL ? "طالب جامعي" : "Student")
                              : d?.badgeFreelancer || (isRTL ? "مستقل" : "Freelancer")}
                          </span>
                        </td>

                        {/* Hours Usage */}
                        <td className="py-3.5 px-4">
                          {isExternal ? (
                            <span className="text-slate-400 font-medium text-xs">
                              {isRTL ? "— (رسوم زائر)" : "— (Visitor fee)"}
                            </span>
                          ) : (
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                <span>{member.hours_used}</span>
                                <span className="text-slate-400 text-xs">/</span>
                                <span className="text-slate-500 text-xs">{member.hours_limit} س</span>
                              </div>
                              <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    member.hours_used > member.hours_limit ? "bg-rose-500" : "bg-emerald-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (member.hours_used / (member.hours_limit || 1)) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Extra Hours */}
                        <td className="py-3.5 px-4">
                          {isExternal ? (
                            <span className="text-slate-400 font-medium text-xs">—</span>
                          ) : member.extra_hours > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>+{member.extra_hours} س إضافية</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">0 س</span>
                          )}
                        </td>

                        {/* Due Amount */}
                        <td className="py-3.5 px-4">
                          {hasDues ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-baseline gap-1">
                                <span className="text-base sm:text-lg font-black text-amber-700 font-mono">
                                  {member.due_amount}
                                </span>
                                <span className="text-[11px] font-bold text-amber-800">₪ شيكل</span>
                              </div>
                              {isCeilingBreached && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shrink-0"
                                  title={isRTL ? "تجاوز سقف المديونية 50 ₪ (محظور من الحجز)" : "Debt ceiling breached"}
                                >
                                  <AlertCircle className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                                  <span>{d?.badgeCapExceeded || (isRTL ? "تجاوز السقف" : "Cap Exceeded")}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              {d?.badgeZeroDues || (isRTL ? "خالص الرصيد" : "Zero Dues")}
                            </span>
                          )}
                        </td>

                        {/* Reason / Notes */}
                        <td className="py-3.5 px-4 max-w-[220px]">
                          {member.reason || member.notes ? (
                            <span
                              className="text-xs font-semibold text-slate-800 block truncate"
                              title={member.reason || member.notes || ""}
                            >
                              {member.reason || member.notes}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {hasDues ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAdjustModal(member, "increase")}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1 border border-slate-200/80 shadow-2xs"
                                  title={isRTL ? "تعديل المستحق (زيادة أو خصم)" : "Adjust balance"}
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{d?.btnAdjust || (isRTL ? "تعديل" : "Adjust")}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenSettleModal(member)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                                  title={isRTL ? "تسوية كاملة وتصفير الرصيد" : "Settle all"}
                                >
                                  <Coins className="w-3.5 h-3.5" />
                                  <span>{d?.btnSettleAll || (isRTL ? "تسوية كاملة" : "Settle All")}</span>
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* -- Settlement Confirmation Modal -- */}
      {settleModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            dir={dir}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setSettleModalOpen(false)}
              className="absolute top-5 end-5 p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-brand-navy">
                  {d?.settleModal?.title || (isRTL ? "تسوية كاملة للمستحقات" : "Settle Full Balance")}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedMember.name}
                </p>
              </div>
            </div>

            {actionError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
            )}

            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 mb-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">{d?.settleModal?.nameLabel || (isRTL ? "الاسم:" : "Name:")}</span>
                <span className="font-bold text-slate-900 text-sm">{selectedMember.name}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-200/80 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-800">
                  {d?.settleModal?.amountLabel || (isRTL ? "المبلغ المراد تصفيره بالكامل:" : "Amount to Clear:")}
                </span>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-black text-emerald-700">
                    {selectedMember.due_amount}
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    {d?.currency || (isRTL ? "₪ شيكل" : "NIS")}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium text-center bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
              {d?.settleModal?.confirmQuestion ||
                (isRTL
                  ? "هل أنت متأكد من تسوية كامل المبلغ المستحق وتصفير حساب العضو/الزائر؟"
                  : "Are you sure you want to settle the full balance and clear this account?")}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSettleModalOpen(false)}
                disabled={settling}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {d?.settleModal?.cancel || (isRTL ? "إلغاء" : "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                disabled={settling}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-95"
              >
                {settling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{d?.settleModal?.settling || (isRTL ? "جاري التسوية..." : "Settling...")}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{d?.settleModal?.confirmBtn || (isRTL ? "نعم، تصفير المستحق" : "Yes, Clear Balance")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -- Adjust Due (Increase / Decrease) Modal -- */}
      <AdjustDueModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        onSuccess={handleAdjustSuccess}
        member={adjustMember}
        initialAction={adjustAction}
        isRTL={isRTL}
      />

      {/* -- Add Due Claim Modal -- */}
      <AddDueModal
        isOpen={addDueModalOpen}
        onClose={() => setAddDueModalOpen(false)}
        onSuccess={fetchDues}
        isRTL={isRTL}
      />
    </div>
  );
}
