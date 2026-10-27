"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ReportsStats from "@/components/admin/reports/ReportsStats";
import BeneficiariesTable from "@/components/admin/reports/BeneficiariesTable";
import WeeklyUsageChart from "@/components/admin/reports/WeeklyUsageChart";
import WorkshopsTable from "@/components/admin/reports/WorkshopsTable";
import { Printer, Menu } from "lucide-react";

export default function AdminReportsPage() {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const r = t.admin?.reports;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-[#5243e1] selection:text-white"
    >
      {/* Sidebar Navigation (hidden in print) */}
      <div className="print:hidden">
        <AdminSidebar
          currentTab="reports"
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`min-h-screen transition-all duration-300 print:m-0 print:p-0 ${
          isRTL ? "lg:mr-64 xl:mr-72" : "lg:ml-64 xl:ml-72"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Mobile top controls (hidden in print) */}
          <div className="flex items-center justify-between pb-2 lg:hidden print:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Report Top Card / Header matching Image 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col-reverse md:flex-row md:items-start justify-between gap-6">
              
              {/* Left Controls (in RTL: Print button & Verified badge) */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-98 transition-all cursor-pointer print:hidden"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>{r?.printBtn || (isRTL ? "طباعة التقرير" : "Print Report")}</span>
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{r?.verifiedBadge || (isRTL ? "بيانات معتمدة" : "Verified Data")}</span>
                </div>
              </div>

              {/* Right Side: Logo & Main Title & Dates */}
              <div className="space-y-3 text-start md:text-end">
                <div className="inline-block relative h-10 w-36">
                  <Image
                    src="/images/logo.png"
                    alt="EduHub Logo"
                    fill
                    className="object-contain object-start md:object-end"
                    priority
                    unoptimized
                  />
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {r?.title || (isRTL ? "تقرير المؤسسة الشهري" : "Monthly Organization Report")}
                </h1>

                <div className="flex items-center md:justify-end gap-3 text-xs sm:text-sm text-slate-500 font-medium flex-wrap">
                  <span>{r?.period || (isRTL ? "الفترة: أكتوبر 2026" : "Period: October 2026")}</span>
                  <span className="text-slate-300">|</span>
                  <span>{r?.issueDate || (isRTL ? "تاريخ الإصدار: 27 أكتوبر 2026" : "Issue Date: 27 October 2026")}</span>
                </div>
              </div>

            </div>
          </div>

          {/* 4 Key Statistics Cards */}
          <ReportsStats />

          {/* Beneficiaries Breakdown */}
          <BeneficiariesTable />

          {/* Weekly Space Usage Progress Bars */}
          <WeeklyUsageChart />

          {/* Workshops & Courses Table */}
          <WorkshopsTable />

          {/* Footer Note matching Image 1 */}
          <div className="text-center py-4 text-xs text-slate-400 font-medium">
            {r?.footerNotice ||
              (isRTL
                ? "تقرير إحصائي معتمد ومربوط مع قاعدة بيانات المنصة."
                : "Official statistical report synced directly with the platform database.")}
          </div>

        </div>
      </div>
    </div>
  );
}
