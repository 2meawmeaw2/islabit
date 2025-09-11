import { create } from "zustand";
import { HabitFromAPI, fetchTrendingHabits } from "@/lib/habits-api";

interface TrendingHabitsStore {
  trendingHabits: HabitFromAPI[];
  isLoading: boolean;
  error: string | null;
  // Actions
  setTrendingHabits: (habits: HabitFromAPI[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTrending: () => Promise<void>;
}

export const useTrendingHabitsStore = create<TrendingHabitsStore>((set) => ({
  trendingHabits: [],
  isLoading: false,
  error: null,

  // Actions
  setTrendingHabits: (habits) => set({ trendingHabits: habits }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Fetch trending habits
  fetchTrending: async () => {
    try {
      set({ isLoading: true, error: null });
      const habits = await fetchTrendingHabits();
      set({ trendingHabits: habits.slice(0, 3) }); // Only take first 3 habits
    } catch (error) {
      set({ error: "حدث خطأ في تحميل العادات الشائعة" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
