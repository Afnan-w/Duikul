const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

const BN_WEEKDAYS = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EN_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export type UiLang = "bn" | "en";

export function toBanglaDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);
}

/** Calendar fields in Asia/Dhaka, independent of the server's timezone. */
function dhakaParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const weekdayShort = get("weekday");
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekdayShort,
  );

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekdayIndex: weekdayIndex >= 0 ? weekdayIndex : 0,
  };
}

export function formatMastheadDate(date: Date, lang: UiLang = "bn"): string {
  const { year, month, day, weekdayIndex } = dhakaParts(date);

  if (lang === "en") {
    return `${EN_WEEKDAYS[weekdayIndex]}, ${day} ${EN_MONTHS[month - 1]} ${year}`;
  }

  return `${BN_WEEKDAYS[weekdayIndex]}, ${toBanglaDigits(day)} ${
    BN_MONTHS[month - 1]
  } ${toBanglaDigits(year)}`;
}

export function formatShortDate(date: Date, lang: UiLang = "bn"): string {
  const { year, month, day } = dhakaParts(date);
  if (lang === "en") {
    return `${day} ${EN_MONTHS[month - 1]} ${year}`;
  }
  return `${toBanglaDigits(day)} ${BN_MONTHS[month - 1]} ${toBanglaDigits(year)}`;
}

function relativeUnit(
  count: number,
  singularBn: string,
  pluralBn: string,
  singularEn: string,
  pluralEn: string,
  lang: UiLang,
): string {
  if (lang === "en") {
    return `${count} ${count === 1 ? singularEn : pluralEn} ago`;
  }
  return `${toBanglaDigits(count)} ${count === 1 ? singularBn : pluralBn} আগে`;
}

export function formatRelativeTime(
  input: string | Date,
  lang: UiLang = "bn",
  now = new Date(),
): string {
  const date = input instanceof Date ? input : new Date(input);
  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (!Number.isFinite(seconds) || seconds < 60) {
    return lang === "en" ? "Just now" : "এইমাত্র";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return relativeUnit(
      minutes,
      "মিনিট",
      "মিনিট",
      "minute",
      "minutes",
      lang,
    );
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return relativeUnit(hours, "ঘণ্টা", "ঘণ্টা", "hour", "hours", lang);
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return relativeUnit(days, "দিন", "দিন", "day", "days", lang);
  }

  return formatShortDate(date, lang);
}

export function formatDateTime(date: Date, lang: UiLang = "bn"): string {
  return `${formatShortDate(date, lang)}, ${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)}`;
}

export function isFresh(date: Date, hours = 48, now = new Date()): boolean {
  return now.getTime() - date.getTime() <= hours * 60 * 60 * 1000;
}
