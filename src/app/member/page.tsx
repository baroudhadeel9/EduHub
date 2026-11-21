import type { Metadata } from "next";
import LoginPage from "../login/page";

export const metadata: Metadata = {
  title: "بوابة الأعضاء",
  description: "بوابة حجز المقاعد وإدارة الرصيد الشهري لأعضاء مساحة إديو هب غزة (EduHub).",
  robots: {
    index: false,
    follow: false,
  },
};

export default LoginPage;
