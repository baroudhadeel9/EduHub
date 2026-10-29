"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  Zap,
  UploadCloud,
  CheckCircle2,
  FileText,
  Camera,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import {
  submitMembershipApplication,
  checkEmailAvailabilityApi,
} from "@/services/applications";

type MemberCategory = "طالب/ة" | "فريلانسر Freelancer" | "باحث عن عمل وتطوير مهارات";

interface NewMemberTabProps {
  onReturnToHub: () => void;
}

/**
 * Compresses an image file client-side before sending over HTTP
 * Reduces mobile camera photos (typically 5MB - 12MB) to ~200-400KB
 * ensuring fast uploads and avoiding PHP / Vercel body limits.
 */
async function compressImageIfNeeded(
  file: File | null,
  maxDimension = 1600,
  quality = 0.82
): Promise<File | null> {
  if (!file || typeof window === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }

  // Already lightweight, skip compression
  if (file.size < 500 * 1024) {
    return file;
  }

  return new Promise<File>((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= file.size) {
                resolve(file);
              } else {
                const safeName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                const compressedFile = new File([blob], safeName, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    } catch {
      resolve(file);
    }
  });
}

export default function NewMemberTab({ onReturnToHub }: NewMemberTabProps) {
  const { locale, dir } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const ArrowNext = isRTL ? ChevronLeft : ChevronRight;
  const ArrowPrev = isRTL ? ChevronRight : ChevronLeft;

  // Multi-step progress (1: Personal, 2: Academic/Work, 3: Device & Needs, 4: Consents)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [reqSubmitted, setReqSubmitted] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);
  const [submittedAppNumber, setSubmittedAppNumber] = useState<string>("");

  // 1. Personal & Contact Info
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("مدينة غزة");
  const [detailedAddress, setDetailedAddress] = useState("");

  // 2. Category & Academic / Work
  const [category, setCategory] = useState<MemberCategory>("طالب/ة");
  const [university, setUniversity] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [primaryPurposes, setPrimaryPurposes] = useState<string[]>([
    "حضور المحاضرات الجامعية الدراسة والتحضير للامتحانات وتقديم الاختبارات الإلكترونية",
  ]);
  const [customPurpose, setCustomPurpose] = useState("");
  const [durationSchedule, setDurationSchedule] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const togglePurpose = (purpose: string) => {
    setPrimaryPurposes((prev) =>
      prev.includes(purpose)
        ? prev.filter((p) => p !== purpose)
        : [...prev, purpose]
    );
  };

  // 3. Device & Power & Needs
  const [deviceType, setDeviceType] = useState("لابتوب عادي");
  const [customDevice, setCustomDevice] = useState("");
  const [chargerWattage, setChargerWattage] = useState("46–65 واط");
  const [chargerPhoto, setChargerPhoto] = useState<File | null>(null);
  const [powerConnectivityStatus, setPowerConnectivityStatus] = useState(
    "لا يتوفر لدي إنترنت أو كهرباء مناسبين للدراسة أو العمل"
  );
  const [customConnectivity, setCustomConnectivity] = useState("");
  const [preferredShift, setPreferredShift] = useState("الفترة الصباحية");
  const [weeklyUsage, setWeeklyUsage] = useState("يوميا");
  const [customWeeklyUsage, setCustomWeeklyUsage] = useState("");

  // 4. Consents & Declaration
  const [photographyConsent, setPhotographyConsent] = useState<"أوافق" | "لا أوافق" | "">("");
  const [dataAccuracyConsent, setDataAccuracyConsent] = useState<
    "أقرّ بصحة البيانات المقدمة وأوافق على ما ورد أعلاه." | "لا أوافق" | ""
  >("");

  // Validation per step
  const validateStep1 = () => {
    if (!email.trim() || !email.includes("@")) {
      return isRTL ? "يرجى إدخال عنوان بريد إلكتروني صالح." : "Please enter a valid email address.";
    }
    if (!fullName.trim() || fullName.trim().split(" ").length < 3) {
      return isRTL ? "يرجى كتابة الاسم رباعياً كاملاً." : "Please provide your full 4-part name.";
    }
    if (!nationalId.trim() || nationalId.trim().length !== 9) {
      return isRTL ? "يرجى إدخال رقم هوية صحيح مكون من 9 أرقام." : "Please enter a valid 9-digit National ID.";
    }
    if (!birthDate) {
      return isRTL ? "يرجى تحديد تاريخ الميلاد." : "Please specify your date of birth.";
    }
    if (!phone.trim() || (!phone.startsWith("059") && !phone.startsWith("056")) || phone.trim().length < 10) {
      return isRTL ? "يرجى إدخال رقم جوال فعال يبدأ بـ 059 أو 056 ومكون من 10 أرقام." : "Please enter a valid mobile number starting with 059 or 056.";
    }
    if (!detailedAddress.trim()) {
      return isRTL ? "يرجى كتابة عنوان التواجد الحالي بالتفصيل." : "Please enter your detailed current residence address.";
    }
    return "";
  };

  const validateStep2 = () => {
    if (!specialty.trim()) {
      return isRTL ? "يرجى كتابة التخصص الجامعي أو مجال عملك." : "Please enter your major or freelance field.";
    }
    if (primaryPurposes.length === 0) {
      return isRTL ? "يرجى تحديد غرض واحد على الأقل من استخدام المساحة." : "Please select at least one purpose for using the space.";
    }
    if (primaryPurposes.includes("أخرى") && !customPurpose.trim()) {
      return isRTL ? "يرجى توضيح الغرض الأساسي في حقل (أخرى)." : "Please clarify your primary purpose.";
    }
    if (!durationSchedule.trim()) {
      return isRTL ? "يرجى تحديد مدة الفصل الدراسي أو مدة المشروع." : "Please specify semester dates or project duration.";
    }
    if (!proofFile) {
      return isRTL ? "يرجى إرفاق الإفادة الجامعية أو صورة عن المشاريع الجارية." : "Please upload your academic proof or freelance work.";
    }
    return "";
  };

  const validateStep3 = () => {
    if (deviceType === "جهاز آخر" && !customDevice.trim()) {
      return isRTL ? "يرجى تحديد نوع الجهاز الذي ستستخدمه." : "Please specify your device type.";
    }
    if (!chargerPhoto) {
      return isRTL ? "يرجى إرفاق صورة لشاحن الجهاز المستخدم." : "Please upload a photo of your device charger.";
    }
    if (powerConnectivityStatus === "أخرى" && !customConnectivity.trim()) {
      return isRTL ? "يرجى توضيح مدى توفر الإنترنت والكهرباء لديك." : "Please clarify your connectivity status.";
    }
    if (weeklyUsage === "أخرى" && !customWeeklyUsage.trim()) {
      return isRTL ? "يرجى تحديد عدد الساعات أو الأيام المتوقعة أسبوعياً." : "Please specify your expected weekly usage.";
    }
    return "";
  };

  const validateStep4 = () => {
    if (photographyConsent !== "أوافق") {
      return isRTL ? "يرجى تحديد الموافقة على بند التصوير واستخدام الصور للمتابعة." : "Please select your consent for photography.";
    }
    if (dataAccuracyConsent !== "أقرّ بصحة البيانات المقدمة وأوافق على ما ورد أعلاه.") {
      return isRTL ? "يجب الإقرار بصحة البيانات المقدمة لإتمام التسجيل." : "You must acknowledge data accuracy to proceed.";
    }
    return "";
  };

  const handleNext = async () => {
    setValidationError("");
    if (currentStep === 1) {
      const err = validateStep1();
      if (err) {
        setValidationError(err);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const res = await checkEmailAvailabilityApi(email);
        if (res.exists) {
          setValidationError(
            res.message ||
              (isRTL
                ? "هذا البريد الإلكتروني مسجل بالفعل وله عضوية في المساحة. يرجى استخدام بريد إلكتروني آخر أو التوجه لتسجيل الدخول."
                : "This email address is already registered with a membership. Please use another email or sign in.")
          );
          return;
        }
      } catch {
        // If pre-check fails due to network, continue and backend will validate on submit
      } finally {
        setIsCheckingEmail(false);
      }

      setCurrentStep(2);
    } else if (currentStep === 2) {
      const err = validateStep2();
      if (err) {
        setValidationError(err);
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const err = validateStep3();
      if (err) {
        setValidationError(err);
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    const err = validateStep4();
    if (err) {
      setValidationError(err);
      return;
    }

    if (!proofFile) {
      setValidationError(isRTL ? "يرجى إرفاق الإفادة الجامعية أو صورة عن المشاريع." : "Please attach your academic proof or work samples.");
      return;
    }
    if (!chargerPhoto) {
      setValidationError(isRTL ? "يرجى إرفاق صورة لشاحن جهازك." : "Please attach your charger photo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const [finalProof, finalCharger] = await Promise.all([
        compressImageIfNeeded(proofFile),
        compressImageIfNeeded(chargerPhoto),
      ]);

      const fd = new FormData();
      fd.append("email", email);
      fd.append("fullName", fullName);
      fd.append("nationalId", nationalId);
      fd.append("birthDate", birthDate);
      fd.append("phone", phone);
      fd.append("governorate", governorate);
      fd.append("detailedAddress", detailedAddress);

      fd.append("category", category);
      if (university) fd.append("university", university);
      fd.append("specialty", specialty);
      
      const finalPurposes = [...primaryPurposes];
      if (customPurpose && customPurpose.trim()) {
        finalPurposes.push(customPurpose.trim());
      }
      finalPurposes.forEach((purpose) => {
        fd.append("primaryPurposes[]", purpose);
      });

      if (customPurpose) fd.append("customPurpose", customPurpose);
      fd.append("durationSchedule", durationSchedule);
      if (finalProof) fd.append("proofFile", finalProof);

      fd.append("deviceType", deviceType);
      if (customDevice) fd.append("customDevice", customDevice);
      fd.append("chargerWattage", chargerWattage);
      if (finalCharger) fd.append("chargerPhoto", finalCharger);
      fd.append("powerConnectivityStatus", powerConnectivityStatus);
      if (customConnectivity) fd.append("customConnectivity", customConnectivity);
      fd.append("preferredShift", preferredShift);
      fd.append("weeklyUsage", weeklyUsage);
      if (customWeeklyUsage) fd.append("customWeeklyUsage", customWeeklyUsage);

      fd.append("photographyConsent", photographyConsent);
      fd.append("dataAccuracyConsent", dataAccuracyConsent);

      const res = await submitMembershipApplication(fd);
      if (res.data?.applicationNumber) {
        setSubmittedAppNumber(res.data.applicationNumber);
      }
      setReqSubmitted(true);
    } catch (submitErr: unknown) {
      const message = submitErr instanceof Error ? submitErr.message : null;
      setValidationError(
        message ||
          (isRTL
            ? "تعذر إرسال طلب العضوية، يرجى التحقق من اتصال الإنترنت والمحاولة ثانية."
            : "Could not submit application. Please check your connection and try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        setValidationError(
          isRTL
            ? "حجم الملف يتجاوز الحد الأقصى المسموح (20 MB)."
            : "File size exceeds 20 MB."
        );
        return;
      }
      setValidationError("");

      if (file.type.startsWith("image/")) {
        try {
          const compressed = await compressImageIfNeeded(file);
          setter(compressed);
        } catch {
          setter(file);
        }
      } else {
        setter(file);
      }
    }
  };

  const stepsList = [
    { num: 1, title: isRTL ? "البيانات الشخصية" : "Personal Info" },
    { num: 2, title: isRTL ? "المجال الأكاديمي والمهني" : "Study & Field" },
    { num: 3, title: isRTL ? "الجهاز والكهرباء" : "Device & Power" },
    { num: 4, title: isRTL ? "الموافقات والإقرار" : "Declarations" },
  ];

  return (
    <div>
      {reqSubmitted ? (
        /* Submission Success View */
        <div className="text-center py-10 space-y-6 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {isRTL ? "تم استلام طلب عضويتك بنجاح!" : "Membership Application Received!"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {isRTL
                ? `شكراً لك يا ${fullName.split(" ")[0] || "عضو أديو هب"}. تم توثيق طلبك رسمياً لدى إدارة المركز، وستصلك رسالة نصية SMS على هاتفك (${phone}) وبريد إلكتروني فور مراجعة المستندات واعتماد حصتك الشهرية.`
                : `Thank you, ${fullName.split(" ")[0]}. Your application is being reviewed by the EduHub committee. You will receive an SMS and email notification upon approval.`}
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 text-start space-y-1.5 font-medium">
            <div className="font-bold flex items-center justify-between text-emerald-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isRTL ? "بيانات الطلب المسجلة:" : "Application Summary:"}</span>
              </div>
              {submittedAppNumber && (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  {submittedAppNumber}
                </span>
              )}
            </div>
            <div>• {isRTL ? `الفئة: ${category}` : `Category: ${category}`}</div>
            <div>• {isRTL ? `الهاتف: ${phone} | البريد: ${email}` : `Phone: ${phone} | Email: ${email}`}</div>
            <div>• {isRTL ? `المحافظة: ${governorate}` : `Governorate: ${governorate}`}</div>
            <div>• {isRTL ? `حالة الطلب: قيد التدقيق الإداري (Pending Review)` : `Status: Pending Review`}</div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setReqSubmitted(false);
                setCurrentStep(1);
                onReturnToHub();
              }}
              className="px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            >
              {isRTL ? "العودة لبوابة الحجز" : "Return to Hub"}
            </button>
          </div>
        </div>
      ) : (
        /* Multi-Step Official Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Header Introduction */}
          <div className="border-b border-slate-100 pb-5">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isRTL ? "نموذج التسجيل وطلب العضوية" : "EduHub Membership Application"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              {isRTL
                ? "مساحة آمنة مجهزة بالطاقة الشمسية والإنترنت الفضائي لطلبة الجامعات، المستقلين، والباحثين عن عمل في قطاع غزة."
                : "A solar-powered sanctuary with satellite internet for students, freelancers, and job seekers in Gaza."}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative">
            <div className="grid grid-cols-4 gap-2">
              {stepsList.map((s) => {
                const isActive = currentStep === s.num;
                const isCompleted = currentStep > s.num;

                return (
                  <div key={s.num} className="space-y-2 text-start">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isCompleted
                          ? "bg-emerald-600"
                          : isActive
                          ? "bg-[#0c2340]"
                          : "bg-slate-100"
                      }`}
                    />
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800"
                            : isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                      </span>
                      <span
                        className={`text-[11px] font-bold hidden sm:inline truncate ${
                          isActive ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              STEP 1: Personal & Contact Information
             ═════════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{isRTL ? "1. البيانات الشخصية ومعلومات الاتصال" : "1. Personal & Contact Information"}</span>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL ? "عنوان البريد الإلكتروني" : "Email Address"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationError) setValidationError("");
                    }}
                    placeholder="name@example.com"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                  <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRTL ? "left-3" : "right-3"}`}>
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL ? "الاسم رباعي" : "Full 4-Part Name"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isRTL ? "مثال: أحمد محمد علي النجار" : "e.g., Ahmed Mohammed Ali Al-Najjar"}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                />
              </div>

              {/* National ID & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {isRTL ? "رقم الهوية الشخصية (9 أرقام)" : "National ID (9 digits)"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={9}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                    placeholder="401234567"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono font-medium"
                  />
                </div>

                {/* Birth Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {isRTL ? "تاريخ الميلاد" : "Date of Birth"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL
                    ? "رقم جوال مبدوء ب 059 أو 056 (يجب أن يكون فعالاً لاستقبال رسائل SMS)"
                    : "Mobile Number (starting with 059 or 056, active for SMS)"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
                    placeholder="059xxxxxxx"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-mono font-medium text-start"
                  />
                  <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRTL ? "left-3" : "right-3"}`}>
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Governorate */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL ? "محافظة السكن الحالي" : "Current Governorate"} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium cursor-pointer"
                >
                  <option value="مدينة غزة">{isRTL ? "مدينة غزة" : "Gaza City"}</option>
                  <option value="شمال غزة">{isRTL ? "شمال غزة" : "North Gaza"}</option>
                  <option value="الوسطى">{isRTL ? "الوسطى (دير البلح والنصيرات)" : "Middle Area"}</option>
                  <option value="خانيونس">{isRTL ? "خانيونس" : "Khan Younis"}</option>
                </select>
              </div>

              {/* Detailed Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL ? "عنوان التواجد حالياً بالتفصيل" : "Current Detailed Address / Shelter"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    placeholder={isRTL ? "مثال: غزة - حي الرمال - شارع الوحدة - بجوار عمارة سندس" : "Neighborhood, street, nearest landmark"}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                  <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none ${isRTL ? "left-3" : "right-3"}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              STEP 2: Academic & Professional Category
             ═════════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>{isRTL ? "2. الفئة، الجامعة، ومجال التخصص" : "2. Category & Academic / Work Field"}</span>
              </div>

              {/* Category Radio Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL ? "من أي الفئات تصنف نفسك؟" : "How do you classify yourself?"} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "طالب/ة", label: isRTL ? "طالب/ة" : "Student", icon: GraduationCap },
                    { id: "فريلانسر Freelancer", label: isRTL ? "فريلانسر Freelancer" : "Freelancer", icon: Briefcase },
                    { id: "باحث عن عمل وتطوير مهارات", label: isRTL ? "باحث عن عمل وتطوير مهارات" : "Job Seeker / Skills", icon: User },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as MemberCategory)}
                      className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-2.5 ${
                        category === cat.id
                          ? "bg-emerald-50/70 border-emerald-500 text-emerald-900 font-bold shadow-2xs"
                          : "bg-[#f8fafc] border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <cat.icon className={`w-4 h-4 ${category === cat.id ? "text-emerald-700" : "text-slate-400"}`} />
                      <span className="text-xs sm:text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* University & Major */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {isRTL ? "اسم الجامعة (للطلاب والخريجين)" : "University Name"}
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder={isRTL ? "مثال: الجامعة الإسلامية، الأزهر، الأقصى..." : "e.g., Islamic University, Al-Azhar..."}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {isRTL ? "التخصص الجامعي أو مجال عملك فريلانسر" : "Major or Freelance Field"} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder={isRTL ? "مثال: هندسة برمجيات، تصميم جرافيك، طب بشري..." : "e.g., Software Engineering, Graphic Design..."}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Primary Purpose (Multiple Selection Allowed) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    {isRTL ? "الغرض الأساسي من استخدام مساحة اديو هب؟" : "Primary Purpose for Using EduHub Space"} <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    {isRTL ? "يمكنك اختيار أكثر من خيار" : "Multiple selections allowed"}
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    "حضور المحاضرات الجامعية الدراسة والتحضير للامتحانات وتقديم الاختبارات الإلكترونية",
                    "تنفيذ مشاريع التخرج والأبحاث",
                    "العمل الحر وتنفيذ مشاريع للعملاء",
                    "حضور اجتماعات العمل عن بُعد",
                    "البحث عن فرص عمل والتقديم عليها",
                    "المشاركة في دورات تدريبية عبر الإنترنت",
                    "إدارة متجر أو مشروع إلكتروني",
                    "أخرى",
                  ].map((purpose, idx) => {
                    const isChecked = primaryPurposes.includes(purpose);
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                          isChecked
                            ? "bg-emerald-50/70 border-emerald-500 font-bold text-emerald-950 shadow-2xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={purpose}
                          checked={isChecked}
                          onChange={() => togglePurpose(purpose)}
                          className="text-emerald-600 focus:ring-emerald-500 rounded h-4 w-4 accent-emerald-600"
                        />
                        <span className="flex-1">{purpose}</span>
                      </label>
                    );
                  })}
                </div>

                {primaryPurposes.includes("أخرى") && (
                  <input
                    type="text"
                    value={customPurpose}
                    onChange={(e) => setCustomPurpose(e.target.value)}
                    placeholder={isRTL ? "يرجى توضيح الغرض بالتفصيل..." : "Please clarify your purpose..."}
                    className="w-full mt-2 bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                )}
              </div>

              {/* Semester Dates or Project Duration */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL
                    ? "للطلاب: حدد متى بدأ الفصل الدراسي الحالي ومتى ينتهي / للفريلانسر: مدة المشروع الذي تعمل عليه"
                    : "For students: semester start/end date / For freelancers: project duration"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={durationSchedule}
                  onChange={(e) => setDurationSchedule(e.target.value)}
                  placeholder={isRTL ? "مثال: الفصل بدأ في 1 سبتمبر وينتهي في 15 يناير / أو: مشروع تطبيق مدته 3 أشهر" : "e.g., Semester Sept 1 to Jan 15, or 3-month contract"}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium"
                />
              </div>

              {/* Proof Attachment (Max 10MB) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL ? "أرفق إفادة جامعية أو صورة عن المشاريع الجارية (الحد الأقصى 10 MB)" : "Attach Academic Proof or Client Projects (Max 10MB)"} <span className="text-rose-500">*</span>
                </label>
                
                {proofFile ? (
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="truncate">{proofFile.name}</span>
                      <span className="text-slate-400 font-normal">({(proofFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProofFile(null)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl bg-[#f8fafc] cursor-pointer transition-colors group">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-700 transition-colors mb-2" />
                    <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-emerald-700">
                      {isRTL ? "انقر لاختيار ملف (PDF أو صورة JPG/PNG)" : "Click to select a file (PDF, JPG, PNG)"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      {isRTL ? "يمكنك تحميل ملف واحد متوافق. الحد الأقصى لحجم الملف: 10 MB" : "One compatible file. Maximum size: 10 MB"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange(e, setProofFile)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              STEP 3: Device Type, Power & Attendance Needs
             ═════════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>{isRTL ? "3. الأجهزة المستخدمة، القدرة الكهربائية، وظروف الحضور" : "3. Devices, Power & Attendance Schedule"}</span>
              </div>

              {/* Device Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL ? "ما نوع الجهاز الذي ستستخدمه داخل المساحة؟" : "What type of device will you use inside the hub?"} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium cursor-pointer"
                >
                  <option value="هاتف ذكي">{isRTL ? "هاتف ذكي" : "Smartphone"}</option>
                  <option value="جهاز لوحي (Tablet)">{isRTL ? "جهاز لوحي (Tablet)" : "Tablet"}</option>
                  <option value="لابتوب عادي">{isRTL ? "لابتوب عادي" : "Standard Laptop"}</option>
                  <option value="لابتوب مكتبي">{isRTL ? "لابتوب مكتبي" : "Desktop-replacement Laptop"}</option>
                  <option value="لابتوب مخصص للتصميم أو الألعاب">{isRTL ? "لابتوب مخصص للتصميم أو الألعاب" : "High-power Design/Gaming Laptop"}</option>
                  <option value="جهاز آخر">{isRTL ? "جهاز آخر" : "Other device"}</option>
                </select>

                {deviceType === "جهاز آخر" && (
                  <input
                    type="text"
                    value={customDevice}
                    onChange={(e) => setCustomDevice(e.target.value)}
                    placeholder={isRTL ? "وضح نوع الجهاز..." : "Specify device..."}
                    className="w-full mt-2 bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800"
                  />
                )}
              </div>

              {/* Charger Wattage */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL ? "ما القدرة الكهربائية للشاحن أو الجهاز؟" : "What is the wattage of your device charger?"} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {["30 واط أو أقل", "31–45 واط", "46–65 واط", "66–90 واط", "أكثر من 100 واط"].map((watt) => (
                    <button
                      key={watt}
                      type="button"
                      onClick={() => setChargerWattage(watt)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        chargerWattage === watt
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs font-bold"
                          : "bg-[#f8fafc] border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {watt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Charger Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL ? "أرفق صورة لشاحن الجهاز المستخدم موضحاً فيها الملصق والمواصفات (الحد الأقصى 10 MB)" : "Attach Photo of Charger Specifications Label (Max 10MB)"} <span className="text-rose-500">*</span>
                </label>

                {chargerPhoto ? (
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
                    <div className="flex items-center gap-2 truncate">
                      <Camera className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="truncate">{chargerPhoto.name}</span>
                      <span className="text-slate-400 font-normal">({(chargerPhoto.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setChargerPhoto(null)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl bg-[#f8fafc] cursor-pointer transition-colors group">
                    <Camera className="w-8 h-8 text-slate-400 group-hover:text-emerald-700 transition-colors mb-2" />
                    <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-emerald-700">
                      {isRTL ? "التقط أو اختر صورة لملصق شاحن اللابتوب/الجهاز" : "Take or upload photo of charger label"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      {isRTL ? "يمكنك تحميل صورة واحدة متوافقة. الحد الأقصى: 10 MB" : "One image file. Max size: 10 MB"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setChargerPhoto)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* External Internet & Power Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {isRTL ? "ما مدى توفر الإنترنت والكهرباء لديك خارج المساحة؟" : "What is the availability of power and internet outside the hub?"} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={powerConnectivityStatus}
                  onChange={(e) => setPowerConnectivityStatus(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5243e1]/20 focus:border-[#5243e1] transition-all font-medium cursor-pointer"
                >
                  <option value="لا يتوفر لدي إنترنت أو كهرباء مناسبين للدراسة أو العمل">
                    {isRTL ? "لا يتوفر لدي إنترنت أو كهرباء مناسبين للدراسة أو العمل" : "No suitable internet or electricity for work/study"}
                  </option>
                  <option value="يتوفر الإنترنت مناسب فقط">
                    {isRTL ? "يتوفر الإنترنت مناسب فقط" : "Suitable internet only"}
                  </option>
                  <option value="يتوفر الإنترنت فقط">
                    {isRTL ? "يتوفر الإنترنت فقط" : "Internet only"}
                  </option>
                  <option value="يتوفر كلاهما ولكن بشكل غير منتظم">
                    {isRTL ? "يتوفر كلاهما ولكن بشكل غير منتظم" : "Both available but intermittently"}
                  </option>
                  <option value="يتوفر كلاهما بصورة مناسبة">
                    {isRTL ? "يتوفر كلاهما بصورة مناسبة" : "Both available adequately"}
                  </option>
                  <option value="أخرى">{isRTL ? "أخرى" : "Other"}</option>
                </select>

                {powerConnectivityStatus === "أخرى" && (
                  <input
                    type="text"
                    value={customConnectivity}
                    onChange={(e) => setCustomConnectivity(e.target.value)}
                    placeholder={isRTL ? "وضح حالتك..." : "Clarify status..."}
                    className="w-full mt-2 bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800"
                  />
                )}
              </div>

              {/* Preferred Shift & Weekly Usage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {isRTL ? "ما الفترة المفضلة للحضور؟" : "Preferred Attendance Shift"} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={preferredShift}
                    onChange={(e) => setPreferredShift(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5243e1]/20 focus:border-[#5243e1] transition-all font-medium cursor-pointer"
                  >
                    <option value="الفترة الصباحية">{isRTL ? "الفترة الصباحية (08:00 ص - 12:00 م)" : "Morning Shift"}</option>
                    <option value="الفترة المسائية">{isRTL ? "الفترة المسائية (12:00 م - 04:00 م)" : "Evening Shift"}</option>
                    <option value="في كلا الموعدين حسب الحاجة">{isRTL ? "في كلا الموعدين حسب الحاجة" : "Both shifts as needed"}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {isRTL ? "كم ساعة/مرة تتوقع استخدام المساحة خلال أسبوع؟" : "Expected Weekly Usage"} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={weeklyUsage}
                    onChange={(e) => setWeeklyUsage(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5243e1]/20 focus:border-[#5243e1] transition-all font-medium cursor-pointer"
                  >
                    <option value="يوميا">{isRTL ? "يومياً" : "Daily"}</option>
                    <option value="مرتين في الاسبوع">{isRTL ? "مرتين في الأسبوع" : "Twice a week"}</option>
                    <option value="ثلاث مرات في الاسبوع">{isRTL ? "ثلاث مرات في الأسبوع" : "Three times a week"}</option>
                    <option value="أخرى">{isRTL ? "أخرى" : "Other"}</option>
                  </select>

                  {weeklyUsage === "أخرى" && (
                    <input
                      type="text"
                      value={customWeeklyUsage}
                      onChange={(e) => setCustomWeeklyUsage(e.target.value)}
                      placeholder={isRTL ? "حدد التوقع..." : "Specify..."}
                      className="w-full mt-2 bg-[#f8fafc] border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              STEP 4: Photography Consent & Official Declarations
             ═════════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-xs font-bold uppercase tracking-wider text-[#5243e1] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{isRTL ? "4. سياسة التصوير والإقرار الرسمي" : "4. Photography Consent & Legal Declaration"}</span>
              </div>

              {/* Photography Consent */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Camera className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {isRTL ? "التصوير واستخدام الصور" : "Photography and Media Usage"} <span className="text-rose-500">*</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {isRTL
                        ? "أوافق على قيام منسقي المشروع بالتقاط صور أثناء وجودي في الـHub، وعلى استخدام هذه الصور في منصات التواصل الاجتماعي وفي المواد الإعلامية الخاصة بالمشروع، بما يخدم نشاطه وأهدافه التوثيقية والإنسانية."
                        : "I agree to coordinators capturing photos during my presence at the Hub and using them on social channels and project media."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="photoConsent"
                      value="أوافق"
                      checked={photographyConsent === "أوافق"}
                      onChange={() => setPhotographyConsent("أوافق")}
                      className="text-[#5243e1] focus:ring-[#5243e1] h-4 w-4"
                    />
                    <span className="text-emerald-800">{isRTL ? "أوافق" : "I Agree"}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="photoConsent"
                      value="لا أوافق"
                      checked={photographyConsent === "لا أوافق"}
                      onChange={() => setPhotographyConsent("لا أوافق")}
                      className="text-slate-400 focus:ring-slate-400 h-4 w-4"
                    />
                    <span className="text-slate-500">{isRTL ? "لا أوافق" : "I Disagree"}</span>
                  </label>
                </div>
              </div>

              {/* Legal Declaration */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {isRTL ? "الإقرار بصحة ودقة البيانات" : "Data Accuracy Declaration"} <span className="text-rose-500">*</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {isRTL
                        ? "أقرّ بأن جميع البيانات والمعلومات التي قدمتها في نموذج التسجيل لدى اديو هب غزة (Gaza Edu Hub) صحيحة ودقيقة، وأتحمل مسؤولية صحتها. كما أوافق على حق إدارة المركز في التحقق من المعلومات المقدمة، واتخاذ القرار المناسب بشأن طلبي، بما في ذلك استبعاده أو إلغاء قبولي في حال ثبوت تقديم معلومات غير صحيحة أو مضللة."
                        : "I declare that all information provided in this registration form is accurate, and I accept the management's right to verify details and act accordingly."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-start gap-2.5 text-xs sm:text-sm font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="dataAccuracyConsent"
                      value="أقرّ بصحة البيانات المقدمة وأوافق على ما ورد أعلاه."
                      checked={dataAccuracyConsent === "أقرّ بصحة البيانات المقدمة وأوافق على ما ورد أعلاه."}
                      onChange={() =>
                        setDataAccuracyConsent("أقرّ بصحة البيانات المقدمة وأوافق على ما ورد أعلاه.")
                      }
                      className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 mt-0.5"
                    />
                    <span className="text-emerald-900 leading-normal">
                      {isRTL
                        ? "أقرّ بصحة البيانات المقدمة وأوافق على ما ورد أعلاه."
                        : "I confirm data accuracy and agree to terms above."}
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="dataAccuracyConsent"
                      value="لا أوافق"
                      checked={dataAccuracyConsent === "لا أوافق"}
                      onChange={() => setDataAccuracyConsent("لا أوافق")}
                      className="text-slate-400 focus:ring-slate-400 h-4 w-4"
                    />
                    <span className="text-slate-500">{isRTL ? "لا أوافق" : "I Disagree"}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setValidationError("");
                  setCurrentStep((prev) => prev - 1);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-slate-700 transition-all cursor-pointer"
              >
                <ArrowPrev className="w-4 h-4" />
                <span>{isRTL ? "السابق" : "Previous"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onReturnToHub}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                {isRTL ? "إلغاء والعودة" : "Cancel & Return"}
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isCheckingEmail}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5243e1] hover:bg-[#4335c9] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-98 ${
                  isCheckingEmail ? "opacity-75 cursor-wait" : "cursor-pointer"
                }`}
              >
                {isCheckingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isRTL ? "جارٍ التحقق من البريد..." : "Checking email..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isRTL ? "المتابعة للخطوة التالية" : "Continue"}</span>
                    <ArrowNext className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black transition-all shadow-md shadow-emerald-700/20 active:scale-98 ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isRTL ? "جارٍ إرسال الطلب..." : "Submitting..."}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isRTL ? "إرسال طلب العضوية رسمياً" : "Submit Application"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
