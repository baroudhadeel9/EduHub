"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { EventItem, deleteAdminEventApi } from "@/services/events";
import { AlertTriangle, X } from "lucide-react";

interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  onSuccess: () => void;
  onDeleted?: (id: number | string) => void;
  isRTL: boolean;
}

export default function DeleteEventModal({
  isOpen,
  onClose,
  event,
  onSuccess,
  onDeleted,
  isRTL,
}: DeleteEventModalProps) {
  const { t } = useLanguage();
  const delT = (t.admin as Record<string, any>)?.events?.deleteModal;

  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !event) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setErrorMsg("");

    try {
      const res = await deleteAdminEventApi(event.id);
      if (!res.success) {
        throw new Error(res.message || (isRTL ? "تعذر حذف الورشة" : "Failed to delete event"));
      }
      if (onDeleted) {
        onDeleted(event.id);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : (isRTL ? "حدث خطأ أثناء الحذف" : "Error deleting event"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 overflow-hidden transition-all"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/80">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-black text-slate-900 mb-2">
          {delT?.title || (isRTL ? "تأكيد حذف الورشة" : "Confirm Event Deletion")}
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {delT?.confirmText ? (
            delT.confirmText.replace("{title}", event.title)
          ) : isRTL ? (
            <>
              هل أنت متأكد من رغبتك في حذف ورشة{" "}
              <strong className="text-slate-950 font-bold">"{event.title}"</strong> نهائياً من النظام؟
              لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
            </>
          ) : (
            <>
              Are you sure you want to permanently delete event{" "}
              <strong className="text-slate-950">"{event.title}"</strong>? This action cannot be undone.
            </>
          )}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            {delT?.cancel || (isRTL ? "تراجع" : "Cancel")}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4.5 py-2 text-xs sm:text-sm font-black bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{delT?.deleting || (isRTL ? "جارٍ الحذف..." : "Deleting...")}</span>
              </>
            ) : (
              <span>{delT?.confirmBtn || (isRTL ? "تأكيد الحذف" : "Delete Event")}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

