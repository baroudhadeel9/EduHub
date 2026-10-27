"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getAdminReportsApi } from "@/services/applications";

interface WorkshopItem {
  name: string;
  type: string;
  typeColor: string;
  date: string;
  participants: number;
}

interface RawWorkshop {
  name: string;
  type?: string;
  date?: string;
  participants?: number;
}

export default function WorkshopsTable() {
  const { t, locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const r = t.admin?.reports;

  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);

  useEffect(() => {
    async function loadWorkshops() {
      try {
        const res = await getAdminReportsApi();
        if (res.workshops && res.workshops.length > 0) {
          const mapped = (res.workshops as RawWorkshop[]).map((w) => {
            const dateStr = typeof w.date === "string" ? w.date.split("T")[0] : "";
            return {
              name: w.name,
              type: w.type || "ورشة",
              typeColor:
                w.type === "دورة"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-cyan-50 text-cyan-800 border-cyan-200",
              date: dateStr,
              participants: w.participants || 0,
            };
          });
          setWorkshops(mapped);
        }
      } catch (err) {
        console.error("Failed to load workshops:", err);
      }
    }
    loadWorkshops();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          {r?.workshopsTitle || (isRTL ? "الورش والدورات" : "Workshops & Courses")}
        </h2>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          {r?.underUpdateTag || (isRTL ? "قيد التحديث" : "Under Update")}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 text-xs font-bold">
              <th className="py-3.5 px-6 text-start font-bold">
                {r?.colWorkshopName || (isRTL ? "الاسم" : "Name")}
              </th>
              <th className="py-3.5 px-6 text-center font-bold">
                {r?.colWorkshopType || (isRTL ? "النوع" : "Type")}
              </th>
              <th className="py-3.5 px-6 text-center font-bold">
                {r?.colWorkshopDate || (isRTL ? "التاريخ" : "Date")}
              </th>
              <th className="py-3.5 px-6 text-center font-bold">
                {r?.colParticipants || (isRTL ? "المشاركون" : "Participants")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {workshops.map((w, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900">
                  {w.name}
                </td>
                <td className="py-4 px-6 text-center">
                  <span
                    className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${w.typeColor}`}
                  >
                    {w.type}
                  </span>
                </td>
                <td className="py-4 px-6 text-center text-xs font-medium text-slate-600">
                  {w.date}
                </td>
                <td className="py-4 px-6 text-center font-bold text-slate-700">
                  {w.participants}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
