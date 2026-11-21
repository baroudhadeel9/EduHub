import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل دخول الأعضاء",
  description: "بوابة تسجيل دخول الأعضاء في مساحة إديو هب غزة (EduHub Gaza).",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
