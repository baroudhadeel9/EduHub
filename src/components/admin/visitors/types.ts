export type VisitorStatus = "pending" | "approved" | "rejected";

export interface VisitorRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  submittedAt: string;
  avatarLetter: string;
  avatarColor: string;
  visitDate: string;
  visitTime: string;
  durationLabel: string;
  isToday?: boolean;
  isVerified?: boolean;
  purposeBadge: string;
  purposeBadgeColor?: string;
  purposeText: string;
  status: VisitorStatus;
}
