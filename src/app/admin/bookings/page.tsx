"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import BookingsTable from "@/components/admin/bookings/BookingsTable";
import AdminQuickBookingModal from "@/components/admin/overview/AdminQuickBookingModal";
import RoomClosureModal from "@/components/admin/bookings/RoomClosureModal";
import { Plus, Lock } from "lucide-react";

export default function AdminBookingsPage() {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white"
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab="bookings"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-72" : "lg:ml-72"
        }`}
      >
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <AdminHeader
            title={isRTL ? "جدول الحجوزات" : "Bookings Roster"}
            subtitle={
              isRTL
                ? "استعراض ومتابعة حجوزات المقاعد المجدولة للأعضاء"
                : "Review and monitor scheduled member seat reservations"
            }
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            actionButton={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsClosureModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/80 text-amber-900 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>{isRTL ? "إغلاق صالة / يوم" : "Room Closure"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickBookingOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRTL ? "حجز مقعد لعضو" : "Book for Member"}</span>
                </button>
              </div>
            }
          />

          {/* Bookings Table Component */}
          <BookingsTable refreshTrigger={refreshTrigger} />
        </main>
      </div>

      {/* Quick Booking Modal */}
      <AdminQuickBookingModal
        isOpen={isQuickBookingOpen}
        onClose={() => setIsQuickBookingOpen(false)}
        onSuccess={() => setRefreshTrigger((k) => k + 1)}
      />

      {/* Room Closure Modal */}
      <RoomClosureModal
        isOpen={isClosureModalOpen}
        onClose={() => setIsClosureModalOpen(false)}
        onUpdated={() => setRefreshTrigger((k) => k + 1)}
        isRTL={isRTL}
      />
    </div>
  );
}
