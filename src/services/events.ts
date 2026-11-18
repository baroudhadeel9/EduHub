import { getAdminAuthSession } from "./applications";

export interface EventCustomQuestion {
  id: string;
  label: string;
  type?: "text" | "textarea" | "select";
  required?: boolean;
  options?: string[];
}

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
  allow_registration?: boolean;
  custom_url?: string;
  custom_questions?: EventCustomQuestion[];
  location?: string;
  desc?: string;
  description?: string;
  image: string;
  image_url: string;
  status: "scheduled" | "completed" | "cancelled" | "archived";
  display_mode?: "events_and_registration" | "banner_only" | "both";
  is_archived?: boolean;
  publish_start_at?: string | null;
  publish_end_at?: string | null;
  registration_deadline?: string | null;
  publish_start_badge?: string | null;
  publish_end_badge?: string | null;
  registration_deadline_badge?: string | null;
  is_registration_open?: boolean;
  is_future_scheduled?: boolean;
  is_publish_expired?: boolean;
  is_deadline_passed?: boolean;
  statusBadge?: string;
  is_upcoming?: boolean;
  created_at?: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  badge: string;
  badge_ar?: string;
  badge_en?: string;
  text: string;
  text_ar?: string;
  text_en?: string;
  action_type: "none" | "event_registration" | "custom_url";
  event_id?: number | null;
  button_label?: string;
  button_label_ar?: string;
  button_label_en?: string;
  custom_url?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_scheduled?: boolean;
  event?: EventItem | null;
}

export interface EventAttendee {
  id: number;
  event_id: number;
  name: string;
  full_name?: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  university?: string | null;
  specialty?: string | null;
  motivation?: string | null;
  custom_answers?: Record<string, string> | null;
  is_member: boolean;
  status: "pending" | "accepted" | "rejected" | "waitlisted";
  attendance_status?: "registered" | "attended" | "absent" | string | null;
  notes?: string | null;
  registered_at?: string;
  created_at?: string;
  notified_at?: string | null;
  notification_channel?: string | null;
  whatsapp_link?: string;
  event_status?: string;
  event_is_upcoming?: boolean;
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
      console.warn(`[getPublicEventsApi] Upstream returned status ${res.status}, using safe fallback.`);
      return { success: false, data: [] };
    }

    return await res.json();
  } catch (error) {
    console.warn("[getPublicEventsApi] Backend unreachable or sleeping, returning empty list:", error);
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

/**
 * ============================================================================
 * ANNOUNCEMENT BANNER & WORKSHOP REGISTRATION SERVICES
 * ============================================================================
 */

/**
 * Fetch active public announcement for site header
 */
export async function getPublicAnnouncementApi(): Promise<{
  success: boolean;
  data: AnnouncementConfig | null;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/announcement`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, data: null };
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching public announcement:", error);
    return { success: false, data: null };
  }
}

/**
 * Fetch admin announcement config + list of upcoming events
 */
export async function getAdminAnnouncementApi(): Promise<{
  success: boolean;
  data?: {
    config: AnnouncementConfig;
    events: EventItem[];
  };
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/announcement`, {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || `HTTP ${res.status}`,
      };
    }

    return data;
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "تعذر جلب إعدادات الإعلان",
    };
  }
}

/**
 * Update admin announcement config
 */
export async function updateAdminAnnouncementApi(
  payload: Partial<AnnouncementConfig>
): Promise<{
  success: boolean;
  data?: AnnouncementConfig;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/announcement`, {
      method: "POST",
      headers: getAdminHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر حفظ إعدادات الشريط الإعلاني");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error updating admin announcement:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ الإعلان",
    };
  }
}

/**
 * Public register for workshop / event
 */
export async function registerForEventApi(
  eventId: number,
  payload: {
    name: string;
    phone: string;
    email?: string;
    age?: number | null;
    gender?: string | null;
    specialty?: string;
    university?: string;
    motivation?: string;
    custom_answers?: Record<string, string>;
    is_member?: boolean;
    notes?: string;
  }
): Promise<{
  success: boolean;
  message?: string;
  data?: {
    id: number;
    event_id: number;
    event_title: string;
    status: string;
  };
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...payload,
        full_name: payload.name,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر إتمام التسجيل في الورشة");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error registering for event:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء إرسال طلب التسجيل",
    };
  }
}

/**
 * Fetch registrations across all events or filtered by eventId, status, search
 */
export async function getAllAdminRegistrationsApi(params?: {
  eventId?: number | "all" | "upcoming";
  scope?: "upcoming" | "all";
  status?: string;
  search?: string;
}): Promise<{
  success: boolean;
  data?: (EventAttendee & { event_title?: string })[];
  counts?: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    attended?: number;
    absent?: number;
  };
  message?: string;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.eventId && params.eventId !== "all") query.set("event_id", String(params.eventId));
    if (params?.scope) query.set("scope", params.scope);
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.search?.trim()) query.set("search", params.search.trim());

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/admin/events/all-registrations${queryString}`, {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}`);
    }

    return data;
  } catch (error: unknown) {
    console.error("Error fetching all event registrations:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "تعذر تحميل قائمة المسجلين",
    };
  }
}

/**
 * Get attendees list for an event in admin
 */
export async function getAdminEventRegistrationsApi(
  eventId: number,
  params?: {
    status?: string;
    search?: string;
  }
): Promise<{
  success: boolean;
  event?: EventItem;
  stats?: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    capacity: number;
  };
  data?: EventAttendee[];
  message?: string;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.search?.trim()) query.set("search", params.search.trim());

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/admin/events/${eventId}/registrations${queryString}`, {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}`);
    }

    return data;
  } catch (error: unknown) {
    console.error("Error fetching event registrations:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "تعذر تحميل قائمة المسجلين",
    };
  }
}

/**
 * Update attendee registration status (e.g. accepted, rejected)
 */
export async function updateAttendeeStatusApi(
  attendeeId: number,
  statusOrPayload:
    | ("pending" | "accepted" | "rejected" | "waitlisted")
    | {
        status?: "pending" | "accepted" | "rejected" | "waitlisted";
        attendance_status?: "attended" | "absent" | "registered";
        send_email?: boolean;
      },
  sendEmail: boolean = false
): Promise<{
  success: boolean;
  message?: string;
  data?: EventAttendee;
}> {
  try {
    const payload =
      typeof statusOrPayload === "string"
        ? { status: statusOrPayload, send_email: sendEmail }
        : statusOrPayload;

    const res = await fetch(`${API_BASE_URL}/admin/events/registrations/${attendeeId}/status`, {
      method: "PATCH",
      headers: getAdminHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر تحديث حالة المشترك");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error updating attendee status:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء تعديل الحالة",
    };
  }
}

/**
 * Send notification to attendee (Email via Brevo or WhatsApp direct link)
 */
export async function notifyAttendeeApi(
  attendeeId: number,
  channel: "email" | "whatsapp"
): Promise<{
  success: boolean;
  message?: string;
  whatsapp_link?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/events/registrations/${attendeeId}/notify`, {
      method: "POST",
      headers: getAdminHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ channel }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر إرسال الإشعار");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error notifying attendee:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الإشعار",
    };
  }
}

/**
 * Bulk accept selected attendees with optional email notification
 */
export async function bulkAcceptAttendeesApi(
  eventId: number,
  attendeeIds: number[],
  sendEmail: boolean = false
): Promise<{
  success: boolean;
  message?: string;
  accepted_count?: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/events/${eventId}/registrations/bulk-accept`, {
      method: "POST",
      headers: getAdminHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        ids: attendeeIds,
        registration_ids: attendeeIds,
        send_email: sendEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر قبول المشتركين المحددين");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error in bulk accept:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء قبول المشتركين",
    };
  }
}

/**
 * Delete attendee registration
 */
export async function deleteAttendeeApi(
  attendeeId: number
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/events/registrations/${attendeeId}`, {
      method: "DELETE",
      headers: getAdminHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "تعذر حذف تسجيل المشترك");
    }

    return data;
  } catch (error: unknown) {
    console.error("Error deleting attendee:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ أثناء حذف المشترك",
    };
  }
}

