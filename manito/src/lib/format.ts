/**
 * Display formatting.
 *
 * Locale and time zone are pinned so that a string rendered on the server
 * matches the one React would produce in the browser — otherwise every date on
 * the page becomes a hydration mismatch. When the app goes multi-city, this is
 * the file that starts reading the user's locale instead.
 */

const LOCALE = "en-US";
const TIME_ZONE = "America/Mexico_City";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const moneyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function formatDate(value: Date | string): string {
  return dateFormatter.format(new Date(value));
}

/** "today" / "3 days ago" / a date once it stops being interesting. */
export function formatRelativeDay(value: Date | string): string {
  const then = new Date(value);
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return formatDate(then);
}

export function formatMoney(amount: number): string {
  return moneyFormatter.format(amount);
}

/** Ratings always show one decimal, so cards don't jump between 4 and 4.5. */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
