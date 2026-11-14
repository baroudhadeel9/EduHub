"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Plus, ExternalLink } from "lucide-react";

interface EventsHeaderProps {
  onOpenCreate: () => void;
  isRTL: boolean;
}

export default function EventsHeader({ onOpenCreate, isRTL }: EventsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/80">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            {isRTL ? "إدارة الورش والفعاليات" : "Workshops & Events Management"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {isRTL
              ? "إضافة وتوثيق وتعديل الورش التدريبية وعرضها مباشرة على الموقع"
              : "Create, edit, and publish workshops live on the website"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        {/* Preview on Public Site */}
        <Link
          href="/#events"
          target="_blank"
          rel="noopener noreferrer"
          title={isRTL ? "معاينة قسم الورش على الموقع للطلاب" : "View Live on Website"}
          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
        >
          <ExternalLink className="w-4 h-4 text-slate-500" />
          <span>{isRTL ? "معاينة عالموقع" : "Preview on Site"}</span>
        </Link>

        {/* Add New Workshop */}
        <button
          type="button"
          onClick={onOpenCreate}
          className="flex-1 sm:flex-none px-4.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isRTL ? "إضافة ورشة جديدة" : "Add New Workshop"}</span>
        </button>
      </div>
    </div>
  );
}
