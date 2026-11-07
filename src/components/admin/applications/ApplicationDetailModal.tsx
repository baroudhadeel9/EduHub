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
  Send,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Laptop,
  MessageSquare,
} from "lucide-react";

interface ApplicationDetailModalProps {
  application: MembershipApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    id: string,
    status: MembershipApplication["status"],
    note?: string,
    quota?: number,
    notificationChannel?: "email" | "sms" | "both" | "none",
    customSmsMessage?: string
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

  const [notificationChannel, setNotificationChannel] = useState<"both" | "email" | "sms" | "none">("sms");
  const [customSmsMessage, setCustomSmsMessage] = useState<string>("");

  useEffect(() => {
    if (initialApplication?.fullName) {
      setCustomSmsMessage(
        `مرحباً ${initialApplication.fullName}، نبارك لك قبول عضويتك في مساحة EduHub غزة! يرجى تعيين كلمة المرور لحسابك وحجز مقعدك عبر الرابط: {set_password_url}`
      );
    }
  }, [initialApplication?.id, initialApplication?.fullName]);

  // Sync state when initialApplication changes or modal opens
  useEffect(() => {
    setApplication(initialApplication);

    if (isOpen && initialApplication?.id) {
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

  // Clean up blob URLs
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

    if (application.chargerPhotoBase64) {
      const mime = application.chargerPhotoMime || "image/jpeg";
      setChargerPhotoBlobUrl(`data:${mime};base64,${application.chargerPhotoBase64}`);
      setIsLoadingChargerPhoto(false);
      setChargerPhotoError("");
      return;
    }

    const fetchPhoto = async () => {
      setIsLoadingChargerPhoto(true);
      setChargerPhotoError("");

      try {
        const token = getAdminToken();
        const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
        const targetUrl = `/api/proxy/admin/files/charger/${application.id}${tokenQuery}`;

        const res = await fetch(targetUrl, {
          headers: getAdminHeaders({ Accept: "image/*,application/json,*/*" }),
        });

        if (!res.ok) {
          let errorDetail = "";
          try {
            const errJson = await res.json();
            if (errJson?.message) errorDetail = errJson.message;
          } catch {}

          throw new Error(
            errorDetail ||
              (isRTL
                ? `تعذر تحميل صورة الشاحن من الخادم (رمز الخطأ: ${res.status})`
                : `Failed to load charger photo (Status: ${res.status})`)
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

      const token = getAdminToken();
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
      const targetUrl = `/api/proxy/admin/files/proof/${application.id}${tokenQuery}`;

      const res = await fetch(targetUrl, {
        headers: getAdminHeaders({ Accept: "*/*,application/json" }),
      });

      if (!res.ok) {
        let errorDetail = "";
        try {
          const errJson = await res.json();
          if (errJson?.message) errorDetail = errJson.message;
        } catch {}

        throw new Error(
          errorDetail ||
            (isRTL
              ? `تعذر تنزيل المستند من الخادم (رمز الحالة: ${res.status}). قد يكون الملف غير محفوظ.`
              : `Failed to download file from server (Status: ${res.status}).`)
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
    if (!application) return;
    const quota = application.category.includes("طالب") ? 25 : 35;
    await onUpdateStatus(
      application.id,
      "approved",
      "تم اعتماد العضوية",
      quota,
      notificationChannel,
      customSmsMessage
    );
    setCreatedAccount({
      email: application.email,
    });
    const feedback =
      notificationChannel === "sms"
        ? (isRTL
            ? "تم اعتماد العضوية وإرسال رسالة SMS للعضو بنجاح!"
            : "Membership approved! SMS sent.")
        : notificationChannel === "email"
        ? (isRTL
            ? "تم اعتماد العضوية وإرسال بريد تعيين كلمة المرور بنجاح!"
            : "Membership approved! Password setup email sent.")
        : (isRTL
            ? "تم اعتماد العضوية بنجاح!"
            : "Membership approved successfully!");

    setMessage(feedback);
    setTimeout(() => {
      setMessage("");
      onClose();
      router.push("/admin/members");
    }, 1800);
  };

  const handleReject = () => {
    onUpdateStatus(application.id, "rejected", "تم رفض الطلب");
    setMessage(isRTL ? "تم رفض الطلب" : "Application rejected");
    setTimeout(() => {
      setMessage("");
      onClose();
    }, 1200);
  };

  const isStudent = application.category.includes("طالب");

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className={`fixed inset-y-0 ${
          isRTL ? "left-0" : "right-0"
        } max-w-full flex`}
      >
        <div
          className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── 1. Clean Top Header ── */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                {(application.fullName || "").charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                    {application.fullName || "طلب عضوية"}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      application.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : application.status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {application.status === "approved"
                      ? isRTL ? "معتمد" : "Approved"
                      : application.status === "rejected"
                      ? isRTL ? "مرفوض" : "Rejected"
                      : isRTL ? "قيد المراجعة" : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {application.applicationNumber || "APP"} • {application.submissionDate || "اليوم"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback message banner */}
          {message && (
            <div className="bg-emerald-50 text-emerald-800 px-4 py-2.5 text-xs font-bold text-center border-b border-emerald-200 shrink-0 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Member account created credentials card */}
          {createdAccount && (
            <div className="bg-emerald-50/90 text-emerald-900 p-4 border-b border-emerald-200 text-xs space-y-1.5 shrink-0 animate-in fade-in">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isRTL
                    ? "تم إنشاء الحساب بنجاح وإرسال رابط تعيين كلمة المرور!"
                    : "Account created and password setup link dispatched!"}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700">
                {isRTL
                  ? `تم إرسال الرابط إلى: ${createdAccount.email}`
                  : `Setup link sent to: ${createdAccount.email}`}
              </p>
            </div>
          )}

          {/* ── 2. Scrollable Body: All Information in Harmonious Sections ── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-800">

            {/* Quick Overview Summary Banner */}
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl p-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                    isStudent
                      ? "bg-blue-100 text-blue-800 border border-blue-200/60"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                  }`}
                >
                  {isStudent ? "🎓 طالب/ة جامعـي" : "💼 فريلانسر / مهني حر"}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {isStudent ? "الحصة: 25 ساعة/شهر" : "الحصة: 35 ساعة/شهر"}
                </span>
              </div>

              {/* Quick WhatsApp Action button */}
              {application.phone && (
                <a
                  href={`https://wa.me/${application.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `مرحباً ${application.fullName}، نتواصل معك من إدارة مساحة EduHub غزة بخصوص طلب عضويتك.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="مراسلة عبر واتساب مباشرة"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isRTL ? "مراسلة واتساب" : "WhatsApp"}</span>
                </a>
              )}
            </div>

            {/* Section A: المعلومات الشخصية ومعلومات الاتصال */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{isRTL ? "المعلومات الشخصية والاتصال" : "Personal & Contact"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60">
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block">{isRTL ? "رقم الهوية" : "National ID"}</span>
                    <span className="font-bold text-slate-900 font-mono">{application.nationalId || "-"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block">{isRTL ? "رقم الجوال" : "Phone"}</span>
                    <span className="font-bold text-slate-900 font-mono" dir="ltr">{application.phone || "-"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block">{isRTL ? "البريد الإلكتروني" : "Email"}</span>
                    <span className="font-semibold text-slate-900 truncate block">{application.email || "-"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block">{isRTL ? "تاريخ الميلاد" : "Birth Date"}</span>
                    <span className="font-semibold text-slate-900">{application.birthDate || "-"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block">{isRTL ? "مكان السكن والعنوان" : "Governorate & Address"}</span>
                    <span className="font-semibold text-slate-900">
                      {application.governorate} {application.detailedAddress ? `— ${application.detailedAddress}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section B: المسار الأكاديمي والمهني */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>{isRTL ? "المسار الأكاديمي والمهني" : "Academic & Professional"}</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50/60">
                    <span className="text-[11px] text-slate-400 block">{isRTL ? "الجامعة أو المؤسسة" : "University"}</span>
                    <span className="font-bold text-slate-900">{application.university || "-"}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50/60">
                    <span className="text-[11px] text-slate-400 block">{isRTL ? "التخصص أو مجال العمل" : "Specialty"}</span>
                    <span className="font-bold text-slate-900">{application.specialty || "-"}</span>
                  </div>
                </div>

                {/* Primary Purposes */}
                {application.primaryPurposes && application.primaryPurposes.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-50/60 space-y-1.5">
                    <span className="text-[11px] text-slate-400 block">{isRTL ? "أغراض استخدام المساحة" : "Purposes"}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {application.primaryPurposes.map((p, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg text-xs font-semibold text-slate-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proof Document Card */}
                {application.proofFileName && (
                  <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-slate-500 block font-medium">
                          {isRTL ? "مستند الإثبات (إفادة جامعية أو عقد عمل):" : "Proof Document:"}
                        </span>
                        <span className="font-bold text-slate-900 text-xs truncate block">{application.proofFileName}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadProof}
                      disabled={isDownloadingProof}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {isDownloadingProof ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{isDownloadingProof ? (isRTL ? "جاري التنزيل..." : "Downloading...") : (isRTL ? "تنزيل" : "Download")}</span>
                    </button>
                  </div>
                )}

                {proofDownloadError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{proofDownloadError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section C: الجهاز والشاحن والكهرباء */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3 shadow-2xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>{isRTL ? "مواصفات الجهاز والشاحن" : "Device & Power Specs"}</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60">
                    <Laptop className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 block">{isRTL ? "نوع الجهاز" : "Device Type"}</span>
                      <span className="font-bold text-slate-900">{application.deviceType || "لابتوب شخصي"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/60">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-slate-400 block">{isRTL ? "قدرة الشاحن" : "Charger Wattage"}</span>
                      <span className="font-bold text-amber-700">{application.chargerWattage || "غير محدد"}</span>
                    </div>
                  </div>
                </div>

                {/* Charger Photo Preview Card */}
                {application.chargerPhotoName && (
                  <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-slate-500 block font-medium">
                          {isRTL ? "صورة ملصق الشاحن:" : "Charger Photo:"}
                        </span>
                        <span className="font-bold text-slate-900 text-xs truncate block">{application.chargerPhotoName}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(application.chargerPhotoName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isRTL ? "معاينة الصورة" : "View Photo"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section D: إعدادات الإشعار للقبول (تنساب داخل الصفحة دون ضغط الشاشة) */}
            {application?.status === "pending" && (
              <div className="bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 rounded-2xl border border-emerald-200/90 p-4 sm:p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      {isRTL ? "إرسال رابط تعيين كلمة المرور" : "Send Password Setup Link"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {isRTL
                        ? "اختر القناة لإرسال رابط تفعيل الحساب للعضو فور الضغط على اعتماد:"
                        : "Choose channel to dispatch the activation link upon approval:"}
                    </p>
                  </div>
                </div>

                {/* Sleek Segmented Toggle: SMS or Email */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setNotificationChannel("sms")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      notificationChannel === "sms"
                        ? "bg-white text-emerald-800 shadow-xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>📱</span>
                    <span>{isRTL ? "رسالة SMS" : "SMS Message"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotificationChannel("email")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      notificationChannel === "email"
                        ? "bg-white text-emerald-800 shadow-xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>✉️</span>
                    <span>{isRTL ? "بريد إلكتروني" : "Email"}</span>
                  </button>
                </div>

                {/* Notification Details Container */}
                {notificationChannel === "email" ? (
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-white text-xs text-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>✉️</span>
                      <span>{isRTL ? "إرسال إلى:" : "Send to:"}</span>
                      <span className="font-bold text-slate-900 font-mono">{application.email}</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                      {isRTL ? "جاهز" : "Ready"}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        {isRTL ? "نص رسالة الـ SMS:" : "SMS Text:"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {customSmsMessage.length} {isRTL ? "حرف" : "chars"}
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      value={customSmsMessage}
                      onChange={(e) => setCustomSmsMessage(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans"
                      placeholder="نص رسالة الـ SMS..."
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 font-medium">
                        <span>📱 {isRTL ? "المستلم:" : "To:"}</span>
                        <span className="font-mono text-slate-800 font-bold" dir="ltr">
                          {application.phone || "غير محدد"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCustomSmsMessage(
                            `مرحباً ${application.fullName}، نبارك لك قبول عضويتك في مساحة EduHub غزة! يرجى تعيين كلمة المرور لحسابك وحجز مقعدك عبر الرابط: {set_password_url}`
                          )
                        }
                        className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                      >
                        {isRTL ? "استعادة النص الافتراضي" : "Reset"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Declarations minimal tag */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isRTL ? "الإقرارات الرسمية وصحة البيانات:" : "Declarations:"}</span>
              </span>
              <span className="font-bold text-emerald-700">
                {isRTL ? "تمت الموافقة والمصادقة ✓" : "Verified ✓"}
              </span>
            </div>

          </div>

          {/* ── 3. Clean Fixed Bottom Action Footer ── */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
            {application.status === "pending" ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isRTL ? "اعتماد الطلب" : "Approve"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{isRTL ? "رفض" : "Reject"}</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-semibold">
                {application.status === "approved"
                  ? isRTL ? "تم اعتماد هذا الطلب مسبقاً" : "Already Approved"
                  : isRTL ? "تم رفض هذا الطلب" : "Already Rejected"}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              {isRTL ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Photo Preview Lightbox ── */}
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
                  {isRTL ? "صورة ملصق مواصفات الشاحن" : "Charger Photo"}
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

            {/* Photo Display */}
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
                      {isRTL ? "لم يتم العثور على صورة الشاحن" : "No Photo Available"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {chargerPhotoError ||
                        (isRTL
                          ? "لم يتم حفظ ملف الصورة في الخادم أثناء تقديم الطلب."
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
                {isRTL ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
