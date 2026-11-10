import type { MemberAchievementItem } from "@/services/achievements";

export type MemberType = "freelancer" | "student";

export type MemberStatus =
  | "extra_hours"
  | "near_limit"
  | "active"
  | "no_booking"
  | "suspended";

export interface BookingHistoryItem {
  id: string;
  date: string;
  day_name?: string;
  date_formatted?: string;
  duration: string;
  desk: string;
  room?: string;
  purpose: string;
  status: "completed" | "active" | "cancelled" | "attended" | "inside" | "no_show" | "confirmed" | string;
  status_label?: string;
  attended_range?: string;
  check_in_time?: string;
  check_out_time?: string;
  recorded_hours?: number;
}

export interface MemberRegistrationDetails {
  fullName: string;
  category: "طالب/ة" | "فريلانسر Freelancer" | "باحث عن عمل وتطوير مهارات";
  nationalId: string;
  birthDate: string;
  phone: string;
  governorate: "مدينة غزة" | "شمال غزة" | "الوسطى" | "خانيونس";
  detailedAddress: string;
  university?: string;
  specialty: string;
  primaryPurposes: string[];
  durationSchedule: string;
  proofFileName: string;
  proofFileSize: string;
  deviceType: string;
  chargerWattage: string;
  chargerPhotoName: string;
  powerConnectivityStatus: string;
  preferredShift: string;
  weeklyUsage: string;
  photographyConsent: "أوافق" | "لا أوافق";
  dataAccuracyConsent: "أقرّ بصحة البيانات المقدمة وأوافق على ما ورد أعلاه." | "لا أوافق";
  applicationDate?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface MemberRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: "male" | "female";
  nationalId?: string;
  avatarLetter: string;
  avatarColor: string;
  type: MemberType;
  specialty: string;
  joinedDate: string;
  bookingNote?: string;
  hoursUsed: number;
  hoursLimit: number;
  extraHours: number;
  remainingHours: number;
  dueAmount: number;
  lastBooking: string;
  status: MemberStatus;
  hasPassword?: boolean;
  isPasswordSet?: boolean;
  history: BookingHistoryItem[];
  registration?: MemberRegistrationDetails;
  achievements?: MemberAchievementItem[];
  achievementsCount?: number;
}

// All data is fetched live from the Laravel API
export const MEMBERS_DATA: MemberRecord[] = [];
