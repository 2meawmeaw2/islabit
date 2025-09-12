// lib/adhan/background.ts
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import dayjs from "dayjs";
import { computePrayerTimes } from "../prayer-times/compute";
import { defaultPrayerCalcConfig } from "../prayer-times/parameters";
import { buildParameters } from "../prayer-times/parameters";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";
import { schedulePrayers, ensureNotificationSetup } from "./adahnNotifications";
const TASK_NAME = "ADHAN_BACKGROUND_REFRESH";

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    // Compute today’s five prayers using your existing utilities

    const coords = await getSavedCoordinates();
    if (!coords) return BackgroundFetch.BackgroundFetchResult.NoData;

    const params = buildParameters(defaultPrayerCalcConfig);
    const today = new Date();
    const { raw } = computePrayerTimes(coords.lat, coords.lng, today, params);

    const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
    const slots = prayers
      .map((k) => ({ name: k, date: (raw as any)[k] as Date }))
      .filter((s) => s.date.getTime() > Date.now());

    await ensureNotificationSetup();
    await schedulePrayers(slots);

    // Optionally schedule Fajr for tomorrow if today passed
    if (slots.length === 0) {
      const tomorrow = dayjs(today).add(1, "day").toDate();
      const { raw: rawTomorrow } = computePrayerTimes(
        coords.lat,
        coords.lng,
        tomorrow,
        params
      );
      const fajrTomorrow = (rawTomorrow as any)?.fajr as Date | undefined;
      if (fajrTomorrow) {
        await schedulePrayers([{ name: "fajr", date: fajrTomorrow }]);
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundRefresh(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (isRegistered) return;
  await BackgroundFetch.registerTaskAsync(TASK_NAME, {
    minimumInterval: 60 * 60, // try hourly; OS decides when to run
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterBackgroundRefresh(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
  } catch {}
}

// Replace with your app’s persistent coordinates (e.g., from Zustand or SecureStore)
async function getSavedCoordinates(): Promise<{
  lat: number;
  lng: number;
} | null> {
  // Read from Zustand store (persist if you later add persistence)
  const coords = usePrayerTimesStore.getState().coordinates;
  return coords;
}
