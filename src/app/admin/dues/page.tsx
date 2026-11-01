"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DuesTable from "@/components/admin/dues/DuesTable";

export default function AdminDuesPage() {
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
        currentTab="dues"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-72" : "lg:ml-72"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Main Dues Table */}
          <DuesTable onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        </div>
      </div>
    </div>
  );
}
