"use client";

import React from "react";
import { Zap, Camera, Trash2 } from "lucide-react";
import { Step3DevicePowerProps } from "./types";

export default function Step3DevicePower({
  deviceType,
  setDeviceType,
  customDevice,
  setCustomDevice,
  chargerWattage,
  setChargerWattage,
  chargerPhoto,
  setChargerPhoto,
  powerConnectivityStatus,
  setPowerConnectivityStatus,
  customConnectivity,
  setCustomConnectivity,
  preferredShift,
  setPreferredShift,
  weeklyUsage,
  setWeeklyUsage,
  customWeeklyUsage,
  setCustomWeeklyUsage,
  onFileChange,
  isRTL,
}: Step3DevicePowerProps) {
  return (
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
              onChange={(e) => onFileChange(e, setChargerPhoto)}
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
            <option value="الفترة الصباحية">{isRTL ? "الفترة الصباحية (09:00 ص - 12:00 م)" : "Morning Shift"}</option>
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
  );
}

