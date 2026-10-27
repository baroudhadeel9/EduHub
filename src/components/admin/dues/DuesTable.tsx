"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  getAdminDuesApi,
  settleMemberDuesApi,
  getDuesHistoryApi,
  MemberDueItem,
  GetAdminDuesResponse,
  DuesSettlementItem,
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
  Printer,
  History,
  FileText,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function DuesTable() {
  const { locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  const [activeTab, setActiveTab] = useState<"dues" | "history">("dues");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GetAdminDuesResponse | null>(null);
  const [historyList, setHistoryList] = useState<DuesSettlementItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "student" | "freelancer">("all");
  const [onlyDebtors, setOnlyDebtors] = useState(true);

  // Settlement modal state
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberDueItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [settlementNotes, setSettlementNotes] = useState<string>("");
  const [settling, setSettling] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const res = await getAdminDuesApi({
        query: searchQuery,
        type: typeFilter,
        onlyDebtors,
      });
      setData(res);
    } catch (err: unknown) {
      console.error("Failed to load dues:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await getDuesHistoryApi();
      if (res && res.data) {
        setHistoryList(res.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load settlement history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchDues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, onlyDebtors]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const filteredMembers = useMemo(() => {
    if (!data?.data) return [];
    let list = data.data;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== "all") {
      list = list.filter((m) => m.type === typeFilter);
    }

    if (onlyDebtors) {
      list = list.filter((m) => m.due_amount > 0);
    }

    return list;
  }, [data, searchQuery, typeFilter, onlyDebtors]);

  const filteredHistory = useMemo(() => {
    if (!historyList) return [];
    if (!searchQuery.trim()) return historyList;
    const q = searchQuery.toLowerCase().trim();
    return historyList.filter(
      (h) =>
        h.member_name.toLowerCase().includes(q) ||
        (h.member_phone && h.member_phone.toLowerCase().includes(q)) ||
        h.admin_name.toLowerCase().includes(q)
    );
  }, [historyList, searchQuery]);

  const handleOpenSettleModal = (member: MemberDueItem) => {
    setSelectedMember(member);
    setPaymentMethod("cash");
    setSettlementNotes("");
    setActionError(null);
    setActionSuccess(null);
    setSettleModalOpen(true);
  };

  const handleConfirmSettle = async () => {
    if (!selectedMember) return;
    setSettling(true);
    setActionError(null);

    try {
      const res = await settleMemberDuesApi(selectedMember.id, {
        payment_method: paymentMethod,
        notes: settlementNotes,
      });

      setActionSuccess(
        res.message ||
          (isRTL
            ? `تم تسوية مستحقات العضو (${selectedMember.name}) وتصفير حسابه بنجاح!`
            : `Dues for ${selectedMember.name} have been settled successfully!`)
      );

      // Local optimistic update
      setData((prev) => {
        if (!prev) return null;
        const updatedList = prev.data.map((m) =>
          String(m.id) === String(selectedMember.id)
            ? { ...m, due_amount: 0, extra_hours: 0 }
            : m
        );
        return {
          ...prev,
          data: updatedList,
          summary: {
            ...prev.summary,
            total_amount: Math.max(0, prev.summary.total_amount - selectedMember.due_amount),
            total_extra_hours: Math.max(0, prev.summary.total_extra_hours - selectedMember.extra_hours),
          },
        };
      });

      setTimeout(() => {
        setSettleModalOpen(false);
        setSelectedMember(null);
        setActionSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تسوية المستحقات.";
      setActionError(msg);
    } finally {
      setSettling(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const summary = data?.summary || {
    total_amount: 0,
    total_extra_hours: 0,
    total_members_with_dues: 0,
  };

  return (
    <div className="space-y-6">
      {/* ── Print Stylesheet ── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-dues-report,
          #printable-dues-report * {
            visibility: visible;
          }
          #printable-dues-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Page Header (Non-printable controls) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs no-print">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-navy">
              {isRTL ? "المستحقات المالية والمطالبات" : "Financial Dues & Balances"}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {isRTL
              ? "متابعة ساعات الأعضاء الإضافية المتجاوزة والمبالغ المستحقة للتحصيل والتسوية."
              : "Track members with extra hours and outstanding balance dues for collection."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Print Report Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
            title={isRTL ? "طباعة كشف المستحقات" : "Print Statement"}
          >
            <Printer className="w-4 h-4" />
            <span>{isRTL ? "طباعة الكشف / PDF" : "Print / PDF"}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={activeTab === "dues" ? fetchDues : fetchHistory}
            disabled={loading || historyLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading || historyLoading ? "animate-spin" : ""}`} />
            <span>{isRTL ? "تحديث" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── Top Summary Cards (2 Modern Metric Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 no-print">
        {/* 1. Total Outstanding Amount */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              {isRTL ? "إجمالي المبالغ المستحقة" : "Total Outstanding Due"}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80 shadow-2xs group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#0c2340] font-mono tracking-tight">
                {summary.total_amount.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-700">
                {isRTL ? "شيكل (₪)" : "NIS"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1.5">
              {isRTL ? "تعرفة الساعة الإضافية المعتمدة: 2 شيكل / ساعة" : "Standard extra hour rate: 2 NIS / hr"}
            </p>
          </div>
        </div>

        {/* 2. Number of Members with Dues */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              {isRTL ? "الأعضاء المطالبون بالتسديد" : "Members With Balances"}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80 shadow-2xs group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#0c2340] font-mono tracking-tight">
                {summary.total_members_with_dues}
              </span>
              <span className="text-xs sm:text-sm font-bold text-blue-700">
                {isRTL ? "عضو مطالب" : "Members"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1.5">
              {isRTL ? "سقف المديونية الأقصى قبل تقييد الحجز: 50 شيكل" : "Debt cap before booking restriction: 50 NIS"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs (Active Dues vs Audit Log) ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 no-print">
        <button
          type="button"
          onClick={() => setActiveTab("dues")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "dues"
              ? "border-[#5243e1] text-[#5243e1] bg-[#5243e1]/5 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{isRTL ? "المطالبات المستحقة" : "Active Dues"}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "dues"
                ? "bg-[#5243e1]/15 text-[#5243e1]"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {summary.total_members_with_dues}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "history"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/60 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isRTL ? "سجل التدقيق والتسويات" : "Settlement Audit Log"}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "history"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {historyList.length}
          </span>
        </button>
      </div>

      {/* ── Printable Container ── */}
      <div id="printable-dues-report" className="space-y-4">
        {/* Print-only Header */}
        <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-slate-900">EduHub Gaza — كشف المستحقات المالية</h2>
              <p className="text-xs text-slate-600">مساحة العمل والتعلم — تقرير ساعات الأعضاء الإضافية والمطالبات المالية</p>
            </div>
            <div className="text-end text-xs text-slate-600">
              <p>تاريخ الاستخراج: {new Date().toLocaleDateString("ar-EG")}</p>
              <p>إجمالي المبالغ المستحقة: {summary.total_amount} ₪</p>
            </div>
          </div>
        </div>

        {activeTab === "dues" ? (
          <>
            {/* ── Search & Filter Controls ── */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isRTL
                      ? "بحث باسم العضو، البريد، أو رقم الهاتف..."
                      : "Search by name, email, or phone..."
                  }
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Type Filter */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setTypeFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      typeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isRTL ? "الكل" : "All"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter("student")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      typeFilter === "student" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isRTL ? "طلاب" : "Students"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter("freelancer")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      typeFilter === "freelancer" ? "bg-white text-teal-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isRTL ? "مستقلون" : "Freelancers"}
                  </button>
                </div>

                {/* Only Debtors Toggle */}
                <button
                  type="button"
                  onClick={() => setOnlyDebtors(!onlyDebtors)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    onlyDebtors
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${onlyDebtors ? "bg-amber-600" : "bg-slate-400"}`} />
                  <span>{isRTL ? "المدينون فقط (> 0 ₪)" : "Debtors Only"}</span>
                </button>
              </div>
            </div>

            {/* ── Table Content ── */}
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
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-slate-800 mb-1">
                    {isRTL ? "لا توجد مستحقات مالية معلقة" : "No Outstanding Dues Found"}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {isRTL
                      ? "جميع الأعضاء ضمن حدود باقاتهم المجانية المعتمدة أو تمت تسوية حساباتهم بالكامل."
                      : "All members are currently within their plan quota limits or have settled balances."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold text-start">
                        <th className="py-3.5 px-4 text-start font-bold">
                          {isRTL ? "العضو" : "Member"}
                        </th>
                        <th className="py-3.5 px-4 text-start font-bold">
                          {isRTL ? "الفئة" : "Category"}
                        </th>
                        <th className="py-3.5 px-4 text-start font-bold">
                          {isRTL ? "استهلاك الساعات" : "Hours Usage"}
                        </th>
                        <th className="py-3.5 px-4 text-start font-bold">
                          {isRTL ? "الساعات المتجاوزة" : "Extra Hours"}
                        </th>
                        <th className="py-3.5 px-4 text-start font-bold">
                          {isRTL ? "المبلغ المستحق" : "Due Amount"}
                        </th>
                        <th className="py-3.5 px-4 text-start font-bold">
                          {isRTL ? "حالة المديونية" : "Debt Status"}
                        </th>
                        <th className="py-3.5 px-4 text-center font-bold no-print">
                          {isRTL ? "الإجراءات" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.map((member) => {
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
                            {/* Member info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 font-black flex items-center justify-center shrink-0 border border-slate-200 text-sm">
                                  {member.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    href={`/admin/members?id=${member.id}`}
                                    className="font-bold text-slate-900 hover:text-brand-navy flex items-center gap-1.5 transition-colors group"
                                  >
                                    <span className="truncate">{member.name}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand-navy opacity-0 group-hover:opacity-100 transition-opacity no-print" />
                                  </Link>
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
                                  isStudent
                                    ? "bg-blue-50 text-blue-800 border-blue-200"
                                    : "bg-teal-50 text-teal-800 border-teal-200"
                                }`}
                              >
                                {isStudent ? (isRTL ? "طالب جامعي" : "Student") : isRTL ? "مستقل" : "Freelancer"}
                              </span>
                            </td>

                            {/* Hours Usage */}
                            <td className="py-3.5 px-4">
                              <div>
                                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                  <span>{member.hours_used}</span>
                                  <span className="text-slate-400 text-xs">/</span>
                                  <span className="text-slate-500 text-xs">{member.hours_limit} س</span>
                                </div>
                                <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden no-print">
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
                            </td>

                            {/* Extra Hours */}
                            <td className="py-3.5 px-4">
                              {member.extra_hours > 0 ? (
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
                                <div className="flex items-baseline gap-1">
                                  <span className="text-base sm:text-lg font-black text-amber-700 font-mono">
                                    {member.due_amount}
                                  </span>
                                  <span className="text-[11px] font-bold text-amber-800">₪ شيكل</span>
                                </div>
                              ) : (
                                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                  {isRTL ? "خالص الرصيد" : "Zero Dues"}
                                </span>
                              )}
                            </td>

                            {/* Debt Status */}
                            <td className="py-3.5 px-4">
                              {isCeilingBreached ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                                  <span>{isRTL ? "تجاوز السقف (حجز محظور)" : "Ceiling Cap Breached"}</span>
                                </span>
                              ) : hasDues ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  {isRTL ? "مستحق للتحصيل" : "Pending Collection"}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs font-medium">—</span>
                              )}
                            </td>

                            {/* Actions (Non-printable) */}
                            <td className="py-3.5 px-4 text-center no-print">
                              <div className="flex items-center justify-center gap-2">
                                {hasDues ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSettleModal(member)}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                                  >
                                    <Coins className="w-3.5 h-3.5" />
                                    <span>{isRTL ? "تسوية وتحصيل" : "Settle"}</span>
                                  </button>
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
          </>
        ) : (
          /* ── Tab 2: Settlement Audit Log ── */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {isRTL ? "سجل التدقيق المالي للمقبوضات والتسويات" : "Financial Settlements Audit Log"}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {isRTL ? `إجمالي العمليات: ${filteredHistory.length}` : `Total records: ${filteredHistory.length}`}
              </span>
            </div>

            {historyLoading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  {isRTL ? "جاري تحميل سجل التدقيق..." : "Loading audit log..."}
                </p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  {isRTL ? "لا توجد عمليات تسوية مسجلة حتى الآن." : "No settlement transactions recorded yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold text-start">
                      <th className="py-3 px-4 text-start font-bold">#</th>
                      <th className="py-3 px-4 text-start font-bold">{isRTL ? "العضو" : "Member"}</th>
                      <th className="py-3 px-4 text-start font-bold">{isRTL ? "المبلغ المحصل" : "Amount"}</th>
                      <th className="py-3 px-4 text-start font-bold">{isRTL ? "الساعات المسواة" : "Settled Hours"}</th>
                      <th className="py-3 px-4 text-start font-bold">{isRTL ? "طريقة الدفع" : "Payment Method"}</th>
                      <th className="py-3 px-4 text-start font-bold">{isRTL ? "المسؤول (الاستقبال)" : "Admin"}</th>
                      <th className="py-3 px-4 text-start font-bold">{isRTL ? "تاريخ ووقت التسوية" : "Timestamp"}</th>
                      <th className="py-3 px-4 text-start font-bold">{isRTL ? "ملاحظات" : "Notes"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map((h, idx) => (
                      <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {h.member_name}
                          {h.member_phone && (
                            <span className="block text-[10px] text-slate-400 font-normal" dir="ltr">
                              {h.member_phone}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-700 font-mono text-sm">
                          {h.amount} ₪
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-bold">
                          {h.extra_hours} ساعة
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                            {h.payment_method === "cash"
                              ? isRTL ? "نقداً" : "Cash"
                              : h.payment_method === "card"
                              ? isRTL ? "بطاقة" : "Card"
                              : isRTL ? "تحويل بنكي" : "Bank Transfer"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {h.admin_name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs font-mono" dir="ltr">
                          {h.settled_at || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs max-w-[180px] truncate">
                          {h.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Print Footer */}
        <div className="hidden print:flex justify-between items-center mt-12 pt-6 border-t border-slate-300 text-xs text-slate-700">
          <div>
            <p>توقيع مسؤول الاستقبال: ____________________</p>
          </div>
          <div>
            <p>توقيع الإدارة المالية: ____________________</p>
          </div>
          <div>
            <p>ختم مساحة EduHub Gaza</p>
          </div>
        </div>
      </div>

      {/* ── Settlement Confirmation Modal ── */}
      {settleModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200 no-print">
          <div
            dir={dir}
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setSettleModalOpen(false)}
              className="absolute top-5 end-5 p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-brand-navy">
                  {isRTL ? "تسوية مستحقات العضو" : "Settle Member Balance"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isRTL
                    ? "تأكيد استلام المبلغ وتوثيق العملية في سجل التدقيق"
                    : "Confirm payment collection and log transaction"}
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

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{isRTL ? "اسم العضو:" : "Member Name:"}</span>
                <span className="font-bold text-slate-900">{selectedMember.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{isRTL ? "الساعات المتجاوزة:" : "Extra Hours:"}</span>
                <span className="font-bold text-slate-900">{selectedMember.extra_hours} ساعة</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{isRTL ? "تعرفة الساعة:" : "Hourly Rate:"}</span>
                <span className="font-bold text-slate-900">2 شيكل / ساعة</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-800">
                  {isRTL ? "المبلغ المطلوب تحصيله:" : "Amount to Settle:"}
                </span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {selectedMember.due_amount} ₪
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRTL ? "طريقة استلام المبلغ:" : "Payment Method:"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    paymentMethod === "cash"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {isRTL ? "نقداً (Cash)" : "Cash"}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    paymentMethod === "bank_transfer"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {isRTL ? "تحويل بنكي" : "Bank"}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    paymentMethod === "card"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {isRTL ? "بطاقة / محفظة" : "Card/Wallet"}
                </button>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isRTL ? "ملاحظة أو رقم سند القبض (اختياري):" : "Notes / Receipt # (Optional):"}
              </label>
              <input
                type="text"
                value={settlementNotes}
                onChange={(e) => setSettlementNotes(e.target.value)}
                placeholder={isRTL ? "مثال: استلام نقدي بالاستقبال - إيصال #104" : "e.g. Receipt #104"}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSettleModalOpen(false)}
                disabled={settling}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                disabled={settling}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {settling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isRTL ? "جاري التسوية..." : "Settling..."}</span>
                  </>
                ) : (
                  <span>{isRTL ? "تأكيد استلام المبلغ" : "Confirm Settlement"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
