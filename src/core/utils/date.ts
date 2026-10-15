/** Local calendar date as YYYY-MM-DD (device timezone, not UTC). */
export function toLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Polish locale and 24-hour time for DateTimePicker (iOS uses locale, Android uses is24Hour). */
export const PICKER_LOCALE_PROPS = { locale: 'pl-PL', is24Hour: true } as const;
