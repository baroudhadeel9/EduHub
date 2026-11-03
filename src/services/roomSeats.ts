import { getAdminHeaders, safeJsonParse, extractErrorMessage } from "./applications";

const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api/proxy"
    : process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://eduhub-api-uz1z.onrender.com/api";

export interface SeatSlot {
  slot_index: number;
  start_time: string;
  end_time: string;
  label: string;
  is_booked: boolean;
  is_locked: boolean;
  status: "available" | "booked" | "locked";
  booking?: {
    id: number | string;
    user_id: number | string;
    user_name: string;
    user_email?: string;
    user_phone?: string;
    member_type?: string;
    start_time: string;
    end_time: string;
  } | null;
}

export interface SeatItem {
  id: number;
  room_id: number;
  seat_number: number;
  label: string;
  code: string;
  status: "available" | "partially_booked" | "fully_booked" | "locked";
  is_locked: boolean;
  has_power: boolean;
  notes?: string;
  booked_slots_count: number;
  total_slots_count: number;
  occupancy_percentage: number;
  is_available?: boolean;
  can_book_remaining?: boolean;
  availability_label?: string;
  has_conflict?: boolean;
  available_hours_text?: string;
  booked_hours_text?: string;
  free_intervals?: { start: string; end: string; label: string }[];
  booked_intervals?: { start: string; end: string; label: string }[];
  first_free_start?: string;
  first_free_end?: string;
  slots: SeatSlot[];
}

export interface RoomItem {
  id: number;
  room_key: "male_main" | "female_hall" | string;
  name_ar: string;
  name_en?: string;
  gender: "male" | "female" | "mixed";
  capacity: number;
  total_seats_count: number;
  booked_slots_count: number;
  room_occupancy_percentage: number;
  is_closed?: boolean;
  has_full_day_closure?: boolean;
  has_partial_closure?: boolean;
  is_shift_closed?: boolean;
  closure_reason?: string;
  closure_start_time?: string | null;
  closure_end_time?: string | null;
  seats: SeatItem[];
}

export interface RoomOverviewStats {
  total_seats: number;
  available_seats: number;
  partially_booked_seats: number;
  fully_booked_seats: number;
  locked_seats: number;
  total_slot_bookings: number;
  overall_occupancy_percentage: number;
}

export interface TodayBookedSeatUser {
  user_name: string;
  user_phone?: string | null;
  member_type?: string | null;
  time_slot: string;
}

export interface TodayBookedSeatRosterItem {
  seat_id: number;
  seat_number: number;
  label: string;
  room_key: string;
  room_name: string;
  gender: string;
  booked_slots_count: number;
  is_fully_booked: boolean;
  users: TodayBookedSeatUser[];
}

export interface BookingWindowInfo {
  min_date: string;
  max_date: string;
  current_week_thursday?: string;
  next_week_unlocked?: boolean;
  is_friday?: boolean;
  disabled_days_of_week?: number[];
  operating_hours?: {
    start: string;
    end: string;
  };
  message: string;
}

export interface RoomOverviewResponse {
  success: boolean;
  date: string;
  stats: RoomOverviewStats & { total_booked_seats_today?: number };
  rooms: RoomItem[];
  today_booked_roster?: TodayBookedSeatRosterItem[];
  booking_window?: BookingWindowInfo;
}

/**
 * Fetch real-time room and seat matrix overview for a specific date
 */
export async function getRoomsOverviewApi(
  date: string,
  roomKey?: string,
  gender?: string,
  token?: string,
  startTime?: string,
  endTime?: string
): Promise<RoomOverviewResponse> {
  const params = new URLSearchParams({ date });
  if (roomKey && roomKey !== "all") {
    params.set("room", roomKey);
  }
  if (gender && gender !== "all") {
    params.set("gender", gender);
  }
  if (startTime) {
    params.set("start_time", startTime);
  }
  if (endTime) {
    params.set("end_time", endTime);
  }

  const headers: Record<string, string> = token
    ? { Accept: "application/json", Authorization: `Bearer ${token}` }
    : getAdminHeaders();

  const url = token
    ? `${API_BASE_URL}/rooms/overview?${params.toString()}`
    : `${API_BASE_URL}/admin/rooms/overview?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const result = await safeJsonParse<RoomOverviewResponse>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "تعذر تحميل بيانات الصالات والمقاعد."));
  }

  return result;
}

/**
 * Fetch single seat details and full 8:00 - 16:00 slots calendar
 */
export async function getSeatCalendarApi(
  seatId: number | string,
  date: string
): Promise<{ success: boolean; date: string; seat: SeatItem; slots: SeatSlot[] }> {
  const response = await fetch(
    `${API_BASE_URL}/admin/seats/${seatId}/calendar?date=${encodeURIComponent(date)}`,
    {
      method: "GET",
      headers: getAdminHeaders(),
      cache: "no-store",
    }
  );

  const result = await safeJsonParse<{ success: boolean; date: string; seat: SeatItem; slots: SeatSlot[] }>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "تعذر جلب جدول المقعد."));
  }

  return result;
}

/**
 * Toggle seat lock/maintenance status (Lock / Unlock)
 */
export async function toggleSeatLockApi(
  seatId: number | string,
  notes?: string
): Promise<{ success: boolean; message: string; data: SeatItem }> {
  const response = await fetch(`${API_BASE_URL}/admin/seats/${seatId}/toggle-lock`, {
    method: "PATCH",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ notes }),
  });

  const result = await safeJsonParse<{ success: boolean; message: string; data: SeatItem }>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "فشل تغيير حالة المقعد."));
  }

  return result;
}

/**
 * Add a new seat to a room
 */
export async function addRoomSeatApi(
  roomId: number | string,
  payload: {
    seat_number?: number;
    label?: string;
    has_power?: boolean;
    notes?: string;
  }
): Promise<{ success: boolean; message: string; data: SeatItem }> {
  const response = await fetch(`${API_BASE_URL}/admin/rooms/${roomId}/seats`, {
    method: "POST",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  const result = await safeJsonParse<{ success: boolean; message: string; data: SeatItem }>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "تعذر إضافة المقعد الجديد."));
  }

  return result;
}

/**
 * Delete a seat from a room
 */
export async function deleteSeatApi(
  seatId: number | string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/seats/${seatId}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  });

  const result = await safeJsonParse<{ success: boolean; message: string }>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "تعذر حذف المقعد."));
  }

  return result;
}

/**
 * Admin reserves a slot on a seat for a user / guest
 */
export async function adminReserveSeatSlotApi(
  seatId: number | string,
  payload: {
    booking_date: string;
    start_time: string;
    end_time: string;
    user_id?: number | string;
    guest_name?: string;
    guest_phone?: string;
    notes?: string;
  }
): Promise<{ success: boolean; message: string; data: unknown }> {
  const response = await fetch(`${API_BASE_URL}/admin/seats/${seatId}/reserve`, {
    method: "POST",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  const result = await safeJsonParse<{ success: boolean; message: string; data: unknown }>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "فشل تأكيد حجز المقعد."));
  }

  return result;
}

export interface RoomClosureItem {
  id: number;
  room_id: number;
  closure_date: string;
  start_time?: string | null;
  end_time?: string | null;
  reason: string;
  created_by?: number;
  created_at?: string;
  room?: {
    id: number;
    name_ar: string;
    name_en?: string;
    room_key: string;
    gender: "male" | "female";
  };
}

/**
 * Get all scheduled room closures
 */
export async function getAdminRoomClosuresApi(): Promise<{ success: boolean; data: RoomClosureItem[] }> {
  const response = await fetch(`${API_BASE_URL}/admin/room-closures`, {
    method: "GET",
    headers: getAdminHeaders(),
    cache: "no-store",
  });

  const result = await safeJsonParse<{ success: boolean; data: RoomClosureItem[] }>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "تعذر جلب قائمة إغلاقات الصالات."));
  }

  return result;
}

/**
 * Create or update a room closure for a specific date or time range with a reason
 */
export async function createRoomClosureApi(payload: {
  room_id: number | string;
  closure_date: string;
  start_time?: string | null;
  end_time?: string | null;
  is_full_day?: boolean;
  reason: string;
}): Promise<{ success: boolean; message: string; data: RoomClosureItem }> {
  const response = await fetch(`${API_BASE_URL}/admin/room-closures`, {
    method: "POST",
    headers: getAdminHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  const result = await safeJsonParse<{ success: boolean; message: string; data: RoomClosureItem }>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "تعذر حفظ إغلاق الصالة."));
  }

  return result;
}

/**
 * Remove an administrative room closure (reopen room)
 */
export async function deleteRoomClosureApi(id: number | string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/room-closures/${id}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  });

  const result = await safeJsonParse<{ success: boolean; message: string }>(response);
  if (!response.ok || !result) {
    throw new Error(extractErrorMessage(result, response, "تعذر إلغاء إغلاق الصالة."));
  }

  return result;
}

