"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Users,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Menu,
} from "lucide-react";
import { MemberRecord, MemberType, MemberStatus } from "./data";
import MemberDetailDrawer from "./MemberDetailDrawer";
import { getAdminMembersApi, updateAdminMemberApi } from "@/services/applications";

type SortOption = "most_active" | "least_active" | "students_first" | "freelancers_first" | "newest";

interface MembersTableProps {
  onOpenMobileMenu?: () => void;
}

export default function MembersTable({ onOpenMobileMenu }: MembersTableProps = {}) {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const m = t.admin?.members;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("most_active");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const loadMembers = React.useCallback(async () => {
    try {
      const data = await getAdminMembersApi();
      if (data && data.length > 0) {
        const backendMembers: MemberRecord[] = (data as Record<string, unknown>[]).map((d) => {
          const name = String(d.name || d.full_name || "عضو جديد");
          const rawType = String(d.type || d.member_type || "student");
          const memberType: MemberType = rawType.includes("free") || rawType.includes("مستقل") ? "freelancer" : "student";
          const quota = (d.current_quota || {}) as Record<string, number>;
          const hoursLimit = Number(d.hoursLimit ?? d.hours_limit ?? quota.allocated_hours ?? (memberType === "student" ? 25 : 35));
          const hoursUsed = Number(d.hoursUsed ?? d.hours_used ?? quota.used_hours ?? 0);
          const extraHours = Number(d.extraHours ?? d.extra_hours ?? quota.extra_hours ?? 0);
          const remainingHours = Math.max(0, hoursLimit - hoursUsed);
          const dueAmount = Number(d.dueAmount ?? d.due_amount ?? quota.extra_amount_due ?? 0);
          const joinedDate = String(d.joinedDate || d.created_at || "").split("T")[0];

          return {
            id: String(d.id),
            name,
            email: String(d.email || ""),
            phone: String(d.phone || ""),
            gender: (d.gender as "male" | "female") || "male",
            nationalId: String(d.nationalId || d.national_id || ""),
            avatarLetter: String(d.avatarLetter || name.charAt(0) || "م"),
            avatarColor:
              String(d.avatarColor ||
              (memberType === "student"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-teal-100 text-teal-800 border-teal-200")),
            type: memberType,
            specialty: String(d.specialty || (memberType === "student" ? "طالب جامعي" : "مستقل")),
            joinedDate,
            hoursUsed,
            hoursLimit,
            extraHours,
            remainingHours,
            dueAmount,
            lastBooking: d.lastBooking && d.lastBooking !== "اليوم" ? String(d.lastBooking) : (isRTL ? "لا يوجد حجز بعد" : "No bookings yet"),
            status: (d.status as MemberStatus) || "active",
            history: (d.history as MemberRecord["history"]) || [],
          };
        });

        setMembers(backendMembers);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error("Failed to load members from backend", err);
    }
  }, [isRTL]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return null;
    return members.find((mem) => mem.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  const totalCount = members.length;
  const activeCount = members.filter(
    (mem) => mem.status === "active" || mem.status === "near_limit" || mem.status === "extra_hours"
  ).length;
  const freelancerCount = members.filter((mem) => mem.type === "freelancer").length;
  const studentCount = members.filter((mem) => mem.type === "student").length;

  const filters = [
    { id: "all", label: m?.filterAll || (isRTL ? "الكل" : "All") },
    { id: "active", label: isRTL ? "نشط" : "Active" },
    { id: "near_limit", label: m?.filterNearLimit || (isRTL ? "قارب على النهاية" : "Near Limit") },
    { id: "extra_hours", label: isRTL ? "ساعات إضافية" : "Extra Hours" },
    { id: "suspended", label: m?.filterSuspended || (isRTL ? "موقوف" : "Suspended") },
  ];

  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  const handleChangeCategoryAndGender = async (id: string, compositeValue: string) => {
    let newType: MemberType = "student";
    let newGender: "male" | "female" = "male";

    if (compositeValue === "student_female") {
      newType = "student";
      newGender = "female";
    } else if (compositeValue === "student_male") {
      newType = "student";
      newGender = "male";
    } else if (compositeValue === "freelancer_female") {
      newType = "freelancer";
      newGender = "female";
    } else if (compositeValue === "freelancer_male") {
      newType = "freelancer";
      newGender = "male";
    }

    const limit = newType === "student" ? 25 : 35;
    const avatarColor =
      newType === "student"
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-purple-50 text-purple-800 border-purple-200";

    setUpdatingMemberId(id);
    const prevMembers = [...members];
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              type: newType,
              gender: newGender,
              hoursLimit: limit,
              remainingHours: Math.max(0, limit - m.hoursUsed),
              avatarColor,
            }
          : m
      )
    );

    try {
      await updateAdminMemberApi(id, {
        member_type: newType,
        type: newType,
        gender: newGender,
      });
    } catch (err: unknown) {
      setMembers(prevMembers);
      const msg = err instanceof Error ? err.message : "";
      alert(msg || (isRTL ? "فشل تعديل الفئة على السيرفر." : "Failed to update category."));
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleChangeStatus = async (id: string, newStatus: "active" | "suspended") => {
    setUpdatingMemberId(id);
    const prevMembers = [...members];
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );

    try {
      await updateAdminMemberApi(id, { status: newStatus });
    } catch (err: unknown) {
      setMembers(prevMembers);
      const msg = err instanceof Error ? err.message : "";
      alert(msg || (isRTL ? "فشل تعديل حالة العضوية على السيرفر." : "Failed to update status."));
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    const mem = members.find((m) => m.id === id);
    if (!mem) return;
    const newStatus = mem.status === "suspended" ? "active" : "suspended";
    handleChangeStatus(id, newStatus);
  };

  const filteredAndSortedMembers = useMemo(() => {
    const result = members.filter((member) => {
      // Filter logic
      if (activeFilter === "active" && member.status !== "active") return false;
      if (activeFilter === "near_limit" && member.status !== "near_limit") return false;
      if (activeFilter === "extra_hours" && member.status !== "extra_hours") return false;
      if (activeFilter === "suspended" && member.status !== "suspended") return false;

      // Search query logic
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = member.name.toLowerCase().includes(q);
        const matchEmail = member.email ? member.email.toLowerCase().includes(q) : false;
        const matchSpecialty = member.specialty.toLowerCase().includes(q);
        return matchName || matchEmail || matchSpecialty;
      }

      return true;
    });

    // Sorting logic
    return result.sort((a, b) => {
      if (sortBy === "most_active") {
        return b.hoursUsed - a.hoursUsed;
      }
      if (sortBy === "least_active") {
        return a.hoursUsed - b.hoursUsed;
      }
      if (sortBy === "students_first") {
        if (a.type === "student" && b.type !== "student") return -1;
        if (a.type !== "student" && b.type === "student") return 1;
        return 0;
      }
      if (sortBy === "freelancers_first") {
        if (a.type === "freelancer" && b.type !== "freelancer") return -1;
        if (a.type !== "freelancer" && b.type === "freelancer") return 1;
        return 0;
      }
      return 0;
    });
  }, [members, activeFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-2xs lg:hidden cursor-pointer shrink-0"
            aria-label="Open Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {m?.title || (isRTL ? "دليل الأعضاء المشتركين" : "Members Directory")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isRTL
              ? "إدارة وتتبع الأعضاء المعتمدين، الحصص الشهرية، وسجلات الحضور والحجوزات."
              : "Manage registered members, monthly quotas, and booking records."}
          </p>
        </div>
      </div>

      {/* ── 4 Summary Stat Cards (Clean & Quiet) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isRTL ? "إجمالي الأعضاء" : "Total Members"}</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-400">{isRTL ? "عضو مسجل معتمد" : "Registered members"}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isRTL ? "الأعضاء النشطون" : "Active Members"}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{activeCount}</div>
          <div className="text-[11px] text-emerald-700 font-semibold">{isRTL ? "يحجزون الساعات بانتظام" : "Booking regularly"}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isRTL ? "مستقلين Freelancers" : "Freelancers"}</span>
            <Briefcase className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{freelancerCount}</div>
          <div className="text-[11px] text-slate-400">{isRTL ? "35 ساعة شهرياً" : "35h monthly limit"}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{isRTL ? "طلاب جامعيين" : "Students"}</span>
            <GraduationCap className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{studentCount}</div>
          <div className="text-[11px] text-slate-400">{isRTL ? "25 ساعة شهرياً" : "25h monthly limit"}</div>
        </div>
      </div>

      {/* ── Search, Filters, and Sorting Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={m?.searchPlaceholder || (isRTL ? "بحث باسم العضو أو التخصص..." : "Search by member name...")}
            className={`w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-medium ${
              isRTL ? "pr-4 pl-9" : "pl-4 pr-9"
            }`}
          />
          <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRTL ? "left-3" : "right-3"}`}>
            <Search className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {filters.map((f) => {
              const isActive = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#0c2340] text-white shadow-xs"
                      : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold hidden sm:inline-flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#f8fafc] border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 outline-none focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-semibold cursor-pointer"
            >
              <option value="most_active">{isRTL ? "الأكثر استخداماً" : "Most Active"}</option>
              <option value="least_active">{isRTL ? "الأقل استخداماً" : "Least Active"}</option>
              <option value="freelancers_first">{isRTL ? "مستقلين أولاً" : "Freelancers First"}</option>
              <option value="students_first">{isRTL ? "طلاب أولاً" : "Students First"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Members Table Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold text-start">
                <th className="py-3.5 px-4 text-start font-bold">
                  {isRTL ? "العضو" : "Member"}
                </th>
                <th className="py-3.5 px-4 text-center font-bold">
                  {isRTL ? "الفئة" : "Category"}
                </th>
                <th className="py-3.5 px-4 text-start font-bold min-w-[170px]">
                  {isRTL ? "استهلاك الرصيد الشهري" : "Monthly Usage"}
                </th>
                <th className="py-3.5 px-4 text-center font-bold">
                  {isRTL ? "حالة الحساب" : "Account Status"}
                </th>
                <th className="py-3.5 px-4 text-center font-bold">
                  {isRTL ? "الملف" : "Profile"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs sm:text-sm">
              {filteredAndSortedMembers.map((member) => {
                const percentage = Math.min(100, Math.round((member.hoursUsed / member.hoursLimit) * 100));

                return (
                  <tr
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Member Name, Email & Specialty */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 border ${member.avatarColor}`}
                        >
                          {member.avatarLetter}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {member.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {member.email}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal line-clamp-1 max-w-xs">
                            {member.specialty}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Member Category & Gender Direct Select Box */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="relative inline-flex items-center">
                        <select
                          value={`${member.type}_${member.gender || "male"}`}
                          disabled={updatingMemberId === member.id}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleChangeCategoryAndGender(member.id, e.target.value);
                          }}
                          title={isRTL ? "تعديل الفئة" : "Change category"}
                          className={`appearance-none bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold rounded-xl py-1.5 pe-7 ps-3.5 transition-all outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 shadow-2xs cursor-pointer ${
                            updatingMemberId === member.id ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          <option value="student_male">{isRTL ? "طالب" : "Student"}</option>
                          <option value="student_female">{isRTL ? "طالبة" : "Student (F)"}</option>
                          <option value="freelancer_male">{isRTL ? "فريلانسر" : "Freelancer"}</option>
                          <option value="freelancer_female">{isRTL ? "فريلانسر (أنثى)" : "Freelancer (F)"}</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute end-2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Progress Bar & Hours */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>
                            {member.hoursUsed} من {member.hoursLimit} س
                          </span>
                          {member.extraHours > 0 ? (
                            <span className="text-rose-600 font-bold text-[11px]">
                              +{member.extraHours} س إضافية
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium text-[11px]">
                              متبقي {member.remainingHours} س
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              member.status === "extra_hours"
                                ? "bg-rose-600"
                                : member.status === "near_limit"
                                ? "bg-amber-500"
                                : "bg-emerald-600"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 3. Account Status Direct Select Box */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center gap-1">
                        <div className="relative inline-flex items-center">
                          <select
                            value={member.status === "suspended" ? "suspended" : "active"}
                            disabled={updatingMemberId === member.id}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleChangeStatus(member.id, e.target.value as "active" | "suspended");
                            }}
                            title={isRTL ? "تعديل حالة الحساب" : "Change status"}
                            className={`appearance-none text-xs font-semibold rounded-xl py-1.5 pe-7 ps-3 border transition-all cursor-pointer outline-none shadow-2xs ${
                              member.status === "suspended"
                                ? "bg-rose-50/70 text-rose-700 border-rose-200 hover:border-rose-300 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 font-bold"
                                : "bg-white hover:bg-slate-50/80 text-slate-800 border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                            } ${updatingMemberId === member.id ? "opacity-60 cursor-not-allowed" : ""}`}
                          >
                            <option value="active">{isRTL ? "نشط" : "Active"}</option>
                            <option value="suspended">{isRTL ? "موقوف" : "Suspended"}</option>
                          </select>
                          <ChevronDown
                            className={`w-3.5 h-3.5 absolute end-2 pointer-events-none ${
                              member.status === "suspended" ? "text-rose-400" : "text-slate-400"
                            }`}
                          />
                        </div>

                        {/* Extra indicators if near limit or extra hours while active */}
                        {member.status === "extra_hours" && (
                          <span className="text-[10px] font-bold text-rose-600">
                            {isRTL ? "ساعات إضافية" : "Extra Hours"}
                          </span>
                        )}
                        {member.status === "near_limit" && (
                          <span className="text-[10px] font-bold text-amber-600">
                            {isRTL ? "قارب على النهاية" : "Near Limit"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action: Open Member Profile Drawer & Full Details */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMemberId(member.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isRTL ? "عرض الملف" : "Profile"}</span>
                          <ChevronIcon className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAndSortedMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    {isRTL ? "لا يوجد أعضاء يطابقون خيارات البحث" : "No members match the search criteria"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Slide-over Member Details Drawer ── */}
      <MemberDetailDrawer
        member={selectedMember}
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMemberId(null)}
        onToggleStatus={handleToggleStatus}
        onMemberUpdated={loadMembers}
      />
    </div>
  );
}
