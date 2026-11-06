/* Date and time formatting for both languages.

   Two important details:
   - The timezone is FIXED to Asia/Dhaka so the server and the browser
     always print the same thing (no flicker when pages load).
   - 24-hour time, so Bangla text never mixes in "AM/PM".
*/

export const SITE_TIMEZONE = "Asia/Dhaka";

export function formatDateTime(iso: string, lang: "bn" | "en"): string {
  const date = new Date(iso);
  const locale = lang === "bn" ? "bn-BD" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    timeZone: SITE_TIMEZONE,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function formatDate(iso: string, lang: "bn" | "en"): string {
  const date = new Date(iso);
  const locale = lang === "bn" ? "bn-BD" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    timeZone: SITE_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
