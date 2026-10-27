"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { MembershipApplication, ApplicationStatus } from "./data";
import ApplicationDetailModal from "./ApplicationDetailModal";
import {
  getAdminMembershipApplications,
  updateApplicationStatusApi,
} from "@/services/applications";
import {
  Search,
  Eye,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function ApplicationsTable() {
  const { locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<"date-desc" | "date-asc" | "student" | "freelancer" | "jobseeker">("date-desc");
  const [selectedApplication, setSelectedApplication] = useState<MembershipApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered & Sorted List
  const filteredAndSorted = applications
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.fullName.toLowerCase().includes(query) ||
        item.nationalId.includes(query) ||
        item.phone.includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.specialty.toLowerCase().includes(query) ||
        (item.university && item.university.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortOption === "student") {
        // Students first
        const isAStudent = a.category.includes("طالب") ? 1 : 0;
        const isBStudent = b.category.includes("طالب") ? 1 : 0;
        if (isAStudent !== isBStudent) return isBStudent - isAStudent;
        return a.id.localeCompare(b.id);
      }
      if (sortOption === "freelancer") {
        // Freelancers first
        const isAFree = a.category.includes("فريلانسر") ? 1 : 0;
        const isBFree = b.category.includes("فريلانسر") ? 1 : 0;
        if (isAFree !== isBFree) return isBFree - isAFree;
        return a.id.localeCompare(b.id);
      }
      if (sortOption === "jobseeker") {
        // Job-seekers first
        const isAJob = a.category.includes("باحث") ? 1 : 0;
        const isBJob = b.category.includes("باحث") ? 1 : 0;
        if (isAJob !== isBJob) return isBJob - isAJob;
        return a.id.localeCompare(b.id);
      }
      if (sortOption === "date-asc") {
        // Oldest first
        return a.applicationNumber.localeCompare(b.applicationNumber);
      }
      // date-desc: Newest first (default)
      return b.applicationNumber.localeCompare(a.applicationNumber);
    });

  const loadApplications = React.useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getAdminMembershipApplications();
      // Only keep pending applications awaiting admin decision
      const pendingData = (data || []).filter((app: MembershipApplication) => app.status === "pending");
      setApplications(pendingData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      setFetchError(
        message ||
          (isRTL
            ? "تعذر تحميل طلبات العضوية من الخادم. يرجى التأكد من تشغيل خادم الباك إند."
            : "Could not load applications from server.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [isRTL]);

  useEffect(() => {
    let isMounted = true;
    getAdminMembershipApplications()
      .then((data) => {
        if (!isMounted) return;
        const pendingData = (data || []).filter((app: MembershipApplication) => app.status === "pending");
        setApplications(pendingData);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : null;
        setFetchError(
          message ||
            (isRTL
              ? "تعذر تحميل طلبات العضوية من الخادم. يرجى التأكد من تشغيل خادم الباك إند."
              : "Could not load applications from server.")
        );
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isRTL]);

  const handleOpenDetail = (app: MembershipApplication) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: ApplicationStatus,
    note?: string,
    quota?: number
  ) => {
    try {
      const updated = await updateApplicationStatusApi(id, newStatus, note, quota);
      // When approved or rejected, remove from membership applications list
      if (newStatus === "approved" || newStatus === "rejected") {
        setApplications((prev) => prev.filter((app) => app.id !== id));
      } else {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, ...updated } : app))
        );
      }
      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication((prev) => (prev ? { ...prev, ...updated } : null));
      }
      return updated;
    } catch {
      // Optimistic removal for approved/rejected
      if (newStatus === "approved" || newStatus === "rejected") {
        setApplications((prev) => prev.filter((app) => app.id !== id));
      }
      return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Search & Quick Sort Bar (Clean & Simple) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? "بحث بالاسم..." : "Search by name..."}
            className={`w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-medium ${
              isRTL ? "pr-4 pl-9" : "pl-4 pr-9"
            }`}
          />
          <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRTL ? "left-3" : "right-3"}`}>
            <Search className="w-4 h-4" />
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{isRTL ? "ترتيب حسب:" : "Sort by:"}</span>
          </span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as "date-desc" | "date-asc" | "student" | "freelancer" | "jobseeker")}
            className="bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 cursor-pointer transition-all"
          >
            <option value="date-desc">{isRTL ? "الأحدث تاريخاً" : "Newest Date"}</option>
            <option value="date-asc">{isRTL ? "الأقدم تاريخاً" : "Oldest Date"}</option>
            <option value="student">{isRTL ? "طلاب أولاً" : "Students First"}</option>
            <option value="freelancer">{isRTL ? "فريلانسر أولاً" : "Freelancers First"}</option>
            <option value="jobseeker">{isRTL ? "باحث عن عمل أولاً" : "Job Seekers First"}</option>
          </select>
        </div>
      </div>

      {/* ── Table (Click any row to open modal) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold text-start">
                <th scope="col" className="py-3.5 px-4 text-start font-bold">
                  {isRTL ? "الاسم رباعي" : "Applicant"}
                </th>
                <th scope="col" className="py-3.5 px-4 text-start font-bold">
                  {isRTL ? "الفئة" : "Category"}
                </th>
                <th scope="col" className="py-3.5 px-4 text-start font-bold">
                  {isRTL ? "تاريخ التقديم" : "Submitted Date"}
                </th>
                <th scope="col" className="py-3.5 px-4 text-center font-bold">
                  {isRTL ? "التفاصيل" : "Details"}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-4 bg-slate-200 rounded-md w-36 mb-1"></div>
                      <div className="h-2.5 bg-slate-100 rounded-md w-24"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 bg-slate-100 rounded-md w-20"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 bg-slate-100 rounded-md w-28"></div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="h-7 bg-slate-100 rounded-xl w-24 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : fetchError ? (
                // Error State
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-rose-800 font-bold">{fetchError}</div>
                      <button
                        type="button"
                        onClick={loadApplications}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isRTL ? "إعادة المحاولة" : "Retry"}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSorted.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium text-xs">
                    {searchQuery.trim()
                      ? isRTL
                        ? "لا توجد طلبات مطابقة لكلمات البحث"
                        : "No applications matching search criteria"
                      : isRTL
                      ? "لا توجد طلبات عضوية مسجلة في قاعدة البيانات حالياً"
                      : "No membership applications found in database"}
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Name - National ID removed */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {item.fullName || "متقدم جديد"}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                        (item.category || "").includes("طالب")
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                          : (item.category || "").includes("فريلانسر")
                          ? "bg-teal-50 text-teal-800 border border-teal-100"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                      }`}>
                        {item.category || "-"}
                      </span>
                    </td>

                    {/* Submission Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.submissionDate || "-"}</span>
                      </div>
                    </td>

                    {/* View Button */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(item);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isRTL ? "عرض البيانات" : "View"}</span>
                        <ChevronIcon className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Component ── */}
      <ApplicationDetailModal
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />

    </div>
  );
}
