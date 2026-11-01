"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import MembersTable from "@/components/admin/members/MembersTable";

export default function AdminMembersPage() {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white"
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab="members"
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
          {/* Members Table Component */}
          <MembersTable onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        </div>
      </div>
    </div>
  );
}
