"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import OverviewHeader from "@/components/admin/overview/OverviewHeader";
import QuickActionsBar from "@/components/admin/overview/QuickActionsBar";
import OverviewTopCards from "@/components/admin/overview/OverviewTopCards";
import TodayBookingsPanel from "@/components/admin/overview/TodayBookingsPanel";
import CheckInModal from "@/components/admin/CheckInModal";
import AdminQuickBookingModal from "@/components/admin/overview/AdminQuickBookingModal";
import { AttendanceRecord } from "@/components/admin/types";
import { getAdminOverviewApi, createManualAttendanceApi } from "@/services/applications";

export default function AdminOverviewPage() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const o = t.admin?.overview;

  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [counts, setCounts] = useState({
    pendingApplications: 0,
    pendingVisitors: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getAdminOverviewApi();
        if (res.topCards) {
          setCounts({
            pendingApplications: res.topCards.pendingApplications || 0,
            pendingVisitors: res.topCards.pendingVisitors || 0,
          });
        }
      } catch (err) {
        console.warn("Could not load overview pending stats:", err);
      }
    }
    fetchStats();
  }, [refreshKey]);

  const handleFastCheckIn = async (record: AttendanceRecord) => {
    try {
      await createManualAttendanceApi({
        name: record.name,
        type: record.type,
        subText: record.subText,
        bookingTime: record.bookingTime,
      });
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert(msg || "تعذر تسجيل الحضور.");
    }
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white"
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab="overview"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-64 xl:mr-72" : "lg:ml-64 xl:ml-72"
        }`}
      >
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Header */}
          <OverviewHeader
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* ── 1. Smart Quick Actions Bar & Pending Tasks Alert ── */}
          <QuickActionsBar
            onOpenCheckIn={() => setIsCheckInOpen(true)}
            onOpenQuickBooking={() => setIsQuickBookingOpen(true)}
            pendingApplications={counts.pendingApplications}
            pendingVisitors={counts.pendingVisitors}
          />

          {/* Top 3 Statistic & Action Cards */}
          <OverviewTopCards />

          {/* Live Today's Bookings from Database */}
          <div>
            <TodayBookingsPanel refreshKey={refreshKey} />
          </div>

          {/* Bottom System Footer */}
          <footer className="text-center pt-8 pb-8 text-xs text-slate-400 font-medium">
            {o?.footer ||
              (isRTL
                ? "لوحة التحكم الإدارية لمركز غزة التعليمي (EduHub) © 2026. جميع الحقوق محفوظة."
                : "EduHub Central Management System © 2026. All rights reserved.")}
          </footer>

        </main>
      </div>

      {/* ── Modals: Fast Check-In & Quick Booking ── */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSubmit={handleFastCheckIn}
      />

      <AdminQuickBookingModal
        isOpen={isQuickBookingOpen}
        onClose={() => setIsQuickBookingOpen(false)}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
