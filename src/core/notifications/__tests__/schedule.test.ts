jest.mock('expo-notifications');

const mockScheduleNotificationAsync = jest.fn().mockResolvedValue('notification-id');
const mockCancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined);
const mockGetAllScheduledNotificationsAsync = jest.fn().mockResolvedValue([]);

import * as Notifications from 'expo-notifications';
import { scheduleReminder, cancelReminder } from '../schedule';

(Notifications.scheduleNotificationAsync as jest.Mock) = mockScheduleNotificationAsync;
(Notifications.cancelAllScheduledNotificationsAsync as jest.Mock) =
  mockCancelAllScheduledNotificationsAsync;
(Notifications.getAllScheduledNotificationsAsync as jest.Mock) =
  mockGetAllScheduledNotificationsAsync;
(Notifications.SchedulableTriggerInputTypes as any) = { DAILY: 'daily' };

beforeEach(() => jest.clearAllMocks());

describe('scheduleReminder', () => {
  it('calls scheduleNotificationAsync with correct title, body, and daily trigger for "08:30"', async () => {
    await scheduleReminder('08:30');

    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const call = mockScheduleNotificationAsync.mock.calls[0][0] as {
      content: { title: string; body: string };
      trigger: { type: string; hour: number; minute: number };
    };
    expect(call.content.title).toBe('Czas na refleksję');
    expect(call.content.body).toBe('Zapisz swoje myśli i emocje');
    expect(call.trigger.type).toBe('daily');
    expect(call.trigger.hour).toBe(8);
    expect(call.trigger.minute).toBe(30);
  });

  it('parses "20:00" correctly (hour=20, minute=0)', async () => {
    await scheduleReminder('20:00');

    const call = mockScheduleNotificationAsync.mock.calls[0][0] as {
      trigger: { hour: number; minute: number };
    };
    expect(call.trigger.hour).toBe(20);
    expect(call.trigger.minute).toBe(0);
  });
});

describe('cancelReminder', () => {
  it('calls cancelAllScheduledNotificationsAsync', async () => {
    await cancelReminder();
    expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});
