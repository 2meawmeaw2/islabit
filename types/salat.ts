// Types for prayer-related functionality

export type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface Prayer {
  key: PrayerKey;
  name: string;
  time: string;
  emoji: string;
}
