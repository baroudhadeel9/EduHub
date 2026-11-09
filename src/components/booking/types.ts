export type BookingTab = "member" | "new_member" | "visitor";

export interface MemberBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  status: "confirmed" | "cancelled" | "attended" | "inside" | "no_show" | string;
  notes?: string;
  canCancel: boolean;
  seatNumber?: number;
  seatLabel?: string;
  seatCode?: string;
  roomName?: string;
  // Rich attendance details
  dayName?: string;
  bookingDateFormatted?: string;
  attendanceStatus?: "attended" | "inside" | "no_show" | "cancelled" | "confirmed" | string;
  statusBadge?: "attended" | "inside" | "no_show" | "cancelled" | "confirmed" | string;
  statusLabel?: string;
  attendanceSummary?: string;
  checkInTime?: string;
  checkOutTime?: string;
  recordedHours?: number;
  cancellationReason?: string;
}
