"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import {
  EventItem,
  EventCustomQuestion,
  createAdminEventApi,
  updateAdminEventApi,
  updateAdminAnnouncementApi,
  getAdminAnnouncementApi,
} from "@/services/events";
import {
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  FileText,
  ImageIcon,
  Plus,
  Trash2,
  Megaphone,
  User,
  GraduationCap,
  Phone,
  MessageSquare,
  HelpCircle,
  Clock,
  Eye,
  Camera,
  Archive,
  ExternalLink,
  CalendarCheck,
  Upload,
} from "lucide-react";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit: EventItem | null;
  onSuccess: (savedEvent?: EventItem, isEditing?: boolean) => void;
  isAnnouncement?: boolean;
  isRTL?: boolean;
}

export default function EventFormModal({
  isOpen,
  onClose,
  eventToEdit,
  onSuccess,
  isAnnouncement = false,
  isRTL = true,
}: EventFormModalProps) {
  const isEditing = Boolean(eventToEdit);

  // Tabs for the modal: 'details' | 'form_questions'
  const [activeTab, setActiveTab] = useState<"details" | "form_questions">("details");

  // Workshop Details State
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("EduHub");
  const [type, setType] = useState("تدريب عملي");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("مساحة إديوهب غزة");
  const [description, setDescription] = useState("");
  
  // Status: 'scheduled' (قادمة - التسجيل متاح) | 'completed' (مكتملة وموثقة بالصور) | 'archived'
  const [status, setStatus] = useState<"scheduled" | "completed" | "archived">("scheduled");

  // Display Mode: 'events_and_registration' (الحالة 2: يظهر بقسم الورش مع التسجيل) | 'banner_only' (الحالة 1: يظهر بس بنر فوق)
  const [displayMode, setDisplayMode] = useState<"events_and_registration" | "banner_only">("events_and_registration");

  // Registration Form Type: 'internal' (فورم الموقع الداخلي مع تخصيص الأسئلة) | 'external' (رابط خارجي مثل Google Form)
  const [registrationType, setRegistrationType] = useState<"internal" | "external">("internal");

  // External Form Link (e.g. Google Form)
  const [customUrl, setCustomUrl] = useState("");

  // Scheduling & Deadline State (تاريخ بدء النشر، انتهاء النشر، وإغلاق التسجيل)
  const [publishStartAt, setPublishStartAt] = useState("");
  const [publishEndAt, setPublishEndAt] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");

  const toDatetimeLocal = (isoStr?: string | null): string => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  // Image State (رفع مباشر من جهاز المشرف بدلاً من الصور الجاهزة)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("/images/workshop-freelance.jpg");
  const [previewSrc, setPreviewSrc] = useState("/images/workshop-freelance.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg(isRTL ? "يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)." : "Please select a valid image file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(isRTL ? "حجم الصورة كبير جداً (الحد الأقصى 10 ميغابايت)." : "Image size exceeds 10MB limit.");
        return;
      }
      setImageFile(file);
      const objUrl = URL.createObjectURL(file);
      setPreviewSrc(objUrl);
      setErrorMsg("");
    }
  };

  // Registration Custom Questions State
  const [customQuestions, setCustomQuestions] = useState<EventCustomQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);

  // Announcement Toggle Option (افتراضياً غير محدد حتى لا يظهر كإعلان إلا بطلب المشرف)
  const [setAsAnnouncement, setSetAsAnnouncement] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const defaultTypes = [
    isRTL ? "تدريب عملي" : "Hands-on Training",
    isRTL ? "ورشة عمل" : "Workshop",
    isRTL ? "كورس تدريبي" : "Training Course",
    isRTL ? "جلسة تقنية" : "Tech Session",
    isRTL ? "لقاء ريادي" : "Entrepreneurship Meetup",
  ];

  // Fixed Default Fields shown in the student registration form
  const defaultFields = [
    { label: isRTL ? "الاسم رباعياً" : "Full Name", req: true, icon: User },
    { label: isRTL ? "العمر (بالسنوات)" : "Age", req: true, icon: Calendar },
    { label: isRTL ? "الجنس (ذكر / أنثى)" : "Gender", req: true, icon: Layers },
    { label: isRTL ? "التخصص الدراسي أو المهني" : "Specialty", req: true, icon: GraduationCap },
    { label: isRTL ? "الجامعة / الكلية" : "University", req: false, icon: GraduationCap },
    { label: isRTL ? "رقم الواتساب للتواصل والقبول" : "WhatsApp Phone", req: true, icon: Phone },
    { label: isRTL ? "لماذا مهتم في هذه الورشة وماذا تأمل أن تتعلم؟" : "Motivation & Goals", req: true, icon: MessageSquare },
  ];

  // Reset or populate state
  useEffect(() => {
    if (!isOpen) return;

    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setTag(eventToEdit.tag || "EduHub");
      setType(eventToEdit.type || "تدريب عملي");
      setEventDate(eventToEdit.event_date || "");
      setLocation(eventToEdit.location || "مساحة إديوهب غزة");
      setDescription(eventToEdit.description || eventToEdit.desc || "");
      setCustomUrl(eventToEdit.custom_url || "");
      setRegistrationType(Boolean(eventToEdit.custom_url && eventToEdit.custom_url.trim()) ? "external" : "internal");
      
      const currentStatus: "scheduled" | "completed" | "archived" =
        eventToEdit.is_archived || eventToEdit.status === "archived"
          ? "archived"
          : eventToEdit.status === "scheduled"
          ? "scheduled"
          : "completed";
      setStatus(currentStatus);
      setDisplayMode(eventToEdit.display_mode === "banner_only" ? "banner_only" : "events_and_registration");

      setImageFile(null);
      const img = eventToEdit.image_url || eventToEdit.image || "/images/workshop-freelance.jpg";
      setImageUrl(img);
      setPreviewSrc(img);
      setCustomQuestions(eventToEdit.custom_questions || []);
      setPublishStartAt(toDatetimeLocal(eventToEdit.publish_start_at));
      setPublishEndAt(toDatetimeLocal(eventToEdit.publish_end_at));
      setRegistrationDeadline(toDatetimeLocal(eventToEdit.registration_deadline));
      setSetAsAnnouncement(Boolean(isAnnouncement));
    } else {
      // New workshop: default to upcoming scheduled workshop without announcement banner
      setTitle("");
      setTag("EduHub");
      setType("تدريب عملي");
      const today = new Date().toISOString().split("T")[0];
      setEventDate(today);
      setLocation("مساحة إديوهب غزة");
      setDescription("");
      setCustomUrl("");
      setRegistrationType("internal");
      setStatus("scheduled");
      setDisplayMode("events_and_registration");
      setImageFile(null);
      setImageUrl("/images/workshop-freelance.jpg");
      setPreviewSrc("/images/workshop-freelance.jpg");
      setCustomQuestions([]);
      setPublishStartAt("");
      setPublishEndAt("");
      setRegistrationDeadline("");
      setSetAsAnnouncement(false);
    }
    setNewQuestionText("");
    setNewQuestionRequired(false);
    setErrorMsg("");
    setActiveTab("details");
  }, [eventToEdit, isOpen]);

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: EventCustomQuestion = {
      id: `q_${Date.now()}`,
      label: newQuestionText.trim(),
      type: "text",
      required: newQuestionRequired,
    };
    setCustomQuestions((prev) => [...prev, newQ]);
    setNewQuestionText("");
    setNewQuestionRequired(false);
  };

  const handleRemoveQuestion = (id: string) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg(isRTL ? "يرجى كتابة عنوان الورشة." : "Please enter workshop title.");
      setActiveTab("details");
      return;
    }

    if (!eventDate) {
      setErrorMsg(isRTL ? "يرجى تحديد تاريخ موعد الورشة." : "Please select event date.");
      setActiveTab("details");
      return;
    }

    if (publishStartAt && publishEndAt && new Date(publishStartAt) > new Date(publishEndAt)) {
      setErrorMsg(isRTL ? "تاريخ انتهاء النشر يجب أن يكون لاحقاً لتاريخ بدء النشر." : "Publish end date must be after publish start date.");
      setActiveTab("details");
      return;
    }

    if (status === "scheduled" && registrationType === "external" && !customUrl.trim()) {
      setErrorMsg(isRTL ? "يرجى إدخال رابط نموذج Google Form أو الاستبيان الخارجي." : "Please enter the external form link.");
      setActiveTab("details");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("type", type);
      formData.append("tag", tag.trim() || "EduHub");
      formData.append("event_date", eventDate);
      formData.append("location", location.trim() || "مساحة إديوهب غزة");
      formData.append("description", description.trim());
      formData.append("status", status);
      formData.append("display_mode", displayMode);
      
      // If completed, registration is closed. If scheduled, registration is open.
      const allowReg = status === "scheduled";
      formData.append("allow_registration", allowReg ? "1" : "0");
      formData.append("custom_url", (status === "scheduled" && registrationType === "external") ? customUrl.trim() : "");
      formData.append("custom_questions", (status === "scheduled" && registrationType === "internal") ? JSON.stringify(customQuestions) : "[]");

      formData.append("publish_start_at", publishStartAt ? new Date(publishStartAt).toISOString() : "");
      formData.append("publish_end_at", publishEndAt ? new Date(publishEndAt).toISOString() : "");
      formData.append("registration_deadline", registrationDeadline ? new Date(registrationDeadline).toISOString() : "");

      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image_url", imageUrl || "/images/workshop-freelance.jpg");
      }

      let res;
      if (isEditing && eventToEdit) {
        res = await updateAdminEventApi(eventToEdit.id, formData);
      } else {
        res = await createAdminEventApi(formData);
      }

      if (!res.success) {
        throw new Error(res.message || (isRTL ? "فشل حفظ بيانات الورشة" : "Failed to save workshop"));
      }

      const savedEvent: EventItem = res.data || (isEditing ? eventToEdit! : { id: 0, title: title.trim() } as EventItem);

      // Handle Announcement Synchronization in background
      const shouldBeAnnouncement = displayMode === "banner_only" || (status === "scheduled" && setAsAnnouncement);
      if (status === "scheduled" && shouldBeAnnouncement && savedEvent?.id) {
        try {
          const annPayload = {
            enabled: true,
            badge: isRTL ? "ورشة عمل قادمة" : "Upcoming Workshop",
            text: isRTL
              ? `انطلاق ورشة: ${title.trim()} — التسجيل متاح مجاناً الآن`
              : `Workshop: ${title.trim()} — Free Registration Open`,
            action_type: customUrl.trim() ? ("custom_url" as const) : ("event_registration" as const),
            custom_url: customUrl.trim() || "",
            event_id: savedEvent.id,
            button_label: isRTL ? "سجّل الآن مجاناً" : "Register Free",
          };
          updateAdminAnnouncementApi(annPayload).catch(() => {});
          localStorage.setItem("eduhub_active_announcement", JSON.stringify({ ...annPayload, event: savedEvent }));
        } catch (annErr) {
          console.error("Failed to set announcement:", annErr);
        }
      } else if (isEditing && eventToEdit && isAnnouncement && !shouldBeAnnouncement) {
        // If this workshop was previously active as announcement, deactivate it
        updateAdminAnnouncementApi({ enabled: false }).catch(() => {});
        try {
          localStorage.removeItem("eduhub_active_announcement");
        } catch {}
      }

      try {
        window.dispatchEvent(new Event("eduhub_events_updated"));
        window.dispatchEvent(new Event("eduhub_announcement_updated"));
        localStorage.setItem("eduhub_events_last_sync", String(Date.now()));
      } catch {}

      onSuccess(savedEvent, isEditing);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : (isRTL ? "حدث خطأ أثناء حفظ الورشة" : "Save error"));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0 shadow-2xs">
              {status === "completed" ? (
                <Camera className="w-5 h-5 text-emerald-600" />
              ) : (
                <Sparkles className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-950 truncate">
                {isEditing
                  ? status === "completed"
                    ? isRTL
                      ? "توثيق وتعديل الورشة بعد تمامها"
                      : "Document Completed Workshop"
                    : isRTL
                    ? "تعديل بيانات ورشة العمل"
                    : "Edit Workshop"
                  : isRTL
                  ? "إضافة ورشة عمل جديدة"
                  : "Add New Workshop"}
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                {status === "completed"
                  ? isRTL
                    ? "رفع الصور الحقيقية للورشة وتوثيق المخرجات على الموقع"
                    : "Upload real photos from the event and document outcomes"
                  : isRTL
                  ? "إعداد بيانات الورشة وأسئلة فورم التسجيل للطلاب"
                  : "Configure workshop info and student registration form"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/40 px-5 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "details"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isRTL ? "1. بيانات الورشة والتوثيق" : "1. Workshop & Media"}</span>
          </button>

          {/* Registration Form tab only relevant if scheduled AND using internal website form */}
          {status === "scheduled" && registrationType === "internal" && (
            <button
              type="button"
              onClick={() => setActiveTab("form_questions")}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "form_questions"
                  ? "border-emerald-600 text-emerald-800"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isRTL ? "2. أسئلة فورم التسجيل" : "2. Registration Form"}</span>
              {customQuestions.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">
                  {customQuestions.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: WORKSHOP DETAILS & DOCUMENTATION */}
          {activeTab === "details" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Workshop Lifecycle Status Selector (مرحلة الورشة) */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="block text-xs font-black text-slate-900">
                  {isRTL ? "مرحلة وحالة الورشة:" : "Workshop Status:"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("scheduled");
                      setSetAsAnnouncement(true);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                      status === "scheduled"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs ring-2 ring-emerald-500/20"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isRTL ? "ورشة قادمة (التسجيل متاح)" : "Upcoming (Open)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatus("completed");
                      setSetAsAnnouncement(false);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                      status === "completed"
                        ? "bg-sky-50 border-sky-500 text-sky-950 shadow-2xs ring-2 ring-sky-500/20"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5 text-sky-600" />
                    <span>{isRTL ? "مكتملة (توثيق الصور والمخرجات)" : "Completed & Documented"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStatus("archived");
                      setSetAsAnnouncement(false);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                      status === "archived"
                        ? "bg-amber-50 border-amber-500 text-amber-950 shadow-2xs ring-2 ring-amber-500/20"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isRTL ? "مؤرشفة (مخفية من الموقع)" : "Archived (Hidden)"}</span>
                  </button>
                </div>

                {status === "completed" && (
                  <p className="text-[11px] text-sky-900 bg-sky-100/70 p-2 rounded-xl font-medium mt-1">
                    {isRTL
                      ? "✨ الورشة أقيمت بنجاح: يمكنك الآن رفع الصور الحقيقية للطلاب والمدرب، وتوثيق ما تم إنجازه. تم إيقاف التسجيل تلقائياً."
                      : "The event is completed: Upload real photos and document outcomes. Registration is closed."}
                  </p>
                )}
              </div>

              {/* Display & Publication Mode (تظهر فقط عندما تكون الورشة قادمة ونشطة للتسجيل) */}
              {status === "scheduled" && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="block text-xs font-black text-slate-900 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>{isRTL ? "مكان ونطاق ظهور الدورة في الموقع:" : "Display & Placement Mode:"}</span>
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                      {displayMode === "banner_only" 
                        ? (isRTL ? "الحالة 1: بنر علوي فقط" : "Case 1: Banner Only") 
                        : (isRTL ? "الحالة 2: قسم الورش + تسجيل" : "Case 2: Workshops Section + Registration")}
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Case 1: Banner Only */}
                    <button
                      type="button"
                      onClick={() => {
                        setDisplayMode("banner_only");
                        setSetAsAnnouncement(true);
                      }}
                      className={`p-3 rounded-2xl border text-start transition-all cursor-pointer relative ${
                        displayMode === "banner_only"
                          ? "bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/30 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          displayMode === "banner_only" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-black block ${
                            displayMode === "banner_only" ? "text-amber-950" : "text-slate-900"
                          }`}>
                            {isRTL ? "الحالة 1: يظهر بس بنر فوق" : "Case 1: Banner Only"}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-normal">
                            {isRTL
                              ? "تظهر الدورة فقط كـ بنر إعلاني في الشريط العلوي أعلى الموقع، ولا تظهر كبطاقة في قسم ورش العمل بالأسفل."
                              : "Shows only as the top announcement bar ribbon on the website. Hidden from the bottom workshops grid."}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Case 2: Full in Workshops Section + Registration */}
                    <button
                      type="button"
                      onClick={() => setDisplayMode("events_and_registration")}
                      className={`p-3 rounded-2xl border text-start transition-all cursor-pointer relative ${
                        displayMode === "events_and_registration"
                          ? "bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          displayMode === "events_and_registration" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          <CalendarCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-black block ${
                            displayMode === "events_and_registration" ? "text-emerald-950" : "text-slate-900"
                          }`}>
                            {isRTL ? "الحالة 2: يظهر بقسم الورش والفعاليات (مع التسجيل)" : "Case 2: Workshops Section + Registration"}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-normal">
                            {isRTL
                              ? "تظهر كبطاقة رسمية كاملة في قسم الورش والفعاليات على الصفحة الرئيسية مع زر (سجّل الآن) وفورم التسجيل."
                              : "Displays as a full workshop card in the workshops section with the registration modal."}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1.5">
                  {isRTL ? "عنوان الورشة *" : "Workshop Title *"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isRTL
                      ? "مثال: ورشة العمل الحر والذكاء الاصطناعي (AI & Freelancing)"
                      : "e.g. AI & Freelancing Workshop"
                  }
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-950 placeholder:text-slate-400"
                />
              </div>

              {/* Date & Location in Two Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "تاريخ موعد الورشة *" : "Event Date *"}
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "مكان انعقاد الورشة" : "Location"}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={isRTL ? "مساحة إديوهب غزة" : "EduHub Space"}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Category / Type & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "تصنيف الورشة" : "Category / Type"}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900 bg-white"
                  >
                    {defaultTypes.map((tVal, idx) => (
                      <option key={idx} value={tVal}>
                        {tVal}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "الشارة (Tag)" : "Tag"}
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="EduHub"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Automated Publishing & Registration Deadline (تظهر فقط عندما تكون الورشة قادمة ومفتوحة للتسجيل) */}
              {status === "scheduled" && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-black text-slate-900">
                        {isRTL ? "مواعيد وجدولة النشر وإغلاق التسجيل (نظام ذكي):" : "Publishing Schedule & Registration Deadline:"}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {isRTL ? "مؤتمت واحترافي" : "Automated"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Publish Start Time (Scheduled Publishing) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isRTL ? "تاريخ ووقت بدء النشر التلقائي" : "Auto-Publish Start Date & Time"}
                      </label>
                      <input
                        type="datetime-local"
                        value={publishStartAt}
                        onChange={(e) => setPublishStartAt(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        {isRTL
                          ? "اتركه فارغاً للنشر الفوري، أو حدد موعداً مستقبلياً (مثلاً بعد يومين) لتُنشر الورشة تلقائياً في ذلك الوقت."
                          : "Leave empty for immediate publishing, or set a future date to auto-publish."}
                      </p>
                    </div>

                    {/* Publish End Time (Auto Expire / Unpublish) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isRTL ? "تاريخ ووقت انتهاء النشر (أرشفة تلقائية)" : "Auto-Unpublish End Date & Time"}
                      </label>
                      <input
                        type="datetime-local"
                        value={publishEndAt}
                        onChange={(e) => setPublishEndAt(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        {isRTL
                          ? "اختياري: بعد هذا التاريخ تختفي الورشة من الموقع وتنتقل للأرشيف تلقائياً."
                          : "Optional: Workshop auto-archives after this date."}
                      </p>
                    </div>
                  </div>

                  {/* Registration Deadline */}
                  <div className="pt-2.5 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800">
                        {isRTL ? "الموعد النهائي لإغلاق التسجيل (Registration Deadline):" : "Registration Deadline:"}
                      </label>
                      {registrationDeadline && (
                        <button
                          type="button"
                          onClick={() => setRegistrationDeadline("")}
                          className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                        >
                          {isRTL ? "إلغاء الموعد (مفتوح)" : "Clear Deadline"}
                        </button>
                      )}
                    </div>
                    <input
                      type="datetime-local"
                      value={registrationDeadline}
                      onChange={(e) => setRegistrationDeadline(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {isRTL
                        ? "عند الوصول لهذا الموعد، يُغلق باب التسجيل فوراً ويتحول الزر تلقائياً إلى (انتهى موعد التسجيل)."
                        : "When this time is reached, registration closes automatically."}
                    </p>
                  </div>
                </div>
              )}

              {/* Registration Method: Strict Choice between Internal Website Form OR External Link (e.g. Google Form) */}
              {status === "scheduled" && (
                <div className="pt-2 border-t border-slate-200/80 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {isRTL ? "طريقة استقبال طلبات التسجيل للطلاب (اختر واحداً من الاثنين):" : "Registration Method for Students (Choose One):"}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Option 1: Internal Website Form */}
                      <button
                        type="button"
                        onClick={() => {
                          setRegistrationType("internal");
                          setCustomUrl("");
                        }}
                        className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-start gap-2.5 ${
                          registrationType === "internal"
                            ? "bg-emerald-50/80 border-emerald-500 shadow-2xs ring-2 ring-emerald-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                            registrationType === "internal"
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {registrationType === "internal" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">
                            {isRTL ? "فورم التسجيل الذكي داخل الموقع" : "Internal Website Form"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {isRTL
                              ? "يملأ الطالب البيانات في نافذة سريعة بالموقع، وتُحفظ الطلبات في لوحة الإدارة مع إمكانية إضافة أسئلة مخصصة."
                              : "Student registers on site. Applications saved to admin dashboard."}
                          </p>
                        </div>
                      </button>

                      {/* Option 2: External Link (Google Form) */}
                      <button
                        type="button"
                        onClick={() => {
                          setRegistrationType("external");
                        }}
                        className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex items-start gap-2.5 ${
                          registrationType === "external"
                            ? "bg-emerald-50/80 border-emerald-500 shadow-2xs ring-2 ring-emerald-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                            registrationType === "external"
                              ? "border-emerald-600 bg-emerald-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {registrationType === "external" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">
                            {isRTL ? "رابط خارجي (Google Forms / استبيان)" : "External Link (Google Forms)"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {isRTL
                              ? "زر (سجّل الآن) ينقل الطالب فوراً لفتح نموذج Google Form الخارجي (دون فتح فورم الموقع الداخلي)."
                              : "The 'Register' button opens your external Google Form directly."}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* If External Link Selected: Show URL Input */}
                  {registrationType === "external" && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2 animate-in fade-in duration-200">
                      <label className="block text-xs font-bold text-slate-800">
                        {isRTL ? "أدخل رابط النموذج الخارجي (Google Form URL):" : "Enter External Form URL:"}
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="https://docs.google.com/forms/d/e/.../viewform"
                          dir="ltr"
                          required={registrationType === "external"}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-slate-900"
                        />
                      </div>
                      <p className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-medium">
                        {isRTL
                          ? "💡 ملاحظة: عند تفعيل الرابط الخارجي، لن يتم طلب أو عرض فورم الموقع، وسيتم توجيه الطلاب مباشرة إلى هذا الرابط."
                          : "Note: When using an external link, the internal website form is disabled."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Description & Outcomes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {status === "completed"
                    ? isRTL
                      ? "توثيق مخرجات وما تم إنجازه في الورشة"
                      : "Document Outcomes & Highlights"
                    : isRTL
                    ? "وصف ومحاور الورشة التدريبية"
                    : "Workshop Description"}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    status === "completed"
                      ? isRTL
                        ? "اكتب هنا نبذة توثيقية عن فعاليات الورشة، عدد الحضور، وأهم ما أنجزه الطلاب..."
                        : "Document workshop highlights, attendance, and student accomplishments..."
                      : isRTL
                      ? "نبذة موجزة تشرح موضوع الورشة وما سيتعلمه الطالب..."
                      : "Brief description of topics covered and expected outcomes..."
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-normal text-slate-900 resize-none leading-relaxed"
                />
              </div>

              {/* Cover / Studio Photos Upload (رفع مباشر من جهاز الكمبيوتر أو الجوال) */}
              <div className="space-y-2.5 pt-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>
                      {status === "completed"
                        ? isRTL ? "توثيق صور الورشة الحقيقية (من ألبوم الاستوديو / الهاتف)" : "Workshop Real Photos (Studio / Device Gallery)"
                        : isRTL ? "صورة غلاف الورشة (رفع مباشر من جهازك)" : "Cover Image (Upload from Device)"}
                    </span>
                  </span>
                  {imageFile && (
                    <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 truncate max-w-[200px]">
                      {isRTL ? `تم اختيار: ${imageFile.name}` : imageFile.name}
                    </span>
                  )}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Current / Preview Image Display */}
                  <div className="sm:col-span-5 relative h-36 sm:h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs group">
                    <Image
                      src={previewSrc}
                      alt="Workshop Preview"
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/45 transition-colors flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-md backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
                        <span>
                          {status === "completed"
                            ? isRTL ? "تغيير الصورة من الاستوديو" : "Change Studio Photo"
                            : isRTL ? "تغيير الصورة" : "Change Image"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Drag-and-drop / Click-to-upload Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="sm:col-span-7 h-36 sm:h-40 p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white text-emerald-600 shadow-2xs border border-slate-200 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 mb-0.5">
                      {status === "completed"
                        ? isRTL ? "انقر لاختيار صور فعاليات الورشة من الاستوديو" : "Click to select real event photos from studio"
                        : isRTL ? "انقر هنا لاختيار صورة من جهازك" : "Click to select an image from your device"}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {isRTL ? "صيغ JPG و PNG و WebP (حتى 10 ميغابايت)" : "Supports JPG, PNG, WebP (up to 10MB)"}
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Live Card Preview on Website for Completed Workshop */}
                {status === "completed" && (
                  <div className="mt-3.5 p-3.5 sm:p-4 rounded-2xl bg-sky-50/60 border border-sky-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-sky-600" />
                        <span>{isRTL ? "معاينة حية لشكل بطاقة الورشة على الموقع للزوار:" : "Live Website Card Preview (Public):"}</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        {isRTL ? "تمت الورشة وموثقة" : "Completed"}
                      </span>
                    </div>

                    <div className="max-w-sm mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                      <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                        <Image
                          src={previewSrc}
                          alt="Live Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <div className="absolute top-2.5 start-2.5 z-10">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs border border-white/60">
                            <Calendar className="w-3 h-3 text-emerald-600" />
                            <span>{eventDate || "2026-11-20"}</span>
                          </span>
                        </div>
                        <div className="absolute top-2.5 end-2.5 z-10">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white shadow-xs">
                            <Camera className="w-3 h-3" />
                            <span>{isRTL ? "تمت الورشة" : "Completed"}</span>
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-1 line-clamp-1">
                          {title || (isRTL ? "عنوان ورشة العمل" : "Workshop Title")}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {description || (isRTL ? "توثيق مخرجات وتفاصيل الورشة..." : "Workshop documentation details...")}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {tag || "EduHub"}
                          </span>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                            {isRTL ? "تمت الورشة وتوثيقها ✓" : "Completed & Documented"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Announcement Option Card */}
              {status === "scheduled" && (
                displayMode === "banner_only" ? (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-2xs flex items-start gap-3">
                    <Megaphone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs sm:text-sm font-black text-amber-950 block">
                        {isRTL ? "مفعل تلقائياً: ستظهر الدورة كـ بنر إعلاني علوي في أعلى الموقع" : "Active: Banner Only Mode"}
                      </span>
                      <p className="text-[11px] text-amber-900/90 mt-0.5 font-medium leading-relaxed">
                        {isRTL
                          ? "سيتم تثبيت هذه الدورة في الشريط العلوي للموقع فور حفظها مع ربط زر التسجيل بها. ولن تظهر في قسم الورش بالأسفل كما اخترت في الحالة 1."
                          : "This course will be pinned to the top announcement bar upon saving, and hidden from the bottom workshops grid."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-300 shadow-2xs">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setAsAnnouncement}
                        onChange={(e) => setSetAsAnnouncement(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
                      />
                      <div>
                        <span className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                          <Megaphone className="w-4 h-4 text-emerald-600" />
                          <span>
                            {isRTL ? "تثبيت هذه الورشة كإعلان رسمي أعلى الموقع (بنر علوي)" : "Pin workshop as top announcement banner"}
                          </span>
                        </span>
                        <p className="text-[11px] text-emerald-900/80 mt-0.5 font-medium leading-relaxed">
                          {isRTL
                            ? "اختياري: اتركه غير محدد ولن تظهر كإعلان علوي أبداً. حدده فقط إذا أردت تثبيت شريط إعلاني ملفت أعلى الموقع لهذه الورشة."
                            : "Optional: Leave unchecked to not display as top banner. Check only if you want a prominent top banner."}
                        </p>
                      </div>
                    </label>
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 2: REGISTRATION FORM QUESTIONS */}
          {activeTab === "form_questions" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Default Fields Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isRTL ? "الأسئلة الافتراضية الثابتة (تسأل لكل طالب):" : "Default Built-in Questions:"}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {defaultFields.length} {isRTL ? "أسئلة أساسية" : "fields"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {defaultFields.map((field, idx) => {
                    const IconComp = field.icon;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IconComp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {field.label}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                            field.req
                              ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {field.req ? (isRTL ? "إجباري" : "Required") : (isRTL ? "اختياري" : "Optional")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Questions Section */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>{isRTL ? "أسئلة مخصصة إضافية لهذه الورشة (اختياري):" : "Custom Additional Questions:"}</span>
                </label>

                {/* Add Custom Question Input */}
                <div className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder={
                        isRTL
                          ? "اكتب نص السؤال الإضافي (مثال: هل تمتلك جهاز لابتوب خاص؟)"
                          : "Enter additional question text"
                      }
                      className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddQuestion();
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      disabled={!newQuestionText.trim()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isRTL ? "إضافة السؤال" : "Add Question"}</span>
                    </button>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newQuestionRequired}
                      onChange={(e) => setNewQuestionRequired(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{isRTL ? "سؤال إجباري يلزم الطالب بالإجابة" : "Mark as required"}</span>
                  </label>
                </div>

                {/* List of Custom Questions */}
                {customQuestions.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {customQuestions.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {q.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              q.required
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {q.required ? (isRTL ? "إجباري" : "Required") : (isRTL ? "اختياري" : "Optional")}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={isRTL ? "حذف هذا السؤال" : "Remove question"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-2 text-xs text-slate-400 font-medium">
                    {isRTL
                      ? "لم تقم بإضافة أسئلة إضافية بعد. يتم الاكتفاء بالأسئلة الأساسية."
                      : "No custom questions added yet. Basic questions will be used."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>

            {activeTab === "details" && status === "scheduled" && registrationType === "internal" && (
              <button
                type="button"
                onClick={() => setActiveTab("form_questions")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
              >
                {isRTL ? "أسئلة فورم التسجيل ←" : "Form Questions →"}
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isRTL ? "جارٍ الحفظ..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isEditing
                      ? status === "completed"
                        ? isRTL
                          ? "حفظ وتوثيق الورشة بالصور"
                          : "Save & Document"
                        : isRTL
                        ? "حفظ التعديلات"
                        : "Save Changes"
                      : isRTL
                      ? "حفظ ونشر الورشة"
                      : "Publish Workshop"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
