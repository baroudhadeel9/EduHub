"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAdminAuthSession } from "@/services/applications";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [authorized, setAuthorized] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const checkAuth = () => {
      const session = getAdminAuthSession();
      if (!session || !session.token || typeof session.token !== "string" || !session.token.trim()) {
        setAuthorized(false);
        setChecking(false);
        router.replace("/login");
      } else {
        setAuthorized(true);
        setChecking(false);
      }
    };

    checkAuth();

    // Listen to storage events to immediately logout if token is cleared in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "eduhub_admin_auth") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#071321] text-white flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mb-2" />
        <p className="text-xs font-bold text-slate-300">
          جاري التحقق من صلاحيات الدخول الإدارية...
        </p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
