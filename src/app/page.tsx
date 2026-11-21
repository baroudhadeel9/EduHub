import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "إديو هب غزة | EduHub Gaza - مساحة عمل مشتركة مجانية وورش عمل للطلاب",
  description:
    "مساحة إديو هب غزة (EduHub Gaza) هي مساحة عمل مشتركة وتعليمية مجانية 100% في قطاع غزة للطلاب والمستقلين، توفر إنترنت فايبر 100 Mbps وطاقة شمسية مستمرة، وحجز مقاعد دراسية، وورش عمل وتدريبات مهنية متخصصة.",
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
    "اديو هي",
    "إديو هي",
    "مساحة عمل مجانية",
    "مساحة عمل مجانية غزة",
    "مساحة عمل مشتركة غزة",
    "مساحة تعليمية غزة",
    "ورش عمل إديو هب",
    "ورش عمل غزة",
    "فعاليات وتدريبات غزة",
    "دورات تدريبية غزة",
    "ورش عمل مجانية غزة",
    "حجز مقاعد طلاب غزة",
    "طاقة شمسية وإنترنت غزة",
    "ملاذ تعليمي للطلاب غزة",
    "انستغرام إديو هب",
    "لينكد إن إديو هب",
    "EduHub Gaza Instagram",
    "EduHub Gaza LinkedIn",
    "Free Coworking Space Gaza",
    "EduHub Workshops Gaza",
  ],
  openGraph: {
    title: "إديو هب غزة | EduHub Gaza - مساحة عمل مشتركة مجانية وورش عمل للطلاب",
    description:
      "مساحة إديو هب غزة (EduHub Gaza) هي مساحة عمل مشتركة وتعليمية مجانية 100% في قطاع غزة للطلاب والمستقلين، توفر طاقة شمسية مستمرة وإنترنت 100 Mbps ومقاعد مجهزة وورش عمل مجانية.",
    url: "https://gazaeduhub.com",
    siteName: "إديو هب - EduHub Gaza",
    locale: "ar_AR",
    type: "website",
    images: [
      {
        url: "/images/hero-workspace.jpg",
        width: 1200,
        height: 630,
        alt: "إديو هب غزة | EduHub Gaza - مساحة عمل مشتركة وورش عمل مجانية",
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
        "اديو هي",
        "إديو هي",
        "EduHub",
        "Edu Hub",
        "EduHub Gaza",
        "غزة EduHub",
      ],
      url: "https://gazaeduhub.com",
      logo: "https://gazaeduhub.com/images/logo.png",
      image: "https://gazaeduhub.com/images/hero-workspace.jpg",
      description:
        "مساحة إديو هب غزة (EduHub Gaza) هي مساحة تعليمية وعمل مشتركة غير ربحية توفر الطاقة الشمسية والإنترنت عالي السرعة والورش التدريبية للطلاب والمستقلين في قطاع غزة مجاناً.",
      email: "eduhubgaza@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "شارع الوحدة، عمارة سندس، طابق 1",
        addressLocality: "Gaza",
        addressCountry: "PS",
      },
      sameAs: [
        "https://www.instagram.com/gaza_edhub",
        "https://www.linkedin.com/company/gaza-edu-hub/",
        "https://www.facebook.com/share/1BrEBigQbH/",
        "https://www.zeffy.com/en-US/donation-form/gaza-education-hub",
      ],
      knowsAbout: [
        "مساحة عمل مشتركة مجانية",
        "ورش عمل وتدريبات مهنية",
        "تعليم جامعي وبحث علمي",
        "العمل الحر والعمل عن بعد",
        "Free Coworking Space Gaza",
        "Technical Workshops Gaza",
      ],
    },
    {
      "@type": "CoworkingSpace",
      "@id": "https://gazaeduhub.com/#coworkingspace",
      name: "EduHub Gaza Free Coworking Space | مساحة عمل إديو هب غزة المجانية",
      alternateName: [
        "مساحة عمل مجانية غزة",
        "إديو هب",
        "EduHub",
        "EduHub Gaza",
        "إديو هب غزة",
        "اديو هب",
        "اديو هي"
      ],
      url: "https://gazaeduhub.com",
      image: "https://gazaeduhub.com/images/hero-workspace.jpg",
      description:
        "مساحة عمل مشتركة وملاذ تعليمي مجاني 100% للطلاب ورواد الأعمال والمستقلين في قطاع غزة، مجهزة بإنترنت فايبر 100 Mbps وطاقة شمسية متواصلة وقاعات ورش عمل وتدريب.",
      priceRange: "Free / 0 USD",
      isAccessibleForFree: true,
      currenciesAccepted: "USD, ILS",
      paymentAccepted: "Free",
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
          name: "Free Workspace & Co-working Desks (مساحة عمل مجانية)",
          value: true,
        },
        {
          "@type": "LocationFeatureSpecification",
          name: "Free Professional Workshops & Training (ورش عمل وتدريبات مجانية)",
          value: true,
        },
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
        "اديو هي",
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
          "name": "حجز المقاعد والإنترنت ومساحة العمل",
          "description":
            "حجز مقاعد الدراسة والعمل المجهزة بإنترنت فايبر 100 Mbps وطاقة شمسية مستمرة في قطاع غزة."
        },
        {
          "@type": "WebPage",
          "@id": "https://gazaeduhub.com/#events",
          "url": "https://gazaeduhub.com/#events",
          "name": "ورش العمل والفعاليات التدريبية",
          "description":
            "جدول ورش العمل والدورات والفعاليات التدريبية المجانية لطلاب الجامعات والمستقلين في مساحة إديو هب غزة."
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
      "@type": "EducationEvent",
      "@id": "https://gazaeduhub.com/#workshop-dentistry",
      "name": "ورشة عمل تحضير الكافيتي للأملجم (Class I & Class II) — طب أسنان",
      "alternateName": "ورشة عمل طب أسنان إديو هب غزة",
      "description": "دورة تدريبية وورشة عمل متخصصة لطلبة طب الأسنان بالتعاون مع فريق Crown Nexus في مساحة إديو هب غزة (EduHub Gaza)، تضمنت شرحاً نظرياً وتطبيقاً عملياً على مجسمات الأسنان.",
      "startDate": "2026-03-03T09:00:00+02:00",
      "endDate": "2026-03-03T16:00:00+02:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "مركز إديو هب غزة | EduHub Gaza",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "شارع الوحدة، عمارة سندس، طابق 1",
          "addressLocality": "Gaza",
          "addressCountry": "PS"
        }
      },
      "image": "https://gazaeduhub.com/images/workshop-dentistry-hall.jpg",
      "organizer": {
        "@id": "https://gazaeduhub.com/#organization"
      },
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://gazaeduhub.com/#events"
      }
    },
    {
      "@type": "Event",
      "@id": "https://gazaeduhub.com/#workshop-chess",
      "name": "بطولة الشطرنج لطلبة التخصصات الطبية (MCI)",
      "alternateName": "فعالية بطولة الشطرنج إديو هب غزة",
      "description": "بطولة استراتيجية نوعية نظمتها مؤسسة MCI لطلبة التخصصات الطبية في مركز إديو هب غزة (EduHub Gaza)، جمعت بين التركيز والتحدي الذهني والتفكير الاستراتيجي.",
      "startDate": "2026-03-10T09:00:00+02:00",
      "endDate": "2026-03-10T16:00:00+02:00",
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": "مركز إديو هب غزة | EduHub Gaza",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "شارع الوحدة، عمارة سندس، طابق 1",
          "addressLocality": "Gaza",
          "addressCountry": "PS"
        }
      },
      "image": "https://gazaeduhub.com/images/workshop-chess.png",
      "organizer": {
        "@id": "https://gazaeduhub.com/#organization"
      },
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://gazaeduhub.com/#events"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://gazaeduhub.com/#faqpage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "هل حجز المقاعد والإنترنت ومساحة العمل مجاني تماماً للطلاب؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "نعم، حجز المقاعد والكهرباء والإنترنت واستخدام مساحة العمل مجاني 100% لجميع طلاب الجامعات والخريجين والمستقلين في إديو هب غزة (EduHub Gaza)."
          }
        },
        {
          "@type": "Question",
          "name": "هل تقام ورش عمل ودورات تدريبية في مساحة إديو هب غزة؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "نعم، ينظم مركز إديو هب غزة (EduHub Gaza) بانتظام ورش عمل وفعاليات تدريبية تخصصية مجانية لطلبة الجامعات في مختلف المجالات (مثل طب الأسنان، البرمجة، المهارات الرقمية، والبطولات الذهنية) بالشراكة مع مبادرات وفرق تطوعية."
          }
        },
        {
          "@type": "Question",
          "name": "ما هي الحسابات الرسمية لـ إديو هب غزة على وسائل التواصل الاجتماعي؟",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "يمكنكم متابعة حساب إديو هب غزة الرسمي على انستغرام (@gaza_edhub: https://www.instagram.com/gaza_edhub) وحساب لينكد إن الرسمي (LinkedIn: https://www.linkedin.com/company/gaza-edu-hub/) وصفحة فيسبوك، للاطلاع على إعلانات الورش وتحديثات مقاعد الدراسة ومواعيد الدوام."
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
