// lib/adhan/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface PrayerSlot {
  name: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  date: Date; // absolute Date for the prayer time
}

// Call this once early (app start) before scheduling
export async function ensureNotificationSetup(): Promise<void> {
  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === "android") {
    // Ensure a high-importance channel with custom sound
    await Notifications.setNotificationChannelAsync("adhan", {
      name: "الآذان",
      importance: Notifications.AndroidImportance.MAX,
      sound: "sins", // no extension; must match res/raw or bundled asset mapping
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });
  }

  // Global handler (optional)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function cancelAllPrayerNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function schedulePrayers(prayers: PrayerSlot[]): Promise<void> {
  // Assumes setup done
  await cancelAllPrayerNotifications();

  for (const p of prayers) {
    console.log("p.date", p.date);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titleForPrayer(p.name),
        body: ` ${p.date.toLocaleTimeString()}`,
        sound: Platform.select({
          ios: "sins.wav", // bundled ≤30s
          android: "sins", // channel sound name
          default: "sins",
        }),
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: {
        channelId: "adhan",
        date: p.date, // exact calendar time trigger
      } as any,
    });
  }
}

function titleForPrayer(name: PrayerSlot["name"]): string {
  switch (name) {
    case "fajr":
      return "الفجر";
    case "dhuhr":
      return "الظهر";
    case "asr":
      return "العصر";
    case "maghrib":
      return "المغرب";
    case "isha":
      return "العشاء";
  }
}
