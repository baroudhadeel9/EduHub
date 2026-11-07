"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAdminAuthSession } from "@/services/applications";
import { Loader2 } from "lucide-react";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyAdmin() {
      const session = getAdminAuthSession();
      const token = session?.token;
      const role = (session?.admin as { role?: string })?.role;

      // 1. Initial Local Guard: Must have token and admin role
      if (!session || !token || token === "admin-session-active" || role !== "admin") {
        if (isMounted) {
          setAuthorized(false);
          router.replace("/login?redirect=" + encodeURIComponent(pathname));
        }
        return;
      }

      // 2. Active Server Verification: Validate token with backend /auth/me
      try {
        const res = await fetch("/api/proxy/auth/me", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          // Token invalid, expired, or rejected by server
          if (typeof window !== "undefined") {
            localStorage.removeItem("cehub_admin_session");
          }
          if (isMounted) {
            setAuthorized(false);
            router.replace("/login?redirect=" + encodeURIComponent(pathname));
          }
          return;
        }

        const data = await res.json();
        const serverRole = data?.user?.role;

        if (serverRole !== "admin") {
          // User is authenticated but NOT an admin (e.g. member/student)
          if (typeof window !== "undefined") {
            localStorage.removeItem("cehub_admin_session");
          }
          if (isMounted) {
            setAuthorized(false);
            router.replace("/login?redirect=" + encodeURIComponent(pathname));
          }
          return;
        }

        if (isMounted) {
          setAuthorized(true);
        }
      } catch {
        // In case of transient network error, allow validated local admin session
        if (isMounted) {
          setAuthorized(true);
        }
      }
    }

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [router, pathname]);

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#071321] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-400">جاري التحقق من صلاحيات الإدارة عبر السيرفر...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
