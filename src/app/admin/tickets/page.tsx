"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SupportTicketsView from "@/components/admin/tickets/SupportTicketsView";
import { Menu } from "lucide-react";

export default function AdminTicketsPage() {
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
        currentTab="tickets"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          isRTL ? "lg:mr-72" : "lg:ml-72"
        }`}
      >
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900">
                  {isRTL ? "الدعم الفني ومشاكل الطلاب" : "Support Tickets & Issues"}
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {isRTL
                    ? "متابعة وحل مشاكل وانقطاعات الطلاب والأعضاء في إديو هب غزة"
                    : "Manage and resolve member complaints and technical inquiries"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <SupportTicketsView />
        </main>
      </div>
    </div>
  );
}
