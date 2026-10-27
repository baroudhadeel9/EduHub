"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  CalendarCheck,
  UserCheck,
  Users,
  BarChart3,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  Compass,
} from "lucide-react";

export default function QuickNavSection() {
  const { locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const sections = [
    {
      id: "applications",
      title: isRTL ? "طلبات العضوية" : "Applications",
      desc: isRTL
        ? "فحص وتدقيق طلبات الانضمام الجديدة والـ 21 حقلاً واعتمادها."
        : "Review and approve new 21-field membership intake applications.",
      icon: UserPlus,
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      href: "/admin/applications",
      actionText: isRTL ? "فحص الطلبات" : "Review Intake",
    },
    {
      id: "attendance",
      title: isRTL ? "الحضور اليومي" : "Daily Attendance",
      desc: isRTL
        ? "متابعة الحضور الميداني، تسجيل وصول ومغادرة الأعضاء فوريًا."
        : "Track field attendance, live member check-ins, and departures.",
      icon: CalendarCheck,
      iconBg: "bg-[#0c2340]/10 text-[#0c2340] border-[#0c2340]/15",
      href: "/admin/attendance",
      actionText: isRTL ? "فتح سجل الحضور" : "Open Attendance Log",
    },
    {
      id: "members",
      title: isRTL ? "دليل الأعضاء" : "Members Directory",
      desc: isRTL
        ? "إدارة حسابات الطلاب والمستقلين المعتمدين، الأرصدة المستهلكة، والمستحقات."
        : "Manage active members, remaining hours balance, and quota.",
      icon: Users,
      iconBg: "bg-teal-50 text-teal-700 border-teal-200",
      href: "/admin/members",
      actionText: isRTL ? "عرض الأعضاء" : "View Members",
    },
    {
      id: "visitors",
      title: isRTL ? "طلبات الزوار" : "Visitor Requests",
      desc: isRTL
        ? "مراجعة واعتماد طلبات الدخول والزيارة الاستثنائية ليوم واحد."
        : "Review and approve 1-day exceptional visitor passes.",
      icon: UserCheck,
      iconBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
      href: "/admin/visitor-requests",
      actionText: isRTL ? "إدارة الطلبات" : "Manage Requests",
    },
    {
      id: "reports",
      title: isRTL ? "التقارير الشهرية" : "Monthly Reports",
      desc: isRTL
        ? "استعراض تقرير المؤسسة الشهري الشامل، ساعات الحجز، وخيار الطباعة."
        : "Explore the verified organization monthly report and print metrics.",
      icon: BarChart3,
      iconBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      href: "/admin/reports",
      actionText: isRTL ? "استعراض التقرير" : "Explore Report",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base sm:text-lg font-black text-[#0c2340] tracking-tight">
            {isRTL ? "الوصول السريع للأقسام الرئيسية" : "Quick Navigation Gateway"}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {sections.map((sec) => {
          const Icon = sec.icon;

          return (
            <Link
              key={sec.id}
              href={sec.href}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${sec.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#0c2340] group-hover:text-emerald-700 transition-colors">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {sec.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">
                <span>{sec.actionText}</span>
                <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
