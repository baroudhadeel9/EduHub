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
  Camera,
  Clock,
  Megaphone,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

interface EventCardProps {
  event: EventItem;
  onEdit: (event: EventItem) => void;
  onDelete: (event: EventItem) => void;
  onToggleArchive: (event: EventItem) => void;
  onToggleStatus?: (event: EventItem, newStatus: "scheduled" | "completed") => void;
  onViewRegistrations?: (event: EventItem) => void;
  onSetAsAnnouncement?: (event: EventItem) => void;
  isAnnouncement?: boolean;
  isRTL: boolean;
}

export default function EventCard({
  event,
  onEdit,
  onDelete,
  onToggleArchive,
  onToggleStatus,
  onViewRegistrations,
  onSetAsAnnouncement,
  isAnnouncement = false,
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
        <div 
          onClick={() => onEdit(event)}
          className="relative h-44 sm:h-52 md:h-56 w-full bg-slate-100 overflow-hidden cursor-pointer"
          title={isRTL ? "اضغط لفتح وتعديل الورشة" : "Click to open and edit"}
        >
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

          {/* Top Start: Date Badge + Scheduled indicator */}
          <div className="absolute top-3 start-3 sm:top-3.5 start-3.5 z-10 flex flex-col items-start gap-1.5 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-md border border-white/60">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{event.dateBadge || event.event_date}</span>
            </span>

            {event.is_future_scheduled ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-700 text-white shadow-sm border border-purple-500 animate-in fade-in duration-150">
                <Clock className="w-3 h-3 text-purple-200" />
                <span>{isRTL ? `مجدولة للنشر: ${event.publish_start_badge || "مستقبلاً"}` : "Scheduled to Publish"}</span>
              </span>
            ) : event.display_mode === "banner_only" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-sm border border-amber-400">
                <Megaphone className="w-3 h-3 text-amber-100" />
                <span>{isRTL ? "بنر علوي فقط" : "Banner Only"}</span>
              </span>
            ) : null}
          </div>

          {/* Top End: Publication & Lifecycle Status Badge */}
          <div className="absolute top-3 end-3 sm:top-3.5 end-3.5 z-10 flex items-center gap-1.5 pointer-events-none">
            {isArchived ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-500/95 text-white shadow-sm backdrop-blur-md border border-amber-300/40">
                <Archive className="w-3 h-3 text-amber-100 shrink-0" />
                <span>{cardT?.archived || (isRTL ? "مؤرشفة" : "Archived")}</span>
              </span>
            ) : event.is_future_scheduled ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-purple-600/95 text-white shadow-sm backdrop-blur-md border border-purple-400/40">
                <Clock className="w-3 h-3 text-purple-100 shrink-0" />
                <span>{isRTL ? "مجدولة" : "Scheduled"}</span>
              </span>
            ) : event.status === "completed" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-sky-600/95 text-white shadow-sm backdrop-blur-md border border-sky-400/40">
                <Camera className="w-3 h-3 text-sky-100 shrink-0" />
                <span>{isRTL ? "تمت الورشة" : "Completed"}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-600/95 text-white shadow-sm backdrop-blur-md border border-emerald-400/40">
                <Globe2 className="w-3 h-3 text-emerald-100 shrink-0" />
                <span>{event.is_deadline_passed ? (isRTL ? "التسجيل منتهٍ" : "Closed") : (isRTL ? "التسجيل متاح" : "Open")}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Body (Clean Typography, Responsive Mobile Sizing) */}
        <div className="p-4 sm:p-5 lg:p-6">
          <h3 
            onClick={() => onEdit(event)}
            className="text-base sm:text-lg font-black text-slate-950 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug cursor-pointer"
            title={isRTL ? "اضغط لفتح وتعديل الورشة" : "Click to open & edit"}
          >
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
        <div className="px-3.5 sm:px-6 py-2 sm:py-2.5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-xs font-semibold text-slate-700">
          <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-bold text-xs truncate max-w-[140px] sm:max-w-[170px]">
            {event.tag || "EduHub"}
          </span>

          {event.status === "completed" ? (
            <span className="text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200/90 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs">
              <Camera className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>{isRTL ? "توثيق بالصور" : "Photo Documented"}</span>
            </span>
          ) : event.custom_url ? (
            <span className="text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200/90 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs">
              <span>{isRTL ? "استبيان Google Form" : "Google Form"}</span>
            </span>
          ) : event.registration_deadline ? (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                event.is_deadline_passed
                  ? "bg-rose-50 text-rose-800 border-rose-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[160px]">
                {event.is_deadline_passed
                  ? isRTL ? "انتهى موعد التسجيل" : "Deadline Passed"
                  : isRTL ? `آخر موعد: ${event.registration_deadline_badge}` : `Deadline: ${event.registration_deadline_badge}`}
              </span>
            </span>
          ) : (
            <span className="text-slate-600 font-medium text-xs">
              {event.meta || event.type}
            </span>
          )}
        </div>

        {/* Admin Management Action Bar (Clean 3 Cute Icons: Edit, Archive, Delete) */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Status Note */}
          <span className="text-[11px] sm:text-xs text-slate-500 font-semibold flex items-center gap-1.5 shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${
                isArchived ? "bg-amber-400" : event.status === "completed" ? "bg-sky-500" : "bg-emerald-500"
              }`}
            />
            {isArchived
              ? cardT?.hiddenFromSite || (isRTL ? "مخفية من الموقع" : "Hidden from site")
              : event.status === "completed"
              ? isRTL ? "معروضة (أرشيف توثيقي)" : "Showcased (Archive)"
              : cardT?.visibleToStudents || (isRTL ? "معروضة للطلاب" : "Visible to students")}
          </span>

          {/* Action Buttons: Quick Status Toggle + Edit, Archive, Delete */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Status Toggle: 1-Click "تمت الورشة" or "إعادة فتح" */}
            {!isArchived && onToggleStatus && (
              event.status === "completed" ? (
                <button
                  type="button"
                  onClick={() => onToggleStatus(event, "scheduled")}
                  title={isRTL ? "إعادة فتح الورشة كقادمة ومتاحة للتسجيل" : "Re-open workshop as upcoming"}
                  className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 stroke-[2.2]" />
                  <span>{isRTL ? "إعادة فتح" : "Reopen"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleStatus(event, "completed")}
                  title={isRTL ? "تحويل فوري إلى تمت الورشة وموثقة" : "Mark as completed"}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all cursor-pointer active:scale-95 shadow-2xs hover:shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span>{isRTL ? "تمت الورشة" : "Done"}</span>
                </button>
              )
            )}

            {/* 1. Edit Button (تعديل) */}
            <button
              type="button"
              onClick={() => onEdit(event)}
              title={cardT?.edit || (isRTL ? "تعديل بيانات الورشة" : "Edit Event")}
              aria-label={cardT?.edit || (isRTL ? "تعديل" : "Edit")}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-slate-600 hover:text-emerald-700 bg-slate-50/80 hover:bg-emerald-50 border border-slate-200/90 hover:border-emerald-300 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </button>

            {/* 2. Archive / Unarchive Button (أرشفة / إلغاء الأرشفة) */}
            <button
              type="button"
              onClick={() => onToggleArchive(event)}
              title={
                isArchived
                  ? cardT?.unarchive || (isRTL ? "إلغاء الأرشفة وإعادة العرض للطلاب" : "Restore to site")
                  : cardT?.archive || (isRTL ? "أرشفة الورشة وإخفاؤها من الموقع" : "Archive (Hide)")
              }
              aria-label={isArchived ? (isRTL ? "إلغاء الأرشفة" : "Restore") : (isRTL ? "أرشفة" : "Archive")}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs ${
                isArchived
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300"
                  : "bg-slate-50/80 text-slate-600 hover:text-amber-700 hover:bg-amber-50 border-slate-200/90 hover:border-amber-300"
              }`}
            >
              {isArchived ? (
                <ArchiveRestore className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 stroke-[2.2]" />
              ) : (
                <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              )}
            </button>

            {/* 3. Delete Button (حذف) */}
            <button
              type="button"
              onClick={() => onDelete(event)}
              title={cardT?.delete || (isRTL ? "حذف الورشة نهائياً" : "Delete Event")}
              aria-label={cardT?.delete || (isRTL ? "حذف" : "Delete")}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-slate-500 hover:text-rose-700 bg-slate-50/80 hover:bg-rose-50 border border-slate-200/90 hover:border-rose-300 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
