export type MemberType = "freelancer" | "student";

export type MemberStatus =
  | "extra_hours"
  | "near_limit"
  | "active"
  | "no_booking"
  | "suspended";

export interface MemberRecord {
  id: string;
  name: string;
  email?: string;
  bookingNote?: string;
  type: MemberType;
  hoursUsed: number;
  hoursLimit: number;
  extraHours: number;
  remainingHours: number;
  dueAmount: number;
  lastBooking: string;
  status: MemberStatus;
}
