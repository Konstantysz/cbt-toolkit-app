import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { pl } from '../i18n/pl';
import { isValidReminderTime } from './time';

const REMINDER_ID = 'daily-reminder';
const CHANNEL_ID = 'daily-reminder';

let queue: Promise<unknown> = Promise.resolve();

/** Serializes tasks so concurrent callers never interleave cancel/schedule. */
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: pl.settings.notifications.channelName,
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/**
 * Makes the scheduled state match the desired state: exactly one daily reminder
 * at `time` when enabled, none otherwise. Only the reminder's own id is touched.
 */
export function applyReminder(enabled: boolean, time: string): Promise<void> {
  return enqueue(async () => {
    if (!enabled) {
      await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
      return;
    }
    if (!isValidReminderTime(time)) throw new Error(`Invalid reminder time: ${time}`);
    const [hour, minute] = time.split(':').map(Number);
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: pl.settings.notifications.content.title,
        body: pl.settings.notifications.content.body,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: CHANNEL_ID,
      },
    });
  });
}
