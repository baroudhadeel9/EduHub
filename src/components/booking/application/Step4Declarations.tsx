"use client";

import React from "react";
import { ShieldCheck, Camera } from "lucide-react";
import { Step4DeclarationsProps } from "./types";

export default function Step4Declarations({
  photographyConsent,
  setPhotographyConsent,
  dataAccuracyConsent,
  setDataAccuracyConsent,
  isRTL,
}: Step4DeclarationsProps) {
  return (
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
  );
}

