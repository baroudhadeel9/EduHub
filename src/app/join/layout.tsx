import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "طلب عضوية جديدة",
  description:
    "قدّم طلبك الرسمي للانضمام لعائلة إديو هب غزة (EduHub Gaza) والاستفادة مجاناً من قاعات الدراسة والعمل المجهزة بالإنترنت عالي السرعة 100 Mbps والطاقة الشمسية المستمرة.",
  alternates: {
    canonical: "https://gazaeduhub.com/join",
  },
  keywords: [
    "طلب عضوية إديو هب",
    "انضمام EduHub",
    "عضوية إديو هب غزة",
    "طلاب غزة EduHub",
    "فريلانسر إديو هب",
    "مساحة تعليمية مجانية غزة",
  ],
  openGraph: {
    title: "طلب عضوية جديدة | إديو هب - EduHub Gaza",
    description:
      "انضم مجاناً إلى مساحة إديو هب غزة (EduHub Gaza) التعليمية: طاقة مستمرة وإنترنت سريع ومقاعد هادئة للطلاب والمستقلين.",
    url: "https://gazaeduhub.com/join",
    siteName: "إديو هب - EduHub Gaza",
    locale: "ar_AR",
    type: "website",
    images: [
      {
        url: "/images/hero-workspace.jpg",
        width: 1200,
        height: 630,
        alt: "طلب عضوية جديدة في إديو هب غزة",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "طلب عضوية جديدة | إديو هب - EduHub Gaza",
    description:
      "انضم مجاناً إلى مساحة إديو هب غزة التعليمية: طاقة مستمرة وإنترنت سريع ومقاعد هادئة.",
    images: ["/images/hero-workspace.jpg"],
  },
};

const joinBreadcrumbsJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": "https://gazaeduhub.com/join#breadcrumb",
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
          "name": "طلب عضوية جديدة",
          "item": "https://gazaeduhub.com/join",
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": "https://gazaeduhub.com/join#webpage",
      "url": "https://gazaeduhub.com/join",
      "name": "طلب عضوية جديدة | إديو هب - EduHub Gaza",
      "description":
        "قدّم طلبك الرسمي للانضمام لعائلة إديو هب غزة (EduHub Gaza) والاستفادة مجاناً من قاعات الدراسة والعمل المجهزة بالإنترنت عالي السرعة 100 Mbps والطاقة الشمسية المستمرة.",
      "breadcrumb": {
        "@id": "https://gazaeduhub.com/join#breadcrumb",
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

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(joinBreadcrumbsJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
