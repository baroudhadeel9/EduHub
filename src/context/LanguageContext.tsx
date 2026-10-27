"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { Locale, Translation, translations, defaultLocale } from "../locales";

interface LanguageContextType {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Translation;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

function getSnapshot(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  try {
    const saved = localStorage.getItem("cehub_locale");
    if (saved === "ar" || saved === "en") {
      return saved;
    }
  } catch {
    // Ignore restricted storage
  }
  return defaultLocale;
}

function getServerSnapshot(): Locale {
  return defaultLocale;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = (newLocale: Locale) => {
    try {
      localStorage.setItem("cehub_locale", newLocale);
    } catch {
      // Ignore
    }
    listeners.forEach((listener) => listener());
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
