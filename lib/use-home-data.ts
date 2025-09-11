import { useTrendingStore } from "@/store/trending-store-supabase";
import { useEffect } from "react";
import { Bundle } from "./bundles";
import { HabitFromAPI } from "./habits-api";
interface HomeData {
  trendingBundles: Bundle[];
  trendingHabits: HabitFromAPI[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHomeData = (): HomeData => {
  const { trendingBundles, trendingHabits, isLoading, error, fetchTrending } =
    useTrendingStore();

  const fetchData = async () => {
    await fetchTrending();
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  return {
    trendingBundles,
    trendingHabits,
    isLoading,
    error,
    refetch: fetchData,
  };
};
