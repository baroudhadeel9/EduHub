"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getAdminOverviewApi, clearAdminAuthSession } from "@/services/applications";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  UserCheck,
  Users,
  CreditCard,
  BarChart3,
  X,
  UserPlus,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  currentTab: string;
  onTabChange?: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({
  currentTab = "overview",
  onTabChange,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const { t, locale, setLocale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const s = t.admin?.sidebar;

  const router = useRouter();
  const [realCounts, setRealCounts] = useState({
    pendingApplications: 0,
    pendingVisitors: 0,
    totalMembers: 0,
  });

  const handleLogout = () => {
    clearAdminAuthSession();
    router.replace("/login");
  };

  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await getAdminOverviewApi();
        if (res?.topCards) {
          setRealCounts({
            pendingApplications: res.topCards.pendingApplications || 0,
            pendingVisitors: res.topCards.pendingVisitors || 0,
            totalMembers: res.topCards.totalMembers || 0,
          });
        }
      } catch {
        // Silently keep 0 counts if network error
      }
    }
    loadCounts();
  }, []);

  const navItems = [
    {
      id: "overview",
      label: s?.overview || (isRTL ? "نظرة عامة" : "Overview"),
      icon: LayoutDashboard,
      badge: null,
      href: "/admin",
    },
    {
      id: "applications",
      label: isRTL ? "طلبات العضوية" : "Membership Applications",
      icon: UserPlus,
      badge:
        realCounts.pendingApplications > 0
          ? { text: String(realCounts.pendingApplications), bg: "bg-amber-100 text-amber-800" }
          : null,
      href: "/admin/applications",
    },
    {
      id: "bookings",
      label: isRTL ? "جدول الحجوزات" : "Bookings Roster",
      icon: CalendarDays,
      badge: null,
      href: "/admin/bookings",
    },
    {
      id: "dailyAttendance",
      label: s?.dailyAttendance || (isRTL ? "الحضور اليومي" : "Daily Attendance"),
      icon: CalendarCheck,
      badge: null,
      href: "/admin/attendance",
    },
    {
      id: "members",
      label: s?.members || (isRTL ? "دليل الأعضاء" : "Members Directory"),
      icon: Users,
      badge:
        realCounts.totalMembers > 0
          ? { text: String(realCounts.totalMembers), bg: "bg-emerald-100 text-emerald-800" }
          : null,
      href: "/admin/members",
    },
    {
      id: "dues",
      label: isRTL ? "المستحقات المالية" : "Financial Dues",
      icon: CreditCard,
      badge: null,
      href: "/admin/dues",
    },
    {
      id: "visitorRequests",
      label: s?.visitorRequests || (isRTL ? "طلبات الزوار" : "Visitor Passes"),
      icon: UserCheck,
      badge:
        realCounts.pendingVisitors > 0
          ? { text: String(realCounts.pendingVisitors), bg: "bg-orange-100 text-orange-800" }
          : null,
      href: "/admin/visitor-requests",
    },
    {
      id: "reports",
      label: s?.reports || (isRTL ? "التقارير الشهرية" : "Monthly Reports"),
      icon: BarChart3,
      badge: null,
      href: "/admin/reports",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 z-50 flex flex-col justify-between w-72 max-w-[85vw] xl:w-72 bg-white border-slate-200/90 transition-all duration-300 ease-in-out ${
          isRTL
            ? "right-0 border-l shadow-[-4px_0_24px_rgba(0,0,0,0.06)]"
            : "left-0 border-r shadow-[4px_0_24px_rgba(0,0,0,0.06)]"
        } ${
          isOpen
            ? "translate-x-0 visible opacity-100 shadow-2xl"
            : isRTL
            ? "translate-x-full max-lg:hidden max-lg:invisible max-lg:pointer-events-none max-lg:opacity-0 lg:visible lg:pointer-events-auto lg:opacity-100 lg:translate-x-0"
            : "-translate-x-full max-lg:hidden max-lg:invisible max-lg:pointer-events-none max-lg:opacity-0 lg:visible lg:pointer-events-auto lg:opacity-100 lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Logo & Mobile Close */}
          <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-100">
            <Link href="/" className="flex items-center group">
              <div className="relative h-10 w-36">
                <Image
                  src="/images/logo.png"
                  alt="EduHub Logo"
                  fill
                  className="object-contain object-start transition-transform group-hover:scale-102"
                  priority
                  unoptimized
                />
              </div>
            </Link>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Menu Title */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">
            {s?.mainMenu || (isRTL ? "القائمة الرئيسية" : "Main Menu")}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Admin Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (onTabChange) onTabChange(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#0c2340] text-white shadow-md shadow-slate-900/15"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-emerald-400" : "text-slate-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isActive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                          : item.badge.bg
                      }`}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Language Switcher & Logout */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
          {/* Segmented Language Switcher */}
          <div className="p-1 bg-slate-200/60 rounded-xl flex items-center gap-1" dir="ltr">
            <button
              type="button"
              onClick={() => setLocale("ar")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                locale === "ar"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              العربية
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                locale === "en"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              English
            </button>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
            <span>{isRTL ? "تسجيل الخروج" : "Sign Out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

