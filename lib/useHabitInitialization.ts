import { useHabitsStore } from "@/store/habitsStore";
import type { HabitProps } from "@/types/habit";
import { useEffect, useState } from "react";
import { convertApiHabitToStore, fetchAllHabits } from "./habits-api";

/**
 * Hook to initialize habits from local storage and fetch from API if needed
 * This should be used at the app root level to ensure habits are loaded before components need them
 */
export function useHabitInitialization() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get habits and isHydrated status from the store
  const habits = useHabitsStore((state) => state.habits);
  const isHydrated = useHabitsStore((state) => state.isHydrated);
  const setHabits = useHabitsStore((state) => state.setHabits);
  const resetHabits = useHabitsStore((state) => state.resetHabits);

  console.log("habits before", habits);

  useEffect(() => {
    // Function to fetch habits from API if needed
    async function loadHabits() {
      try {
        // If we have habits from storage and hydration is complete, check if they're in the correct format
        if (habits.length > 0 && isHydrated) {
          // Check if the first habit has the correct structure (HabitProps format)
          const firstHabit = habits[0];
          if (
            firstHabit &&
            "streak" in firstHabit &&
            "relatedSalat" in firstHabit
          ) {
            // Habits are in correct format, don't fetch
            setIsLoading(false);
            return;
          } else {
            // Habits are in wrong format, clear and refetch
            console.log("Habits in wrong format, clearing and refetching...");
            resetHabits();
          }
        }

        // Fetch habits from API since we don't have them in storage or they're in wrong format
        setIsLoading(true);
        const apiHabits = await fetchAllHabits();
        const localHabits: HabitProps[] = apiHabits.map(convertApiHabitToStore);

        // Update the store (which will also persist to AsyncStorage)
        setHabits(localHabits);

        setError(null);
      } catch (err) {
        console.error("Failed to load habits:", err);
        setError("Failed to load habits");
      } finally {
        setIsLoading(false);
      }
    }

    console.log("habits after", habits);

    // Only attempt to load habits if hydration process has completed
    if (isHydrated) {
      loadHabits();
    }
  }, [habits.length, isHydrated, setHabits, resetHabits]);

  return { isLoading, error, isHydrated };
}
