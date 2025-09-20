/**
 * Habits Store - SQLite Implementation
 *
 * This store manages habits using SQLite for better performance and data integrity.
 * Maintains all existing functionality while providing:
 * - Faster data access
 * - Better data consistency
 * - Islamic tracking principles preserved
 * - Smooth UX with optimized queries
 */

import { create } from "zustand";
import type { CompletionRecord, HabitProps } from "../types/habit";
import {
  getAllHabits,
  getHabitById,
  updateHabitCompletion,
  updateHabitStreak,
  createHabit,
  updateHabit,
  deleteHabit,
} from "../lib/database/habits";

// Helper function to calculate streaks properly
function calculateStreaks(
  completed: CompletionRecord[],
  date: string,
  prayer: string,
  isCompleted: boolean,
  relatedSalat: string[]
): { streak: number; bestStreak: number } {
  // Create the updated completion list based on the action
  let updatedCompleted: CompletionRecord[];

  if (isCompleted) {
    // Add the new completion
    updatedCompleted = [...completed, { date, prayer }];
  } else {
    // Remove the completion
    updatedCompleted = completed.filter(
      (record) => !(record.date === date && record.prayer === prayer)
    );
  }

  // Get all unique dates when habit was completed, sorted in descending order
  const completedDates = [
    ...new Set(updatedCompleted.map((record) => record.date)),
  ]
    .sort()
    .reverse();

  // Calculate current streak - consecutive days up to the most recent completion
  let currentStreak = 0;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  if (completedDates.length > 0) {
    const mostRecentCompletionStr = completedDates[0]; // Already sorted in descending order
    const mostRecentDate = new Date(mostRecentCompletionStr);
    const todayDate = new Date(todayStr);

    // Calculate days between most recent completion and today
    const daysDiff = Math.floor(
      (todayDate.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Current streak is valid if:
    // - Most recent completion is today (daysDiff = 0), OR
    // - Most recent completion is yesterday (daysDiff = 1) - streak continues if they do it today/tomorrow
    if (daysDiff <= 1) {
      // Count consecutive days backwards from the most recent completion
      let checkDate = new Date(mostRecentDate);

      for (let i = 0; i < 365; i++) {
        // Reasonable limit
        const dateStr = checkDate.toISOString().split("T")[0];

        if (completedDates.includes(dateStr)) {
          currentStreak++;
          // Move to previous day
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Found a gap, stop counting
          break;
        }
      }
    }
    // If daysDiff > 1, the streak is broken (more than 1 day gap)
  }

  // Calculate best streak by finding longest consecutive sequence
  let bestStreak = 0;

  if (completedDates.length > 0) {
    const ascendingDates = [...completedDates].sort();
    let maxConsecutive = 1; // Start with 1 since we have at least one date
    let currentConsecutive = 1;

    for (let i = 1; i < ascendingDates.length; i++) {
      const currentDate = new Date(ascendingDates[i]);
      const previousDate = new Date(ascendingDates[i - 1]);

      const daysDiff = Math.floor(
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Consecutive day
        currentConsecutive++;
      } else {
        // Gap found, update max and reset counter
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        currentConsecutive = 1;
      }
    }

    // Don't forget the last sequence
    bestStreak = Math.max(maxConsecutive, currentConsecutive);
  }

  return { streak: currentStreak, bestStreak };
}

// Extended habit interface to include bundle information
export interface ExtendedHabitProps extends HabitProps {
  source?: "individual" | "bundle";
  bundleTitle?: string;
  bundleColor?: string;
  isCompletedForSelectedDay?: boolean;
}

interface HabitsState {
  habits: ExtendedHabitProps[];
  selectedHabitId: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  setHabits: (items: ExtendedHabitProps[]) => void;
  selectHabit: (habitId: string | null) => void;
  updateHabit: (habit: ExtendedHabitProps) => Promise<void>;
  completeHabit: (
    habitId: string,
    date: string,
    prayer: string,
    isCompleted: boolean
  ) => Promise<void>;
  resetHabits: () => void;
  getHabitById: (habitId: string) => ExtendedHabitProps | undefined;
  loadAllHabits: () => Promise<void>;
  clearAllStorage: () => Promise<void>;
  addHabit: (habit: Omit<HabitProps, "completed">) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  selectedHabitId: null,
  isHydrated: false,
  isLoading: false,

  setHabits: (items: ExtendedHabitProps[]) => set({ habits: items }),

  selectHabit: (habitId: string | null) => set({ selectedHabitId: habitId }),

  updateHabit: async (habit: ExtendedHabitProps) => {
    try {
      set({ isLoading: true });

      // Update in database
      await updateHabit(habit.id, {
        title: habit.title,
        quote: habit.quote,
        description: habit.description,
        color: habit.color,
      });

      // Update in store
      set({
        habits: get().habits.map((h) => (h.id === habit.id ? habit : h)),
      });
    } catch (error) {
      console.error("Error updating habit:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  completeHabit: async (
    habitId: string,
    date: string,
    prayer: string,
    isCompleted: boolean
  ) => {
    try {
      set({ isLoading: true });

      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;

      // Clone the habit to avoid direct mutation
      const updatedHabit: ExtendedHabitProps = { ...habit };

      // Initialize completed array if it doesn't exist
      if (!updatedHabit.completed) {
        updatedHabit.completed = [];
      }

      // Convert old format (string array) to new format (object array) if needed
      if (
        updatedHabit.completed.length > 0 &&
        typeof updatedHabit.completed[0] === "string"
      ) {
        updatedHabit.completed = (updatedHabit.completed as string[]).map(
          (dateStr: string) => ({
            date: dateStr,
            prayer: "unknown",
          })
        );
      }

      const completedArray = updatedHabit.completed as CompletionRecord[];
      let newCompleted: CompletionRecord[];

      if (isCompleted) {
        // Check if we already have a record for this date and prayer
        const existingRecordIndex = completedArray.findIndex(
          (record: CompletionRecord) =>
            record.date === date && record.prayer === prayer
        );

        if (existingRecordIndex >= 0) {
          // Already completed for this prayer, shouldn't happen normally
          newCompleted = [...completedArray];
        } else {
          // Add a new completion record
          newCompleted = [...completedArray, { date, prayer }];
        }
      } else {
        // Remove the specific record for this date and prayer
        newCompleted = completedArray.filter(
          (record: CompletionRecord) =>
            !(record.date === date && record.prayer === prayer)
        );
      }

      // Calculate proper streaks using our helper function
      const { streak: calculatedStreak, bestStreak: calculatedBestStreak } =
        calculateStreaks(
          newCompleted,
          date,
          prayer,
          isCompleted,
          updatedHabit.relatedSalat || []
        );

      // Update completion in database
      await updateHabitCompletion(habitId, date, prayer, isCompleted);

      // Update streak in database
      await updateHabitStreak(habitId, calculatedStreak, calculatedBestStreak);

      // Update the habit with calculated streaks
      const finalUpdatedHabit: ExtendedHabitProps = {
        ...updatedHabit,
        completed: newCompleted,
        streak: calculatedStreak,
        bestStreak: calculatedBestStreak,
        isCompletedForSelectedDay: isCompleted,
      };

      // Update the habit in the store
      set({
        habits: get().habits.map((h) =>
          h.id === habitId ? finalUpdatedHabit : h
        ),
      });
    } catch (error) {
      console.error("Error completing habit:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  resetHabits: () => set({ habits: [], selectedHabitId: null }),

  getHabitById: (habitId: string) => get().habits.find((h) => h.id === habitId),

  loadAllHabits: async () => {
    try {
      set({ isLoading: true });

      // Load habits from SQLite database
      const habits = await getAllHabits();

      // Add source property to individual habits
      const processedHabits = habits.map((habit) => ({
        ...habit,
        source: "individual" as const,
      }));

      set({ habits: processedHabits, isHydrated: true });
    } catch (error) {
      console.error("Error loading habits:", error);
      set({ habits: [], isHydrated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  addHabit: async (habit: Omit<HabitProps, "completed">) => {
    try {
      set({ isLoading: true });

      // Create habit in database
      await createHabit(habit);

      // Add to store
      const newHabit: ExtendedHabitProps = {
        ...habit,
        completed: [],
        source: "individual",
      };

      set({
        habits: [...get().habits, newHabit],
      });
    } catch (error) {
      console.error("Error adding habit:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  removeHabit: async (habitId: string) => {
    try {
      set({ isLoading: true });

      // Remove from database
      await deleteHabit(habitId);

      // Remove from store
      set({
        habits: get().habits.filter((h) => h.id !== habitId),
        selectedHabitId:
          get().selectedHabitId === habitId ? null : get().selectedHabitId,
      });
    } catch (error) {
      console.error("Error removing habit:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearAllStorage: async () => {
    try {
      set({ isLoading: true });

      // Clear all habits from database
      const habits = get().habits;
      for (const habit of habits) {
        if (habit.source === "individual") {
          await deleteHabit(habit.id);
        }
      }

      set({ habits: [], selectedHabitId: null });
      console.log("All habits cleared from SQLite");
    } catch (error) {
      console.error("Error clearing storage:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export const selectSelectedHabit = (s: HabitsState) =>
  s.habits.find((h) => h.id === s.selectedHabitId) || null;
