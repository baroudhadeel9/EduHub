/**
 * WhatsApp Helper & Messaging Utility for EduHub
 */

export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/[^0-9]/g, "");

  // Palestinian local format (059xxxxxxx, 056xxxxxxx)
  if (digits.startsWith("0")) {
    digits = "972" + digits.substring(1);
  } else if (!digits.startsWith("972") && !digits.startsWith("970")) {
    digits = "972" + digits;
  }

  return digits;
}

export function buildWhatsAppLink(phone: string, text: string): string {
  const formatted = formatWhatsAppNumber(phone);
  if (!formatted) return "";
  return `https://wa.me/${formatted}?text=${encodeURIComponent(text.trim())}`;
}

export interface WhatsAppTemplate {
  id: string;
  titleAr: string;
  titleEn: string;
  iconName: string;
  generateText: (params: {
    memberName: string;
    setPasswordUrl?: string;
    bookingDate?: string;
    bookingTime?: string;
    deskName?: string;
    remainingHours?: number;
    customNote?: string;
  }) => string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "activation",
    titleAr: "رابط تفعيل الحساب وكلمة المرور",
    titleEn: "Activation & Set Password Link",
    iconName: "Key",
    generateText: ({ memberName, setPasswordUrl }) =>
      `مرحباً ${memberName} 👋\n\nنتواصل معك من إدارة مساحة EduHub غزة.\nتم اعتماد عضويتك بنجاح! يمكنك الآن تعيين كلمة المرور لحسابك للبدء بحجز مقعدك الدراسي عبر الرابط التالي:\n\n🔗 ${setPasswordUrl || "[رابط التفعيل]"}\n\n⚠️ ملاحظة: الرابط صالح لمدة 48 ساعة.\nنتمنى لك أوقاتاً دراسية وعملاً مثمراً معنا! ✨`,
  },
  {
    id: "booking_reminder",
    titleAr: "تذكير بموعد الحجز اليومي",
    titleEn: "Booking Schedule Reminder",
    iconName: "Calendar",
    generateText: ({ memberName, bookingDate, bookingTime, deskName }) =>
      `مرحباً ${memberName} 👋\n\nنود تذكيرك بحجز مقعدك في مساحة EduHub غزة:\n📅 التاريخ: ${bookingDate || "اليوم"}\n⏰ الموعد: ${bookingTime || "09:00 ص – 04:00 م"}${deskName ? `\n🪑 المقعد: ${deskName}` : ""}\n\nيرجى تأكيد حضورك عند الاستقبال وتسجيل الدخول. أهلاً بك! 🌟`,
  },
  {
    id: "quota_alert",
    titleAr: "تنبيه رصيد الساعات الشهري",
    titleEn: "Monthly Quota Status",
    iconName: "Clock",
    generateText: ({ memberName, remainingHours }) =>
      `مرحباً ${memberName} 👋\n\nنود إعلامك بأن رصيدك المتبقي من الساعات لهذا الشهر في مساحة EduHub هو: (${remainingHours ?? 0} ساعة).\n\nإذا كنت ترغب بإضافة باقة ساعات إضافية أو تجديد اشتراكك، يسعدنا تواصلك مع إدارة الاستقبال. بالتوفيق! 💡`,
  },
  {
    id: "general_notice",
    titleAr: "تنبيه أو إشعار إداري",
    titleEn: "Administrative Notice",
    iconName: "Bell",
    generateText: ({ memberName, customNote }) =>
      `مرحباً ${memberName} 👋\n\nنتواصل معك من إدارة مساحة EduHub غزة:\n\n${customNote || "نود إعلامك بمستجدات دوام المساحة."}\n\nشاكرين تعاونك والتزامك معنا! 🌿`,
  },
];

