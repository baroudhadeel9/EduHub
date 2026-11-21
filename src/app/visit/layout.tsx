import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تصريح زيارة استثنائية (ليوم واحد)",
  description:
    "طلب تصريح زيارة مؤقت ليوم واحد لغير الأعضاء في مساحة إديو هب غزة (EduHub Gaza) لحضور امتحان إلكتروني، مقابلة عمل، أو شحن الحواسيب وإنجاز المهام العاجلة.",
  alternates: {
    canonical: "https://gazaeduhub.com/visit",
  },
  keywords: [
    "تصريح زيارة إديو هب",
    "زيارة EduHub Gaza",
    "امتحان إلكتروني غزة إديو هب",
    "مقابلة عمل عن بعد غزة",
    "شحن لابتوب غزة إديو هب",
  ],
  openGraph: {
    title: "تصريح زيارة استثنائية (ليوم واحد) | إديو هب - EduHub Gaza",
    description:
      "تصريح زيارة مؤقت لغير الأعضاء لحضور يوم دراسي، مقابلة عمل، أو امتحان إلكتروني في مساحة إديو هب غزة (EduHub Gaza).",
    url: "https://gazaeduhub.com/visit",
    siteName: "إديو هب - EduHub Gaza",
    locale: "ar_AR",
    type: "website",
    images: [
      {
        url: "/images/hero-workspace.jpg",
        width: 1200,
        height: 630,
        alt: "تصريح زيارة إديو هب غزة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تصريح زيارة استثنائية (ليوم واحد) | إديو هب - EduHub Gaza",
    description:
      "تصريح زيارة مؤقت لغير الأعضاء لحضور يوم دراسي أو امتحان إلكتروني في مساحة إديو هب غزة.",
    images: ["/images/hero-workspace.jpg"],
  },
};

const visitBreadcrumbsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://gazaeduhub.com/visit#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": "https://gazaeduhub.com",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "تصريح زيارة استثنائية (ليوم واحد)",
          "item": "https://gazaeduhub.com/visit",
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://gazaeduhub.com/visit#webpage",
      "url": "https://gazaeduhub.com/visit",
      "name": "تصريح زيارة استثنائية (ليوم واحد) | إديو هب - EduHub Gaza",
      "description":
        "طلب تصريح زيارة مؤقت ليوم واحد لغير الأعضاء في مساحة إديو هب غزة (EduHub Gaza) لحضور امتحان إلكتروني، مقابلة عمل، أو شحن الحواسيب وإنجاز المهام العاجلة.",
      "breadcrumb": {
        "@id": "https://gazaeduhub.com/visit#breadcrumb",
      },
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://gazaeduhub.com/#website",
        "url": "https://gazaeduhub.com",
        "name": "إديو هب غزة | EduHub Gaza",
      },
    },
  ],
};

export default function VisitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(visitBreadcrumbsJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
