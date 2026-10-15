import { toLocalDateKey } from '../date';

describe('toLocalDateKey', () => {
  it('runs in the Europe/Warsaw timezone', () => {
    expect(new Date('2026-10-14T22:30:00Z').getHours()).toBe(0);
  });

  it('returns the local date for 00:30 Polish time, not the UTC date', () => {
    // 00:30 CEST on 2026-10-15 is 22:30 UTC on 2026-10-14.
    const justAfterMidnight = new Date('2026-10-14T22:30:00Z');
    expect(toLocalDateKey(justAfterMidnight)).toBe('2026-10-15');
    expect(justAfterMidnight.toISOString().split('T')[0]).toBe('2026-10-14');
  });

  it('zero-pads month and day', () => {
    expect(toLocalDateKey(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
  });
});
