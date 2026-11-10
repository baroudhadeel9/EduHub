"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPwaPrompt() {
  const { locale } = useLanguage();
  const isRTL = locale === "ar";

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      setIsStandalone(Boolean(isStandaloneMode));

      // 2. Detect iOS device
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIos(isIosDevice);

      // Check if user dismissed prompt recently (within 48 hours)
      const dismissedUntil = localStorage.getItem("eduhub_pwa_dismissed");
      const isDismissed = dismissedUntil && Number(dismissedUntil) > Date.now();

      if (isStandaloneMode || isDismissed) {
        return;
      }

      // 3. Android / Chrome / Desktop PWA prompt listener
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      // 4. If iOS device and not standalone, show prompt after 4 seconds
      if (isIosDevice && !isStandaloneMode) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 4000);
        return () => {
          clearTimeout(timer);
          window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
      }

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    // Dismiss for 48 hours
    localStorage.setItem("eduhub_pwa_dismissed", String(Date.now() + 48 * 60 * 60 * 1000));
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={isRTL ? "تثبيت التطبيق" : "Install App"}
      className="fixed bottom-4 start-4 end-4 sm:end-auto sm:start-4 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#0c2340] text-white p-4 sm:p-4.5 rounded-3xl shadow-2xl border border-slate-700/80 backdrop-blur-md relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 end-0 -mt-6 -me-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start gap-3.5 relative z-10">
          {/* Logo icon */}
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shrink-0 shadow-md flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="EduHub Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                {isRTL ? "تطبيق إديو هب غزة" : "EduHub Gaza App"}
              </h4>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title={isRTL ? "إغلاق" : "Close"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed font-medium">
              {isRTL
                ? "ثبّت التطبيق على هاتفك للوصول السريع ومتابعة رصيدك وحجوزاتك بدون متصفح."
                : "Install the app for instant access to your quota, desk bookings, and attendance."}
            </p>

            {/* iOS installation steps guide */}
            {showIosGuide && isIos ? (
              <div className="mt-3 p-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs space-y-2 text-slate-200 animate-in fade-in">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>{isRTL ? "طريقة التثبيت على الآيفون:" : "How to install on iOS:"}</span>
                </div>
                <div className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>{isRTL ? "اضغط على زر المشاركة أسفل المتصفح" : "Tap the Share button below"}</span>
                  <Share2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>{isRTL ? "اختر إضافة إلى الشاشة الرئيسية" : "Select 'Add to Home Screen'"}</span>
                  <PlusSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-[#0c2340] text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isRTL ? "تثبيت التطبيق الآن 📲" : "Install App Now 📲"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {isRTL ? "لاحقاً" : "Later"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

