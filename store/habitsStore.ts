import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CompletionRecord, HabitProps } from "../types/habit";

// Extended habit interface to include bundle information
interface ExtendedHabitProps extends HabitProps {
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

        // Update streak and bestStreak
        const nextStreak = isCompleted
          ? (updatedHabit.streak || 0) + 1
          : Math.max(0, (updatedHabit.streak || 0) - 1);
        const nextBestStreak = isCompleted
          ? Math.max(nextStreak, updatedHabit.bestStreak || 0)
          : updatedHabit.bestStreak || 0;

        // Update the habit
        const finalUpdatedHabit: ExtendedHabitProps = {
          ...updatedHabit,
          completed: newCompleted,
          streak: nextStreak,
          bestStreak: nextBestStreak,
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
