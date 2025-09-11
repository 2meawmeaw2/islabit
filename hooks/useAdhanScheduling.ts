import { useEffect } from "react";
import {
  ensureNotificationSetup,
  schedulePrayers,
} from "@/lib/reminders/adahnNotifications";
import { registerBackgroundRefresh } from "@/lib/reminders/background";
import { computePrayerTimes } from "@/lib/prayer-times/compute";
import {
  buildParameters,
  defaultPrayerCalcConfig,
} from "@/lib/prayer-times/parameters";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";

export function useAdhanScheduling() {
  const coordinates = usePrayerTimesStore((state) => state.coordinates);
  const isInitialized = usePrayerTimesStore((state) => state.isInitialized);
  useEffect(() => {
    let mounted = true;

    async function setupAdhan() {
      if (!coordinates || !isInitialized) return;

      try {
        await ensureNotificationSetup();
        await registerBackgroundRefresh();

        const params = buildParameters(defaultPrayerCalcConfig);
        const { raw } = computePrayerTimes(
          coordinates.lat,
          coordinates.lng,
          new Date(),
          params
        );
        if (!mounted) return;

        const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
        const upcomingPrayers = prayers
          .map((name) => ({ name, date: (raw as any)[name] as Date }))
          .filter((p) => p.date.getTime() > Date.now());

        await schedulePrayers(upcomingPrayers);
      } catch (error) {
        console.error("Failed to setup Adhan notifications:", error);
      }
    }

    setupAdhan();

    return () => {
      mounted = false;
    };
  }, [coordinates?.lat, coordinates?.lng, isInitialized]);
}
