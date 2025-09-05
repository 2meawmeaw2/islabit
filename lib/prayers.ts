import { usePrayerStore } from "@/store/prayerStore";
import { useCallback, useEffect, useState } from "react";
import type { Prayer } from "@/types/salat";

export function useCurrentPrayer() {
  const prayerTimes = usePrayerStore((state) => state.prayerTimes);
  const [currentPrayer, setCurrentPrayer] = useState<Prayer | null>(null);

  const updateCurrentPrayer = useCallback(() => {
    if (!prayerTimes.length) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Find the next prayer time
    const currentPrayerTime = prayerTimes.find((prayer) => {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;
      return currentTime <= prayerMinutes;
    });

    // If no next prayer found, we're after the last prayer of the day
    setCurrentPrayer(currentPrayerTime || prayerTimes[0]);
  }, [prayerTimes]);

  useEffect(() => {
    updateCurrentPrayer();
    const interval = setInterval(updateCurrentPrayer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [updateCurrentPrayer]);

  return currentPrayer;
}
