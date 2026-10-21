"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, Translation, translations, defaultLocale } from "../locales";

interface LanguageContextType {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Translation;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cehub_locale") as Locale;
      if (saved === "ar" || saved === "en") {
        return saved;
      }
    }
    return defaultLocale;
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("cehub_locale", newLocale);
  };

  const toggleLocale = () => {
    const next = locale === "ar" ? "en" : "ar";
    setLocale(next);
  };

  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = translations[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return (
    <LanguageContext.Provider value={{ locale, dir, t, setLocale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
