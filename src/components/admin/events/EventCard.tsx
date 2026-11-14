"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { EventItem } from "@/services/events";
import {
  Calendar,
  Edit2,
  Trash2,
  Archive,
  ArchiveRestore,
  Globe2,
} from "lucide-react";

interface EventCardProps {
  event: EventItem;
  onEdit: (event: EventItem) => void;
  onDelete: (event: EventItem) => void;
  onToggleArchive: (event: EventItem) => void;
  isRTL: boolean;
}

export default function EventCard({
  event,
  onEdit,
  onDelete,
  onToggleArchive,
  isRTL,
}: EventCardProps) {
  const { t } = useLanguage();
  const cardT = (t.admin as Record<string, any>)?.events?.card;

  const isArchived = Boolean(event.is_archived || event.status === "archived");
  const rawImage = event.image || event.image_url || "/images/hero-workspace.jpg";
  const [imgSrc, setImgSrc] = useState(rawImage);

  useEffect(() => {
    setImgSrc(event.image || event.image_url || "/images/hero-workspace.jpg");
  }, [event.image, event.image_url]);

  return (
    <article
      className={`group bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl ${
        isArchived
          ? "border-amber-200/90 bg-slate-50/40 opacity-95"
          : "border-slate-200/90 hover:border-emerald-300"
      }`}
    >
      {/* -- Main Website Card Section (1:1 with Public Site) -- */}
      <div>
        {/* Event Image Container with Gradient & Status Badge */}
        <div className="relative h-44 sm:h-52 md:h-56 w-full bg-slate-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={event.title}
            fill
            unoptimized={Boolean(imgSrc.startsWith("/api/") || imgSrc.startsWith("http"))}
            onError={() => setImgSrc("/images/hero-workspace.jpg")}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-transform duration-700 ease-out ${
              isArchived ? "grayscale-[30%]" : "group-hover:scale-105"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

          {/* Top Start: Date Badge (Identical to Website) */}
          <div className="absolute top-3 start-3 sm:top-3.5 start-3.5 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-md border border-white/60">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{event.dateBadge || event.event_date}</span>
            </span>
          </div>

          {/* Top End: Publication Status Badge */}
          <div className="absolute top-3 end-3 sm:top-3.5 end-3.5 z-10">
            {isArchived ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-500/95 text-white shadow-sm backdrop-blur-md border border-amber-300/40">
                <Archive className="w-3 h-3 text-amber-100 shrink-0" />
                <span>{cardT?.archived || (isRTL ? "مؤرشفة" : "Archived")}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-600/95 text-white shadow-sm backdrop-blur-md border border-emerald-400/40">
                <Globe2 className="w-3 h-3 text-emerald-100 shrink-0" />
                <span>{cardT?.live || (isRTL ? "معروضة بالموقع" : "Live")}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Body (Clean Typography, Responsive Mobile Sizing) */}
        <div className="p-4 sm:p-5 lg:p-6">
          <h3 className="text-base sm:text-lg font-black text-slate-950 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
            {event.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal line-clamp-2 sm:line-clamp-3">
            {event.desc || event.description}
          </p>
        </div>
      </div>

      {/* -- Meta & Admin Control Bars -- */}
      <div>
        {/* Bottom Meta Bar (Identical to Website) */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-bold text-xs truncate max-w-[140px] sm:max-w-[170px]">
            {event.tag || "EduHub"}
          </span>
          <span className="text-slate-600 font-medium text-xs">
            {event.meta || event.type}
          </span>
        </div>

        {/* Admin Management Action Bar */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-white border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Status Note */}
          <span className="text-[11px] sm:text-xs text-slate-500 font-semibold flex items-center gap-1.5 shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${
                isArchived ? "bg-amber-400" : "bg-emerald-500"
              }`}
            />
            {isArchived
              ? cardT?.hiddenFromSite || (isRTL ? "مخفية من الموقع" : "Hidden from site")
              : cardT?.visibleToStudents || (isRTL ? "معروضة للطلاب" : "Visible to students")}
          </span>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Archive / Unarchive Button */}
            <button
              type="button"
              onClick={() => onToggleArchive(event)}
              title={
                isArchived
                  ? cardT?.unarchive || (isRTL ? "إلغاء الأرشفة وعرضها بالموقع فوراً" : "Restore to site")
                  : cardT?.archive || (isRTL ? "أرشفة الورشة وإخفاؤها من الموقع" : "Archive (Hide)")
              }
              className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border active:scale-95 ${
                isArchived
                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200 hover:border-amber-200"
              }`}
            >
              {isArchived ? (
                <>
                  <ArchiveRestore className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] sm:text-xs">{cardT?.unarchive || (isRTL ? "إلغاء الأرشفة" : "Unarchive")}</span>
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[11px] sm:text-xs">{cardT?.archive || (isRTL ? "أرشفة" : "Archive")}</span>
                </>
              )}
            </button>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(event)}
              title={cardT?.edit || (isRTL ? "تعديل بيانات الورشة" : "Edit Event")}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-all cursor-pointer active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(event)}
              title={cardT?.delete || (isRTL ? "حذف الورشة نهائياً" : "Delete Event")}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
