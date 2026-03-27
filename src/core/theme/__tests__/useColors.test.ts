jest.mock('../../settings/store', () => ({
  useSettings: jest.fn(),
}));

import { useColors } from '../useColors';
import { useSettings } from '../../settings/store';
import { colors, highContrastColors } from '../index';

describe('useColors', () => {
  it('returns colors when highContrast is false', () => {
    (useSettings as unknown as jest.Mock).mockImplementation(
      (sel: (s: { highContrast: boolean }) => boolean) => sel({ highContrast: false })
    );
    expect(useColors()).toBe(colors);
  });

  it('returns highContrastColors when highContrast is true', () => {
    (useSettings as unknown as jest.Mock).mockImplementation(
      (sel: (s: { highContrast: boolean }) => boolean) => sel({ highContrast: true })
    );
    expect(useColors()).toBe(highContrastColors);
  });
});
