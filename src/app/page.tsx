import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "إديو هب غزة | EduHub Gaza - مساحة تعليمية للطلاب وعمل حر",
  description:
    "مساحة إديو هب غزة (EduHub Gaza) هي مساحة تعليمية وعمل مشتركة غير ربحية في قطاع غزة، توفر طاقة شمسية مستمرة وإنترنت فايبر 100 Mbps ومقاعد مجهزة مجاناً للطلاب والمستقلين.",
  alternates: {
    canonical: "https://gazaeduhub.com",
  },
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
    "ملاذ تعليمي للطلاب غزة",
  ],
  openGraph: {
    title: "إديو هب غزة | EduHub Gaza - مساحة تعليمية للطلاب وعمل حر",
    description:
      "مساحة إديو هب غزة (EduHub Gaza) هي مساحة تعليمية وعمل مشتركة غير ربحية في قطاع غزة، توفر طاقة شمسية مستمرة وإنترنت 100 Mbps ومقاعد مجهزة مجاناً للطلاب والمستقلين.",
    url: "https://gazaeduhub.com",
    siteName: "إديو هب - EduHub Gaza",
    locale: "ar_AR",
    type: "website",
    images: [
      {
        url: "/images/hero-workspace.jpg",
        width: 1200,
        height: 630,
        alt: "إديو هب غزة | EduHub Gaza - مساحة عمل وتعليم",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://gazaeduhub.com/#organization",
      name: "EduHub Gaza",
      alternateName: [
        "إديو هب",
        "إديو هب غزة",
        "غزة إديو هب",
        "اديو هب",
        "ايديو هب",
        "ايديو هاب",
        "إيديو هوب",
        "EduHub",
        "Edu Hub",
        "EduHub Gaza",
        "غزة EduHub",
      ],
      url: "https://gazaeduhub.com",
      logo: "https://gazaeduhub.com/images/logo.png",
      image: "https://gazaeduhub.com/images/hero-workspace.jpg",
      description:
        "مساحة إديو هب غزة (EduHub Gaza) هي مساحة تعليمية وعمل مشتركة غير ربحية توفر الطاقة الشمسية والإنترنت عالي السرعة للطلاب والمستقلين في قطاع غزة.",
      email: "eduhubgaza@gmail.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Gaza",
        addressCountry: "PS",
      },
      sameAs: [
        "https://www.instagram.com/gaza_edhub?rpxt=dGJjcWtna3pxaHBz",
        "https://www.linkedin.com/company/gaza-edu-hub/",
        "https://www.facebook.com/share/1BrEBigQbH/",
        "https://www.zeffy.com/en-US/donation-form/gaza-education-hub",
      ],
    },
    {
      "@type": "CoworkingSpace",
      "@id": "https://gazaeduhub.com/#coworkingspace",
      name: "EduHub Gaza Coworking Sanctuary | مساحة إديو هب غزة",
      alternateName: ["إديو هب", "EduHub", "EduHub Gaza", "إديو هب غزة"],
      url: "https://gazaeduhub.com",
      image: "https://gazaeduhub.com/images/hero-workspace.jpg",
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
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomePageClient />
    </>
  );
}
