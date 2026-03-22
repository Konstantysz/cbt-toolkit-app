import { scaledFont } from '../fontScale';

describe('scaledFont', () => {
  it("'sm' multiplier = 0.875", () => {
    expect(scaledFont(16, 'sm')).toBeCloseTo(14);
  });

  it("'md' multiplier = 1.0", () => {
    expect(scaledFont(16, 'md')).toBe(16);
  });

  it("'lg' multiplier = 1.2", () => {
    expect(scaledFont(16, 'lg')).toBeCloseTo(19.2);
  });
});
