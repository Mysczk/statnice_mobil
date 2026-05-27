import * as Notifications from 'expo-notifications';

// Jak se zobrazí notifikace když je appka v popředí
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleInactivityNotification(delaySeconds: number = 300): Promise<string> {
  // Zruší předchozí naplánovanou notifikaci
  await Notifications.cancelAllScheduledNotificationsAsync();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏃 Čas se hýbat!',
      body: 'Už chvíli není zaznamenána žádná aktivita. Jak to jde?',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
      repeats: false,
    },
  });

  return id;
}

export async function cancelInactivityNotification(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}