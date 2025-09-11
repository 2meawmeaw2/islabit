import { create } from "zustand";
import { Bundle, fetchBundleById } from "@/lib/bundles";
import { HabitFromAPI, fetchAllHabits } from "@/lib/habits-api";
import { supabase } from "@/utils/supabase";

interface ExploreStore {
  // Data
  bundles: Bundle[];
  habits: HabitFromAPI[];
  selectedCategory: string | null;

  // Pagination state
  currentPage: number;
  hasMore: boolean;
  pageSize: number;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setBundles: (bundles: Bundle[]) => void;
  setHabits: (habits: HabitFromAPI[]) => void;
  setCategory: (category: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Fetch functions
  fetchMoreBundles: (pageSize?: number) => Promise<void>;
  fetchMoreHabits: (pageSize?: number) => Promise<void>;
  fetchByCategory: (category: string, pageSize?: number) => Promise<void>;
  clearFilters: () => void;
  resetPagination: () => void;
}

export const useExploreStore = create<ExploreStore>((set, get) => ({
  // Initial state
  bundles: [],
  habits: [],
  selectedCategory: null,
  currentPage: 1,
  hasMore: true,
  pageSize: 10, // Default page size
  isLoading: false,
  error: null,

  // Simple state setters
  setBundles: (bundles) => set({ bundles }),
  setHabits: (habits) => set({ habits }),
  setCategory: (category) => set({ selectedCategory: category }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Reset pagination state
  resetPagination: () => set({ currentPage: 1, hasMore: true }),

  // Fetch more bundles with pagination
  fetchMoreBundles: async (pageSize = get().pageSize) => {
    try {
      const { currentPage, bundles, isLoading } = get();

      // Don't fetch if already loading or no more data
      if (isLoading || !get().hasMore) return;

      set({ isLoading: true, error: null });

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("bundles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Update hasMore based on count
      const hasMore = count ? from + pageSize < count : false;

      set({
        bundles: currentPage === 1 ? data || [] : [...bundles, ...(data || [])],
        currentPage: currentPage + 1,
        hasMore,
        pageSize,
      });
    } catch (error) {
      set({ error: "حدث خطأ في تحميل المجموعات" });
      console.error("Error fetching explore bundles:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch more habits with pagination
  fetchMoreHabits: async (pageSize = get().pageSize) => {
    try {
      const { currentPage, habits, isLoading } = get();

      // Don't fetch if already loading or no more data
      if (isLoading || !get().hasMore) return;

      set({ isLoading: true, error: null });

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("habits")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Update hasMore based on count
      const hasMore = count ? from + pageSize < count : false;

      set({
        habits: currentPage === 1 ? data || [] : [...habits, ...(data || [])],
        currentPage: currentPage + 1,
        hasMore,
        pageSize,
      });
    } catch (error) {
      set({ error: "حدث خطأ في تحميل العادات" });
      console.error("Error fetching explore habits:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch both bundles and habits by category with pagination
  fetchByCategory: async (category: string, pageSize = get().pageSize) => {
    try {
      const { currentPage, bundles, habits, isLoading } = get();

      // Don't fetch if already loading or no more data
      if (isLoading || !get().hasMore) return;

      set({ isLoading: true, error: null, selectedCategory: category });

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      // Fetch both in parallel with pagination
      const [bundlesResponse, habitsResponse] = await Promise.all([
        supabase
          .from("bundles")
          .select("*", { count: "exact" })
          .eq("category->text", category)
          .range(from, to),
        supabase
          .from("habits")
          .select("*", { count: "exact" })
          .eq("category->text", category)
          .range(from, to),
      ]);

      if (bundlesResponse.error) throw bundlesResponse.error;
      if (habitsResponse.error) throw habitsResponse.error;

      // Calculate if there's more data
      const bundlesHasMore = bundlesResponse.count
        ? from + pageSize < bundlesResponse.count
        : false;
      const habitsHasMore = habitsResponse.count
        ? from + pageSize < habitsResponse.count
        : false;
      const hasMore = bundlesHasMore || habitsHasMore;

      set({
        bundles:
          currentPage === 1
            ? bundlesResponse.data || []
            : [...bundles, ...(bundlesResponse.data || [])],
        habits:
          currentPage === 1
            ? habitsResponse.data || []
            : [...habits, ...(habitsResponse.data || [])],
        currentPage: currentPage + 1,
        hasMore,
        pageSize,
      });
    } catch (error) {
      set({ error: "حدث خطأ في تحميل العناصر" });
      console.error("Error fetching by category:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Clear filters and reset pagination
  clearFilters: async () => {
    const store = get();
    store.resetPagination();
    set({ selectedCategory: null });
    await Promise.all([store.fetchMoreBundles(), store.fetchMoreHabits()]);
  },
}));
