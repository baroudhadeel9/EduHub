export type BookingTab = "member" | "new_member" | "visitor";

export interface MemberBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  status: "confirmed" | "cancelled";
  notes?: string;
  canCancel: boolean;
}
