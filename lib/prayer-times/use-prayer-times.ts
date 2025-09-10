// hooks/use-prayer-times.ts
import { useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import { buildParameters, defaultPrayerCalcConfig } from "./parameters";
import { computePrayerTimes } from "./compute";

export interface UsePrayerTimesResult {
  isLoading: boolean;
  error?: string;
  formatted?: ReturnType<typeof computePrayerTimes>["formatted"];
  next?: ReturnType<typeof computePrayerTimes>["next"];
  coords?: { lat: number; lng: number };
  /** Absolute Date of the upcoming prayer */
  nextAt?: Date;
  /** Milliseconds remaining to the next prayer (clamped to >= 0) */
  msUntilNext?: number;
  /** HH:mm:ss string for UI countdowns */
  timeUntilNext?: string;
  refresh: () => void;
}

/** Small helper to format a millisecond duration as HH:mm:ss */
function formatHHMMSS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function usePrayerTimes(): UsePrayerTimesResult {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [coords, setCoords] = useState<
    { lat: number; lng: number } | undefined
  >();
  const [dateKey, setDateKey] = useState(() => new Date().toDateString());
  const [now, setNow] = useState<Date>(new Date());

  // Tick every second for a live countdown
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setError(undefined);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission denied");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        setError("Failed to get location");
      } finally {
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dateKey]);

  const result = useMemo(() => {
    if (!coords) return undefined;
    const params = buildParameters(defaultPrayerCalcConfig);
    return computePrayerTimes(coords.lat, coords.lng, new Date(), params);
  }, [coords, dateKey]);

  // Derive the absolute Date of the next prayer and the live countdown
  const { nextAt, msUntilNext, timeUntilNext } = useMemo(() => {
    if (!coords || !result)
      return {
        nextAt: undefined,
        msUntilNext: undefined,
        timeUntilNext: undefined,
      };

    const params = buildParameters(defaultPrayerCalcConfig);
    const today = new Date();

    // We assume computePrayerTimes returns a "raw" map with Date objects.
    // If your computePrayerTimes doesn’t expose `raw`, see the note below.
    const rawToday = (result as any).raw as
      | {
          fajr: Date;
          sunrise: Date;
          dhuhr: Date;
          asr: Date;
          maghrib: Date;
          isha: Date;
        }
      | undefined;

    // If raw times aren’t available, we can’t safely compute the delta here.
    if (!rawToday)
      return {
        nextAt: undefined,
        msUntilNext: undefined,
        timeUntilNext: undefined,
      };

    let candidate: Date | undefined;

    // Typical shape: result.next = { current: 'asr' | 'none', next: 'maghrib' | null }
    const nextName = (result as any).next?.next as
      | keyof typeof rawToday
      | null
      | undefined;

    if (nextName && rawToday[nextName]) {
      candidate = rawToday[nextName];
    } else {
      // No next prayer left today → use tomorrow's Fajr
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowResult = computePrayerTimes(
        coords.lat,
        coords.lng,
        tomorrow,
        params
      ) as any;
      const rawTomorrow = tomorrowResult?.raw as typeof rawToday | undefined;
      if (rawTomorrow?.fajr) candidate = rawTomorrow.fajr;
    }

    if (!candidate)
      return {
        nextAt: undefined,
        msUntilNext: undefined,
        timeUntilNext: undefined,
      };

    const diff = candidate.getTime() - now.getTime();
    return {
      nextAt: candidate,
      msUntilNext: Math.max(0, diff),
      timeUntilNext: formatHHMMSS(Math.max(0, diff)),
    };
  }, [coords, result, now]);

  function refresh() {
    setDateKey(new Date().toDateString());
  }

  return {
    isLoading,
    error,
    formatted: result?.formatted,
    next: result?.next,
    coords,
    nextAt,
    msUntilNext,
    timeUntilNext,
    refresh,
  };
}
