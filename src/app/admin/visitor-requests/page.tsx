"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import VisitorRequestsTable from "@/components/admin/visitors/VisitorRequestsTable";
import { Menu } from "lucide-react";

export default function VisitorRequestsPage() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-[#5243e1] selection:text-white"
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab="visitorRequests"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-64 xl:mr-72" : "lg:ml-64 xl:ml-72"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between pb-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Main Visitor Requests Table */}
          <VisitorRequestsTable />
        </div>
      </div>
    </div>
  );
}
