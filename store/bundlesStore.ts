/**
 * Bundles Store - SQLite Implementation
 *
 * This store manages bundles using SQLite for better performance and data integrity.
 * Maintains all existing functionality while providing:
 * - Faster data access
 * - Better data consistency
 * - Islamic tracking principles preserved
 * - Bundle completion logic maintained
 */

import { create } from "zustand";
import type { CompletionRecord } from "../types/habit";
import {
  getAllBundles,
  getBundleById,
  createBundle,
  updateBundleHabitCompletion,
  markBundleDayCompleted,
  removeBundleDayCompletion,
  updateBundleCurrentDay,
  updateBundleLastActivity,
  deleteBundle,
  isBundleDayCompleted,
} from "../lib/database/bundles";

// Local shapes based on how bundles are saved
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
  isLoading: boolean;
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
  isLoading: false,

  hydrate: async () => {
    try {
      set({ isLoading: true });
      const bundles = await getAllBundles();
      set({ bundles, isHydrated: true });
    } catch (error) {
      console.error("Error hydrating bundles:", error);
      set({ bundles: [], isHydrated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      const bundles = await getAllBundles();
      set({ bundles, isHydrated: true });
    } catch (error) {
      console.error("Error initializing bundles:", error);
      set({ bundles: [], isHydrated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  setBundles: async (items: BundleLocal[]) => {
    set({ bundles: items });
    // Note: In SQLite implementation, we don't need to manually save
    // as data is persisted automatically through database operations
  },

  getBundleById: (id: string) => get().bundles.find((b) => b.id === id),

  addOrUpdateBundle: async (bundle: BundleLocal) => {
    try {
      set({ isLoading: true });

      // Check if bundle exists
      const existingBundle = await getBundleById(bundle.id);

      if (existingBundle) {
        // Update existing bundle
        await createBundle(bundle); // This will replace the existing bundle
      } else {
        // Create new bundle
        await createBundle(bundle);
      }

      // Update store
      const existing = get().bundles;
      const index = existing.findIndex((b) => b.id === bundle.id);
      const next =
        index >= 0
          ? existing.map((b) => (b.id === bundle.id ? bundle : b))
          : [...existing, bundle];

      set({ bundles: next });
    } catch (error) {
      console.error("Error adding/updating bundle:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateBundle: async (
    id: string,
    updater: (b: BundleLocal) => BundleLocal
  ) => {
    try {
      set({ isLoading: true });

      const bundle = get().bundles.find((b) => b.id === id);
      if (!bundle) return;

      const updatedBundle = updater(bundle);
      await createBundle(updatedBundle); // Replace in database

      const next = get().bundles.map((b) => (b.id === id ? updatedBundle : b));
      set({ bundles: next });
    } catch (error) {
      console.error("Error updating bundle:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  removeBundle: async (id: string) => {
    try {
      set({ isLoading: true });

      await deleteBundle(id);
      const next = get().bundles.filter((b) => b.id !== id);
      set({ bundles: next });
    } catch (error) {
      console.error("Error removing bundle:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearBundles: async () => {
    try {
      set({ isLoading: true });

      // Clear all bundles from database
      const bundles = get().bundles;
      for (const bundle of bundles) {
        await deleteBundle(bundle.id);
      }

      set({ bundles: [] });
    } catch (error) {
      console.error("Error clearing bundles:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateBundleCompletion: async (
    habitId: string,
    date: string,
    prayer: string
  ) => {
    try {
      set({ isLoading: true });

      // Find the bundle that contains this habit
      const bundle = get().bundles.find((b) =>
        b.habits.some((h) => h.id === habitId)
      );

      if (!bundle) return;

      // Update the habit completion in database
      await updateBundleHabitCompletion(habitId, date, prayer, true);

      // Check if bundle day is now completed
      const isCompleted = await isBundleDayCompleted(bundle.id, date);

      if (isCompleted) {
        await markBundleDayCompleted(bundle.id, date);

        // Update bundle in store
        const updatedBundle = {
          ...bundle,
          dates: {
            ...bundle.dates,
            completed_days: [...bundle.dates.completed_days, date],
          },
        };

        set({
          bundles: get().bundles.map((b) =>
            b.id === bundle.id ? updatedBundle : b
          ),
        });
      }
    } catch (error) {
      console.error("Error updating bundle completion:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  recalculateAllBundleCompletions: async () => {
    try {
      set({ isLoading: true });

      const bundles = get().bundles;

      for (const bundle of bundles) {
        // Get all dates from bundle habits
        const allDates = new Set<string>();

        for (const habit of bundle.habits) {
          for (const completion of habit.completed) {
            if (typeof completion === "string") {
              allDates.add(completion);
            } else {
              allDates.add(completion.date);
            }
          }
        }

        // Check each date to see if bundle is completed
        const completedDays: string[] = [];

        for (const date of allDates) {
          const isCompleted = await isBundleDayCompleted(bundle.id, date);
          if (isCompleted) {
            completedDays.push(date);
          }
        }

        // Update bundle with recalculated completed days
        const updatedBundle = {
          ...bundle,
          dates: {
            ...bundle.dates,
            completed_days: completedDays,
          },
        };

        set({
          bundles: get().bundles.map((b) =>
            b.id === bundle.id ? updatedBundle : b
          ),
        });
      }
    } catch (error) {
      console.error("Error recalculating bundle completions:", error);
    } finally {
      set({ isLoading: false });
    }
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

  // For each habit in the bundle, check if it's completed for ALL its related salat on the target date
  for (const habit of bundle.habits) {
    // Get all related salat for this habit
    const relatedSalat = habit.relatedSalat || [];

    // For each related salat, check if there's a completion record
    for (const prayer of relatedSalat) {
      const isCompleted = habit.completed.some((completion) => {
        if (typeof completion === "string") {
          // Legacy format - treat as date only
          return completion === targetDate;
        } else {
          // New format with prayer
          return completion.date === targetDate && completion.prayer === prayer;
        }
      });

      if (!isCompleted) {
        // At least one prayer is missing for this habit
        return false;
      }
    }
  }

  // All habits completed for all their prayers
  return true;
}

// Utility function to update bundle completed days
export function updateBundleCompletedDays(bundle: BundleLocal): BundleLocal {
  const startDate = new Date(bundle.dates.start_date);
  const endDate = new Date(bundle.dates.end_date);
  const completedDays: string[] = [];

  // Check each day in the bundle duration
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateStr = date.toISOString().split("T")[0];

    if (calculateBundleDayCompletion(bundle, dateStr)) {
      completedDays.push(dateStr);
    }
  }

  return {
    ...bundle,
    dates: {
      ...bundle.dates,
      completed_days: completedDays,
    },
  };
}
