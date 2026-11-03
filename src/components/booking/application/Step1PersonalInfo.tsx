"use client";

import React from "react";
import { User, Phone, Mail, MapPin } from "lucide-react";
import { Step1PersonalInfoProps } from "./types";

export default function Step1PersonalInfo({
  email,
  setEmail,
  fullName,
  setFullName,
  gender,
  setGender,
  nationalId,
  setNationalId,
  birthDate,
  setBirthDate,
  phone,
  setPhone,
  governorate,
  setGovernorate,
  detailedAddress,
  setDetailedAddress,
  isRTL,
  onClearValidation,
}: Step1PersonalInfoProps) {
  return (
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
              onClearValidation();
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

      {/* Gender Selection: Male / Female */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">
          {isRTL ? "الجنس" : "Gender"} <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGender("male")}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs sm:text-sm ${
              gender === "male"
                ? "bg-sky-50 border-sky-500 text-sky-800 shadow-xs ring-2 ring-sky-500/20"
                : "bg-[#f8fafc] border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="text-xl">👨</span>
            <div className="font-black text-sm">{isRTL ? "ذكر" : "Male"}</div>
          </button>

          <button
            type="button"
            onClick={() => setGender("female")}
            className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs sm:text-sm ${
              gender === "female"
                ? "bg-rose-50 border-rose-500 text-rose-800 shadow-xs ring-2 ring-rose-500/20"
                : "bg-[#f8fafc] border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="text-xl">👩</span>
            <div className="font-black text-sm">{isRTL ? "أنثى" : "Female"}</div>
          </button>
        </div>
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
  );
}

