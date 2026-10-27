"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  Calendar as CalendarIcon,
  Info,
  CheckCircle2,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { VisitorRequest } from "./types";
import RejectReasonModal from "./RejectReasonModal";
import ApproveSuccessModal from "./ApproveSuccessModal";
import VisitorDetailModal from "./VisitorDetailModal";
import {
  getAdminVisitorRequestsApi,
  updateVisitorRequestStatusApi,
} from "@/services/applications";

interface RawVisitorRequest {
  id: string | number;
  name: string;
  phone?: string;
  email?: string;
  submission_time?: string;
  submission_date?: string;
  created_at?: string;
  visit_date?: string;
  visit_time?: string;
  duration_hours?: number | string;
  purpose?: string;
  status?: string;
}

export default function VisitorRequestsTable() {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const vr = t.admin?.visitorRequests;

  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  // Only active filters: all, pending, approved (rejected requests are excluded completely)
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [rejectingItem, setRejectingItem] = useState<VisitorRequest | null>(null);
  const [approvedItem, setApprovedItem] = useState<VisitorRequest | null>(null);
  const [passSentId, setPassSentId] = useState<string | null>(null);

  // Filter out rejected and expired requests right at mapping
  const mapRawRequests = (data: RawVisitorRequest[]): VisitorRequest[] => {
    const todayStr = new Date().toISOString().split("T")[0];
    return (data || [])
      .filter((r) => r.status !== "rejected" && r.status !== "مرفوض")
      .filter((r) => {
        const dateStr = typeof r.visit_date === "string" ? r.visit_date.split("T")[0] : "";
        // Exclude any request whose visit date has already passed
        if (dateStr && dateStr < todayStr) {
          return false;
        }
        return true;
      })
      .map((r) => {
        const dateStr = typeof r.visit_date === "string" ? r.visit_date.split("T")[0] : "";
        const isToday = dateStr === todayStr;
        return {
          id: String(r.id),
          name: r.name,
          phone: r.phone || "",
          email: r.email || "",
          submittedAt: r.submission_time
            ? `${r.submission_date || r.created_at?.split("T")[0]} - ${r.submission_time}`
            : typeof r.created_at === "string"
            ? r.created_at.split("T")[0]
            : "-",
          avatarLetter: r.name ? r.name.charAt(0) : "ز",
          avatarColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
          visitDate: dateStr || "-",
          visitTime: r.visit_time || "-",
          durationLabel: r.duration_hours ? `${r.duration_hours} ساعات` : "-",
          isToday,
          isVerified: r.status === "approved",
          purposeBadge: r.purpose ? r.purpose.slice(0, 24) : "-",
          purposeBadgeColor: "bg-slate-100 text-slate-700 border-slate-200",
          purposeText: r.purpose || "",
          status: (r.status as "pending" | "approved") || "pending",
        };
      });
  };

  useEffect(() => {
    let isMounted = true;
    getAdminVisitorRequestsApi()
      .then((data) => {
        if (!isMounted) return;
        setRequests(mapRawRequests(data as RawVisitorRequest[]));
      })
      .catch((err) => {
        console.error("Failed to load visitor requests:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedVisitor = useMemo(() => {
    if (!selectedVisitorId) return null;
    return requests.find((r) => r.id === selectedVisitorId) || null;
  }, [requests, selectedVisitorId]);

  // Dynamic counts calculated from real active requests
  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
    };
  }, [requests]);

  // Filtered requests (never includes rejected requests)
  const filtered = useMemo(() => {
    return requests
      .filter((item) => item.status !== "rejected")
      .filter((item) => {
        // Status filter
        if (filter !== "all" && item.status !== filter) return false;

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(query);
          const matchPhone = item.phone.includes(query);
          const matchEmail = item.email ? item.email.toLowerCase().includes(query) : false;
          const matchPurpose =
            item.purposeBadge.toLowerCase().includes(query) ||
            item.purposeText.toLowerCase().includes(query);
          return matchName || matchPhone || matchEmail || matchPurpose;
        }

        return true;
      });
  }, [requests, filter, searchQuery]);

  // Handlers
  const handleOpenDetail = (req: VisitorRequest) => {
    setSelectedVisitorId(req.id);
  };

  const handleCloseDetail = () => {
    setSelectedVisitorId(null);
  };

  const handleApprove = async (req: VisitorRequest) => {
    const today = new Date().toISOString().split("T")[0];
    if (req.visitDate !== "-" && req.visitDate < today) {
      alert(
        isRTL
          ? `لا يمكن قبول طلب زيارة بعد انتهاء تاريخ الزيارة المحدد (${req.visitDate}).`
          : `Cannot approve visitor request as the scheduled date (${req.visitDate}) has already passed.`
      );
      return;
    }

    try {
      await updateVisitorRequestStatusApi(req.id, "approved");
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: "approved", isVerified: true } : r))
      );
      setApprovedItem(req);
      setSelectedVisitorId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      alert(message || "تعذر اعتماد الطلب");
    }
  };

  const handleOpenReject = (req: VisitorRequest) => {
    setRejectingItem(req);
  };

  const handleConfirmReject = async (
    requestId: string,
    reason?: string,
    notes?: string,
    sendMessage = false
  ) => {
    try {
      await updateVisitorRequestStatusApi(requestId, "rejected", reason, notes);

      const targetReq = requests.find((r) => r.id === requestId);

      if (sendMessage && targetReq && targetReq.phone) {
        const cleanPhone = targetReq.phone.replace(/[^0-9]/g, "");
        const formattedPhone = cleanPhone.startsWith("05")
          ? "970" + cleanPhone.slice(1)
          : cleanPhone.startsWith("5")
          ? "970" + cleanPhone
          : cleanPhone;

        const reasonText = reason || "عدم توفر مقاعد شاغرة في التوقيت والمدة المطلوبة";
        const msg = `مرحباً ${targetReq.name}،\nنعتذر عن عدم قبول طلب تصريح الزيارة الخاص بك لمساحة EduHub لموعد (${targetReq.visitDate}).\nالسبب: ${reasonText}.${notes ? `\nملاحظات: ${notes}` : ""}\nشكراً لتفهمك ونتمنى لك التوفيق.`;
        const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, "_blank");
      }

      // Remove rejected request immediately from the list so it completely disappears
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setRejectingItem(null);
      setSelectedVisitorId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      alert(message || "تعذر رفض الطلب");
    }
  };

  const handleSendPass = (id: string) => {
    setPassSentId(id);
    setTimeout(() => {
      setPassSentId(null);
    }, 3000);
  };

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {vr?.title || (isRTL ? "طلبات الزوار" : "Visitor Requests")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {vr?.subtitle ||
            (isRTL
              ? "مراجعة وتدقيق تصاريح الزيارة اليومية النشطة لمساحة العمل."
              : "Review and manage daily visitor pass requests.")}
        </p>
      </div>

      {/* ── Search and Filters Bar (Clean & Calm) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? "بحث باسم الزائر..." : "Search by visitor name..."}
            className={`w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-all font-medium ${
              isRTL ? "pr-4 pl-9" : "pl-4 pr-9"
            }`}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${
              isRTL ? "left-3" : "right-3"
            }`}
          >
            <Search className="w-4 h-4" />
          </div>
        </div>

        {/* Filter Pills (All / Pending / Approved - No Rejected) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === "all"
                ? "bg-[#0c2340] text-white shadow-xs"
                : "text-slate-600 bg-slate-100 hover:bg-slate-200"
            }`}
          >
            <span>{vr?.filterAll || (isRTL ? "الكل" : "All")}</span>
            <span className="ms-1.5 opacity-80 font-normal">({counts.all})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === "pending"
                ? "bg-[#0c2340] text-white shadow-xs"
                : "text-slate-600 bg-slate-100 hover:bg-slate-200"
            }`}
          >
            <span>{vr?.filterPending || (isRTL ? "بانتظار القرار" : "Pending")}</span>
            <span className="ms-1.5 opacity-80 font-normal">({counts.pending})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("approved")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filter === "approved"
                ? "bg-[#0c2340] text-white shadow-xs"
                : "text-slate-600 bg-slate-100 hover:bg-slate-200"
            }`}
          >
            <span>{vr?.filterApproved || (isRTL ? "المقبولة" : "Approved")}</span>
            <span className="ms-1.5 opacity-80 font-normal">({counts.approved})</span>
          </button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold text-start">
                <th className="py-3.5 px-4 text-start font-bold">
                  {vr?.colApplicant || (isRTL ? "الاسم" : "Name")}
                </th>
                <th className="py-3.5 px-4 text-start font-bold">
                  {isRTL ? "موعد تقديم الطلب" : "Application Date"}
                </th>
                <th className="py-3.5 px-4 text-center font-bold">
                  {vr?.colStatus || (isRTL ? "الحالة" : "Status")}
                </th>
                <th className="py-3.5 px-4 text-center font-bold">
                  {isRTL ? "التفاصيل" : "Details"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>{isRTL ? "جاري تحميل طلبات الزيارة..." : "Loading visitor requests..."}</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    {isRTL ? "لا توجد طلبات زيارة حالية" : "No active visitor requests"}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${item.avatarColor}`}
                        >
                          {item.avatarLetter}
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          <span>{item.name}</span>
                          {item.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Submission Date/Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.submittedAt}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.status === "pending" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{vr?.statusPending || (isRTL ? "بانتظار القرار" : "Pending")}</span>
                        </span>
                      )}

                      {item.status === "approved" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>{vr?.statusApproved || (isRTL ? "مقبول" : "Approved")}</span>
                        </span>
                      )}
                    </td>

                    {/* View Details Button */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(item);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isRTL ? "عرض البيانات" : "View"}</span>
                        {isRTL ? (
                          <ChevronLeft className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Transparency Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 text-xs text-slate-500 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {vr?.notice ||
                (isRTL
                  ? "يتم إشعار الزائر فورياً بتصريح الدخول عبر رسائل الواتساب والبريد."
                  : "Visitors are notified with entry passes upon approval.")}
            </span>
          </div>
          <div className="font-semibold text-slate-600 shrink-0">
            {isRTL
              ? `عرض ${filtered.length} من أصل ${requests.length} طلباً نشطاً`
              : `Showing ${filtered.length} of ${requests.length} active requests`}
          </div>
        </div>
      </div>

      {/* Slide-over Visitor Detail Modal */}
      <VisitorDetailModal
        request={selectedVisitor}
        isOpen={Boolean(selectedVisitor)}
        onClose={handleCloseDetail}
        onApprove={handleApprove}
        onOpenReject={handleOpenReject}
        onSendPass={handleSendPass}
        isPassSent={selectedVisitor ? passSentId === selectedVisitor.id : false}
      />

      {/* Modal for Rejecting with Reason */}
      <RejectReasonModal
        isOpen={Boolean(rejectingItem)}
        onClose={() => setRejectingItem(null)}
        onConfirm={handleConfirmReject}
        request={rejectingItem}
      />

      {/* Success Modal after approval */}
      <ApproveSuccessModal
        isOpen={Boolean(approvedItem)}
        onClose={() => setApprovedItem(null)}
        request={approvedItem}
      />
    </div>
  );
}
