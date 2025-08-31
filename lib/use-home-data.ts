import { useState, useEffect } from "react";
import { fetchBundles } from "./bundles";
import { fetchTrendingHabits, convertApiHabitToLocal } from "./habits-api";
import { HabitsShopHabit } from "@/types/habit";
import { Bundle } from "./bundles";

interface HomeData {
  bundles: Bundle[];
  trendingHabits: HabitsShopHabit[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHomeData = (): HomeData => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [trendingHabits, setTrendingHabits] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch bundles and trending habits in parallel
      const [bundlesData, habitsData] = await Promise.all([
        fetchBundles(),
        fetchTrendingHabits(),
      ]);

      // Convert API habits to local format and take first 3
      const convertedHabits = habitsData.map(convertApiHabitToLocal);
      const firstThreeHabits = convertedHabits.slice(0, 3);

      setBundles(bundlesData || []);
      setTrendingHabits(firstThreeHabits);
    } catch (err) {
      console.error("Error loading home data:", err);
      setError("حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    bundles,
    trendingHabits,
    isLoading,
    error,
    refetch: fetchData,
  };
};
