"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Search, RefreshCw, Globe2, Archive } from "lucide-react";

interface EventsFilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  counts?: { published: number; archived: number; total?: number };
  onRefresh: () => void;
  loading: boolean;
  isRTL: boolean;
}

export default function EventsFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  counts,
  onRefresh,
  loading,
  isRTL,
}: EventsFilterBarProps) {
  const { t } = useLanguage();
  const ev = (t.admin as Record<string, any>)?.events;

  const tabs = [
    {
      id: "published",
      label: ev?.liveTab || (isRTL ? "الورش المعروضة بالموقع" : "Live on Site"),
      icon: Globe2,
      count: counts?.published,
      color: "text-emerald-700",
    },
    {
      id: "archived",
      label: ev?.archivedTab || (isRTL ? "مؤرشفة" : "Archived"),
      icon: Archive,
      count: counts?.archived,
      color: "text-amber-700",
    },
  ];

  return (
    <div className="bg-white p-2 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
      {/* Published vs Archived Filter Tabs - Responsive Segmented Controls */}
      <div className="grid grid-cols-2 sm:flex sm:items-center bg-slate-100/90 p-1 rounded-xl shrink-0 gap-1 sm:gap-0">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          const IconComp = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 active:scale-98 ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? tab.color : "text-slate-400"} shrink-0`} />
              <span className="truncate">{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`font-mono text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isActive
                      ? "bg-slate-100 text-slate-800"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input & Refresh Button */}
      <div className="flex items-center gap-2 flex-1 md:max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              ev?.searchPlaceholder ||
              (isRTL
                ? "ابحث بعنوان الورشة، أو الشريك..."
                : "Search by title or partner...")
            }
            className="w-full ps-9 pe-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          title={ev?.refresh || (isRTL ? "تحديث القائمة" : "Refresh")}
          className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
        </button>
      </div>
    </div>
  );
}
