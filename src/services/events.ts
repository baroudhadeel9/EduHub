import { getAdminAuthSession } from "./applications";

export interface EventItem {
  id: number;
  title: string;
  type: string;
  tag?: string;
  meta?: string;
  instructor?: string;
  event_date: string;
  dateBadge?: string;
  timeBadge?: string;
  start_time?: string;
  end_time?: string;
  hours_count?: number;
  capacity?: number;
  registered_count?: number;
  location?: string;
  desc?: string;
  description?: string;
  image: string;
  image_url: string;
  status: "scheduled" | "completed" | "cancelled" | "archived";
  is_archived?: boolean;
  statusBadge?: string;
  is_upcoming?: boolean;
  created_at?: string;
}

export interface EventStats {
  total_events: number;
  upcoming_events: number;
  completed_events: number;
  total_beneficiaries: number;
}

const API_BASE_URL = "/api/proxy";

function getAdminHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...extraHeaders,
  };

  const session = getAdminAuthSession();
  if (session?.token) {
    headers["Authorization"] = `Bearer ${session.token}`;
  }

  return headers;
}

/**
 * Fetch public events for landing page
 */
export async function getPublicEventsApi(): Promise<{ success: boolean; data: EventItem[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/events`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching public events:", error);
    return { success: false, data: [] };
  }
}

/**
 * Fetch admin events with statistics and optional search/status filter
 */
export async function getAdminEventsApi(params?: {
  status?: string;
  search?: string;
}): Promise<{
  success: boolean;
  stats?: EventStats;
  data: EventItem[];
  message?: string;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.search?.trim()) query.set("search", params.search.trim());

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/admin/events${queryString}`, {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error: unknown) {
    console.error("Error fetching admin events:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "تعذر تحميل الورش والفعاليات",
    };
  }
}

/**
 * Create new event (supports FormData for image upload or raw JSON)
 */
export async function createAdminEventApi(
  payload: FormData | Record<string, unknown>
): Promise<{ success: boolean; data?: EventItem; message?: string }> {
  try {
    const isFormData = payload instanceof FormData;
    const headers = getAdminHeaders(
      isFormData ? {} : { "Content-Type": "application/json" }
    );

    const res = await fetch(`${API_BASE_URL}/admin/events`, {
      method: "POST",
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر حفظ الورشة");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error creating event:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ الورشة",
    };
  }
}

/**
 * Update existing event
 */
export async function updateAdminEventApi(
  id: number,
  payload: FormData | Record<string, unknown>
): Promise<{ success: boolean; data?: EventItem; message?: string }> {
  try {
    const isFormData = payload instanceof FormData;
    const headers = getAdminHeaders(
      isFormData ? {} : { "Content-Type": "application/json" }
    );

    // Using POST to /admin/events/{id} for easy multipart file upload support
    const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
      method: "POST",
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر تحديث بيانات الورشة");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error updating event:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الورشة",
    };
  }
}

/**
 * Delete event
 */
export async function deleteAdminEventApi(
  id: number
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر حذف الورشة");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error deleting event:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء حذف الورشة",
    };
  }
}

/**
 * Archive event (hides from public website)
 */
export async function archiveAdminEventApi(
  id: number
): Promise<{ success: boolean; data?: EventItem; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/events/${id}/archive`, {
      method: "POST",
      headers: getAdminHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر أرشفة الورشة");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error archiving event:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء أرشفة الورشة",
    };
  }
}

/**
 * Unarchive / Restore event (shows back on public website)
 */
export async function unarchiveAdminEventApi(
  id: number
): Promise<{ success: boolean; data?: EventItem; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/events/${id}/unarchive`, {
      method: "POST",
      headers: getAdminHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر إلغاء أرشفة الورشة");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error unarchiving event:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء استعادة الورشة",
    };
  }
}

