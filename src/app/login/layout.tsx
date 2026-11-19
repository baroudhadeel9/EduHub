import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل دخول الأعضاء وحجز المقاعد | إديو هب غزة",
  description:
    "بوابة دخول الأعضاء لحاضنة إديو هب غزة: متابعة رصيد الساعات المتبقية، حجز مقاعد الدراسة والعمل، واستعراض وإلغاء الحجوزات بسهولة.",
  keywords: [
    "تسجيل دخول إديو هب",
    "حجز مقعد غزة",
    "رصيد الساعات إديو هب",
    "حجوزاتي إديو هب",
  ],
  openGraph: {
    title: "تسجيل دخول الأعضاء | إديو هب غزة",
    description: "بوابة دخول الأعضاء لحجز مقاعد العمل ومتابعة رصيد الساعات.",
    url: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
