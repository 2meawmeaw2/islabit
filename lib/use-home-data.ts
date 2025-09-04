import { useHabitsStore } from "@/store/habitsStore";
import { HabitsShopHabit } from "@/types/habit";
import { useEffect, useState } from "react";
import { Bundle, fetchBundles } from "./bundles";
import { convertApiHabitToLocal, fetchTrendingHabits } from "./habits-api";

interface HomeData {
  bundles: Bundle[];
  trendingHabits: HabitsShopHabit[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHomeData = (): HomeData => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference the habits store for both reading and writing
  const habits = useHabitsStore((state) => state.habits);
  const setHabitsStore = useHabitsStore((state) => state.setHabits);
  const isHydrated = useHabitsStore((state) => state.isHydrated);

  // Extract trending habits from the store (first 3)
  const trendingHabits = habits.slice(0, 3);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch bundles
      const bundlesData = await fetchBundles();
      setBundles(bundlesData || []);

      // Only fetch habits if we don't have any in the store
      if (habits.length === 0 && isHydrated) {
        // Fetch trending habits
        const habitsData = await fetchTrendingHabits();

        // Convert API habits to local format
        const convertedHabits = habitsData.map(convertApiHabitToLocal);

        // Update the Zustand store with all habits
        setHabitsStore(convertedHabits);
      }
    } catch (err) {
      console.error("Error loading home data:", err);
      setError("حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount, but only if store is hydrated
  useEffect(() => {
    if (isHydrated) {
      fetchData();
    }
  }, [isHydrated]);

  return {
    bundles,
    trendingHabits,
    isLoading,
    error,
    refetch: fetchData,
  };
};
