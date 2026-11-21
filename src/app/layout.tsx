import type { Metadata, Viewport } from "next";
import { Cairo, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import InstallPwaPrompt from "@/components/pwa/InstallPwaPrompt";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0c2340",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const SITE_URL = "https://gazaeduhub.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "إديو هب غزة | EduHub Gaza - مساحة تعليمية للطلاب",
    template: "%s | إديو هب - EduHub Gaza",
  },
  description:
    "مساحة إديو هب غزة (EduHub Gaza) حاضنة تعليمية ومساحة عمل مشتركة غير ربحية في قطاع غزة، توفر طاقة شمسية مستمرة وإنترنت فايبر عالي السرعة 100 Mbps ومقاعد مجهزة مجاناً للطلاب والمستقلين.",
  keywords: [
    "إديو هب",
    "إديو هب غزة",
    "غزة إديو هب",
    "EduHub",
    "Edu Hub",
    "EduHub Gaza",
    "غزة EduHub",
    "اديو هب",
    "ايديو هب",
    "ايديو هاب",
    "إيديو هوب",
    "مساحة عمل مشتركة غزة",
    "مساحة تعليمية غزة",
    "حجز مقاعد طلاب غزة",
    "طاقة شمسية وإنترنت غزة",
    "ملاذ تعليمي للطلاب",
    "العمل عن بعد غزة",
    "Gaza Coworking Space",
    "Gaza Study Sanctuary",
    "Free Coworking Gaza",
  ],
  authors: [{ name: "EduHub Gaza Team", url: SITE_URL }],
  creator: "EduHub Gaza",
  publisher: "EduHub Gaza",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduHub",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    url: SITE_URL,
    siteName: "إديو هب - EduHub Gaza",
    title: "إديو هب غزة | EduHub Gaza - مساحة تعليمية للطلاب",
    description:
      "مساحة إديو هب غزة (EduHub Gaza) حاضنة تعليمية ومساحة عمل مشتركة غير ربحية في قطاع غزة، توفر طاقة شمسية مستمرة وإنترنت 100 Mbps ومقاعد مجهزة مجاناً للطلاب والمستقلين.",
    images: [
      {
        url: "/images/hero-workspace.jpg",
        width: 1200,
        height: 630,
        alt: "إديو هب غزة | EduHub Gaza - مساحة عمل وتعليم",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "إديو هب غزة | EduHub Gaza - مساحة تعليمية للطلاب",
    description:
      "مساحة إديو هب غزة (EduHub Gaza) مساحة تعليمية وعمل غير ربحية في قطاع غزة توفر طاقة مستمرة وإنترنت سريع مجاناً.",
    images: ["/images/hero-workspace.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${plusJakartaSans.variable} ${cairo.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-brand-bg text-slate-800 antialiased selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <InstallPwaPrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}
