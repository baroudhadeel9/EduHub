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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gazaeduhub.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EduHub Gaza | إديو هب غزة - الملاذ التعليمي ومساحة العمل المشتركة",
    template: "%s | EduHub Gaza",
  },
  description:
    "حاضنة تعليمية ومساحة عمل مشتركة غير ربحية في قطاع غزة، توفر طاقة شمسية مستمرة وإنترنت فايبر عالي السرعة 100 Mbps ومقاعد مجهزة مجاناً للطلاب والمستقلين.",
  keywords: [
    "إديو هب غزة",
    "EduHub Gaza",
    "مساحة عمل مشتركة غزة",
    "مساحة تعليمية غزة",
    "حجز مقعد غزة",
    "طاقة شمسية غزة",
    "انترنت فايبر غزة",
    "العمل عن بعد غزة",
    "حاضنة أعمال غزة",
    "ملاذ تعليمي للطلاب",
    "حجز ساعات غزة",
    "Gaza Coworking Space",
    "Gaza Study Sanctuary",
    "Free Coworking Gaza",
    "Students Sanctuary Gaza",
  ],
  authors: [{ name: "EduHub Gaza Initiative", url: SITE_URL }],
  creator: "EduHub Gaza",
  publisher: "EduHub Gaza Non-profit Initiative",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EduHub Gaza",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icons/icon-192.png",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "ar_PS",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: "EduHub Gaza | إديو هب غزة",
    title: "EduHub Gaza | إديو هب غزة - الملاذ التعليمي ومساحة العمل المشتركة",
    description:
      "مساحة تعليمية وعمل مشتركة غير ربحية في غزة، تضمن استمرارية التعليم والعمل عن بعد عبر طاقة شمسية مستمرة وإنترنت سريع 100 Mbps مجاناً.",
    images: [
      {
        url: "/images/hero-workspace.jpg",
        width: 1200,
        height: 630,
        alt: "EduHub Gaza Workstations and Sanctuary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduHub Gaza | إديو هب غزة",
    description:
      "ملاذ تعليمي ومساحة عمل مشتركة غير ربحية في غزة توفر طاقة مستمرة وإنترنت سريع مجاناً.",
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
  alternates: {
    canonical: "/",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["EducationalOrganization", "NGO"],
      "@id": `${SITE_URL}/#organization`,
      name: "EduHub Gaza | إديو هب غزة",
      alternateName: ["EduHub", "إديو هب", "حاضنة إديو هب غزة"],
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
      image: `${SITE_URL}/images/hero-workspace.jpg`,
      description:
        "حاضنة تعليمية ومساحة عمل مشتركة غير ربحية توفر الطاقة الشمسية المستمرة والإنترنت عالي السرعة للطلاب والعاملين عن بعد في قطاع غزة.",
      email: "eduhubgaza@gmail.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Gaza",
        addressCountry: "PS",
      },
    },
    {
      "@type": "CoworkingSpace",
      "@id": `${SITE_URL}/#coworkingspace`,
      name: "EduHub Gaza Coworking Sanctuary",
      url: SITE_URL,
      image: `${SITE_URL}/images/hero-workspace.jpg`,
      priceRange: "Free / 0 USD",
      isAccessibleForFree: true,
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Saturday",
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
          ],
          opens: "09:00",
          closes: "16:00",
        },
      ],
      amenityFeature: [
        {
          "@type": "LocationFeatureSpecification",
          name: "Continuous Solar Energy",
          value: true,
        },
        {
          "@type": "LocationFeatureSpecification",
          name: "High-Speed Fiber Internet 100 Mbps",
          value: true,
        },
        {
          "@type": "LocationFeatureSpecification",
          name: "Quiet Study Desks",
          value: true,
        },
        {
          "@type": "LocationFeatureSpecification",
          name: "Separate Female Hall",
          value: true,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "هل حجز المقاعد والإنترنت مجاني تماماً للطلاب؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "نعم، حجز المقاعد والكهرباء والإنترنت مجاني 100% لجميع طلاب الجامعات والخريجين والمستقلين في قطاع غزة.",
          },
        },
        {
          "@type": "Question",
          name: "أين يقع مركز إديو هب غزة وما هي شروط الحجز؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يقع المركز في غزة - شارع الوحدة - عمارة سندس (طابق 1). يتطلب الحجز التسجيل المسبق عبر الموقع الإلكتروني لإصدار كود الدخول والالتزام بمواعيد الفترات المحجوزة.",
          },
        },
        {
          "@type": "Question",
          name: "ما هي الخدمات والمرافق المتوفرة في مساحة إديو هب؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "توفر الحاضنة طاقة شمسية مستمرة مع مولدات احتياطية، إنترنت فايبر عالي السرعة 100 Mbps، قاعة هادئة للشباب وقاعة منفصلة للصبايا، ومقاعد عمل مجهزة بنقاط طاقة كهربائية.",
          },
        },
        {
          "@type": "Question",
          name: "كيف يمكنني تقديم طلب عضوية جديدة؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يمكنك التقديم مباشرة عبر صفحة 'طلب عضوية جديدة' في الموقع، وسيتم مراجعة طلبك وإشعارك لتتمكن من حجز ساعاتك ومقعدك فوراً.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${plusJakartaSans.variable} ${cairo.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen bg-brand-bg text-slate-800 antialiased selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <InstallPwaPrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}
