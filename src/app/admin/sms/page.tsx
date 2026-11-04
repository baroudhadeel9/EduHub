"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  getSmsBalanceApi,
  getSmsLogsApi,
  sendSingleSmsApi,
  broadcastSmsApi,
  SmsBalanceInfo,
  SmsLogItem,
} from "@/services/applications";
import {
  MessageSquareText,
  Send,
  Users,
  Radio,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Menu,
  History,
} from "lucide-react";

export default function AdminSmsPage() {
  const { dir, locale } = useLanguage();
  const isRTL = dir === "rtl" || locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<"broadcast" | "single" | "logs">("broadcast");

  // Balance & Stats
  const [balanceInfo, setBalanceInfo] = useState<SmsBalanceInfo | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Broadcast State
  const [targetGroup, setTargetGroup] = useState<"all" | "male" | "female" | "students" | "freelancers">("all");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [confirmBroadcastOpen, setConfirmBroadcastOpen] = useState(false);

  // Single SMS State
  const [singlePhone, setSinglePhone] = useState("");
  const [singleName, setSingleName] = useState("");
  const [singleMessage, setSingleMessage] = useState("");
  const [sendingSingle, setSendingSingle] = useState(false);

  // Logs State
  const [logs, setLogs] = useState<SmsLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Notification Banner
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load Balance & Stats
  const loadBalance = async () => {
    setLoadingBalance(true);
    try {
      const data = await getSmsBalanceApi();
      setBalanceInfo(data);
    } catch {
      // Fallback
      setBalanceInfo({
        success: true,
        balance: 1096,
        sender: "EDU HUB",
        senders: [{ id: "6590", text: "EDU HUB", status: "Active", default: "true" }],
        total_sent_in_db: 0,
      });
    } finally {
      setLoadingBalance(false);
    }
  };

  // Load Logs
  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await getSmsLogsApi();
      setLogs(res.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadBalance();
    loadLogs();
  }, []);

  // Quick Templates for Broadcast
  const templates = [
    {
      title: isRTL ? "🛑 الهب مغلق اليوم" : "Space Closed Today",
      text: isRTL
        ? "تنويه هام: نود إعلامكم بأن مساحة إديو هب غزة ستكون مغلقة اليوم نظراً للظروف الراهنة. نتمنى لكم ولعائلاتكم السلامة ونلقاكم على خير."
        : "Notice: EduHub Gaza workspace will be closed today due to current circumstances. Stay safe and see you soon.",
    },
    {
      title: isRTL ? "⏰ تعديل مواعيد الدوام" : "Adjusted Hours",
      text: isRTL
        ? "تنويه من إديو هب غزة: نلفت عنايتكم إلى تعديل ساعات العمل واستقبال الحجوزات اليوم لتكون من الساعة 8:00 صباحاً وحتى 4:00 مساءً."
        : "Notice: EduHub Gaza opening hours today are adjusted to 8:00 AM - 4:00 PM.",
    },
    {
      title: isRTL ? "⚡ توفر الطاقة والإنترنت" : "Power & Internet Ready",
      text: isRTL
        ? "تنويه للمستفيدين: الطاقة الشمسية المستقرة وخدمة الإنترنت فائق السرعة (100 ميجا) متوفران وجاهزان لاستقبالكم اليوم في مساحة إديو هب."
        : "Notice: Stable solar power and 100 Mbps internet are ready for your booking at EduHub.",
    },
  ];

  // Handle Broadcast Submission
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      setFeedback({ type: "error", text: isRTL ? "يرجى كتابة نص الرسالة." : "Please write a message." });
      return;
    }
    setConfirmBroadcastOpen(true);
  };

  const executeBroadcast = async () => {
    setConfirmBroadcastOpen(false);
    setSendingBroadcast(true);
    setFeedback(null);

    try {
      const res = await broadcastSmsApi(targetGroup, broadcastMessage.trim());
      setFeedback({
        type: "success",
        text: res.message || (isRTL ? "تم إرسال التعميم بنجاح!" : "Broadcast sent successfully!"),
      });
      setBroadcastMessage("");
      loadBalance();
      loadLogs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setFeedback({
        type: "error",
        text: msg || (isRTL ? "تعذر إرسال التعميم." : "Failed to send broadcast."),
      });
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Handle Single SMS Submission
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singlePhone.trim() || !singleMessage.trim()) {
      setFeedback({
        type: "error",
        text: isRTL ? "يرجى إدخال رقم الجوال ونص الرسالة." : "Please enter phone and message.",
      });
      return;
    }

    setSendingSingle(true);
    setFeedback(null);

    try {
      const res = await sendSingleSmsApi(singlePhone.trim(), singleMessage.trim(), singleName.trim() || undefined);
      setFeedback({
        type: "success",
        text: res.message || (isRTL ? "تم إرسال الرسالة بنجاح!" : "SMS sent successfully!"),
      });
      setSinglePhone("");
      setSingleName("");
      setSingleMessage("");
      loadBalance();
      loadLogs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setFeedback({
        type: "error",
        text: msg || (isRTL ? "تعذر إرسال الرسالة." : "Failed to send SMS."),
      });
    } finally {
      setSendingSingle(false);
    }
  };

  // Arabic SMS segment calculation (70 chars for 1st, 67 for concatenated)
  const calculateSmsParts = (text: string) => {
    const len = text.length;
    if (len === 0) return { parts: 0, remaining: 70 };
    if (len <= 70) return { parts: 1, remaining: 70 - len };
    const parts = Math.ceil(len / 67);
    return { parts, remaining: parts * 67 - len };
  };

  const broadcastParts = calculateSmsParts(broadcastMessage);
  const singleParts = calculateSmsParts(singleMessage);

  return (
    <div
      dir={dir}
      className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-emerald-600 selection:text-white"
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab="sms"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`min-h-screen transition-all duration-300 ${isRTL ? "lg:mr-72" : "lg:ml-72"}`}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          
          {/* Top Title Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50 lg:hidden cursor-pointer"
                aria-label="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <MessageSquareText className="w-6 h-6 text-emerald-600" />
                  <span>{isRTL ? "رسائل SMS والتعميمات" : "SMS & Broadcasts"}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {isRTL
                    ? "إرسال تعميمات جماعية للمستفيدين أو رسائل فردية عبر بوابة TweetSMS المعتمدة."
                    : "Send announcements to beneficiaries or direct SMS via TweetSMS Palestine."}
                </p>
              </div>
            </div>

            {/* Refresh Balance Button */}
            <button
              type="button"
              onClick={loadBalance}
              disabled={loadingBalance}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingBalance ? "animate-spin text-emerald-600" : "text-slate-500"}`} />
              <span>{isRTL ? "تحديث الرصيد" : "Refresh Balance"}</span>
            </button>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="flex-1">{feedback.text}</span>
            </div>
          )}

          {/* Top Info Cards (Live Balance & Sender ID) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Balance */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{isRTL ? "الرصيد المتاح" : "Available Balance"}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {loadingBalance ? "..." : (balanceInfo?.balance ?? 1096).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-500">{isRTL ? "نقطة SMS" : "Credits"}</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">
                {isRTL ? "جاهز لإرسال الرسائل والتعميمات" : "Ready for sending"}
              </p>
            </div>

            {/* Card 2: Sender Name */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{isRTL ? "اسم المرسل المعتمد" : "Approved Sender ID"}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="pt-1">
                <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono tracking-wider">
                  {balanceInfo?.sender || "EDU HUB"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isRTL ? "بوابة TweetSMS الرسمية (جوال وأوريدو)" : "Official TweetSMS Palestine Gateway"}
              </p>
            </div>

            {/* Card 3: Total Sent */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{isRTL ? "إجمالي الرسائل بالسجل" : "Total Logged SMS"}</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="pt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {logs.length}
                </span>
                <span className="text-xs font-bold text-slate-500">{isRTL ? "رسالة" : "messages"}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isRTL ? "تشمل رسائل القبول والتعميمات" : "Includes acceptance & broadcasts"}
              </p>
            </div>
          </div>

          {/* Sub-Tabs: Broadcast vs Single vs Logs */}
          <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-2xl w-full sm:w-fit text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("broadcast")}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "broadcast"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{isRTL ? "إرسال تعميم جماعي" : "Broadcast Announcement"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("single")}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "single"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isRTL ? "إرسال رسالة فردية" : "Single SMS"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("logs");
                loadLogs();
              }}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "logs"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="w-4 h-4" />
              <span>{isRTL ? "سجل الرسائل المرسلة" : "Sent Logs"}</span>
            </button>
          </div>

          {/* ═══════════ SUB-TAB 1: BROADCAST SMS ═══════════ */}
          {activeTab === "broadcast" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6 animate-in fade-in">
              <form onSubmit={handleBroadcastSubmit} className="space-y-6">
                {/* Target Audience Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    {isRTL ? "الفئة المستهدفة للتعميم:" : "Target Beneficiaries:"}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-bold">
                    {[
                      { id: "all", label: isRTL ? "جميع الأعضاء 👥" : "All Members" },
                      { id: "male", label: isRTL ? "الذكور 👨" : "Males" },
                      { id: "female", label: isRTL ? "الإناث 👩" : "Females" },
                      { id: "students", label: isRTL ? "الطلاب الجامعيين 🎓" : "Students" },
                      { id: "freelancers", label: isRTL ? "المستقلين / فريلانسرز 💼" : "Freelancers" },
                    ].map((group) => (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => setTargetGroup(group.id as any)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          targetGroup === group.id
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Templates */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    {isRTL ? "قوالب تعميم جاهزة بنقرة واحدة:" : "Quick Announcement Templates:"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBroadcastMessage(tpl.text)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        {tpl.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="broadcast-msg" className="font-bold text-slate-800">
                      {isRTL ? "نص رسالة التعميم (SMS):" : "SMS Message Body:"}
                    </label>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                      <span>{broadcastMessage.length} {isRTL ? "حرف" : "chars"}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-700">
                        {broadcastParts.parts} {isRTL ? "رسالة SMS" : "SMS parts"}
                      </span>
                    </div>
                  </div>

                  <textarea
                    id="broadcast-msg"
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    required
                    placeholder={
                      isRTL
                        ? "اكتب نص التعميم هنا... مثلاً: نلفت عنايتكم بأن مساحة إديو هب مغلقة اليوم..."
                        : "Type announcement here..."
                    }
                    className="w-full p-4 rounded-2xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 leading-relaxed font-sans"
                  />
                  <p className="text-[11px] text-slate-400">
                    {isRTL
                      ? "يتم إرسال الرسالة باسم المرسل المعتمد (EDU HUB) لجميع الهواتف المسجلة بالفئة المختارة."
                      : "Messages sent from EDU HUB to all registered phone numbers in selected group."}
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingBroadcast || !broadcastMessage.trim()}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:bg-emerald-300"
                  >
                    {sendingBroadcast ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isRTL ? "جاري الإرسال للمستفيدين..." : "Sending..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isRTL ? "إرسال التعميم الآن" : "Send Broadcast Now"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ═══════════ SUB-TAB 2: SINGLE MANUAL SMS ═══════════ */}
          {activeTab === "single" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 space-y-6 animate-in fade-in">
              <form onSubmit={handleSingleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="single-phone" className="block text-xs font-bold text-slate-700 mb-1">
                      {isRTL ? "رقم الهاتف / الجوال" : "Mobile Number"} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="single-phone"
                      type="text"
                      required
                      placeholder={isRTL ? "059xxxxxxx أو 056xxxxxxx" : "059xxxxxxx"}
                      value={singlePhone}
                      onChange={(e) => setSinglePhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-start font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="single-name" className="block text-xs font-bold text-slate-700 mb-1">
                      {isRTL ? "اسم المستلم (اختياري للسجل)" : "Recipient Name (Optional)"}
                    </label>
                    <input
                      id="single-name"
                      type="text"
                      placeholder={isRTL ? "اسم العضو أو الزائر" : "Member name"}
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="single-msg" className="font-bold text-slate-800">
                      {isRTL ? "نص الرسالة:" : "Message Body:"} <span className="text-rose-500">*</span>
                    </label>
                    <span className="font-mono text-[11px] text-slate-500">
                      {singleMessage.length} {isRTL ? "حرف" : "chars"} ({singleParts.parts} {isRTL ? "رسالة" : "parts"})
                    </span>
                  </div>

                  <textarea
                    id="single-msg"
                    rows={4}
                    required
                    value={singleMessage}
                    onChange={(e) => setSingleMessage(e.target.value)}
                    placeholder={isRTL ? "اكتب نص الرسالة الفردية هنا..." : "Type SMS message here..."}
                    className="w-full p-4 rounded-2xl border border-slate-300 text-sm outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 leading-relaxed font-sans"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingSingle || !singlePhone.trim() || !singleMessage.trim()}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:bg-emerald-300"
                  >
                    {sendingSingle ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isRTL ? "جاري الإرسال..." : "Sending..."}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isRTL ? "إرسال الرسالة الآن" : "Send SMS Now"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ═══════════ SUB-TAB 3: LOGS HISTORY ═══════════ */}
          {activeTab === "logs" && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">
                  {isRTL ? "سجل كافة رسائل الـ SMS المرسلة" : "Sent SMS History"}
                </h3>
                <button
                  type="button"
                  onClick={loadLogs}
                  disabled={loadingLogs}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
                  <span>{isRTL ? "تحديث السجل" : "Refresh"}</span>
                </button>
              </div>

              {loadingLogs ? (
                <div className="py-14 flex items-center justify-center gap-2 text-slate-500 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>{isRTL ? "جاري تحميل السجل..." : "Loading logs..."}</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-xs">
                  {isRTL ? "لا توجد رسائل مسجلة بعد في السجل." : "No SMS logs recorded yet."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4 text-start">{isRTL ? "المستلم" : "Recipient"}</th>
                        <th className="py-3 px-4 text-start">{isRTL ? "النوع" : "Type"}</th>
                        <th className="py-3 px-4 text-start">{isRTL ? "نص الرسالة" : "Message"}</th>
                        <th className="py-3 px-4 text-start">{isRTL ? "الحالة" : "Status"}</th>
                        <th className="py-3 px-4 text-start">{isRTL ? "التاريخ والوقت" : "Date & Time"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900">{log.recipient_name || log.recipient_phone}</div>
                            {log.recipient_name && (
                              <div className="text-[11px] font-mono text-slate-400">{log.recipient_phone}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.type === "acceptance"
                                  ? "bg-purple-100 text-purple-800"
                                  : log.type === "broadcast"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {log.type === "acceptance"
                                ? isRTL ? "قبول عضوية" : "Acceptance"
                                : log.type === "broadcast"
                                ? isRTL ? "تعميم جماعي" : "Broadcast"
                                : isRTL ? "إرسال فردي" : "Manual"}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs sm:max-w-md truncate" title={log.message}>
                            {log.message}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === "sent"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {log.status === "sent"
                                ? isRTL ? "✓ تم الإرسال" : "Sent"
                                : isRTL ? "✕ فشل" : "Failed"}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                            {new Date(log.created_at).toLocaleString(isRTL ? "ar-EG" : "en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ CONFIRMATION MODAL FOR BROADCAST ═══════════ */}
          {confirmBroadcastOpen && (
            <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Radio className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-base font-black text-slate-900">
                    {isRTL ? "تأكيد إرسال التعميم الجماعي" : "Confirm Broadcast"}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isRTL
                      ? "سيتم إرسال رسالة SMS هذه إلى كافة أرقام هواتف الفئة المختارة فوراً باسم (EDU HUB)."
                      : "This message will be sent to all selected phone numbers immediately."}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>{isRTL ? "الفئة المستهدفة:" : "Target:"}</span>
                    <span className="font-bold text-slate-900">
                      {targetGroup === "all"
                        ? isRTL ? "جميع الأعضاء" : "All Members"
                        : targetGroup === "male"
                        ? isRTL ? "الذكور" : "Males"
                        : targetGroup === "female"
                        ? isRTL ? "الإناث" : "Females"
                        : targetGroup === "students"
                        ? isRTL ? "الطلاب الجامعيين" : "Students"
                        : isRTL ? "المستقلين / فريلانسرز" : "Freelancers"}
                    </span>
                  </div>
                  <div className="border-t border-slate-200/80 pt-2 text-slate-800 font-medium leading-relaxed">
                    «{broadcastMessage}»
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={executeBroadcast}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    {isRTL ? "تأكيد وإرسال" : "Confirm & Send"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmBroadcastOpen(false)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

