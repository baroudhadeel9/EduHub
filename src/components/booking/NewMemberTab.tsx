"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react";
import {
  submitMembershipApplication,
  checkEmailAvailabilityApi,
} from "@/services/applications";
import {
  MemberCategory,
  GenderType,
  PhotographyConsentType,
  DataAccuracyConsentType,
  compressImageIfNeeded,
} from "./application/types";
import Step1PersonalInfo from "./application/Step1PersonalInfo";
import Step2AcademicWork from "./application/Step2AcademicWork";
import Step3DevicePower from "./application/Step3DevicePower";
import Step4Declarations from "./application/Step4Declarations";
import ApplicationSuccessView from "./application/ApplicationSuccessView";

interface NewMemberTabProps {
  onReturnToHub: () => void;
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
  const [gender, setGender] = useState<GenderType>("male");
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
  const [photographyConsent, setPhotographyConsent] = useState<PhotographyConsentType>("");
  const [dataAccuracyConsent, setDataAccuracyConsent] = useState<DataAccuracyConsentType>("");

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
      fd.append("gender", gender);
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
        <ApplicationSuccessView
          fullName={fullName}
          phone={phone}
          email={email}
          category={category}
          gender={gender}
          governorate={governorate}
          submittedAppNumber={submittedAppNumber}
          onReset={() => {
            setReqSubmitted(false);
            setCurrentStep(1);
            onReturnToHub();
          }}
          isRTL={isRTL}
        />
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

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <Step1PersonalInfo
              email={email}
              setEmail={setEmail}
              fullName={fullName}
              setFullName={setFullName}
              gender={gender}
              setGender={setGender}
              nationalId={nationalId}
              setNationalId={setNationalId}
              birthDate={birthDate}
              setBirthDate={setBirthDate}
              phone={phone}
              setPhone={setPhone}
              governorate={governorate}
              setGovernorate={setGovernorate}
              detailedAddress={detailedAddress}
              setDetailedAddress={setDetailedAddress}
              isRTL={isRTL}
              onClearValidation={() => {
                if (validationError) setValidationError("");
              }}
            />
          )}

          {/* Step 2: Academic & Work */}
          {currentStep === 2 && (
            <Step2AcademicWork
              category={category}
              setCategory={setCategory}
              university={university}
              setUniversity={setUniversity}
              specialty={specialty}
              setSpecialty={setSpecialty}
              primaryPurposes={primaryPurposes}
              togglePurpose={togglePurpose}
              customPurpose={customPurpose}
              setCustomPurpose={setCustomPurpose}
              durationSchedule={durationSchedule}
              setDurationSchedule={setDurationSchedule}
              proofFile={proofFile}
              setProofFile={setProofFile}
              onFileChange={handleFileChange}
              isRTL={isRTL}
            />
          )}

          {/* Step 3: Device & Power */}
          {currentStep === 3 && (
            <Step3DevicePower
              deviceType={deviceType}
              setDeviceType={setDeviceType}
              customDevice={customDevice}
              setCustomDevice={setCustomDevice}
              chargerWattage={chargerWattage}
              setChargerWattage={setChargerWattage}
              chargerPhoto={chargerPhoto}
              setChargerPhoto={setChargerPhoto}
              powerConnectivityStatus={powerConnectivityStatus}
              setPowerConnectivityStatus={setPowerConnectivityStatus}
              customConnectivity={customConnectivity}
              setCustomConnectivity={setCustomConnectivity}
              preferredShift={preferredShift}
              setPreferredShift={setPreferredShift}
              weeklyUsage={weeklyUsage}
              setWeeklyUsage={setWeeklyUsage}
              customWeeklyUsage={customWeeklyUsage}
              setCustomWeeklyUsage={setCustomWeeklyUsage}
              onFileChange={handleFileChange}
              isRTL={isRTL}
            />
          )}

          {/* Step 4: Declarations */}
          {currentStep === 4 && (
            <Step4Declarations
              photographyConsent={photographyConsent}
              setPhotographyConsent={setPhotographyConsent}
              dataAccuracyConsent={dataAccuracyConsent}
              setDataAccuracyConsent={setDataAccuracyConsent}
              isRTL={isRTL}
            />
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
