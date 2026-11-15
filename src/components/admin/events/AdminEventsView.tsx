"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import EventsFilterBar from "@/components/admin/events/EventsFilterBar";
import EventCard from "@/components/admin/events/EventCard";
import EventFormModal from "@/components/admin/events/EventFormModal";
import DeleteEventModal from "@/components/admin/events/DeleteEventModal";
import EventRegistrationsModal from "@/components/admin/events/EventRegistrationsModal";
import AdminAttendeesView from "@/components/admin/events/AdminAttendeesView";
import {
  EventItem,
  getAdminEventsApi,
  updateAdminEventApi,
  archiveAdminEventApi,
  unarchiveAdminEventApi,
  getAdminAnnouncementApi,
  updateAdminAnnouncementApi,
} from "@/services/events";
import {
  CalendarX,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Globe2,
  Camera,
  Archive,
} from "lucide-react";

export default function AdminEventsView() {
  const { dir, locale, t } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ev = (t.admin as Record<string, any>)?.events;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [counts, setCounts] = useState<{
    published: number;
    archived: number;
    completed?: number;
    scheduled?: number;
    total_registrations?: number;
    total?: number;
  }>({
    published: 0,
    archived: 0,
    completed: 0,
    scheduled: 0,
    total_registrations: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filters: default to 'published' (الورش المعروضة بالموقع)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("published");

  // Modals state
  const [mainView, setMainView] = useState<"workshops" | "attendees">("workshops");
  const [selectedAttendeeEventId, setSelectedAttendeeEventId] = useState<number | "all" | "upcoming">("upcoming");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [eventForRegistrations, setEventForRegistrations] = useState<EventItem | null>(null);

  // Active top announcement ID
  const [activeAnnouncementId, setActiveAnnouncementId] = useState<number | null>(null);

  const loadAnnouncementInfo = useCallback(async () => {
    try {
      const res = await getAdminAnnouncementApi();
      if (res.success && res.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = res.data as any;
        const cfg = raw.config || raw;
        if (cfg && (cfg.enabled || cfg.is_active)) {
          setActiveAnnouncementId(cfg.event_id || null);
        } else {
          setActiveAnnouncementId(null);
        }
      }
    } catch {}
  }, []);

  const handleSetAsAnnouncement = async (event: EventItem) => {
    const isAlreadyActive = activeAnnouncementId === event.id;
    try {
      if (isAlreadyActive) {
        await updateAdminAnnouncementApi({ enabled: false });
        setActiveAnnouncementId(null);
        try {
          localStorage.removeItem("eduhub_active_announcement");
        } catch {}
      } else {
        const payload = {
          enabled: true,
          badge: isRTL ? "ورشة عمل قادمة" : "Upcoming Workshop",
          text: isRTL
            ? `انطلاق ورشة: ${event.title} — التسجيل متاح مجاناً الآن`
            : `Workshop: ${event.title} — Free Registration Open`,
          action_type: event.custom_url ? ("custom_url" as const) : ("event_registration" as const),
          custom_url: event.custom_url || "",
          event_id: event.id,
          button_label: isRTL ? "سجّل الآن مجاناً" : "Register Free",
        };

        const res = await updateAdminAnnouncementApi(payload);
        if (res.success) {
          setActiveAnnouncementId(event.id);
          try {
            localStorage.setItem("eduhub_active_announcement", JSON.stringify({ ...payload, event }));
          } catch {}
        }
      }
      try {
        window.dispatchEvent(new Event("eduhub_announcement_updated"));
        window.dispatchEvent(new Event("eduhub_events_updated"));
      } catch {}
      loadAnnouncementInfo();
      loadEvents();
    } catch (err) {
      console.error("Failed to toggle workshop announcement", err);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Fetch events from server with optional silent background refresh
  const loadEvents = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
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
        loadAnnouncementInfo();
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [statusFilter, searchTerm, loadAnnouncementInfo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadEvents]);

  // Ensure all events are available for the attendees filter dropdown
  useEffect(() => {
    if (mainView === "attendees" && allEvents.length === 0) {
      getAdminEventsApi({ status: "all" }).then((res) => {
        if (res.success && res.data) {
          setAllEvents(res.data);
        }
      });
    }
  }, [mainView, allEvents.length]);

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

  const handleOpenRegistrations = (event: EventItem) => {
    setSelectedAttendeeEventId(event.id);
    setMainView("attendees");
  };

  // Instant 1-Click Status Toggle ("تمت الورشة" <-> "إعادة فتح كورشة قادمة")
  const handleToggleStatus = async (event: EventItem, newStatus: "scheduled" | "completed") => {
    const prevEvents = [...events];
    const prevCounts = { ...counts };

    const isMarkingCompleted = newStatus === "completed";
    const newBadge = isMarkingCompleted
      ? isRTL ? "تمت الورشة" : "Completed"
      : isRTL ? "قادمة ومتاحة" : "Upcoming";

    // 1. Instant 0ms Optimistic UI update
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id
          ? {
              ...e,
              status: newStatus,
              statusBadge: newBadge,
              allow_registration: !isMarkingCompleted,
              is_registration_open: !isMarkingCompleted,
            }
          : e
      )
    );

    setCounts((prev) => ({
      ...prev,
      scheduled: Math.max(0, (prev.scheduled ?? 0) + (isMarkingCompleted ? -1 : 1)),
      completed: Math.max(0, (prev.completed ?? 0) + (isMarkingCompleted ? 1 : -1)),
    }));

    if (isMarkingCompleted && activeAnnouncementId === event.id) {
      setActiveAnnouncementId(null);
      try {
        localStorage.removeItem("eduhub_active_announcement");
      } catch {}
    }

    // 2. Background API call
    try {
      const res = await updateAdminEventApi(event.id, {
        status: newStatus,
        allow_registration: !isMarkingCompleted,
      });

      if (!res.success) {
        throw new Error(res.message || "Failed to update status");
      }

      if (res.data) {
        setEvents((prev) => prev.map((e) => (e.id === event.id ? (res.data as EventItem) : e)));
      }

      try {
        window.dispatchEvent(new Event("eduhub_events_updated"));
        window.dispatchEvent(new Event("eduhub_announcement_updated"));
        localStorage.setItem("eduhub_events_last_sync", String(Date.now()));
      } catch {}
    } catch (err) {
      console.error("Failed to update status, reverting:", err);
      setEvents(prevEvents);
      setCounts(prevCounts);
    }
  };

  // Form Success Handler: Instant Optimistic update + silent background refresh
  const handleFormSuccess = (savedEvent?: EventItem, isEditing?: boolean) => {
    if (savedEvent) {
      if (isEditing) {
        setEvents((prev) =>
          prev.map((e) => (e.id === savedEvent.id ? { ...e, ...savedEvent } : e))
        );
      } else {
        setEvents((prev) => [savedEvent, ...prev]);
        setCounts((prev) => ({
          ...prev,
          total: (prev.total ?? 0) + 1,
          scheduled: (prev.scheduled ?? 0) + (savedEvent.status === "scheduled" ? 1 : 0),
          completed: (prev.completed ?? 0) + (savedEvent.status === "completed" ? 1 : 0),
          published: (prev.published ?? 0) + 1,
        }));
      }
    }
    loadEvents(true);
    setMainView("workshops");
  };

  // Optimistic Archive / Restore
  const handleToggleArchive = async (event: EventItem) => {
    const isCurrentlyArchived = Boolean(event.is_archived || event.status === "archived");
    const newArchived = !isCurrentlyArchived;

    // Snapshot previous state for rollback if needed
    const prevEvents = [...events];
    const prevCounts = { ...counts };

    // 1. Optimistic UI update
    const isFuture = event.event_date ? new Date(event.event_date) >= new Date() : false;
    const restoredStatus = isFuture ? "scheduled" : "completed";

    if (statusFilter === "all") {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, is_archived: newArchived, status: newArchived ? "archived" : restoredStatus }
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
      try {
        window.dispatchEvent(new Event("eduhub_events_updated"));
        window.dispatchEvent(new Event("eduhub_announcement_updated"));
        localStorage.setItem("eduhub_events_last_sync", String(Date.now()));
      } catch {}
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

    try {
      const stored = localStorage.getItem("eduhub_active_announcement");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed?.event_id || Number(parsed.event_id) === Number(deletedId)) {
          localStorage.removeItem("eduhub_active_announcement");
        }
      }
      window.dispatchEvent(new Event("eduhub_events_updated"));
      localStorage.setItem("eduhub_events_last_sync", String(Date.now()));
    } catch {}
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
          {/* Single Unified Header */}
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
              <button
                type="button"
                onClick={handleOpenCreate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="whitespace-nowrap">{ev?.addWorkshop || (isRTL ? "إضافة ورشة جديدة" : "Add Workshop")}</span>
              </button>
            }
          />

          {/* Executive Summary Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Active Workshops */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                  {isRTL ? "الورش النشطة والمتاحة" : "Active Workshops"}
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/70 shrink-0">
                  <Globe2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {counts.scheduled ?? 0}
                </span>
                <span className="text-[10px] sm:text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">
                  {isRTL ? "متاحة للتسجيل" : "Open for students"}
                </span>
              </div>
            </div>

            {/* 2. Completed & Documented */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                  {isRTL ? "الورش المكتملة والموثقة" : "Completed & Documented"}
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200/70 shrink-0">
                  <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {counts.completed ?? 0}
                </span>
                <span className="text-[10px] sm:text-[11px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md font-bold">
                  {isRTL ? "موثقة بالصور" : "With photos"}
                </span>
              </div>
            </div>

            {/* 3. Total Registrants */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                  {isRTL ? "إجمالي طلبات التسجيل" : "Total Registrants"}
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/70 shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {counts.total_registrations ?? 0}
                </span>
                <span className="text-[10px] sm:text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-md font-bold">
                  {isRTL ? "طالب ومستفيد" : "Students"}
                </span>
              </div>
            </div>

            {/* 4. Archived Workshops */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                  {isRTL ? "الورش المؤرشفة" : "Archived Workshops"}
                </span>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/70 shrink-0">
                  <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {counts.archived ?? 0}
                </span>
                <span className="text-[10px] sm:text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md font-bold">
                  {isRTL ? "مخفية من الموقع" : "Hidden"}
                </span>
              </div>
            </div>
          </div>

          {/* Main Section Switcher */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl border border-slate-300/60 shadow-2xs">
              <button
                type="button"
                onClick={() => setMainView("workshops")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mainView === "workshops"
                    ? "bg-white text-emerald-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{isRTL ? "جدول ورش العمل" : "Workshops"}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black font-mono">
                  {counts.published + counts.archived}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMainView("attendees")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  mainView === "attendees"
                    ? "bg-white text-emerald-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{isRTL ? "المسجلون في الورش" : "Registrants"}</span>
                {typeof counts.total_registrations === "number" && counts.total_registrations > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black font-mono">
                    {counts.total_registrations}
                  </span>
                )}
              </button>
            </div>
          </div>

          {mainView === "attendees" ? (
            <AdminAttendeesView
              events={allEvents.length > 0 ? allEvents : events}
              initialEventId={selectedAttendeeEventId}
              onOpenFormCustomizer={() => handleOpenCreate()}
              isRTL={isRTL}
            />
          ) : (
            <>
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
                  <div
                    className={`grid gap-6 ${
                      paginatedEvents.length === 2
                        ? "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto"
                        : paginatedEvents.length === 1
                        ? "grid-cols-1 max-w-lg mx-auto"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    }`}
                  >
                    {paginatedEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                        onToggleArchive={handleToggleArchive}
                        onToggleStatus={handleToggleStatus}
                        onViewRegistrations={handleOpenRegistrations}
                        onSetAsAnnouncement={handleSetAsAnnouncement}
                        isAnnouncement={event.id === activeAnnouncementId}
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
            </>
          )}
        </main>
      </div>

      {/* Create / Edit Modal */}
      <EventFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        eventToEdit={eventToEdit}
        onSuccess={handleFormSuccess}
        isAnnouncement={eventToEdit ? activeAnnouncementId === eventToEdit.id : false}
        isRTL={isRTL}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEventModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        event={eventToDelete}
        onSuccess={() => {
          loadEvents();
          setMainView("workshops");
        }}
        onDeleted={handleOptimisticDelete}
        isRTL={isRTL}
      />

      {/* Workshop Attendees / Registrations Modal */}
      <EventRegistrationsModal
        isOpen={registrationsModalOpen}
        onClose={() => setRegistrationsModalOpen(false)}
        event={eventForRegistrations}
        onRefreshEvent={loadEvents}
      />
    </div>
  );
}
