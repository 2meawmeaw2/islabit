import { create } from "zustand";
import { computePrayerTimes } from "../lib/prayer-times/compute";
import {
  buildParameters,
  defaultPrayerCalcConfig,
} from "../lib/prayer-times/parameters";
import { dayjs } from "../lib/daysjs";

// Types and Interfaces
interface Prayer {
  time: Date;
  name: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
  shouldRing: boolean;
  wasPrayed: boolean;
}

interface PrayerDay {
  date: Date;
  prayers: Prayer[];
}

interface PrayerState {
  days: PrayerDay[]; // will always be [today]
  coordinates: { lat: number; lng: number } | null;
  // State management
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  initializePrayers: (lat: number, lng: number) => Promise<void>;
  markPrayerAsPrayed: (date: Date, prayerName: Prayer["name"]) => void;
  updatePrayerWindow: () => void; // recomputes only for today
}

// Helper function to create a PrayerDay object for a specific date
function createPrayerDay(date: Date, lat: number, lng: number): PrayerDay {
  const params = buildParameters(defaultPrayerCalcConfig);
  const { raw } = computePrayerTimes(lat, lng, date, params);

  const prayers: Prayer[] = [
    { name: "fajr", time: raw.fajr, shouldRing: false, wasPrayed: false },
    { name: "sunrise", time: raw.sunrise, shouldRing: false, wasPrayed: false },
    { name: "dhuhr", time: raw.dhuhr, shouldRing: false, wasPrayed: false },
    { name: "asr", time: raw.asr, shouldRing: false, wasPrayed: false },
    { name: "maghrib", time: raw.maghrib, shouldRing: false, wasPrayed: false },
    { name: "isha", time: raw.isha, shouldRing: false, wasPrayed: false },
  ];

  return { date, prayers };
}

// Utility to calculate shouldRing status
function updateShouldRing(prayer: Prayer): boolean {
  const now = dayjs();
  const prayerTime = dayjs(prayer.time);

  // Only set shouldRing for future prayers of today
  if (!now.isSame(prayerTime, "day")) return false;

  const deltaMinutes = prayerTime.diff(now, "minute");
  // Ring if prayer is within next 30 minutes and hasn't been prayed
  return deltaMinutes >= 0 && deltaMinutes <= 30 && !prayer.wasPrayed;
}

// Create the store (today-only)
export const usePrayerTimesStore = create<PrayerState>((set, get) => ({
  days: [],
  coordinates: null,
  isInitialized: false,
  isLoading: false,
  error: null,

  initializePrayers: async (lat: number, lng: number) => {
    set({ isLoading: true, error: null });
    try {
      const today = new Date();
      const day = createPrayerDay(today, lat, lng);

      // Initialize shouldRing right away
      day.prayers = day.prayers.map((p) => ({
        ...p,
        shouldRing: updateShouldRing(p),
      }));

      set({
        days: [day], // only keep today
        coordinates: { lat, lng },
        isInitialized: true,
        isLoading: false,
      });

      // Set up midnight update (to roll to the new "today")
      const midnight = dayjs().endOf("day");
      const msUntilMidnight = Math.max(0, midnight.diff(dayjs()));
      setTimeout(() => {
        get().updatePrayerWindow();
      }, msUntilMidnight);
    } catch (error) {
      set({ error: "Failed to initialize prayer times", isLoading: false });
    }
  },

  markPrayerAsPrayed: (date: Date, prayerName: Prayer["name"]) => {
    set((state) => ({
      days: state.days.map((day) => {
        if (dayjs(day.date).isSame(date, "day")) {
          return {
            ...day,
            prayers: day.prayers.map((prayer) =>
              prayer.name === prayerName
                ? { ...prayer, wasPrayed: true, shouldRing: false }
                : prayer
            ),
          };
        }
        return day;
      }),
    }));
  },

  updatePrayerWindow: () => {
    const { coordinates } = get();
    if (!coordinates) return;

    const { lat, lng } = coordinates;

    // Recompute ONLY for today
    const today = new Date();
    const day = createPrayerDay(today, lat, lng);

    // Update shouldRing for all prayers
    day.prayers = day.prayers.map((p) => ({
      ...p,
      shouldRing: updateShouldRing(p),
    }));

    set({ days: [day] });

    // Schedule next midnight update
    const midnight = dayjs().endOf("day");
    const msUntilMidnight = Math.max(0, midnight.diff(dayjs()));
    setTimeout(() => {
      get().updatePrayerWindow();
    }, msUntilMidnight);
  },
}));
