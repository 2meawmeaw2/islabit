// Let's start by defining a TypeScript type for the habit props you described.
// We'll use an interface to clearly specify each property and its type.
import { WeekDayAr } from "./dates";
import { PrayerKey } from "./salat";

// New Category interface for habits and bundles
export interface Category {
  text: string;
  hexColor: string;
}

// Default categories with Islamic and lifestyle themes - using Arabic IDs
export const DEFAULT_CATEGORIES: Category[] = [
  { text: "روحاني", hexColor: "#8B5CF6" }, // Spiritual - Purple
  { text: "صحي", hexColor: "#10B981" }, // Health - Green
  { text: "تعليمي", hexColor: "#3B82F6" }, // Educational - Blue
  { text: "اجتماعي", hexColor: "#F59E0B" }, // Social - Amber
  { text: "مالي", hexColor: "#EF4444" }, // Financial - Red
  { text: "عائلي", hexColor: "#EC4899" }, // Family - Pink
  { text: "عمل", hexColor: "#6B7280" }, // Work - Gray
  { text: "رياضة", hexColor: "#059669" }, // Sports - Emerald
];

// Type for completion record with prayer information
export interface CompletionRecord {
  date: string;
  prayer: string;
}

export interface HabitProps {
  id: string; // Unique identifier for the habit
  title: string; // Name or title of the habit
  quote?: string; // Motivational or related quote
  description?: string; // Description of the habit
  streak: number; // Current streak count
  bestStreak?: number; // Best (longest) streak achieved
  completed?: string[] | CompletionRecord[]; // Array of days when habit was completed (legacy: string[], new: CompletionRecord[])
  completedDates?: string[]; // Array of dates in ISO format when the habit was completed (e.g., ["2024-06-01", "2024-06-02"])
  relatedSalat: PrayerKey[]; // (Optional) Name of the related prayer, if any
  relatedDays: number[]; // (Optional) Days of the week related to the habit (e.g., ["Monday", "Thursday"])
  category?: Category; // Category for the habit
  color?: string;
}

export interface HabitsShopHabit {
  id: string; // Unique identifier for the habit (UUID)
  title: string; // Name or title of the habit
  benefit: string[];
  quote: string; // Motivational or related quote
  description: string; // Description of the habit
  suggestedRelatedSalat: import("./salat").PrayerKey[]; // (Optional) Name of the related prayer, if any
  suggestedRelatedDays?: string[]; //["1","2","3","4","5","6","7"]
  categories: Category[]; // Array of category IDs that this habit belongs to
  color: string;
  comments?: import("@/lib/habits-api").HabitComment[];
  likes?: string[];
  enrolled_users?: string[];
}

export type HabitDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
