"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ApplicationsTable from "@/components/admin/applications/ApplicationsTable";
import { Menu } from "lucide-react";

export default function AdminApplicationsPage() {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white"
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab="applications"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-64 xl:mr-72" : "lg:ml-64 xl:ml-72"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Mobile top controls & Page Title */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50 lg:hidden cursor-pointer"
                aria-label="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isRTL ? "طلبات العضوية" : "Membership Applications"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {isRTL
                    ? "استعراض وفحص طلبات الانضمام واعتماد بيانات المتقدمين."
                    : "Review submitted membership applications and verify details."}
                </p>
              </div>
            </div>
          </div>

          {/* Applications Table Component */}
          <ApplicationsTable />
        </div>
      </div>
    </div>
  );
}
