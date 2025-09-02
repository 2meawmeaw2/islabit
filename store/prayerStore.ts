import { create } from "zustand";
import type { Prayer } from "../types/salat";

interface PrayerState {
  prayerTimes: Prayer[];
  lastSyncedAt: string | null; // ISO
  locationConsent: boolean;
  setPrayerTimes: (items: Prayer[], syncedAt?: string) => void;
  setLocationConsent: (consent: boolean) => void;
  clearPrayerTimes: () => void;
}

export const usePrayerStore = create<PrayerState>()((set) => ({
  prayerTimes: [],
  lastSyncedAt: null,
  locationConsent: false,
  setPrayerTimes: (items, syncedAt) =>
    set({
      prayerTimes: items,
      lastSyncedAt: syncedAt ?? new Date().toISOString(),
    }),
  setLocationConsent: (consent) => set({ locationConsent: consent }),
  clearPrayerTimes: () => set({ prayerTimes: [], lastSyncedAt: null }),
}));
