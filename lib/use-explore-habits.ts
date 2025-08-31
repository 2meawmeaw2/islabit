import { useState, useEffect } from "react";
import { fetchAllHabits, convertApiHabitToLocal } from "./habits-api";
import { HabitsShopHabit } from "@/types/habit";

interface ExploreHabitsData {
  habits: HabitsShopHabit[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useExploreHabits = (): ExploreHabitsData => {
  const [habits, setHabits] = useState<HabitsShopHabit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all habits from Supabase
      const habitsData = await fetchAllHabits();

      // Convert API habits to local format
      const localHabits = habitsData.map(convertApiHabitToLocal);

      setHabits(localHabits);
    } catch (err) {
      console.error("Error loading explore habits data:", err);
      setError("حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    habits,
    isLoading,
    error,
    refetch: fetchData,
  };
};
