const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidReminderTime(time: unknown): time is string {
  return typeof time === 'string' && HHMM.test(time);
}
