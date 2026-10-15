import { plural } from '../plural';
import { matchesQuery } from '../search';
import { formatDate } from '../date';

describe('plural', () => {
  it.each([
    [1, 'wpis'],
    [2, 'wpisy'],
    [4, 'wpisy'],
    [5, 'wpisów'],
    [12, 'wpisów'],
    [22, 'wpisy'],
    [0, 'wpisów'],
    [112, 'wpisów'],
  ])('%i -> %s', (n, expected) => {
    expect(plural(n, 'wpis', 'wpisy', 'wpisów')).toBe(expected);
  });
});

describe('matchesQuery', () => {
  it('ignores diacritics and case in both directions', () => {
    expect(matchesQuery('Łódź była żółta', 'lodz')).toBe(true);
    expect(matchesQuery('Lodz', 'ŁÓDŹ')).toBe(true);
    expect(matchesQuery('zolta', 'żółta')).toBe(true);
    expect(matchesQuery('abc', 'xyz')).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats with the Polish locale', () => {
    expect(formatDate(new Date(2024, 2, 5, 10, 30), 'long')).toBe('5 marca 2024');
    expect(formatDate('2024-03-05T10:30:00', 'shortTime')).toBe('5 mar 2024 · 10:30');
  });
});
