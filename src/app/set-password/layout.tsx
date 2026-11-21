import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تعيين كلمة المرور",
  description: "تعيين كلمة المرور لحساب مساحة إديو هب غزة (EduHub).",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
