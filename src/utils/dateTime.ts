// Helper to get local date string YYYY-MM-DD
export function getLocalDateString(offsetDays: number = 0, baseDateStr?: string): string {
  const d = baseDateStr ? new Date(baseDateStr) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to clean booking date (strips T00:00:00.000000Z or trailing zeros/Z)
export function cleanBookingDate(dateStr?: string): string {
  if (!dateStr) return "";
  const s = String(dateStr).trim();
  if (s.includes("T")) {
    return s.split("T")[0];
  }
  if (s.includes(" ")) {
    return s.split(" ")[0];
  }
  return s.replace(/\.0+Z?$/i, "").replace(/Z$/i, "");
}

// Helper to format booking date with day name in Arabic (e.g., "الثلاثاء، 2026-11-03")
export function formatBookingDayAndDate(dateStr?: string, isRTL: boolean = true): {
  dayName: string;
  cleanDate: string;
  formattedWithDay: string;
} {
  const clean = cleanBookingDate(dateStr);
  if (!clean) return { dayName: "", cleanDate: "", formattedWithDay: "" };

  try {
    const parts = clean.split("-");
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const dayOfWeek = d.getDay();
    const arDayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const enDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = isRTL ? arDayNames[dayOfWeek] : enDayNames[dayOfWeek];
    return {
      dayName: dayName || "",
      cleanDate: clean,
      formattedWithDay: dayName ? (isRTL ? `${dayName}، ${clean}` : `${dayName}, ${clean}`) : clean,
    };
  } catch {
    return { dayName: "", cleanDate: clean, formattedWithDay: clean };
  }
}

// Helper to format time into 12-hour format with Arabic AM/PM (e.g., "13:00" -> "1 م", "08:00" -> "8 ص")
export function formatHour12(timeStr?: string): string {
  if (!timeStr) return "";
  const clean = String(timeStr).trim().replace(/[A-Za-z]/g, "");
  const parts = clean.split(":");
  let hour = parseInt(parts[0], 10);
  if (isNaN(hour)) return timeStr;
  const minute = parts[1] && parts[1].length >= 2 ? parts[1].slice(0, 2) : "00";
  const period = hour >= 12 ? "م" : "ص";
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return minute === "00" ? `${hour} ${period}` : `${hour}:${minute} ${period}`;
}

// Helper to format booking creation timestamp without raw ISO zeros or Z
export function formatBookingCreatedAt(dateStr?: string, isRTL: boolean = true): string {
  if (!dateStr) return isRTL ? "حجز مباشر" : "Direct";
  try {
    const cleanStr = String(dateStr).trim();
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) {
      return cleanBookingDate(cleanStr);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? (isRTL ? "م" : "PM") : (isRTL ? "ص" : "AM");
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;

    const timeFormatted = `${hours}:${minutes} ${period}`;
    return `${year}-${month}-${day} (${timeFormatted})`;
  } catch {
    return cleanBookingDate(dateStr);
  }
}

export interface AllowedWeekDate {
  date: string; // "YYYY-MM-DD"
  dayNameAr: string; // "السبت", "الأحد", etc.
  dayNameEn: string; // "Saturday", "Sunday", etc.
  dayNumber: number; // 31
  monthNumber: number; // 10
  formattedShort: string; // "31/10"
  fullLabelAr: string; // "السبت (31/10)"
  fullLabelEn: string; // "Saturday (31/10)"
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isNextWeek?: boolean;
}

/**
 * Returns strictly the allowed dates of the week where members can book and attend.
 * EduHub working days: Saturday to Thursday (Friday is day-off / closed).
 * If today is Thursday after 16:00 or Friday, next week's allowed days are also unlocked.
 */
export function getAllowedWeekDates(referenceDate?: Date): {
  currentWeek: AllowedWeekDate[];
  nextWeek: AllowedWeekDate[];
  allAllowed: AllowedWeekDate[];
  defaultDate: string;
} {
  const now = referenceDate ? new Date(referenceDate) : new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // In Gaza/Arab working week, work week starts on Saturday (day 6)
  const daysSinceSaturday = (dayOfWeek + 1) % 7;
  const currentSaturday = new Date(now);
  currentSaturday.setDate(currentSaturday.getDate() - daysSinceSaturday);
  currentSaturday.setHours(0, 0, 0, 0);

  const arDayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const enDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const buildWeekDays = (startSat: Date, isNextWeek: boolean = false): AllowedWeekDate[] => {
    const list: AllowedWeekDate[] = [];
    // 6 working days: Saturday (0) through Thursday (5). Day 6 (Friday) is day-off!
    for (let i = 0; i < 6; i++) {
      const cur = new Date(startSat);
      cur.setDate(startSat.getDate() + i);

      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      const curDayIndex = cur.getDay();
      const dayNameAr = arDayNames[curDayIndex];
      const dayNameEn = enDayNames[curDayIndex];
      const isToday = cur.toDateString() === now.toDateString();

      const todayZero = new Date(now);
      todayZero.setHours(0, 0, 0, 0);
      const isPast = cur.getTime() < todayZero.getTime();
      const isFuture = cur.getTime() > todayZero.getTime();

      list.push({
        date: dateStr,
        dayNameAr,
        dayNameEn,
        dayNumber: cur.getDate(),
        monthNumber: cur.getMonth() + 1,
        formattedShort: `${cur.getDate()}/${cur.getMonth() + 1}`,
        fullLabelAr: `${dayNameAr} (${cur.getDate()}/${cur.getMonth() + 1})`,
        fullLabelEn: `${dayNameEn} (${cur.getDate()}/${cur.getMonth() + 1})`,
        isToday,
        isPast,
        isFuture,
        isNextWeek,
      });
    }
    return list;
  };

  const currentWeek = buildWeekDays(currentSaturday, false);

  // Check if next week is unlocked: Thursday after 16:00 or Friday
  const isThursdayAfter4 = dayOfWeek === 4 && currentTimeStr >= "16:00";
  const isFriday = dayOfWeek === 5;
  const isNextWeekUnlocked = isThursdayAfter4 || isFriday;

  let nextWeek: AllowedWeekDate[] = [];
  if (isNextWeekUnlocked) {
    const nextSaturday = new Date(currentSaturday);
    nextSaturday.setDate(nextSaturday.getDate() + 7);
    nextWeek = buildWeekDays(nextSaturday, true);
  }

  const allAllowed = [...currentWeek, ...nextWeek];

  let defaultDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (isFriday) {
    defaultDate = nextWeek.length > 0 ? nextWeek[0].date : currentWeek[currentWeek.length - 1].date;
  }

  return {
    currentWeek,
    nextWeek,
    allAllowed,
    defaultDate,
  };
}


