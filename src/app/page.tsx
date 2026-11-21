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
    {
      "@type": "WebSite",
      "@id": "https://gazaeduhub.com/#website",
      "url": "https://gazaeduhub.com",
      "name": "إديو هب غزة | EduHub Gaza",
      "alternateName": [
        "إديو هب",
        "EduHub",
        "غزة إديو هب",
        "اديو هب",
        "ايديو هب",
        "EduHub Gaza",
        "Edu Hub"
      ],
      "description":
        "الملاذ التعليمي ومساحة العمل المشتركة المجانية للطلاب والمستقلين في قطاع غزة.",
      "inLanguage": "ar",
      "publisher": {
        "@id": "https://gazaeduhub.com/#organization"
      },
      "hasPart": [
        {
          "@type": "WebPage",
          "@id": "https://gazaeduhub.com/join",
          "url": "https://gazaeduhub.com/join",
          "name": "طلب عضوية جديدة",
          "description":
            "تقديم طلب رسمي للانضمام المجاني لعائلة إديو هب غزة والاستفادة من خدمات قاعات الدراسة والإنترنت السريع."
        },
        {
          "@type": "WebPage",
          "@id": "https://gazaeduhub.com/visit",
          "url": "https://gazaeduhub.com/visit",
          "name": "تصريح زيارة استثنائية (ليوم واحد)",
          "description":
            "طلب تصريح زيارة مؤقت ليوم واحد لغير الأعضاء لحضور امتحان إلكتروني، مقابلة عمل أو شحن الحواسيب."
        },
        {
          "@type": "WebPage",
          "@id": "https://gazaeduhub.com/#booking-section",
          "url": "https://gazaeduhub.com/#booking-section",
          "name": "حجز المقاعد والإنترنت",
          "description":
            "حجز مقاعد الدراسة والعمل المجهزة بإنترنت فايبر 100 Mbps وطاقة شمسية مستمرة في قطاع غزة."
        },
        {
          "@type": "WebPage",
          "@id": "https://gazaeduhub.com/#faq",
          "url": "https://gazaeduhub.com/#faq",
          "name": "الأسئلة الشائعة",
          "description":
            "إجابات واضحة وشفافة حول كيفية الحجز وشروط المركز ومجانية كافة الخدمات للطلاب والمستقلين."
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://gazaeduhub.com/#faqpage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "هل حجز المقاعد والإنترنت مجاني تماماً للطلاب؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "نعم، حجز المقاعد والكهرباء والإنترنت مجاني 100% لجميع طلاب الجامعات والخريجين والمستقلين في إديو هب غزة."
          }
        },
        {
          "@type": "Question",
          "name": "كيف أصل للمركز وما هي شروط الحجز الأساسية؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "يقع المركز في مدينة غزة - شارع الوحدة، عمارة سندس (طابق 1). شروط الحجز تتطلب التسجيل المسبق عبر الموقع لإصدار كود الدخول والالتزام بمواعيد الفترات المحجوزة لإتاحة الفرصة للجميع."
          }
        },
        {
          "@type": "Question",
          "name": "كيف يمكنني التبرع والتأكد من وصول الدعم للمركز مباشرة؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "يمكنك التبرع مباشرة عبر منصة Zeffy الرسمية الخالية من أي رسوم استقطاع 0%، حيث تصل جميع التبرعات مباشرة لحساب المبادرة لشراء الوقود، صيانة الطاقة الشمسية واشتراكات الإنترنت عالي السرعة."
          }
        },
        {
          "@type": "Question",
          "name": "ماذا تفعلون في حال حدوث طارئ أو انقطاع غير متوقع؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "يمتلك المركز منظومة طاقة هجينة مع بطاريات ومولدات لضمان استمرار الخدمة والكهرباء والإنترنت بنسبة 100% دون أي توقف."
          }
        }
      ]
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
