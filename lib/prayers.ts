// app/lib/prayers.ts
import { toDate } from "@/lib/dates";
import type { PrayerKey, Prayer } from "@/types/salat";

export const PRAYERS: Prayer[] = [
  { key: "fajr", name: "الفجر", time: "05:00", emoji: "🌅" },
  { key: "dhuhr", name: "الظهر", time: "12:30", emoji: "☀️" },
  { key: "asr", name: "العصر", time: "16:00", emoji: "🌤️" },
  { key: "maghrib", name: "المغرب", time: "19:20", emoji: "🌇" },
  { key: "isha", name: "العشاء", time: "20:45", emoji: "🌙" },
];

export const COLORS: Record<PrayerKey, string> = {
  fajr: "#4B9AB5",
  dhuhr: "#FACC15",
  asr: "#FB923C",
  maghrib: "#F87171",
  isha: "#7C3AED",
};

export const ORDER: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

/** Current/Next prayer based on a list of prayer times */
export function currentAndNext(prayers: Prayer[], now = new Date()) {
  const list = prayers.map((p) => ({ ...p, date: toDate(p.time, now) }));
  const nowMs = now.getTime();
  const nextToday = list.find((p) => p.date.getTime() > nowMs);
  const current =
    [...list].reverse().find((p) => p.date.getTime() <= nowMs) ||
    list[list.length - 1];

  if (!nextToday) {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    const fajr = prayers.find((p) => p.key === "fajr")!;
    return { current, next: { ...fajr, date: toDate(fajr.time, t) } };
  }
  return { current, next: nextToday };
}
