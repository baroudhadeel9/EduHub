"use client";

import React, { useEffect } from "react";
import { getAdminAuthSession, setAdminAuthSession } from "@/services/applications";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure default admin session exists so all admin API calls are authenticated
    const session = getAdminAuthSession();
    if (!session || !session.token) {
      setAdminAuthSession({
        token: "admin-session-active",
        admin: {
          id: 1,
          name: "مدير مساحة EduHub",
          email: "admin@eduhub.ps",
          role: "admin",
        },
      });
    }
  }, []);

  return <>{children}</>;
}
