// app/lib/tasks.ts
import type { PrayerKey, PrayerTime, Task, SectionBlock } from "@/types";
import { ORDER } from "./prayers";

export function makeSections(
  tasks: Task[],
  prayers: PrayerTime[],
  collapsed: Record<PrayerKey, boolean>
): SectionBlock[] {
  const groups: Record<PrayerKey, Task[]> = {
    fajr: [],
    dhuhr: [],
    asr: [],
    maghrib: [],
    isha: [],
  };
  for (const t of tasks) groups[t.prayer].push(t);
  ORDER.forEach((k) =>
    groups[k].sort(
      (a, b) =>
        Number(a.completed) - Number(b.completed) || a.createdAt - b.createdAt
    )
  );
  return ORDER.map((k) => {
    const p = prayers.find((x) => x.key === k)!;
    return {
      title: p.name,
      prayerKey: p.key,
      time: p.time,
      emoji: p.emoji,
      data: collapsed[k] ? [] : groups[k],
    };
  });
}
