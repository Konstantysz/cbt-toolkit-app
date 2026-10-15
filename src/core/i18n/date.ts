import { format, parseISO } from 'date-fns';
import { pl as plLocale } from 'date-fns/locale';

/** The single place for date-fns locale and display patterns. */
export const DATE_FORMATS = {
  long: 'd MMMM yyyy',
  longTime: 'd MMMM yyyy · HH:mm',
  short: 'd MMM yyyy',
  shortTime: 'd MMM yyyy · HH:mm',
} as const;

export type DateFormatKind = keyof typeof DATE_FORMATS;

export function formatDate(value: Date | string, kind: DateFormatKind): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, DATE_FORMATS[kind], { locale: plLocale });
}
