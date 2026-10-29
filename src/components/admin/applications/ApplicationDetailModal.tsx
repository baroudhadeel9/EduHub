"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { MembershipApplication } from "./data";
import {
  getAdminHeaders,
  getAdminToken,
  normalizeMembershipApplication,
} from "@/services/applications";
import {
  X,
  User,
  ShieldCheck,
  GraduationCap,
  Zap,
  CheckCircle2,
  XCircle,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ApplicationDetailModalProps {
  application: MembershipApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    status: MembershipApplication["status"],
    note?: string,
    quota?: number
  ) => Promise<{ temporaryPassword?: string } | null | void> | void;
}

export default function ApplicationDetailModal({
  application: initialApplication,
  isOpen,
  onClose,
  onUpdateStatus,
}: ApplicationDetailModalProps) {
  const router = useRouter();
  const { locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";

  const [application, setApplication] = useState<MembershipApplication | null>(initialApplication);
  const [message, setMessage] = useState<string>("");
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [createdAccount, setCreatedAccount] = useState<{
    email: string;
  } | null>(null);

  // Sync state when initialApplication changes or modal opens
  useEffect(() => {
    setApplication(initialApplication);

    if (isOpen && initialApplication?.id) {
      // If base64 is not already present, fetch the full application details (which contains base64)
      if (!initialApplication.chargerPhotoBase64 && !initialApplication.proofFileBase64) {
        fetch(`/api/proxy/admin/membership-applications/${initialApplication.id}`, {
          headers: getAdminHeaders(),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((res) => {
            if (res?.data) {
              const fullNormalized = normalizeMembershipApplication(res.data);
              setApplication((prev) => (prev ? { ...prev, ...fullNormalized } : fullNormalized));
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, initialApplication]);

  // File loading & download states
  const [isDownloadingProof, setIsDownloadingProof] = useState<boolean>(false);
  const [proofDownloadError, setProofDownloadError] = useState<string>("");

  const [chargerPhotoBlobUrl, setChargerPhotoBlobUrl] = useState<string | null>(null);
  const [isLoadingChargerPhoto, setIsLoadingChargerPhoto] = useState<boolean>(false);
  const [chargerPhotoError, setChargerPhotoError] = useState<string>("");

  // Clean up blob URLs when application changes or modal closes
  useEffect(() => {
    return () => {
      if (chargerPhotoBlobUrl && chargerPhotoBlobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(chargerPhotoBlobUrl);
      }
    };
  }, [chargerPhotoBlobUrl]);

  // Load charger photo whenever previewPhoto is triggered
  useEffect(() => {
    if (!previewPhoto || !application) return;

    let active = true;

    // 1. If we already have base64 in the application model
    if (application.chargerPhotoBase64) {
      const mime = application.chargerPhotoMime || "image/jpeg";
      setChargerPhotoBlobUrl(`data:${mime};base64,${application.chargerPhotoBase64}`);
      setIsLoadingChargerPhoto(false);
      setChargerPhotoError("");
      return;
    }

    // 2. Fetch via authenticated endpoint
    const fetchPhoto = async () => {
      setIsLoadingChargerPhoto(true);
      setChargerPhotoError("");

      try {
        const token = getAdminToken();
        const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
        const targetUrl = `/api/proxy/admin/files/charger/${application.id}${tokenQuery}`;

        const res = await fetch(targetUrl, {
          headers: getAdminHeaders({ Accept: "image/*,*/*" }),
        });

        if (!res.ok) {
          throw new Error(
            isRTL
              ? `تعذر تحميل صورة الشاحن من الخادم (رمز الخطأ: ${res.status})`
              : `Failed to load charger photo (Status: ${res.status})`
          );
        }

        const blob = await res.blob();
        if (!active) return;

        const objectUrl = URL.createObjectURL(blob);
        setChargerPhotoBlobUrl(objectUrl);
      } catch (err: unknown) {
        if (!active) return;
        console.error("Charger photo load error:", err);
        const msg =
          err instanceof Error
            ? err.message
            : isRTL
            ? "تعذر جلب صورة الشاحن من الخادم"
            : "Failed to fetch photo";
        setChargerPhotoError(msg);
      } finally {
        if (active) setIsLoadingChargerPhoto(false);
      }
    };

    fetchPhoto();

    return () => {
      active = false;
    };
  }, [previewPhoto, application, isRTL]);

  if (!isOpen || !application) return null;

  const handleDownloadProof = async () => {
    if (!application) return;
    setIsDownloadingProof(true);
    setProofDownloadError("");

    try {
      // 1. If base64 is already embedded
      if (application.proofFileBase64) {
        const mime = application.proofFileMime || "application/pdf";
        const byteCharacters = atob(application.proofFileBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = application.proofFileName || "proof_document.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      // 2. Fetch authenticated from proxy endpoint
      const token = getAdminToken();
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
      const targetUrl = `/api/proxy/admin/files/proof/${application.id}${tokenQuery}`;

      const res = await fetch(targetUrl, {
        headers: getAdminHeaders({ Accept: "*/*" }),
      });

      if (!res.ok) {
        throw new Error(
          isRTL
            ? `تعذر تنزيل المستند من الخادم (رمز الحالة: ${res.status}). قد يكون الملف غير محفوظ.`
            : `Failed to download file from server (Status: ${res.status}).`
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = application.proofFileName || "proof_document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("Proof download error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : isRTL
          ? "فشل تنزيل المستند من الخادم"
          : "Download failed";
      setProofDownloadError(msg);
    } finally {
      setIsDownloadingProof(false);
    }
  };

  const handleDownloadChargerPhoto = () => {
    if (!chargerPhotoBlobUrl) return;
    const link = document.createElement("a");
    link.href = chargerPhotoBlobUrl;
    link.download = application.chargerPhotoName || "charger_photo.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApprove = async () => {
    const quota = application.category.includes("طالب") ? 25 : 35;
    await onUpdateStatus(application.id, "approved", "تم اعتماد العضوية", quota);
    setCreatedAccount({
      email: application.email,
    });
    setMessage(
      isRTL
        ? "تم اعتماد العضوية بنجاح وإرسال رابط تعيين كلمة المرور إلى البريد الإلكتروني! جاري تحويلك لسجل الأعضاء..."
        : "Membership approved! Password setup link sent to member's email. Redirecting to Members..."
    );
    setTimeout(() => {
      setMessage("");
      onClose();
      router.push("/admin/members");
    }, 1500);
  };

  const handleReject = () => {
    onUpdateStatus(application.id, "rejected", "تم رفض الطلب");
    setMessage(isRTL ? "تم رفض الطلب" : "Application rejected");
    setTimeout(() => {
      setMessage("");
      onClose();
    }, 1200);
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-2xs transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className={`fixed inset-y-0 ${
          isRTL ? "left-0" : "right-0"
        } max-w-full flex pl-0`}
      >
        <div
          className="w-screen max-w-xl bg-white shadow-2xl border-x border-slate-200 flex flex-col h-full transform transition-transform duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
        
        {/* ── Header ── */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0c2340] text-white flex items-center justify-center font-bold text-base shrink-0">
              {(application.fullName || "").charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {application.fullName || "طلب عضوية"}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {application.applicationNumber || "-"} • {application.submissionDate || "-"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div className="bg-emerald-50 text-emerald-800 px-4 py-2 text-xs font-bold text-center border-b border-emerald-200">
            {message}
          </div>
        )}

        {/* Member account created credentials card */}
        {createdAccount && (
          <div className="bg-emerald-50 text-emerald-900 p-4 border-b border-emerald-200 text-xs space-y-1.5 animate-in fade-in">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isRTL
                  ? "تم اعتماد العضوية وإرسال رابط تعيين كلمة المرور إلى البريد الإلكتروني:"
                  : "Membership approved and password setup link dispatched to member's email:"}
              </span>
            </div>
            <div className="font-mono bg-white p-2.5 rounded-lg border border-emerald-200 text-xs flex flex-col gap-1">
              <div>
                <span className="font-bold text-slate-500">{isRTL ? "البريد الإلكتروني:" : "Email:"} </span>
                <span className="text-slate-900">{createdAccount.email || application.email}</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-700">
              {isRTL
                ? "يقوم العضو بتعيين كلمة مروره الخاصة مباشرة عبر الرابط المرسل إلى بريده الإلكتروني للدخول وحجز الساعات."
                : "The member will set their own private password via the email link to sign in and book hours."}
            </p>
          </div>
        )}

        {/* ── Body: Fields list ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs sm:text-sm">
          
          {/* Section 1: البيانات الشخصية ومعلومات الاتصال */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0c2340] pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>{isRTL ? "البيانات الشخصية ومعلومات الاتصال" : "Personal & Contact Details"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "الاسم رباعي" : "Full Name"}</span>
                <span className="font-semibold text-slate-900">{application.fullName}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "رقم الهوية الشخصية" : "National ID"}</span>
                <span className="font-semibold font-mono text-slate-900">{application.nationalId}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "رقم الجوال (SMS)" : "Phone"}</span>
                <span className="font-semibold font-mono text-slate-900" dir="ltr">{application.phone}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "البريد الإلكتروني" : "Email"}</span>
                <span className="font-medium text-slate-800">{application.email}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "تاريخ الميلاد" : "Birth Date"}</span>
                <span className="font-medium text-slate-800">{application.birthDate}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "محافظة السكن" : "Governorate"}</span>
                <span className="font-semibold text-slate-900">{application.governorate}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-xs">{isRTL ? "العنوان الحالي بالتفصيل" : "Address"}</span>
                <span className="font-medium text-slate-800">{application.detailedAddress}</span>
              </div>
            </div>
          </div>

          {/* Section 2: الفئة، الجامعة، والتخصص */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0c2340] pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>{isRTL ? "الفئة الأكاديمية والمهنية" : "Academic & Professional Field"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "تصنيف الفئة" : "Category"}</span>
                <span className="font-bold text-emerald-800">{application.category}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "اسم الجامعة" : "University"}</span>
                <span className="font-medium text-slate-800">{application.university || "-"}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-xs">{isRTL ? "التخصص أو مجال العمل" : "Specialty / Field"}</span>
                <span className="font-semibold text-slate-900">{application.specialty}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2 space-y-1.5">
                <span className="text-slate-400 block text-xs">{isRTL ? "الأغراض الأساسية من استخدام المساحة" : "Purposes"}</span>
                <div className="flex flex-wrap gap-1.5">
                  {(application.primaryPurposes || []).map((p, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-800">
                      • {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-xs">{isRTL ? "مدة الفصل الدراسي أو العقد" : "Schedule Duration"}</span>
                <span className="font-medium text-slate-800">{application.durationSchedule}</span>
              </div>

              {/* Document Download Row */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-400 block text-[11px]">{isRTL ? "المستند المرفق (إفادة جامعية أو إثبات عمل)" : "Proof File"}</span>
                      <span className="font-semibold text-slate-900 truncate block">{application.proofFileName}</span>
                      <span className="text-slate-400 text-xs">({application.proofFileSize})</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadProof}
                    disabled={isDownloadingProof}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isDownloadingProof ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{isDownloadingProof ? (isRTL ? "جاري التنزيل..." : "Downloading...") : (isRTL ? "تنزيل المستند" : "Download")}</span>
                  </button>
                </div>

                {proofDownloadError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{proofDownloadError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: الجهاز والشاحن والكهرباء */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0c2340] pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>{isRTL ? "مواصفات الجهاز والشاحن" : "Device & Power"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "نوع الجهاز المستخدم" : "Device Type"}</span>
                <span className="font-semibold text-slate-900">{application.deviceType}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "قدرة الشاحن الكهربائي" : "Charger Wattage"}</span>
                <span className="font-bold text-amber-700">{application.chargerWattage}</span>
              </div>

              {/* Photo View Row */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-teal-100/80 text-teal-800 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[11px]">{isRTL ? "صورة ملصق مواصفات الشاحن" : "Charger Photo"}</span>
                    <span className="font-medium text-slate-900 truncate block">{application.chargerPhotoName}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(application.chargerPhotoName)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isRTL ? "عرض الصورة الحقيقية" : "View Photo"}</span>
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-xs">{isRTL ? "توفر الكهرباء والإنترنت خارج المساحة" : "Outside Power & Net"}</span>
                <span className="font-medium text-slate-800">{application.powerConnectivityStatus}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "الفترة المفضلة للحضور" : "Preferred Shift"}</span>
                <span className="font-semibold text-slate-900">{application.preferredShift}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "الاستخدام الأسبوعي المتوقع" : "Weekly Usage"}</span>
                <span className="font-semibold text-slate-900">{application.weeklyUsage}</span>
              </div>
            </div>
          </div>

          {/* Section 4: الإقرارات الرسمية */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#0c2340] pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isRTL ? "الإقرارات والسياسات" : "Declarations"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "موافقة التصوير واستخدام المواد الإعلامية" : "Photo Consent"}</span>
                <span className="font-bold text-emerald-800">{application.photographyConsent}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-xs">{isRTL ? "الإقرار بصحة ودقة البيانات" : "Accuracy Declaration"}</span>
                <span className="font-bold text-emerald-800">{application.dataAccuracyConsent}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer Actions ── */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApprove}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isRTL ? "اعتماد الطلب" : "Approve"}</span>
            </button>

            <button
              type="button"
              onClick={handleReject}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>{isRTL ? "رفض" : "Reject"}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isRTL ? "إغلاق" : "Close"}
          </button>
        </div>

        </div>
      </div>

      {/* ── Photo Preview Lightbox (Shows REAL uploaded charger photo) ── */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-sm text-slate-900 truncate">
                  {isRTL ? "صورة ملصق الشاحن المرفوعة" : "Uploaded Charger Photo"}
                </span>
                <span className="text-xs text-slate-400 font-mono">({application.chargerWattage})</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Charger Photo Display */}
            <div className="p-6 bg-slate-900 flex-1 overflow-auto flex flex-col items-center justify-center min-h-[300px]">
              {isLoadingChargerPhoto ? (
                <div className="flex flex-col items-center gap-3 text-slate-300">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <span className="text-xs">{isRTL ? "جاري تحميل الصورة من السيرفر..." : "Loading photo..."}</span>
                </div>
              ) : chargerPhotoBlobUrl ? (
                <div className="w-full flex flex-col items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={chargerPhotoBlobUrl}
                    alt={application.chargerPhotoName || "Charger Photo"}
                    className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-2xl border border-slate-700"
                  />
                  <div className="text-[11px] text-slate-400 font-mono text-center">
                    {application.chargerPhotoName} • {application.chargerWattage}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-sm bg-slate-800 rounded-xl p-6 border border-slate-700 text-slate-300 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {isRTL ? "لم يتم العثور على صورة الشاحن" : "No Charger Photo Available"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {chargerPhotoError ||
                        (isRTL
                          ? "لم يتم حفظ ملف الصورة في الخادم أثناء تقديم الطلب، أو قد تم حذفه."
                          : "Photo file is not found on the server.")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {chargerPhotoBlobUrl ? (
                <button
                  type="button"
                  onClick={handleDownloadChargerPhoto}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isRTL ? "تنزيل الصورة" : "Download Photo"}</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isRTL ? "إغلاق المعاينة" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
