import { Suspense } from "react";
import type { Metadata } from "next";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export const instant = false;

export const metadata: Metadata = {
  title: "لوحة التحكم الإدارية",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#071321]" />}>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </Suspense>
  );
}
