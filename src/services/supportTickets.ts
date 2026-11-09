import { getMemberAuthSession, getAdminHeaders } from "./applications";

const API_BASE_URL =
  typeof window !== "undefined" ? "/api/proxy" : "https://eduhub-api-uz1z.onrender.com/api";

export type SupportTicketCategory =
  | "power_charging"
  | "internet"
  | "booking_seat"
  | "facility"
  | "account_quota"
  | "general"
  | string;

export type SupportTicketPriority = "normal" | "urgent";

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicketUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  member_type?: string;
  status?: string;
}

export interface SupportTicketItem {
  id: number;
  user_id: number;
  subject: string;
  category: SupportTicketCategory;
  category_label: string;
  priority: SupportTicketPriority;
  priority_label: string;
  description: string;
  status: SupportTicketStatus;
  status_label: string;
  admin_reply?: string | null;
  admin_name?: string | null;
  resolved_at?: string | null;
  resolved_at_human?: string | null;
  created_at: string;
  created_at_human?: string | null;
  updated_at?: string;
  user?: SupportTicketUser;
}

export interface SupportTicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  urgent_pending: number;
  filtered_count: number;
}

export interface CreateTicketPayload {
  subject: string;
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
  description: string;
}

export interface UpdateTicketPayload {
  status: SupportTicketStatus;
  admin_reply?: string;
  priority?: SupportTicketPriority;
}

/**
 * Fetch authenticated student/member's support tickets
 */
export async function getMemberSupportTicketsApi(): Promise<{
  success: boolean;
  data: SupportTicketItem[];
  meta?: { total: number; open_count: number; resolved_count: number };
}> {
  try {
    const session = getMemberAuthSession();
    const token = session?.token;
    if (!token) return { success: false, data: [] };

    const res = await fetch(`${API_BASE_URL}/member/support-tickets`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return { success: false, data: [] };
    const json = await res.json();
    return {
      success: true,
      data: json?.data || [],
      meta: json?.meta,
    };
  } catch (err) {
    console.error("Failed to fetch member support tickets:", err);
    return { success: false, data: [] };
  }
}

/**
 * Submit a new support ticket / issue as a student
 */
export async function createMemberSupportTicketApi(
  payload: CreateTicketPayload
): Promise<{ success: boolean; data?: SupportTicketItem; message?: string }> {
  try {
    const session = getMemberAuthSession();
    const token = session?.token;
    if (!token) {
      return { success: false, message: "يرجى تسجيل الدخول أولاً لتقديم طلب دعم." };
    }

    const res = await fetch(`${API_BASE_URL}/member/support-tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json?.message || "تعذر تقديم طلب الدعم الفني، يرجى المحاولة لاحقاً.",
      };
    }

    return {
      success: true,
      data: json?.data,
      message: json?.message || "تم استلام مشكلتك بنجاح.",
    };
  } catch (err) {
    console.error("Failed to create support ticket:", err);
    return { success: false, message: "حدث خطأ في الاتصال بالخادم." };
  }
}

/**
 * Admin: List all tickets across all students with filters
 */
export async function getAdminSupportTicketsApi(params?: {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
}): Promise<{
  success: boolean;
  data: SupportTicketItem[];
  stats?: SupportTicketStats;
}> {
  try {
    const headers = getAdminHeaders();
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.category) query.set("category", params.category);
    if (params?.priority) query.set("priority", params.priority);
    if (params?.search) query.set("search", params.search);

    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/admin/support-tickets${qs}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) return { success: false, data: [] };
    const json = await res.json();
    return {
      success: true,
      data: json?.data || [],
      stats: json?.stats,
    };
  } catch (err) {
    console.error("Failed to fetch admin support tickets:", err);
    return { success: false, data: [] };
  }
}

/**
 * Admin: List support tickets for a specific member profile
 */
export async function getAdminMemberSupportTicketsApi(
  memberId: string | number
): Promise<{
  success: boolean;
  data: SupportTicketItem[];
  count: number;
}> {
  try {
    const headers = getAdminHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/members/${memberId}/support-tickets`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) return { success: false, data: [], count: 0 };
    const json = await res.json();
    return {
      success: true,
      data: json?.data || [],
      count: json?.count || (json?.data || []).length,
    };
  } catch (err) {
    console.error("Failed to fetch member support tickets for admin:", err);
    return { success: false, data: [], count: 0 };
  }
}

/**
 * Admin: Update ticket status and reply
 */
export async function updateAdminSupportTicketApi(
  ticketId: number | string,
  payload: UpdateTicketPayload
): Promise<{ success: boolean; data?: SupportTicketItem; message?: string }> {
  try {
    const headers = getAdminHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/support-tickets/${ticketId}`, {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json?.message || "تعذر تحديث حالة التذكرة.",
      };
    }

    return {
      success: true,
      data: json?.data,
      message: json?.message || "تم تحديث التذكرة بنجاح.",
    };
  } catch (err) {
    console.error("Failed to update support ticket:", err);
    return { success: false, message: "حدث خطأ في الاتصال بالخادم." };
  }
}

/**
 * Admin: Delete a support ticket
 */
export async function deleteAdminSupportTicketApi(
  ticketId: number | string
): Promise<{ success: boolean; message?: string }> {
  try {
    const headers = getAdminHeaders();
    const res = await fetch(`${API_BASE_URL}/admin/support-tickets/${ticketId}`, {
      method: "DELETE",
      headers,
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json?.message || "تعذر حذف التذكرة." };
    }

    return { success: true, message: json?.message || "تم حذف التذكرة." };
  } catch (err) {
    console.error("Failed to delete support ticket:", err);
    return { success: false, message: "حدث خطأ في الاتصال بالخادم." };
  }
}
