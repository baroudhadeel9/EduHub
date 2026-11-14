"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import EventsFilterBar from "@/components/admin/events/EventsFilterBar";
import EventCard from "@/components/admin/events/EventCard";
import EventFormModal from "@/components/admin/events/EventFormModal";
import DeleteEventModal from "@/components/admin/events/DeleteEventModal";
import {
  EventItem,
  getAdminEventsApi,
  archiveAdminEventApi,
  unarchiveAdminEventApi,
} from "@/services/events";
import {
  CalendarX,
  Plus,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminEventsPage() {
  const { dir, locale, t } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ev = (t.admin as Record<string, any>)?.events;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [counts, setCounts] = useState<{ published: number; archived: number; total?: number }>({
    published: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filters: default to 'published' (الورش المعروضة بالموقع)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("published");

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Fetch events from server
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminEventsApi({
        status: statusFilter,
        search: searchTerm,
      });

      if (res.success) {
        setEvents(res.data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawCounts = (res as any).counts;
        if (rawCounts) {
          setCounts(rawCounts);
        }
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadEvents]);

  // Handlers
  const handleOpenCreate = () => {
    setEventToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (event: EventItem) => {
    setEventToEdit(event);
    setFormModalOpen(true);
  };

  const handleOpenDelete = (event: EventItem) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  // Optimistic Archive / Restore
  const handleToggleArchive = async (event: EventItem) => {
    const isCurrentlyArchived = Boolean(event.is_archived || event.status === "archived");
    const newArchived = !isCurrentlyArchived;

    // Snapshot previous state for rollback if needed
    const prevEvents = [...events];
    const prevCounts = { ...counts };

    // 1. Optimistic UI update
    if (statusFilter === "all") {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, is_archived: newArchived, status: newArchived ? "archived" : "completed" }
            : e
        )
      );
    } else {
      // Remove immediately from current filtered view for zero-latency feel
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    }

    setCounts((prev) => ({
      ...prev,
      published: Math.max(0, prev.published + (newArchived ? -1 : 1)),
      archived: Math.max(0, prev.archived + (newArchived ? 1 : -1)),
    }));

    // 2. Background API call
    try {
      if (isCurrentlyArchived) {
        await unarchiveAdminEventApi(event.id);
      } else {
        await archiveAdminEventApi(event.id);
      }
    } catch (err) {
      console.error("Failed to toggle archive, reverting:", err);
      // Revert on error
      setEvents(prevEvents);
      setCounts(prevCounts);
    }
  };

  // Optimistic Delete handler
  const handleOptimisticDelete = (deletedId: number | string) => {
    setEvents((prev) => prev.filter((e) => e.id !== deletedId));
    setCounts((prev) => ({
      ...prev,
      published: statusFilter === "published" ? Math.max(0, prev.published - 1) : prev.published,
      archived: statusFilter === "archived" ? Math.max(0, prev.archived - 1) : prev.archived,
      total: typeof prev.total === "number" ? Math.max(0, prev.total - 1) : undefined,
    }));
  };

  // Compute pagination
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const paginatedEvents = events.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white"
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab="events"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-72" : "lg:ml-72"
        }`}
      >
        <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Single Unified Header (without date) */}
          <AdminHeader
            title={ev?.title || (isRTL ? "الورش والفعاليات" : "Workshops & Events")}
            subtitle={
              ev?.subtitle ||
              (isRTL
                ? "إدارة وتوثيق فعاليات المركز وعرضها مباشرة على الموقع للطلاب أو أرشفتها"
                : "Manage hub workshops, publish live or archive")
            }
            showDate={false}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            actionButton={
              <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                {/* View on Public Site Link */}
                <Link
                  href="/#events"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer active:scale-98"
                  title={ev?.previewSite || (isRTL ? "معاينة قسم الورش على الموقع الحي" : "Preview on live website")}
                >
                  <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="whitespace-nowrap">{ev?.previewSite || (isRTL ? "معاينة عالموقع" : "Preview Site")}</span>
                </Link>

                {/* Single Add Workshop Button */}
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span className="whitespace-nowrap">{ev?.addWorkshop || (isRTL ? "إضافة ورشة جديدة" : "Add Workshop")}</span>
                </button>
              </div>
            }
          />

          {/* Published vs Archived Filter Bar */}
          <EventsFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            counts={counts}
            onRefresh={loadEvents}
            loading={loading}
            isRTL={isRTL}
          />

          {/* Events Grid View */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
              <span className="text-xs sm:text-sm text-slate-500 font-semibold">
                {ev?.loading || (isRTL ? "جارٍ تحميل الورش والفعاليات..." : "Loading workshops...")}
              </span>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-md mx-auto my-8 shadow-2xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center border border-slate-200">
                <CalendarX className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {statusFilter === "archived"
                    ? ev?.emptyArchived || (isRTL ? "لا توجد ورش مؤرشفة حالياً" : "No Archived Workshops")
                    : ev?.emptyLive || (isRTL ? "لا توجد ورش معروضة مطابقة" : "No Events Found")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {searchTerm
                    ? ev?.trySearch || (isRTL ? "جرب البحث بكلمات أخرى." : "Try different search terms.")
                    : statusFilter === "archived"
                    ? ev?.allPublishedDesc || (isRTL ? "جميع ورش العمل الحالية منشورة ومعروضة على الموقع للطلاب." : "All current workshops are published on site.")
                    : ev?.noActiveDesc || (isRTL ? "لم تتم إضافة أي ورش عمل نشطة بعد. يمكنك إضافة ورشة جديدة الآن." : "No active workshops published yet.")}
                </p>
              </div>

              {statusFilter === "published" && !searchTerm && (
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{ev?.addNow || (isRTL ? "إضافة ورشة الآن" : "Add Workshop")}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    onToggleArchive={handleToggleArchive}
                    isRTL={isRTL}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 order-2 sm:order-1">
                    {isRTL
                      ? `عرض ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, events.length)} من أصل ${events.length} ورشة`
                      : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, events.length)} of ${events.length} workshops`}
                  </span>

                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
                      title={isRTL ? "الصفحة السابقة" : "Previous"}
                    >
                      <ChevronRight className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
                      title={isRTL ? "الصفحة التالية" : "Next"}
                    >
                      <ChevronLeft className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Modal */}
      <EventFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        eventToEdit={eventToEdit}
        onSuccess={loadEvents}
        isRTL={isRTL}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEventModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        event={eventToDelete}
        onSuccess={loadEvents}
        onDeleted={handleOptimisticDelete}
        isRTL={isRTL}
      />
    </div>
  );
}
