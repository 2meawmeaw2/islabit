import { create } from "zustand";
import { Bundle, fetchTrendingBundles } from "@/lib/bundles";
import { HabitFromAPI, fetchTrendingHabits } from "@/lib/habits-api";

// Define the store state
interface TrendingStore {
  trendingBundles: Bundle[];
  trendingHabits: HabitFromAPI[];
  isLoading: boolean;
  error: string | null;
  // Actions
  setBundles: (trendingBundles: Bundle[]) => void;
  setTrendingHabits: (habits: HabitFromAPI[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  // Fetch functions
  fetchTrending: () => Promise<void>;
}

// Create the store
export const useTrendingStore = create<TrendingStore>((set) => ({
  trendingBundles: [],
  trendingHabits: [],
  isLoading: false,
  error: null,

  // Actions
  setBundles: (trendingBundles) => set({ trendingBundles }),
  setTrendingHabits: (habits) => set({ trendingHabits: habits.slice(0, 3) }), // Only keep first 3 habits
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Fetch both trending bundles and habits
  fetchTrending: async () => {
    try {
      // Get current state
      const state = useTrendingStore.getState();

      // If we already have data, don't fetch again
      if (state.trendingBundles.length > 0 && state.trendingHabits.length > 0) {
        return;
      }

      set({ isLoading: true, error: null });

      // Fetch both in parallel
      const [bundlesData, habitsData] = await Promise.all([
        fetchTrendingBundles(),
        fetchTrendingHabits(),
      ]);

      set({
        trendingBundles: bundlesData || [],
        trendingHabits: (habitsData || []).slice(0, 3), // Only keep first 3 habits
      });
    } catch (error) {
      set({ error: "مياو :) حدث خطأ في تحميل العناصر الشائعة" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
