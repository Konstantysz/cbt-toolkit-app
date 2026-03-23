jest.mock('expo-notifications');

const mockRequestPermissionsAsync = jest.fn();

import * as Notifications from 'expo-notifications';
import { requestPermissions } from '../permissions';

(Notifications.requestPermissionsAsync as jest.Mock) = mockRequestPermissionsAsync;

beforeEach(() => jest.clearAllMocks());

describe('requestPermissions', () => {
  it('returns true when status is granted', async () => {
    mockRequestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    const result = await requestPermissions();
    expect(result).toBe(true);
  });

  it('returns false when status is denied', async () => {
    mockRequestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const result = await requestPermissions();
    expect(result).toBe(false);
  });

  it('returns false when status is undetermined', async () => {
    mockRequestPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
    const result = await requestPermissions();
    expect(result).toBe(false);
  });
});
