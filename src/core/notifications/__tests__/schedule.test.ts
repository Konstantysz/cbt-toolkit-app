jest.mock('expo-notifications', () => {
  // Stateful fake: scheduling with an existing identifier replaces it, like the real API.
  const scheduled = new Map<string, unknown>();
  const tick = () => new Promise((r) => setTimeout(r, Math.random() * 5));
  return {
    __scheduled: scheduled,
    SchedulableTriggerInputTypes: { DAILY: 'daily' },
    AndroidImportance: { DEFAULT: 3 },
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
    cancelScheduledNotificationAsync: jest.fn(async (id: string) => {
      await tick();
      scheduled.delete(id);
    }),
    scheduleNotificationAsync: jest.fn(async (req: { identifier: string }) => {
      await tick();
      scheduled.set(req.identifier, req);
      return req.identifier;
    }),
  };
});

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { applyReminder, configureNotifications } from '../schedule';
import { isValidReminderTime } from '../time';
import { pl } from '../../i18n/pl';

const scheduled = (Notifications as unknown as { __scheduled: Map<string, any> }).__scheduled;

beforeEach(() => {
  scheduled.clear();
  jest.clearAllMocks();
});

describe('applyReminder', () => {
  it('schedules a daily reminder with i18n text and parsed time', async () => {
    await applyReminder(true, '08:30');
    const req = [...scheduled.values()][0];
    expect(scheduled.size).toBe(1);
    expect(req.content.title).toBe(pl.settings.notifications.content.title);
    expect(req.content.body).toBe(pl.settings.notifications.content.body);
    expect(req.trigger).toMatchObject({ type: 'daily', hour: 8, minute: 30 });
  });

  it('rapid toggling and time changes leave exactly one reminder at the last time', async () => {
    await Promise.all([
      applyReminder(true, '08:00'),
      applyReminder(false, '08:00'),
      applyReminder(true, '09:15'),
      applyReminder(true, '10:00'),
      applyReminder(false, '10:00'),
      applyReminder(true, '21:45'),
    ]);
    expect(scheduled.size).toBe(1);
    expect([...scheduled.values()][0].trigger).toMatchObject({ hour: 21, minute: 45 });
  });

  it('rapid toggling ending disabled leaves nothing scheduled', async () => {
    await Promise.all([
      applyReminder(true, '08:00'),
      applyReminder(true, '09:00'),
      applyReminder(false, '09:00'),
    ]);
    expect(scheduled.size).toBe(0);
  });

  it('only cancels its own id, never all notifications', async () => {
    await applyReminder(false, '08:00');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('daily-reminder');
  });

  it('rejects a malformed time without scheduling, and later calls still work', async () => {
    await expect(applyReminder(true, 'abc')).rejects.toThrow();
    await expect(applyReminder(true, '25:00')).rejects.toThrow();
    expect(scheduled.size).toBe(0);
    await applyReminder(true, '07:05');
    expect(scheduled.size).toBe(1);
  });

  it('propagates scheduling errors and keeps the queue alive', async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    await expect(applyReminder(true, '08:00')).rejects.toThrow('boom');
    await applyReminder(true, '08:00');
    expect(scheduled.size).toBe(1);
  });
});

describe('configureNotifications', () => {
  it('sets handler and Android channel', async () => {
    Platform.OS = 'android';
    await configureNotifications();
    expect(Notifications.setNotificationHandler).toHaveBeenCalled();
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalled();
  });
});

describe('isValidReminderTime', () => {
  it.each(['00:00', '08:30', '23:59'])('accepts %s', (t) =>
    expect(isValidReminderTime(t)).toBe(true)
  );
  it.each(['8:30', '24:00', '12:60', 'ab:cd', '', '12:30:00'])('rejects %s', (t) =>
    expect(isValidReminderTime(t)).toBe(false)
  );
});
