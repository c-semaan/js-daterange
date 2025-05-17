/**
 * Converts a date into a human-readable relative time string using `Intl.RelativeTimeFormat`.
 *
 * @param date - The date to compare against the current time. Can be a `Date` object, a timestamp, or an ISO string.
 * @param locale - Optional BCP 47 locale string (e.g., `'en'`, `'fr'`, `'ar'`). Defaults to `'en'`.
 * @returns A localized string representing the relative time, such as "5 minutes ago" or "in 2 hours".
 *
 * @example
 * timeAgo(Date.now() - 60000); // "1 minute ago"
 *
 * @example
 * timeAgo('2025-05-17T10:00:00Z'); // e.g., "3 hours ago"
 *
 * @example
 * timeAgo(Date.now() + 3600000, 'fr'); // "dans 1 heure"
 *
 * @remarks
 * - Future dates are supported and will produce strings like "in 2 days".
 * - Uses `Intl.RelativeTimeFormat`, which ensures proper pluralization and localization.
 */
export function timeAgo(date: Date | string | number, locale = "en"): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((past.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const ranges: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"], // < 1 minute
    [3600, "minute"], // < 1 hour
    [86400, "hour"], // < 1 day
    [604800, "day"], // < 1 week
    [2592000, "week"], // < 1 month
    [31536000, "month"], // < 1 year
    [Infinity, "year"], // > 1 year
  ];

  const absDiff = Math.abs(diffInSeconds);

  for (let i = 0; i < ranges.length; i++) {
    const [threshold, unit] = ranges[i];
    if (absDiff < threshold) {
      const prevThreshold = i === 0 ? 1 : ranges[i - 1][0];
      const value = Math.round(diffInSeconds / prevThreshold);
      return rtf.format(value, unit);
    }
  }

  return rtf.format(0, "second");
}
