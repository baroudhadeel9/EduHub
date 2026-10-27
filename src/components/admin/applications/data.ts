export type ApplicationStatus =
  | "pending" // قيد المراجعة والتدقيق
  | "needs_info" // بحاجة لاستكمال بيانات
  | "approved" // معتمد
  | "rejected"; // مرفوض

export interface MembershipApplication {
  id: string;
  applicationNumber: string;
  submissionDate: string;
  status: ApplicationStatus;
  statusNote?: string;
  reviewedBy?: string;
  assignedQuota?: number; // 25 or 35 hours once approved
  temporaryPassword?: string;
  
  // ─── 1. Personal & Contact Information (6 fields) ───
  email: string;
  fullName: string;
  nationalId: string;
  birthDate: string;
  phone: string;
  governorate: "مدينة غزة" | "شمال غزة" | "الوسطى" | "خانيونس";
  detailedAddress: string;

  // ─── 2. Academic & Professional Field (5 fields) ───
  category: "طالب/ة" | "فريلانسر Freelancer" | "باحث عن عمل وتطوير مهارات";
  university?: string;
  specialty: string;
  primaryPurposes: string[];
  durationSchedule: string;
  proofFileName: string;
  proofFileSize: string;
  proofFileUrl?: string;

  // ─── 3. Devices, Power & Attendance Schedule (6 fields) ───
  deviceType: string;
  chargerWattage: string;
  chargerPhotoName: string;
  chargerPhotoUrl?: string;
  powerConnectivityStatus: string;
  preferredShift: string;
  weeklyUsage: string;

  // ─── 4. Photography Consent & Legal Declaration (2 fields) ───
  photographyConsent: "أوافق" | "لا أوافق";
  dataAccuracyConsent: "أقرّ بصحة البيانات المقدمة وأوافق على ما ورد أعلاه." | "لا أوافق";
}

// All data is fetched live from the Laravel API
export const APPLICATIONS_DATA: MembershipApplication[] = [];
