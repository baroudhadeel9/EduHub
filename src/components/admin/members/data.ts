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
  duration: string;
  desk: string;
  purpose: string;
  status: "completed" | "active" | "cancelled";
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
  history: BookingHistoryItem[];
  registration?: MemberRegistrationDetails;
}

// All data is fetched live from the Laravel API
export const MEMBERS_DATA: MemberRecord[] = [];
