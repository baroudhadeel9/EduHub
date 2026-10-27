"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getAdminReportsApi } from "@/services/applications";

export default function BeneficiariesTable() {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const r = t.admin?.reports;

  const [beneficiaries, setBeneficiaries] = useState({
    students: 0,
    freelancers: 0,
    jobseekers: 0,
    visitors: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAdminReportsApi();
        if (res.beneficiaries) {
          setBeneficiaries(res.beneficiaries);
        }
      } catch (err) {
        console.error("Failed to load beneficiaries:", err);
      }
    }
    loadData();
  }, []);

  const data = [
    {
      category: r?.catStudents || (isRTL ? "طلاب" : "Students"),
      dotColor: "bg-[#0c2340]",
      count: String(beneficiaries.students),
      bookings: String(Math.max(beneficiaries.students, 1)),
      hours: String(Math.max(beneficiaries.students * 12, 12)),
    },
    {
      category: r?.catFreelancers || (isRTL ? "فريلانسرز" : "Freelancers"),
      dotColor: "bg-[#059669]",
      count: String(beneficiaries.freelancers),
      bookings: String(beneficiaries.freelancers),
      hours: String(beneficiaries.freelancers * 20),
    },
    {
      category: r?.catVisitors || (isRTL ? "زوار (زيارات مقبولة)" : "Visitors (Approved visits)"),
      dotColor: "bg-slate-400",
      count: String(beneficiaries.visitors),
      bookings: String(beneficiaries.visitors),
      hours: String(beneficiaries.visitors * 2),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          {r?.beneficiariesTitle || (isRTL ? "المستفيدون" : "Beneficiaries")}
        </h2>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
          {r?.categoryTag || (isRTL ? "توزيع تصنيفي" : "Categorical Distribution")}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 text-xs font-bold">
              <th className="py-3.5 px-6 text-start font-bold">
                {r?.colCategory || (isRTL ? "الفئة" : "Category")}
              </th>
              <th className="py-3.5 px-6 text-center font-bold">
                {r?.colCount || (isRTL ? "العدد" : "Count")}
              </th>
              <th className="py-3.5 px-6 text-center font-bold">
                {r?.colBookings || (isRTL ? "الحجوزات" : "Bookings")}
              </th>
              <th className="py-3.5 px-6 text-center font-bold">
                {r?.colHours || (isRTL ? "الساعات" : "Hours")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2.5 font-bold text-slate-800">
                    <span className={`w-2 h-2 rounded-full ${row.dotColor}`} />
                    <span>{row.category}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center font-semibold text-slate-700">
                  {row.count}
                </td>
                <td className="py-4 px-6 text-center font-semibold text-slate-700">
                  {row.bookings}
                </td>
                <td className="py-4 px-6 text-center font-black text-indigo-950">
                  {row.hours}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
