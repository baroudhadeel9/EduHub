import { Suspense } from "react";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export const instant = false;

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
