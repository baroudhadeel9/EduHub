"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { EventItem, registerForEventApi } from "@/services/events";
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
  GraduationCap,
  Briefcase,
  Send,
  HelpCircle,
} from "lucide-react";

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem | null;
  onSuccess?: () => void;
}

export default function EventRegistrationModal({
  isOpen,
  onClose,
  event,
  onSuccess,
}: EventRegistrationModalProps) {
  const { locale, dir } = useLanguage();
  const isRTL = locale === "ar" || dir === "rtl";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<"ذكر" | "أنثى">("ذكر");
  const [specialty, setSpecialty] = useState("");
  const [university, setUniversity] = useState("");
  const [motivation, setMotivation] = useState("");
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [isMember, setIsMember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-fill member session if available
  useEffect(() => {
    if (!isOpen) return;

    setIsSuccess(false);
    setErrorMsg("");
    setCustomAnswers({});

    try {
      const storedMember = localStorage.getItem("eduhub_member_session");
      if (storedMember) {
        const parsed = JSON.parse(storedMember);
        if (parsed?.name) setName(parsed.name);
        if (parsed?.phone) setPhone(parsed.phone);
        if (parsed?.email) setEmail(parsed.email);
        if (parsed?.specialty) setSpecialty(parsed.specialty);
        if (parsed?.university) setUniversity(parsed.university);
        setIsMember(true);
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const isCompleted =
    event.status === "completed" ||
    event.statusBadge === "تمت الورشة" ||
    event.statusBadge === "Completed" ||
    event.statusBadge === "توثيق ميداني" ||
    event.statusBadge === "Field Verified";

  if (isCompleted) {
    return (
      <div
        dir={dir}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      >
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center border border-sky-200">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {isRTL ? "تمت هذه الورشة بنجاح" : "Workshop Completed"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {isRTL
                ? `ورشة "${event.title}" انتهت وتمت بنجاح بالفعل، وتوثيق مخرجاتها متاح على المنصة. لا تستقبل الورشة أي طلبات تسجيل جديدة.`
                : `The workshop "${event.title}" has concluded. Registrations are closed.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            {isRTL ? "إغلاق" : "Close"}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Deadline check
    if (event.is_deadline_passed) {
      setErrorMsg(isRTL ? "عذراً، انتهى الموعد النهائي المحدد للتسجيل في هذه الورشة." : "Sorry, registration deadline has passed.");
      return;
    }

    if (!name.trim()) {
      setErrorMsg(isRTL ? "يرجى كتابة الاسم رباعياً." : "Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg(isRTL ? "يرجى كتابة رقم الواتساب أو الهاتف للتواصل." : "Please enter your WhatsApp/phone number.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(isRTL ? "يرجى إدخال بريد إلكتروني صحيح (إجباري لتصلك تفاصيل القبول)." : "Please enter a valid email address (required).");
      return;
    }
    if (!age || Number(age) < 10 || Number(age) > 99) {
      setErrorMsg(isRTL ? "يرجى إدخال عمر صحيح (بين 10 و 99)." : "Please enter a valid age.");
      return;
    }
    if (!specialty.trim()) {
      setErrorMsg(isRTL ? "يرجى كتابة التخصص الأكاديمي أو المهني." : "Please enter your specialty.");
      return;
    }
    if (!university.trim()) {
      setErrorMsg(isRTL ? "يرجى كتابة الجامعة أو الكلية (إجباري)." : "Please enter your university/college (required).");
      return;
    }
    if (!motivation.trim()) {
      setErrorMsg(isRTL ? "يرجى توضيح سبب اهتمامك بهذه الورشة." : "Please explain why you are interested in this workshop.");
      return;
    }

    // Verify required custom questions if any
    if (event.custom_questions && event.custom_questions.length > 0) {
      for (const q of event.custom_questions) {
        if (q.required && !customAnswers[q.id]?.trim()) {
          setErrorMsg(isRTL ? `يرجى الإجابة على السؤال: "${q.label}"` : `Please answer: "${q.label}"`);
          return;
        }
      }
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await registerForEventApi(event.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        age: Number(age),
        gender,
        specialty: specialty.trim(),
        university: university.trim(),
        motivation: motivation.trim(),
        custom_answers: customAnswers,
        is_member: isMember,
      });

      if (!res.success) {
        throw new Error(res.message || (isRTL ? "تعذر إتمام التسجيل." : "Registration failed."));
      }

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : (isRTL ? "حدث خطأ أثناء التسجيل" : "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-950">
                {isRTL ? "فورم التسجيل في الورشة" : "Workshop Registration Form"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isRTL ? "المقاعد محدودة لضمان أقصى استفادة" : "Seats are limited for maximum impact"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body (أسئلة فورم التسجيل مباشرة بدون كارد أو عنوان بالبداية) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {isSuccess ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 animate-in zoom-in-75">
                <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
              </div>

              <h4 className="text-lg font-black text-slate-950 mb-1.5">
                {isRTL ? "تم إرسال طلب تسجيلك بنجاح!" : "Registration Submitted Successfully!"}
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto mb-6">
                {isRTL
                  ? `أهلاً بك يا ${name}! تم حفظ بياناتك بنجاح. سيتم مراجعة الطلب وإشعارك بالقبول وتفاصيل الحضور عبر الواتساب أو البريد.`
                  : `Welcome ${name}! Your registration has been received. We will notify you once confirmed.`}
              </p>

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  {isRTL ? "تم، إغلاق" : "Close"}
                </button>
              </div>
            </div>
          ) : event.is_deadline_passed ? (
            /* Deadline Passed State */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3.5 border border-amber-200">
                <Clock className="w-7 h-7 stroke-[2.2]" />
              </div>

              <h4 className="text-base sm:text-lg font-black text-slate-950 mb-1.5">
                {isRTL ? "انتهى الموعد النهائي للتسجيل" : "Registration Deadline Has Passed"}
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto mb-3">
                {isRTL
                  ? "نعتذر منك، تم إغلاق باب التسجيل في هذه الورشة تلقائياً وفقاً للموعد النهائي المحدد من قبل إدارة المركز."
                  : "We apologize, registration for this workshop is now closed according to the set deadline."}
              </p>

              {event.registration_deadline_badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-6">
                  <span>{isRTL ? "كان آخر موعد:" : "Deadline was:"}</span>
                  <span className="font-bold">{event.registration_deadline_badge}</span>
                </div>
              )}

              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  {isRTL ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Deadline reminder banner if active */}
              {event.registration_deadline_badge && (
                <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-semibold">{isRTL ? "آخر موعد للتسجيل:" : "Registration Deadline:"}</span>
                  </div>
                  <span className="font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                    {event.registration_deadline_badge}
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isRTL ? "الاسم رباعياً *" : "Full Name *"}
                </label>
                <div className="relative">
                  <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? "right-3" : "left-3"}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isRTL ? "اكتب اسمك كاملاً" : "Your full name"}
                    className={`w-full py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-900 ${
                      isRTL ? "pr-9 pl-3" : "pl-9 pr-3"
                    }`}
                  />
                </div>
              </div>

              {/* 2. Phone (WhatsApp) & Email (كلاهما إجباري) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "رقم الواتساب للتواصل *" : "WhatsApp Phone *"}
                  </label>
                  <div className="relative">
                    <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? "right-3" : "left-3"}`}>
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="059xxxxxxx"
                      className={`w-full py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-medium text-slate-900 ${
                        isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                      }`}
                    />
                  </div>
                </div>

                {/* Email (إجباري) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <div className="relative">
                    <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? "right-3" : "left-3"}`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans text-slate-900 ${
                        isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Age & Gender (العمر والجنس) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "العمر *" : "Age *"}
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={99}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={isRTL ? "مثال: 22" : "e.g. 22"}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "الجنس *" : "Gender *"}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setGender("ذكر")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        gender === "ذكر"
                          ? "bg-white text-emerald-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {isRTL ? "ذكر" : "Male"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("أنثى")}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        gender === "أنثى"
                          ? "bg-white text-emerald-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {isRTL ? "أنثى" : "Female"}
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Specialty & University (التخصص والكلية/الجامعة - كلاهما إجباري) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "التخصص الأكاديمي أو المهني *" : "Specialty / Field *"}
                  </label>
                  <div className="relative">
                    <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? "right-3" : "left-3"}`}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder={isRTL ? "مثال: هندسة حاسوب، طب، تصميم..." : "e.g. Software Eng"}
                      className={`w-full py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800 ${
                        isRTL ? "pr-9 pl-3" : "pl-9 pr-3"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {isRTL ? "الجامعة أو الكلية *" : "University / College *"}
                  </label>
                  <div className="relative">
                    <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? "right-3" : "left-3"}`}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder={isRTL ? "مثال: الجامعة الإسلامية / كلية مجتمعية" : "e.g. University / College"}
                      className={`w-full py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800 ${
                        isRTL ? "pr-9 pl-3" : "pl-9 pr-3"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 5. Motivation: لماذا أنت مهتم في هذه الورشة؟ */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isRTL ? "لماذا أنت مهتم في هذه الورشة وماذا تأمل أن تتعلم؟ *" : "Why are you interested in this workshop? *"}
                </label>
                <textarea
                  rows={2}
                  required
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder={
                    isRTL
                      ? "اكتب نبذة قصيرة عن سبب اهتمامك وتوقعاتك من هذه الورشة..."
                      : "Briefly describe your motivation and expected outcomes..."
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
                />
              </div>

              {/* 6. Dynamic Custom Questions Added by Admin (أسئلة الأدمن المخصصة للورشة) */}
              {event.custom_questions && event.custom_questions.length > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isRTL ? "أسئلة إضافية خاصة بالورشة" : "Workshop Specific Questions"}</span>
                  </div>

                  {event.custom_questions.map((q) => (
                    <div key={q.id}>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {q.label} {q.required && <span className="text-rose-500">*</span>}
                      </label>

                      {q.type === "textarea" ? (
                        <textarea
                          rows={2}
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 bg-white"
                        />
                      ) : q.type === "select" && q.options && q.options.length > 0 ? (
                        <select
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 bg-white"
                        >
                          <option value="">{isRTL ? "-- اختر إجابة --" : "-- Select --"}</option>
                          {q.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) =>
                            setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}



              {/* 8. Is Member in Space Checkbox */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={isMember}
                  onChange={(e) => setIsMember(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  {isRTL ? "أنا عضو مسجل حالياً في مساحة إديوهب" : "I am an active registered member at EduHub"}
                </span>
              </label>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {loading ? (
                    <span>{isRTL ? "جارٍ إرسال الطلب..." : "Submitting..."}</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isRTL ? "تأكيد وإرسال طلب التسجيل" : "Submit Registration"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
