import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CompletionRecord, HabitProps } from "../types/habit";

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
  isCompletedForSelectedDay?: boolean;
}

interface HabitsState {
  habits: ExtendedHabitProps[];
  selectedHabitId: string | null;
  isHydrated: boolean;
  setHabits: (items: ExtendedHabitProps[]) => void;
  selectHabit: (habitId: string | null) => void;
  updateHabit: (habit: ExtendedHabitProps) => void;
  completeHabit: (
    habitId: string,
    date: string,
    prayer: string,
    isCompleted: boolean
  ) => void;
  resetHabits: () => void;
  getHabitById: (habitId: string) => ExtendedHabitProps | undefined;
  loadAllHabits: () => Promise<void>;
  clearAllStorage: () => Promise<void>;
  saveHabitsToStorage: () => Promise<void>;
}

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: [],
      selectedHabitId: null,
      isHydrated: false,

      setHabits: (items: ExtendedHabitProps[]) => set({ habits: items }),

      selectHabit: (habitId: string | null) =>
        set({ selectedHabitId: habitId }),

      updateHabit: (habit: ExtendedHabitProps) =>
        set({
          habits: get().habits.map((h) => (h.id === habit.id ? habit : h)),
        }),

      completeHabit: (
        habitId: string,
        date: string,
        prayer: string,
        isCompleted: boolean
      ) => {
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

        // Save to appropriate AsyncStorage location
        get().saveHabitsToStorage();
      },

      resetHabits: () => set({ habits: [], selectedHabitId: null }),

      getHabitById: (habitId: string) =>
        get().habits.find((h) => h.id === habitId),

      loadAllHabits: async () => {
        try {
          // Load individual habits
          const habitsData = await AsyncStorage.getItem("habits");
          const individualHabits = habitsData ? JSON.parse(habitsData) : [];

          // Add source property to individual habits
          const processedIndividualHabits = individualHabits.map(
            (habit: any) => ({
              ...habit,
              bestStreak:
                typeof habit.bestStreak === "number" ? habit.bestStreak : 0,
              source: "individual" as const,
            })
          );

          // Load bundle habits
          const bundlesData = await AsyncStorage.getItem("bundles");
          const bundles = bundlesData ? JSON.parse(bundlesData) : [];

          // Extract habits from bundles with unique IDs
          const bundleHabits = bundles.flatMap(
            (bundle: any, bundleIndex: number) =>
              (bundle.habits || []).map((habit: any, habitIndex: number) => ({
                ...habit,
                bestStreak:
                  typeof habit.bestStreak === "number" ? habit.bestStreak : 0,
                // Create unique ID by combining bundle ID and habit ID with index for extra uniqueness
                id: `bundle_${bundle.id || bundle.title || bundleIndex}_${habit.id || habitIndex}`,
                source: "bundle" as const,
                bundleTitle: bundle.title,
              }))
          );

          // Combine all habits and ensure unique IDs
          const allHabits = [...processedIndividualHabits, ...bundleHabits];

          // Ensure no duplicate IDs by adding index if needed
          const uniqueHabits = allHabits.map((habit: any, index: number) => {
            const existingHabits = allHabits.slice(0, index);
            const hasDuplicate = existingHabits.some(
              (h: any) => h.id === habit.id
            );
            return hasDuplicate
              ? { ...habit, id: `${habit.id}_${index}` }
              : habit;
          });

          set({ habits: uniqueHabits });
        } catch (error) {
          console.error("Error loading habits:", error);
          set({ habits: [] });
        }
      },

      saveHabitsToStorage: async () => {
        const { habits } = get();

        // Separate individual habits from bundle habits
        const individualHabitsToSave = habits.filter(
          (h) => !h.source || h.source === "individual"
        );
        const bundleHabitsToSave = habits.filter((h) => h.source === "bundle");

        // Save individual habits
        await AsyncStorage.setItem(
          "habits",
          JSON.stringify(
            individualHabitsToSave.map((h) => ({
              ...h,
              isCompletedForSelectedDay: undefined, // Don't store computed data
            }))
          )
        );

        // Update bundles with their updated habits
        if (bundleHabitsToSave.length > 0) {
          const bundlesData = await AsyncStorage.getItem("bundles");
          const bundles = bundlesData ? JSON.parse(bundlesData) : [];

          const updatedBundles = bundles.map((bundle: any) => {
            const bundleHabits = bundleHabitsToSave.filter((h) =>
              h.id.startsWith(`bundle_${bundle.id || bundle.title}_`)
            );

            if (bundleHabits.length > 0) {
              // Update the habits in this bundle
              const updatedBundleHabits = bundle.habits.map((habit: any) => {
                const updatedHabit = bundleHabits.find(
                  (h) =>
                    h.id === `bundle_${bundle.id || bundle.title}_${habit.id}`
                );
                return updatedHabit
                  ? {
                      ...habit,
                      completed: updatedHabit.completed,
                      streak: updatedHabit.streak,
                      bestStreak:
                        typeof updatedHabit.bestStreak === "number"
                          ? updatedHabit.bestStreak
                          : 0,
                    }
                  : habit;
              });

              return {
                ...bundle,
                habits: updatedBundleHabits,
              };
            }
            return bundle;
          });

          await AsyncStorage.setItem("bundles", JSON.stringify(updatedBundles));
        }
      },

      clearAllStorage: async () => {
        try {
          await AsyncStorage.clear();
          set({ habits: [], selectedHabitId: null });
          console.log("habits cleared");
          console.log("habits", get().habits);
        } catch (error) {
          console.error("Error clearing storage:", error);
        }
      },
    }),
    {
      name: "habits-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    }
  )
);

export const selectSelectedHabit = (s: HabitsState) =>
  s.habits.find((h) => h.id === s.selectedHabitId) || null;
