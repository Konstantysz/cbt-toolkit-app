import * as Notifications from 'expo-notifications';

export async function scheduleReminder(time: string): Promise<void> {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Czas na refleksję',
      body: 'Zapisz swoje myśli i emocje',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
