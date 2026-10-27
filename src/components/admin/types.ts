export type AttendanceStatus = "inside" | "waiting" | "left";
export type MemberType = "student" | "freelancer" | "visitor";

export interface AttendanceRecord {
  id: string;
  name: string;
  avatarLetter: string;
  avatarColor: string;
  type: MemberType;
  subText: string;
  bookingTime: string;
  arrivalTime: string;
  departureTime: string;
  actualDuration: string;
  status: AttendanceStatus;
  userId?: number | string;
  bookingId?: number | string;
  visitorPassId?: number | string;
  phone?: string;
  nationalId?: string;
}

export type FilterOption = "all" | "inside" | "waiting" | "left";
