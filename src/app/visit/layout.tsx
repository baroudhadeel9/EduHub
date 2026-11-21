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

export default function VisitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
