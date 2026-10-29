import { MembershipApplication, ApplicationStatus } from "@/components/admin/applications/data";

const REMOTE_API_URL = "https://eduhub-api-uz1z.onrender.com/api";

const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api/proxy"
    : process.env.NEXT_PUBLIC_API_BASE_URL || REMOTE_API_URL;

const ADMIN_STORAGE_KEY = "eduhub_admin_auth";
export const ADMIN_COOKIE_NAME = "eduhub_admin_token";

export function getAdminAuthSession(): { token: string; admin: unknown } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.token || typeof parsed.token !== "string" || !parsed.token.trim()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getAdminHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
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

export function getAdminToken(): string | null {
  return getAdminAuthSession()?.token || null;
}

export async function safeJsonParse<T = unknown>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function extractErrorMessage(
  result: unknown,
  response: Response,
  defaultMessage: string
): string {
  const r = result as Record<string, unknown> | null;
  if (r && typeof r.message === "string" && r.message.trim()) {
    return r.message;
  }
  if (r && r.errors && typeof r.errors === "object") {
    const values = Object.values(r.errors);
    if (values.length > 0) {
      const first = values[0];
      if (Array.isArray(first) && first.length > 0 && typeof first[0] === "string") {
        return first[0];
      }
    }
  }
  if (response.status >= 500) {
    return "الخادم قيد التجهيز أو الاستجابة حالياً، يرجى المحاولة بعد لحظات.";
  }
  if (response.status === 401) {
    return "جلسة الدخول منتهية أو غير مصرح بها. يرجى تسجيل الدخول مجدداً.";
  }
  if (response.status === 403) {
    return "ليس لديك الصلاحية المطلوبة لتنفيذ هذا الإجراء.";
  }
  return defaultMessage;
}

export interface SubmitApplicationResponse {
  success: boolean;
  message: string;
  data: MembershipApplication;
  errors?: Record<string, string[]>;
}

export interface GetApplicationsResponse {
  success: boolean;
  data: MembershipApplication[];
  count: number;
}

/**
 * Submit a new membership application with files to Laravel Backend
 */
export async function submitMembershipApplication(
  formData: FormData
): Promise<SubmitApplicationResponse> {
  const response = await fetch(`${API_BASE_URL}/membership-applications`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const result = await safeJsonParse<SubmitApplicationResponse>(response);

  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "فشل إرسال طلب العضوية."));
  }

  return result;
}



export function normalizeMembershipApplication(
  raw: Record<string, unknown>
): MembershipApplication {
  if (!raw) return {} as MembershipApplication;

  const safeStr = (v: unknown, fallback = ""): string => {
    if (v === null || v === undefined) return fallback;
    return String(v);
  };

  const safeArr = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map(String);
    if (typeof v === "string") {
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        return v.trim() ? [v.trim()] : [];
      }
    }
    return [];
  };

  const id = safeStr(raw.id);
  const fullName = safeStr(raw.fullName || raw.full_name || raw.name, "متقدم جديد");

  let submissionDate = safeStr(raw.submissionDate);
  if (!submissionDate && raw.created_at) {
    try {
      const d = new Date(String(raw.created_at));
      if (!isNaN(d.getTime())) {
        submissionDate = d.toISOString().split("T")[0];
      }
    } catch {
      submissionDate = safeStr(raw.created_at);
    }
  }

  const applicationNumber = safeStr(
    raw.applicationNumber || raw.application_number,
    `APP-${id.padStart(4, "0")}`
  );

  const hasProof = Boolean(
    raw.has_proof_file ||
    raw.proof_file_path ||
    raw.proof_file_base64 ||
    raw.proofFileBase64 ||
    raw.proof_file_url ||
    raw.proofFileUrl ||
    raw.proofFileName ||
    raw.proof_file_name
  );
  const hasCharger = Boolean(
    raw.has_charger_photo ||
    raw.charger_photo_path ||
    raw.charger_photo_base64 ||
    raw.chargerPhotoBase64 ||
    raw.charger_photo_url ||
    raw.chargerPhotoUrl ||
    raw.chargerPhotoName ||
    raw.charger_photo_name
  );

  const token = getAdminAuthSession()?.token;
  const tokenSuffix = token ? `?token=${encodeURIComponent(token)}` : "";

  const proofFileUrl = safeStr(
    raw.proofFileUrl ||
    raw.proof_file_url ||
    (hasProof && id ? `/api/proxy/admin/files/proof/${id}${tokenSuffix}` : "")
  );

  const chargerPhotoUrl = safeStr(
    raw.chargerPhotoUrl ||
    raw.charger_photo_url ||
    (hasCharger && id ? `/api/proxy/admin/files/charger/${id}${tokenSuffix}` : "")
  );

  return {
    ...raw,
    id,
    applicationNumber,
    submissionDate: submissionDate || new Date().toISOString().split("T")[0],
    status: (raw.status as ApplicationStatus) || "pending",
    statusNote: safeStr(raw.statusNote || raw.status_note),
    reviewedBy: safeStr(raw.reviewedBy || raw.reviewed_by),
    assignedQuota:
      typeof raw.assignedQuota === "number"
        ? raw.assignedQuota
        : typeof raw.assigned_quota === "number"
        ? raw.assigned_quota
        : 25,
    temporaryPassword: safeStr(raw.temporaryPassword || raw.temporary_password),

    // 1. Personal & Contact
    email: safeStr(raw.email),
    fullName,
    nationalId: safeStr(raw.nationalId || raw.national_id, "-"),
    birthDate: safeStr(raw.birthDate || raw.birth_date, "-"),
    phone: safeStr(raw.phone, "-"),
    governorate: (raw.governorate as any) || "مدينة غزة",
    detailedAddress: safeStr(raw.detailedAddress || raw.detailed_address, "-"),

    // 2. Academic & Professional
    category: (raw.category as any) || "طالب/ة",
    university: safeStr(raw.university),
    specialty: safeStr(raw.specialty, "-"),
    primaryPurposes: safeArr(raw.primaryPurposes || raw.primary_purposes),
    durationSchedule: safeStr(raw.durationSchedule || raw.duration_schedule, "-"),
    proofFileName: safeStr(raw.proofFileName || raw.proof_file_name, "وثيقة_الطلب.pdf"),
    proofFileSize: safeStr(raw.proofFileSize || raw.proof_file_size, "غير محدد"),
    proofFileUrl,
    proofFileBase64: safeStr(raw.proofFileBase64 || raw.proof_file_base64),
    proofFileMime: safeStr(raw.proofFileMime || raw.proof_file_mime, "application/pdf"),

    // 3. Devices & Power
    deviceType: safeStr(raw.deviceType || raw.device_type, "كمبيوتر محمول"),
    chargerWattage: safeStr(raw.chargerWattage || raw.charger_wattage, "65W"),
    chargerPhotoName: safeStr(raw.chargerPhotoName || raw.charger_photo_name, "charger_photo.jpg"),
    chargerPhotoUrl,
    chargerPhotoBase64: safeStr(raw.chargerPhotoBase64 || raw.charger_photo_base64),
    chargerPhotoMime: safeStr(raw.chargerPhotoMime || raw.charger_photo_mime, "image/jpeg"),
    powerConnectivityStatus: safeStr(raw.powerConnectivityStatus || raw.power_connectivity_status, "عادي"),
    preferredShift: safeStr(raw.preferredShift || raw.preferred_shift, "صباحي"),
    weeklyUsage: safeStr(raw.weeklyUsage || raw.weekly_usage, "-"),

    // 4. Consents
    photographyConsent: (raw.photographyConsent || raw.photography_consent || "أوافق") as any,
    dataAccuracyConsent: (raw.dataAccuracyConsent || raw.data_accuracy_consent || "أقرّ بصحة البيانات المقدمة وأوافق على ما ورد أعلاه.") as any,
  } as MembershipApplication;
}

/**
 * Fetch all applications for Admin Dashboard (Protected by X-Admin-Key & Sanctum)
 */
export async function getAdminMembershipApplications(
  query?: string,
  sort?: string
): Promise<MembershipApplication[]> {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (sort) params.set("sort", sort);
  const queryStr = params.toString() ? `?${params.toString()}` : "";
  const url = `${API_BASE_URL}/admin/membership-applications${queryStr}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAdminHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("غير مصرح: لا تملك صلاحية الوصول إلى طلبات العضوية.");
    }
    throw new Error("حدث خطأ أثناء جلب طلبات العضوية من الخادم.");
  }

  const result: GetApplicationsResponse = await response.json();
  const rawList = (result.data || []) as unknown as Record<string, unknown>[];
  return rawList.map(normalizeMembershipApplication);
}

/**
 * Update application status (Admin only)
 */
export async function updateApplicationStatusApi(
  id: string,
  status: ApplicationStatus,
  statusNote?: string,
  assignedQuota?: number
): Promise<MembershipApplication> {
  const response = await fetch(
    `${API_BASE_URL}/admin/membership-applications/${id}/status`,
    {
      method: "PATCH",
      headers: getAdminHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        status,
        statusNote,
        assignedQuota,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "فشل تحديث حالة الطلب في الخادم.");
  }

  return normalizeMembershipApplication({
    ...(result.data || {}),
    temporaryPassword: result.temporaryPassword,
  });
}

export interface MemberBookingItem {
  id: string;
  booking_code?: string;
  numericId?: number;
  date: string;
  startTime: string;
  start_time?: string;
  endTime: string;
  end_time?: string;
  durationHours: number;
  duration_hours?: number;
  status: "confirmed" | "cancelled";
  notes?: string;
  canCancel?: boolean;
}

export interface MemberData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  monthlyLimit: number;
  hoursUsed: number;
  hoursRemaining: number;
  dailyLimit: number;
  extraHours?: number;
  dueAmount?: number;
  bookings: MemberBookingItem[];
}

export interface MemberLoginResponse {
  success: boolean;
  message: string;
  token: string;
  user?: {
    id: number | string;
    name: string;
    email: string;
    role: string;
    member_type?: string;
    status?: string;
  };
  member: MemberData;
}

export const MEMBER_STORAGE_KEY = "eduhub_member_session";
export const MEMBER_COOKIE_NAME = "eduhub_member_token";

export function setMemberAuthSession(data: { token: string; member: MemberData }) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(data));
      const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${MEMBER_COOKIE_NAME}=${encodeURIComponent(
        data.token
      )}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
    } catch (e) {
      console.warn("Failed to save member auth session:", e);
    }
  }
}

export function getMemberAuthSession(): { token: string; member: MemberData } | null {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(MEMBER_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to parse member auth session:", e);
    }
  }
  return null;
}

export function clearMemberAuthSession() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(MEMBER_STORAGE_KEY);
      const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${MEMBER_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax${secureFlag}`;
    } catch (e) {
      console.warn("Failed to clear member auth session:", e);
    }
  }
}

/**
 * Fetch member bookings fresh from backend
 */
export async function getMemberBookingsApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/member/bookings`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "تعذر جلب حجوزات العضو.");
  }
  return result.data || [];
}

/**
 * Member Login with email & password
 */
export async function memberLoginApi(
  email: string,
  password: string
): Promise<MemberLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/member/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await safeJsonParse<MemberLoginResponse>(response);

  if (!response.ok || !result) {
    throw new Error(
      extractErrorMessage(
        result,
        response,
        "البريد الإلكتروني أو كلمة المرور غير صحيحة."
      )
    );
  }

  return result;
}



/**
 * Create a new day-based booking for authenticated member
 */
export async function createMemberBookingApi(
  token: string,
  bookingData: {
    date: string;
    startTime?: string;
    durationHours?: number;
    notes?: string;
  }
) {
  const response = await fetch(`${API_BASE_URL}/member/bookings`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      bookingDate: bookingData.date,
      date: bookingData.date,
      startTime: bookingData.startTime || "08:00",
      endTime: "16:00",
      durationHours: bookingData.durationHours ?? 8,
      notes: bookingData.notes || "",
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "تعذر إتمام الحجز، يرجى المحاولة ثانية.");
  }

  return result;
}



export interface MemberDueItem {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  member_type: string;
  type: string;
  status: string;
  hours_limit: number;
  hours_used: number;
  extra_hours: number;
  due_amount: number;
  hourly_rate: number;
  month: string;
  quota_id?: number | null;
  joined_at?: string | null;
}

export interface GetAdminDuesResponse {
  success: boolean;
  data: MemberDueItem[];
  count: number;
  summary: {
    total_amount: number;
    total_extra_hours: number;
    total_members_with_dues: number;
  };
}

/**
 * Fetch members with financial dues for Admin
 */
export async function getAdminDuesApi(params?: {
  query?: string;
  type?: string;
  onlyDebtors?: boolean;
}): Promise<GetAdminDuesResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append("query", params.query);
    if (params?.type && params.type !== "all") searchParams.append("type", params.type);
    if (params?.onlyDebtors !== undefined) searchParams.append("onlyDebtors", String(params.onlyDebtors));

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const response = await fetch(`${API_BASE_URL}/admin/dues${queryStr}`, {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // fallback
  }

  // Graceful fallback from admin members list if backend dues endpoint isn't reached yet
  try {
    const members = await getAdminMembersApi();
    const debtors = (members as unknown as Array<Record<string, unknown>>)
      .map((m) => {
        const extraHours = Number(m.extra_hours || m.extraHours || 0);
        const dueAmount = Number(m.due_amount || m.dueAmount || extraHours * 2);
        return {
          id: m.id as number | string,
          name: String(m.name || ""),
          email: String(m.email || ""),
          phone: String(m.phone || ""),
          member_type: String(m.member_type || m.type || "student"),
          type: String(m.member_type || m.type || "student"),
          status: String(m.status || "active"),
          hours_limit: Number(m.hours_limit || m.hoursLimit || 35),
          hours_used: Number(m.hours_used || m.hoursUsed || 0),
          extra_hours: extraHours,
          due_amount: dueAmount,
          hourly_rate: 2,
          month: new Date().toISOString().slice(0, 7),
          joined_at: (m.joinedDate as string) || null,
        };
      })
      .filter((m) => (params?.onlyDebtors === false ? true : m.due_amount > 0));

    const totalAmount = debtors.reduce((sum, d) => sum + d.due_amount, 0);
    const totalExtraHours = debtors.reduce((sum, d) => sum + d.extra_hours, 0);

    return {
      success: true,
      data: debtors,
      count: debtors.length,
      summary: {
        total_amount: totalAmount,
        total_extra_hours: totalExtraHours,
        total_members_with_dues: debtors.length,
      },
    };
  } catch {
    return {
      success: true,
      data: [],
      count: 0,
      summary: { total_amount: 0, total_extra_hours: 0, total_members_with_dues: 0 },
    };
  }
}

/**
 * Settle member financial dues
 */
export async function settleMemberDuesApi(
  id: number | string,
  data?: { payment_method?: string; notes?: string }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dues/${id}/settle`, {
      method: "POST",
      headers: getAdminHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data || {}),
    });

    if (response.ok) {
      return await response.json();
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "فشل تسوية المستحقات.");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "فشل تسوية المستحقات.";
    throw new Error(msg);
  }
}

export interface DuesSettlementItem {
  id: number;
  member_name: string;
  member_phone: string | null;
  member_type: string | null;
  admin_name: string;
  amount: number;
  extra_hours: number;
  month_year: string;
  payment_method: string;
  notes: string | null;
  settled_at: string | null;
}

export interface GetDuesHistoryResponse {
  success: boolean;
  data: DuesSettlementItem[];
  count: number;
  total_collected: number;
}

/**
 * Fetch audit log of past dues settlements
 */
export async function getDuesHistoryApi(memberId?: number | string): Promise<GetDuesHistoryResponse> {
  try {
    const query = memberId ? `?member_id=${memberId}` : "";
    const response = await fetch(`${API_BASE_URL}/admin/dues/history${query}`, {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // fallback
  }

  return { success: false, data: [], count: 0, total_collected: 0 };
}

/**
 * Admin creates a booking directly on behalf of a member
 */
export async function createAdminBookingForMemberApi(data: {
  userId: number | string;
  date: string;
  startTime: string;
  durationHours: number;
  notes?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: getAdminHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "تعذر إتمام الحجز للعضو.");
  }
  return result;
}



/**
 * Fetch all bookings for Admin Dashboard
 */
export async function getAdminBookingsApi(date?: string, status?: string) {
  try {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (status && status !== "all") params.append("status", status);

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const url = `${API_BASE_URL}/admin/bookings${queryStr}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "تعذر جلب الحجوزات.");
    }
    return result.data || [];
  } catch (err) {
    console.warn("getAdminBookingsApi network error:", err);
    return [];
  }
}

/**
 * Cancel a booking by Admin
 */
export async function cancelAdminBookingApi(bookingId: number | string, reason?: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
    method: "POST",
    headers: getAdminHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      reason: reason || "إلغاء بواسطة إدارة المساحة",
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "تعذر إلغاء الحجز.");
  }

  return result;
}



/**
 * Cancel a booking for authenticated member
 */
export async function cancelMemberBookingApi(token: string, bookingId: number | string) {
  const response = await fetch(`${API_BASE_URL}/member/bookings/${bookingId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "تعذر إلغاء الحجز.");
  }

  return result;
}



/**
 * Change member password
 */
export async function changeMemberPasswordApi(
  token: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  const response = await fetch(`${API_BASE_URL}/member/change-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "تعذر تغيير كلمة المرور.");
  }

  return result;
}



/**
 * Fetch all members for Admin Dashboard
 */
export async function getAdminMembersApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/members`, {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "تعذر تحميل بيانات الأعضاء.");
    }
    return result.data || [];
  } catch (err) {
    console.warn("getAdminMembersApi network error:", err);
    return [];
  }
}

/**
 * ── Visitor Requests API ──
 */
export async function submitVisitorRequestApi(data: {
  name: string;
  phone: string;
  email: string;
  visitDate: string;
  durationHours: number;
  visitTime?: string;
  purpose: string;
}) {
  const response = await fetch(`${API_BASE_URL}/visitor-passes`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: data.name,
      phone: data.phone,
      email: data.email,
      visitDate: data.visitDate,
      purpose: data.purpose,
      notes: data.durationHours ? `المدة: ${data.durationHours} ساعات` : undefined,
    }),
  });

  const result = await safeJsonParse<Record<string, unknown>>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "تعذر تقديم طلب الزيارة."));
  }
  return result;
}

export async function getAdminVisitorRequestsApi(status?: string) {
  const url = status && status !== "all"
    ? `${API_BASE_URL}/admin/visitor-passes?status=${status}`
    : `${API_BASE_URL}/admin/visitor-passes`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAdminHeaders(),
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "تعذر تحميل طلبات الزوار.");
  }
  const rawList = (result.data || []) as Record<string, unknown>[];
  return rawList.map((item) => ({
    ...item,
    name: item.name || item.full_name || "",
  }));
}

export async function updateVisitorRequestStatusApi(
  id: string | number,
  status: "approved" | "rejected" | "pending",
  rejectionReason?: string,
  adminNotes?: string
) {
  const response = await fetch(`${API_BASE_URL}/admin/visitor-passes/${id}/status`, {
    method: "PATCH",
    headers: getAdminHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      status,
      status_note: rejectionReason || adminNotes,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "تعذر تحديث حالة طلب الزيارة.");
  }
  return result.data;
}

/**
 * ── Attendance & Daily Check-ins API ──
 */
export async function getAdminAttendanceApi(date?: string) {
  const url = date
    ? `${API_BASE_URL}/admin/attendance?date=${date}`
    : `${API_BASE_URL}/admin/attendance`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAdminHeaders(),
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "تعذر تحميل سجل الحضور اليومي.");
  }
  return result;
}



export interface CheckInOptions {
  type?: "member" | "visitor";
  userId?: number | string;
  bookingId?: number | string;
  visitorPassId?: number | string;
  notes?: string;
}

export async function checkInAttendanceApi(
  id: string | number,
  options?: CheckInOptions
) {
  const idStr = String(id);
  const isVisitor = options?.type === "visitor" || idStr.startsWith("visitor_");
  const type: "member" | "visitor" = isVisitor ? "visitor" : "member";

  let bookingId = options?.bookingId;
  if (!bookingId && idStr.startsWith("booking_")) {
    const rawNum = idStr.replace("booking_", "");
    if (!isNaN(Number(rawNum))) bookingId = Number(rawNum);
  }

  let visitorPassId = options?.visitorPassId;
  if (!visitorPassId && idStr.startsWith("visitor_")) {
    const rawNum = idStr.replace("visitor_", "");
    if (!isNaN(Number(rawNum))) visitorPassId = Number(rawNum);
  }

  let userId = options?.userId;

  // If userId is missing for a member booking, try to resolve it from the bookings list
  if (!userId && type === "member" && bookingId) {
    try {
      const bookings = await getAdminBookingsApi();
      const match = bookings.find((b: { id: number | string; user_id?: number | string; user?: { id?: number | string } }) => String(b.id) === String(bookingId));
      if (match) {
        userId = match.user_id || match.user?.id;
      }
    } catch {
      // ignore
    }
  }

  // Construct request body that satisfies both camelCase and snake_case on backend
  const requestBody: Record<string, unknown> = {
    id: idStr,
    type: type,
    notes: options?.notes || "تسجيل وصول مساحة EduHub",
  };

  if (userId) {
    requestBody.userId = Number(userId);
    requestBody.user_id = Number(userId);
  }
  if (bookingId) {
    requestBody.bookingId = Number(bookingId);
    requestBody.booking_id = Number(bookingId);
  }
  if (visitorPassId) {
    requestBody.visitorPassId = Number(visitorPassId);
    requestBody.visitor_pass_id = Number(visitorPassId);
  }

  // 1. Try standard check-in endpoint
  let response = await fetch(`${API_BASE_URL}/admin/attendance/check-in`, {
    method: "POST",
    headers: getAdminHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(requestBody),
  });

  // 2. Fallback to /check-in/${id} in case route differs
  if (response.status === 404) {
    response = await fetch(`${API_BASE_URL}/admin/attendance/check-in/${id}`, {
      method: "POST",
      headers: getAdminHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(requestBody),
    });
  }

  const result = await response.json();
  if (!response.ok) {
    const errMsg = result.message || (result.errors ? Object.values(result.errors).flat().join(" ") : "تعذر تسجيل الدخول.");
    throw new Error(errMsg);
  }
  return result.data;
}

export async function checkOutAttendanceApi(id: string | number) {
  // Primary endpoint on Render: POST /api/admin/attendance/{id}/check-out
  let response = await fetch(`${API_BASE_URL}/admin/attendance/${id}/check-out`, {
    method: "POST",
    headers: getAdminHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ id }),
  });

  // Fallback to /check-out/${id} in case route differs
  if (response.status === 404) {
    response = await fetch(`${API_BASE_URL}/admin/attendance/check-out/${id}`, {
      method: "POST",
      headers: getAdminHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ id }),
    });
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "تعذر تسجيل الخروج.");
  }
  return result.data;
}

export async function createManualAttendanceApi(data: {
  name: string;
  type: "student" | "freelancer" | "visitor";
  subText?: string;
  bookingTime?: string;
  date?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/admin/attendance`, {
    method: "POST",
    headers: getAdminHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      name: data.name,
      type: data.type,
      sub_text: data.subText,
      booking_time: data.bookingTime,
      date: data.date,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "تعذر إضافة سجل الحضور.");
  }
  return result.data;
}

let hasOverviewEndpoint: boolean | null = null;
let overviewInFlightPromise: Promise<{
  topCards: {
    pendingApplications: number;
    pendingVisitors: number;
    insideAttendees: number;
    totalMembers: number;
  };
  needsFollowUp: Array<{
    name: string;
    subText?: string;
    alertText?: string;
    badge?: string;
    phone?: string;
  }>;
  todayBookings: Array<{
    id: string | number;
    name: string;
    time?: string;
    desk?: string;
    type?: string;
    reason?: string;
  }>;
}> | null = null;
let cachedOverviewData: {
  topCards: {
    pendingApplications: number;
    pendingVisitors: number;
    insideAttendees: number;
    totalMembers: number;
  };
  needsFollowUp: Array<{
    name: string;
    subText?: string;
    alertText?: string;
    badge?: string;
    phone?: string;
  }>;
  todayBookings: Array<{
    id: string | number;
    name: string;
    time?: string;
    desk?: string;
    type?: string;
    reason?: string;
  }>;
} | null = null;
let cachedOverviewTime = 0;

export async function getAdminOverviewApi() {
  const now = Date.now();
  if (cachedOverviewData && now - cachedOverviewTime < 4000) {
    return cachedOverviewData;
  }

  if (overviewInFlightPromise) {
    return overviewInFlightPromise;
  }

  overviewInFlightPromise = (async () => {
    // 1. If backend has /admin/overview endpoint, try it
    if (hasOverviewEndpoint !== false) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/overview`, {
          method: "GET",
          headers: getAdminHeaders(),
          cache: "no-store",
        });

        if (response.ok) {
          hasOverviewEndpoint = true;
          const result = await response.json();
          const todayStr = new Date().toISOString().split("T")[0];
          
          // Verify actual active attendance for TODAY to fix backend stale/seeded count
          try {
            const attRaw = await getAdminAttendanceApi(todayStr).catch(() => ({ data: [] }));
            const attList = Array.isArray((attRaw as { data?: unknown[] })?.data)
              ? (attRaw as { data: Record<string, unknown>[] }).data
              : Array.isArray(attRaw)
              ? (attRaw as Record<string, unknown>[])
              : [];

            const realInsideToday = attList.filter((att) => {
              const hasCheckIn = Boolean(att.check_in || att.checkIn || att.check_in_time);
              const hasCheckOut = Boolean(att.check_out || att.checkOut || att.check_out_time);
              const attDate = String(att.date || att.attendance_date || att.created_at || "").substring(0, 10);
              const isToday = !attDate || attDate === todayStr;
              return isToday && hasCheckIn && !hasCheckOut;
            }).length;

            if (result && typeof result === "object") {
              if (result.topCards) {
                result.topCards.insideAttendees = realInsideToday;
              } else {
                result.insideAttendees = realInsideToday;
              }
            }
          } catch {
            // Keep original if check fails
          }

          cachedOverviewData = result;
          cachedOverviewTime = Date.now();
          return result;
        } else if (response.status === 404) {
          hasOverviewEndpoint = false;
        }
      } catch {
        hasOverviewEndpoint = false;
      }
    }

    // 2. Synthesize real live metrics directly from active backend endpoints
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const [applicationsRes, visitorsRes, attendanceRes, membersRes, bookingsRes] = await Promise.allSettled([
        getAdminMembershipApplications().catch(() => []),
        getAdminVisitorRequestsApi().catch(() => []),
        getAdminAttendanceApi(todayStr).catch(() => ({ data: [] })),
        getAdminMembersApi().catch(() => []),
        getAdminBookingsApi(todayStr).catch(() => []),
      ]);

      const applications = applicationsRes.status === "fulfilled" ? applicationsRes.value : [];
      const visitorPasses = visitorsRes.status === "fulfilled" ? visitorsRes.value : [];
      const attendanceRaw = attendanceRes.status === "fulfilled" ? attendanceRes.value : { data: [] };
      const members = membersRes.status === "fulfilled" ? membersRes.value : [];
      const bookingsList = bookingsRes.status === "fulfilled" && Array.isArray(bookingsRes.value) ? bookingsRes.value : [];

      const pendingApplications = Array.isArray(applications)
        ? applications.filter(
            (app: MembershipApplication) => app.status === "pending"
          ).length
        : 0;

      const rawVisitorPasses = Array.isArray(visitorPasses)
        ? (visitorPasses as Record<string, unknown>[])
        : [];

      const pendingVisitors = rawVisitorPasses.filter((v) => {
        const isPending = v.status === "pending" || v.status === "قيد المراجعة";
        const isNotRejected = v.status !== "rejected" && v.status !== "مرفوض";
        const visitDate = String(v.visit_date || v.visitDate || "").substring(0, 10);
        const isExpired = visitDate && visitDate < todayStr;
        return isPending && isNotRejected && !isExpired;
      }).length;

      const attendanceList = Array.isArray((attendanceRaw as { data?: unknown[] })?.data)
        ? (attendanceRaw as { data: Record<string, unknown>[] }).data
        : Array.isArray(attendanceRaw)
        ? (attendanceRaw as Record<string, unknown>[])
        : [];

      const insideAttendees = attendanceList.filter((att) => {
        const hasCheckIn = Boolean(att.check_in || att.checkIn || att.check_in_time);
        const hasCheckOut = Boolean(att.check_out || att.checkOut || att.check_out_time);
        const attDate = String(att.date || att.attendance_date || att.created_at || "").substring(0, 10);
        const isToday = !attDate || attDate === todayStr;
        return isToday && hasCheckIn && !hasCheckOut;
      }).length;

      const todayBookings = bookingsList.length > 0
        ? bookingsList.slice(0, 10).map((b: Record<string, unknown>, idx: number) => {
            const user = (b.user as Record<string, unknown>) || {};
            const userName = (user.name as string) || (b.userName as string) || (b.name as string) || "عضو مسجل";
            const memberType = (user.member_type as string) || (b.member_type as string);
            const startRaw = (b.start_time as string) || (b.startTime as string) || "";
            const endRaw = (b.end_time as string) || (b.endTime as string) || "";
            const timeStr = startRaw && endRaw ? `${startRaw} - ${endRaw}` : "اليوم";

            return {
              id: (b.id as string | number) || idx + 1,
              name: userName,
              time: timeStr,
              desk: `مقعد #${b.id || idx + 1}`,
              type: memberType === "freelancer" ? "عمل حر" : "طالب",
              reason: (b.notes as string) || "حجز مقعد دراسة/عمل",
            };
          })
        : attendanceList.slice(0, 10).map((att, idx) => ({
            id: (att.id as string | number) || idx + 1,
            name: (att.user_name || att.member_name || att.name || "عضو") as string,
            time: (att.check_in_time || att.check_in || att.time || "اليوم") as string,
            desk: (att.desk || att.seat || `مكتب ${idx + 1}`) as string,
            type: (att.type || (att.role === "freelancer" ? "عمل حر" : att.role === "student" ? "طالب" : "عضو")) as string,
            reason: (att.purpose || att.reason || "حضور مساحة العمل") as string,
          }));

      const needsFollowUp = (Array.isArray(applications) ? applications : [])
        .filter((app) => app.status === "pending")
        .slice(0, 5)
        .map((app) => ({
          name: app.fullName || "طلب جديد",
          subText: app.submissionDate || "بانتظار الاعتماد",
          alertText: "يحتاج لمراجعة وتحديد الحصة",
          badge: app.category || "عضوية",
          phone: app.phone || "",
        }));

      const totalMembers = Array.isArray(members) ? members.length : 0;

      const synthesized = {
        topCards: {
          pendingApplications,
          pendingVisitors,
          insideAttendees,
          totalMembers,
        },
        needsFollowUp,
        todayBookings,
      };

      cachedOverviewData = synthesized;
      cachedOverviewTime = Date.now();
      return synthesized;
    } catch (err) {
      console.warn("Synthesized overview error:", err);
      return {
        topCards: { pendingApplications: 0, pendingVisitors: 0, insideAttendees: 0, totalMembers: 0 },
        needsFollowUp: [],
        todayBookings: [],
      };
    }
  })().finally(() => {
    overviewInFlightPromise = null;
  });

  return overviewInFlightPromise;
}

let hasReportsEndpoint: boolean | null = null;

export async function getAdminReportsApi() {
  if (hasReportsEndpoint !== false) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports`, {
        method: "GET",
        headers: getAdminHeaders(),
        cache: "no-store",
      });

      if (response.ok) {
        hasReportsEndpoint = true;
        return await response.json();
      } else if (response.status === 404) {
        hasReportsEndpoint = false;
      }
    } catch {
      hasReportsEndpoint = false;
    }
  }

  // Gracefully aggregate reports from members and attendance
  try {
    const [membersRes, attendanceRes] = await Promise.allSettled([
      getAdminMembersApi().catch(() => []),
      getAdminAttendanceApi().catch(() => ({ data: [] })),
    ]);

    const members = membersRes.status === "fulfilled" && Array.isArray(membersRes.value) ? membersRes.value : [];
    const attendanceRaw = attendanceRes.status === "fulfilled" ? attendanceRes.value : { data: [] };
    const attendanceList = Array.isArray((attendanceRaw as { data?: unknown[] })?.data)
      ? (attendanceRaw as { data: Record<string, unknown>[] }).data
      : Array.isArray(attendanceRaw)
      ? (attendanceRaw as Record<string, unknown>[])
      : [];

    let students = 0;
    let freelancers = 0;
    let jobseekers = 0;

    members.forEach((m: { membership_type?: string; role?: string }) => {
      const type = (m.membership_type || m.role || "").toLowerCase();
      if (type.includes("student") || type.includes("طالب")) students++;
      else if (type.includes("freelanc") || type.includes("حر")) freelancers++;
      else jobseekers++;
    });

    return {
      categories: { students, freelancers, jobseekers },
      financial: { totalSpent: 0, currentBalance: 0 },
      totalHours: attendanceList.length * 3,
      activeMembersCount: members.length,
      workshops: [],
    };
  } catch {
    return {
      categories: { students: 0, freelancers: 0, jobseekers: 0 },
      financial: { totalSpent: 0, currentBalance: 0 },
      totalHours: 0,
      activeMembersCount: 0,
      workshops: [],
    };
  }
}

/**
 * ── Admin Authentication API ──
 */
export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token: string;
  adminKey?: string;
  admin: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export async function adminLoginApi(
  username: string,
  password: string
): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: username, password }),
  });

  const result = await safeJsonParse<AdminLoginResponse & { user?: AdminLoginResponse["admin"] }>(response);
  if (!response.ok || !result) {
    throw new Error(
      extractErrorMessage(
        result,
        response,
        "اسم المستخدم أو كلمة المرور غير صحيحة."
      )
    );
  }

  const adminData = (result.admin || result.user || {
    id: 1,
    name: "مدير النظام",
    email: username,
    role: "admin",
  }) as AdminLoginResponse["admin"];

  const sessionData = {
    token: result.token,
    admin: adminData,
  };
  setAdminAuthSession(sessionData);

  return {
    success: true,
    message: result.message,
    token: result.token,
    admin: adminData,
  };
}

export function setAdminAuthSession(data: { token: string; admin: unknown }) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
    const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${ADMIN_COOKIE_NAME}=${encodeURIComponent(
      data.token
    )}; path=/; max-age=604800; SameSite=Lax${secureFlag}`;
  }
}

export function clearAdminAuthSession() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${ADMIN_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax${secureFlag}`;
    } catch (e) {
      console.warn("Failed to clear admin auth session:", e);
    }
  }
}

/**
 * Member set password from email verification token
 */
export async function setPasswordApi(data: {
  token: string;
  password: string;
  password_confirmation: string;
}) {
  const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await safeJsonParse<Record<string, unknown>>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "فشل تعيين كلمة المرور."));
  }
  return result;
}

/**
 * ── Live Operational & Public Stats API ──
 */
export interface HubPublicStats {
  powerHours: number;
  internetSpeedMbps: number;
  availableSeats: number;
  activeLearnersCount: number;
  isLive: boolean;
}

let warmupDone = false;
/**
 * Warm up the backend from Render cold sleep on initial app load
 */
export function warmupBackendApi(): void {
  if (warmupDone || typeof window === "undefined") return;
  warmupDone = true;
  fetch(`${API_BASE_URL}/health`, { method: "GET", mode: "no-cors" }).catch(() => {});
}

/**
 * Fetch live public impact and operational telemetry from Laravel backend
 */
export async function getHubPublicStatsApi(): Promise<HubPublicStats> {
  const defaultStats: HubPublicStats = {
    powerHours: 24,
    internetSpeedMbps: 100,
    availableSeats: 50,
    activeLearnersCount: 1500,
    isLive: false,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${API_BASE_URL}/public/stats`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const d = json.data || json;
      return {
        powerHours: typeof d.power_hours === "number" ? d.power_hours : defaultStats.powerHours,
        internetSpeedMbps:
          typeof d.internet_speed === "number" ? d.internet_speed : defaultStats.internetSpeedMbps,
        availableSeats:
          typeof d.available_seats === "number" ? d.available_seats : defaultStats.availableSeats,
        activeLearnersCount:
          typeof d.active_learners === "number" ? d.active_learners : defaultStats.activeLearnersCount,
        isLive: true,
      };
    }
  } catch {
    // Graceful fallback to baseline targets when server is sleeping or route not yet exposed
  }

  return defaultStats;
}




