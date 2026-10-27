import { Translation } from "./schema";
import arData from "./ar.json";
import enData from "./en.json";

// Statically typed translations (avoids runtime Zod schema parsing overhead on client)
export const arTranslation: Translation = arData as unknown as Translation;
export const enTranslation: Translation = enData as unknown as Translation;

export type Locale = "ar" | "en";

export const translations: Record<Locale, Translation> = {
  ar: arTranslation,
  en: enTranslation,
};

export const defaultLocale: Locale = "ar";

export function getTranslations(locale: Locale): Translation {
  return translations[locale] || translations[defaultLocale];
}

export * from "./schema";
