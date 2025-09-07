import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { CompletionRecord } from "../types/habit";
import { useHabitsStore } from "./habitsStore";

// Local shapes based on how bundles are saved under the "bundles" key
//
// BUNDLE COMPLETION LOGIC:
// A bundle day is considered "completed" when ALL habits in the bundle are completed
// for ALL their related salats on that specific date.
//
// Example: If a bundle has 3 habits:
// - Habit 1: related to [fajr, dhuhr]
// - Habit 2: related to [fajr]
// - Habit 3: related to [asr, maghrib]
//
// For a day to be "completed" for the bundle:
// - Habit 1 must be completed for both fajr AND dhuhr
// - Habit 2 must be completed for fajr
// - Habit 3 must be completed for both asr AND maghrib
//
// Only when ALL these conditions are met will the day be added to completed_days array.
export interface BundleDates {
  enrolled_at: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  current_day: number;
  is_active: boolean;
  completed_days: string[];
  last_activity: string;
}

export interface BundleHabitLocal {
  id: string;
  title: string;
  quote?: string;
  description: string;
  relatedDays: number[];
  relatedSalat: string[];
  category: { text: string; hexColor: string };
  completed: { date: string; prayer: string }[] | string[];
  streak: number;
  bestStreak: number;
}

export interface BundleLocal {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: { text: string; hexColor: string };
  image_url: string;
  dates: BundleDates;
  habits: BundleHabitLocal[];
  color: string;
}

interface BundlesState {
  bundles: BundleLocal[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  initialize: () => Promise<void>;
  setBundles: (items: BundleLocal[]) => Promise<void>;
  getBundleById: (id: string) => BundleLocal | undefined;
  addOrUpdateBundle: (bundle: BundleLocal) => Promise<void>;
  updateBundle: (
    id: string,
    updater: (b: BundleLocal) => BundleLocal
  ) => Promise<void>;
  removeBundle: (id: string) => Promise<void>;
  clearBundles: () => Promise<void>;
  updateBundleCompletion: (
    habitId: string,
    date: string,
    prayer: string
  ) => Promise<void>;
  recalculateAllBundleCompletions: () => Promise<void>;
}

export const useBundlesStore = create<BundlesState>((set, get) => ({
  bundles: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem("bundles");
      const parsed: BundleLocal[] = raw ? JSON.parse(raw) : [];
      set({ bundles: parsed, isHydrated: true });
    } catch (error) {
      console.error("Error hydrating bundles:", error);
      set({ bundles: [], isHydrated: true });
    }
  },

  initialize: async () => {
    try {
      const raw = await AsyncStorage.getItem("bundles");
      const parsed = raw ? JSON.parse(raw) : [];

      const normalized: BundleLocal[] = Array.isArray(parsed)
        ? parsed.map((b: any) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            description: b.description,
            category: b.category,
            color: b.color,
            image_url: b.image_url || "",
            dates: b.dates,
            habits: Array.isArray(b.habits)
              ? b.habits.map((h: any) => ({
                  id: h.id,
                  title: h.title,
                  quote: h.quote,
                  description: h.description,
                  relatedDays: Array.isArray(h.relatedDays)
                    ? h.relatedDays
                    : [0, 1, 2, 3, 4, 5, 6],
                  relatedSalat: Array.isArray(h.relatedSalat)
                    ? h.relatedSalat
                    : ["fajr"],
                  category: h.category || b.category,
                  completed: Array.isArray(h.completed) ? h.completed : [],
                  streak: typeof h.streak === "number" ? h.streak : 0,
                  bestStreak:
                    typeof h.bestStreak === "number" ? h.bestStreak : 0,
                }))
              : [],
          }))
        : [];

      set({ bundles: normalized, isHydrated: true });

      if (!raw) {
        await AsyncStorage.setItem("bundles", JSON.stringify(normalized));
      } else {
        // Recalculate bundle completions to ensure they're up to date
        await get().recalculateAllBundleCompletions();
      }
    } catch (error) {
      console.error("Error initializing bundles:", error);
      set({ bundles: [], isHydrated: true });
    }
  },

  setBundles: async (items: BundleLocal[]) => {
    set({ bundles: items });
    try {
      await AsyncStorage.setItem("bundles", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving bundles:", error);
    }
  },

  getBundleById: (id: string) => get().bundles.find((b) => b.id === id),

  addOrUpdateBundle: async (bundle: BundleLocal) => {
    const existing = get().bundles;
    const index = existing.findIndex((b) => b.id === bundle.id);
    const next =
      index >= 0
        ? existing.map((b) => (b.id === bundle.id ? bundle : b))
        : [...existing, bundle];
    await get().setBundles(next);
  },

  updateBundle: async (id, updater) => {
    const next = get().bundles.map((b) => (b.id === id ? updater(b) : b));
    await get().setBundles(next);
  },

  removeBundle: async (id: string) => {
    const next = get().bundles.filter((b) => b.id !== id);
    await get().setBundles(next);
  },

  clearBundles: async () => {
    try {
      await AsyncStorage.removeItem("bundles");
    } catch (error) {
      console.error("Error clearing bundles:", error);
    } finally {
      set({ bundles: [] });
    }
  },

  updateBundleCompletion: async (
    habitId: string,
    date: string,
    prayer: string
  ) => {
    console.log(
      "🔄 Updating bundle completion for habit:",
      habitId,
      "date:",
      date,
      "prayer:",
      prayer
    );

    // Get the actual habit data from habits store
    const habitsStore = useHabitsStore.getState();
    const actualHabit = habitsStore.getHabitById(habitId);

    if (!actualHabit) {
      console.log("❌ Habit not found in habits store:", habitId);
      return;
    }

    console.log(
      "✅ Found habit in habits store:",
      actualHabit.title,
      "completed:",
      actualHabit.completed
    );

    const bundles = get().bundles;
    let hasUpdates = false;

    const updatedBundles = bundles.map((bundle) => {
      console.log(
        "🔍 Checking bundle:",
        bundle.title,
        "habits:",
        bundle.habits.map((h) => h.title)
      );

      // Check if this bundle contains a habit that matches the completed habit
      // We need to match by title and bundle context since IDs might be different
      const habitInBundle = bundle.habits.find((habit) => {
        // Try to match by original ID pattern or by title if it's a bundle habit
        const matches =
          habit.id === habitId ||
          (habitId.startsWith("bundle_") &&
            habit.title === actualHabit.title) ||
          habit.title === actualHabit.title;

        if (matches) {
          console.log(
            "🎯 Found matching habit in bundle:",
            habit.title,
            "bundle:",
            bundle.title
          );
        }

        return matches;
      });

      if (habitInBundle) {
        console.log("📝 Updating bundle completion for:", bundle.title);
        // Update the habit's completion in the bundle with the actual completion data
        const updatedHabits = bundle.habits.map((habit) => {
          if (habit.id === habitInBundle.id) {
            // Use the actual completion data from the habits store
            return {
              ...habit,
              completed: actualHabit.completed || [],
              streak: actualHabit.streak || 0,
              bestStreak: actualHabit.bestStreak || 0,
            };
          }
          return habit;
        });

        // Update the bundle with updated habits and recalculate completed days
        const updatedBundle = {
          ...bundle,
          habits: updatedHabits,
        };

        const bundleWithUpdatedCompletion =
          updateBundleCompletedDays(updatedBundle);

        console.log(
          "📊 Bundle completion updated:",
          bundleWithUpdatedCompletion.title,
          "completed_days:",
          bundleWithUpdatedCompletion.dates.completed_days
        );

        hasUpdates = true;
        return bundleWithUpdatedCompletion;
      }

      return bundle;
    });

    if (hasUpdates) {
      await get().setBundles(updatedBundles);
    }
  },

  recalculateAllBundleCompletions: async () => {
    // Get the actual habit data from habits store
    const habitsStore = useHabitsStore.getState();
    const allHabits = habitsStore.habits;

    const bundles = get().bundles;
    const updatedBundles = bundles.map((bundle) => {
      // Update each habit in the bundle with the latest data from habits store
      const updatedHabits = bundle.habits.map((bundleHabit) => {
        // Find the corresponding habit in the habits store
        const actualHabit = allHabits.find((habit) => {
          return (
            habit.title === bundleHabit.title &&
            habit.source === "bundle" &&
            habit.bundleTitle === bundle.title
          );
        });

        if (actualHabit) {
          // Use the actual completion data from the habits store
          return {
            ...bundleHabit,
            completed: actualHabit.completed || [],
            streak: actualHabit.streak || 0,
            bestStreak: actualHabit.bestStreak || 0,
          };
        }

        return bundleHabit;
      });

      // Update the bundle with updated habits and recalculate completed days
      const updatedBundle = {
        ...bundle,
        habits: updatedHabits,
      };

      return updateBundleCompletedDays(updatedBundle);
    });

    await get().setBundles(updatedBundles);
  },
}));

// Utility function to calculate if a bundle day is completed
export function calculateBundleDayCompletion(
  bundle: BundleLocal,
  targetDate: string
): boolean {
  if (!bundle.habits || bundle.habits.length === 0) {
    return false;
  }

  // Check if all habits are completed for all their related salats on the target date
  return bundle.habits.every((habit) => {
    // Get habit's related salats
    const relatedSalats = habit.relatedSalat || [];

    // If no related salats, consider it completed if there's any completion on that date
    if (relatedSalats.length === 0) {
      return (
        habit.completed?.some((completion) => {
          if (typeof completion === "string") {
            return completion === targetDate;
          }
          return completion.date === targetDate;
        }) || false
      );
    }

    // Check if habit is completed for ALL its related salats on the target date
    return relatedSalats.every((salat) => {
      return (
        habit.completed?.some((completion) => {
          if (typeof completion === "string") {
            return completion === targetDate;
          }
          return completion.date === targetDate && completion.prayer === salat;
        }) || false
      );
    });
  });
}

// Utility function to update bundle completed days
export function updateBundleCompletedDays(bundle: BundleLocal): BundleLocal {
  const startDate = new Date(bundle.dates.start_date);
  const endDate = new Date(bundle.dates.end_date);
  const completedDays: string[] = [];

  // Iterate through each day from start to end
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];

    // Check if this day is completed
    if (calculateBundleDayCompletion(bundle, dateStr)) {
      completedDays.push(dateStr);
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    ...bundle,
    dates: {
      ...bundle.dates,
      completed_days: completedDays,
    },
  };
}

export const selectBundles = (s: BundlesState) => s.bundles;
export const selectIsBundlesHydrated = (s: BundlesState) => s.isHydrated;
