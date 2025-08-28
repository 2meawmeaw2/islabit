// Let's start by defining a TypeScript type for the habit props you described.
// We'll use an interface to clearly specify each property and its type.
import { PrayerKey } from "./salat";
import { WeekDayAr, WEEK_DAYS } from "./dates";
export interface HabitProps {
  id: string; // Unique identifier for the habit
  title: string; // Name or title of the habit
  quote?: string; // Motivational or related quote
  description?: string; // Description of the habit
  streak: number; // Current streak count
  completed: string[]; // Array of days (e.g., ["2024-06-01", "2024-06-02"]) when the habit was completed
  relatedSalat: PrayerKey[]; // (Optional) Name of the related prayer, if any
  relatedDays: number[]; // (Optional) Days of the week related to the habit (e.g., ["Monday", "Thursday"])
  priority: string; // Priority label; supports custom labels (e.g., bundle name)
  priorityColor?: string; // Optional custom color for the priority label
}
export interface HabitsShopHabit {
  id: number; // Unique identifier for the habit
  title: string; // Name or title of the habit
  benefit: string[];
  quote: string; // Motivational or related quote

  whyDescription: string; // Description of the habit
  suggestedRelatedSalat: import("./salat").Prayer[]; // (Optional) Name of the related prayer, if any
  suggestedRelatedDays?: WeekDayAr[]; // (Optional) Days of the week related to the habit (e.g., ["Monday", "Thursday"])
}
export type HabitDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
