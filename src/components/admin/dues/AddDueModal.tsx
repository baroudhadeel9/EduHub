"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  X,
  UserPlus,
  Users,
  Coins,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Search,
  Check,
} from "lucide-react";
import { getAdminMembersApi, createMemberDueApi } from "@/services/applications";

interface MemberOption {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  member_type?: string;
  type?: string;
}

interface AddDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isRTL: boolean;
}

export default function AddDueModal({
  isOpen,
  onClose,
  onSuccess,
  isRTL,
}: AddDueModalProps) {
  const { t } = useLanguage();
  const m = t.admin?.dues?.addModal;

  const [mode, setMode] = useState<"existing" | "new">("existing");

  // Existing members list and search state
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Visitor / Non-member inputs
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Due details
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing members when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingMembers(true);
    getAdminMembersApi()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? (res as unknown as MemberOption[]) : [];
        setMembers(list);
      })
      .catch((err) => {
        console.warn("Failed to load members for dues modal:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingMembers(false);
      });

    // Reset form
    setErrorMsg(null);
    setSuccessMsg(null);
    setMemberSearchQuery("");
    setSelectedMember(null);
    setSelectedUserId("");
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setAmount("");
    setNotes("");

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Filter members dynamically based on search query with smart phone normalization
  const searchResults = useMemo(() => {
    const q = memberSearchQuery.toLowerCase().trim();
    if (!q) {
      return members.slice(0, 6);
    }
    const cleanDigits = q.replace(/\D/g, "");
    return members
      .filter((m) => {
        const nameMatch = m.name?.toLowerCase().includes(q);
        const emailMatch = m.email?.toLowerCase().includes(q);
        const rawPhone = m.phone || "";
        const mDigits = rawPhone.replace(/\D/g, "");
        const phoneMatch =
          rawPhone.includes(q) ||
          (cleanDigits.length >= 4 && mDigits.includes(cleanDigits));
        return nameMatch || phoneMatch || emailMatch;
      })
      .slice(0, 8);
  }, [members, memberSearchQuery]);

  if (!isOpen) return null;

  const handleAmountChange = (val: string) => {
    setAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg(isRTL ? "يرجى كتابة مبلغ مستحق صالح أكبر من الصفر." : "Please enter a valid amount greater than 0");
      return;
    }

    if (mode === "new" && !newName.trim()) {
      setErrorMsg(isRTL ? "يرجى إدخال اسم الزائر." : "Please enter the visitor name");
      return;
    }

    if (mode === "existing" && (!selectedUserId || !selectedMember)) {
      setErrorMsg(isRTL ? "يرجى البحث عن العضو واختياره أولاً." : "Please search and select a member");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        amount: parsedAmount,
        notes: notes.trim() || undefined,
        ...(mode === "existing"
          ? { user_id: selectedUserId }
          : {
            name: newName.trim(),
            phone: newPhone.trim() || undefined,
            email: newEmail.trim() || undefined,
            member_type: "external",
          }),
      };

      const res = await createMemberDueApi(payload);

      setSuccessMsg(
        res.message ||
        (isRTL
          ? "تم تسجيل المستحق المالي بنجاح!"
          : "Due registered successfully!")
      );

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isRTL ? "فشل تسجيل المستحق." : "Failed to record due";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200 my-8"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-brand-navy">
                {m?.title || (isRTL ? "تسجيل مستحق مالي" : "Add Financial Due")}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                {m?.subtitle ||
                  (isRTL
                    ? "تسجيل مطالبة مالية على عضو مسجل أو زائر (غير عضو)"
                    : "Record due claim for an existing member or a visitor")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Member Selection Mode (Existing Member vs Visitor) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {m?.targetParty || (isRTL ? "جهة أو طرف المطالبة المالية:" : "Target Party:")}
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode("existing")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mode === "existing"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>{m?.registeredMember || (isRTL ? "عضو مسجل بالنظام" : "Registered Member")}</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("new")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mode === "new"
                    ? "bg-white text-amber-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                <span>{m?.visitorParty || (isRTL ? "زائر (غير عضو)" : "Visitor")}</span>
              </button>
            </div>
          </div>

          {/* Case 1: Search and Pick from Existing Members */}
          {mode === "existing" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {m?.searchMember || (isRTL ? "البحث عن العضو واختياره *" : "Search & Select Member *")}
              </label>

              {selectedMember ? (
                /* Selected Member Card with Change button */
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xs shrink-0 border border-amber-300">
                      {selectedMember.name?.charAt(0) || "ع"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {selectedMember.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950">
                          {selectedMember.member_type === "freelancer"
                            ? isRTL ? "مستقل" : "Freelancer"
                            : isRTL ? "طالب جامعي" : "Student"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {selectedMember.phone && (
                          <span dir="ltr" className="font-mono">
                            {selectedMember.phone}
                          </span>
                        )}
                        {selectedMember.email && (
                          <span className="truncate max-w-[180px]">
                            — {selectedMember.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMember(null);
                      setSelectedUserId("");
                      setMemberSearchQuery("");
                    }}
                    className="text-xs font-bold text-amber-900 hover:text-amber-950 bg-white hover:bg-amber-100/60 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors cursor-pointer"
                  >
                    {m?.changeMember || (isRTL ? "تغيير" : "Change")}
                  </button>
                </div>
              ) : (
                /* Search Input & Dynamic Suggestions */
                <div className="space-y-1.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      placeholder={
                        m?.searchMemberPlaceholder ||
                        (isRTL
                          ? "اكتب اسم العضو، رقم هاتفه، أو بريده للبحث..."
                          : "Type member name, phone, or email to search...")
                      }
                      className="w-full ps-10 pe-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                    {loadingMembers && (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
                    )}
                  </div>

                  {/* Matching results dropdown list */}
                  <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs divide-y divide-slate-100">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        {loadingMembers
                          ? m?.loadingMembers || (isRTL ? "جاري تحميل قائمة الأعضاء..." : "Loading members...")
                          : m?.noMatchingMembers || (isRTL ? "لا يوجد عضو مطابق لنص البحث." : "No matching members found.")}
                      </div>
                    ) : (
                      searchResults.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedMember(m);
                            setSelectedUserId(String(m.id));
                            setMemberSearchQuery("");
                          }}
                          className="w-full p-2.5 text-start hover:bg-amber-50/60 flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-900 font-bold flex items-center justify-center text-xs shrink-0 transition-colors">
                              {m.name?.charAt(0) || "ع"}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-slate-900 group-hover:text-amber-950 block truncate">
                                {m.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                {m.phone && <span dir="ltr">{m.phone}</span>}
                                {m.email && <span className="truncate max-w-[150px]">{m.email}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-900 transition-colors">
                              {m.member_type === "freelancer"
                                ? isRTL ? "مستقل" : "Freelancer"
                                : isRTL ? "طالب" : "Student"}
                            </span>
                            <span className="text-[11px] font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              <span>{isRTL ? "اختيار" : "Select"}</span>
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Case 2: Visitor (Non-Member) Details */}
          {mode === "new" && (
            <div className="space-y-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{m?.visitorDetails || (isRTL ? "بيانات الزائر أو المطالبة المالية" : "Visitor Details")}</span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300">
                  {m?.visitorBadge || (isRTL ? "حساب زائر — لن يُضاف لقائمة الأعضاء" : "Visitor (Not in members)")}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {m?.visitorName || (isRTL ? "الاسم الكامل للزائر *" : "Visitor Full Name *")}
                </label>
                <input
                  type="text"
                  required={mode === "new"}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={m?.visitorNamePlaceholder || (isRTL ? "مثال: حسام عادل النجار" : "e.g. Hossam Adel")}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {m?.visitorPhone || (isRTL ? "رقم الهاتف / للتواصل (اختياري)" : "Phone (Optional)")}
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="059xxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono"
                />
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {m?.amount || (isRTL ? "المبلغ المستحق (شيكل ₪) *" : "Due Amount (NIS) *")}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="50"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-mono"
              />
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700 pointer-events-none">
                {isRTL ? "شيكل" : "NIS"}
              </span>
            </div>
          </div>

          {/* Notes / Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {m?.notes || (isRTL ? "بيان أو سبب المستحق (اختياري):" : "Reason / Notes (Optional):")}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                m?.notesPlaceholder ||
                (isRTL
                  ? "مثال: رسوم خدمات، حجز قاعة، طباعة، تلفيات..."
                  : "e.g. Service fee, room booking, printing...")
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {m?.cancel || (isRTL ? "إلغاء" : "Cancel")}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{m?.submitting || (isRTL ? "جاري الحفظ..." : "Saving...")}</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 stroke-[2.2]" />
                  <span>{m?.submit || (isRTL ? "تسجيل المستحق المالي" : "Record Due Claim")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
