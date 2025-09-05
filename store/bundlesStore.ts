import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

// Local shapes based on how bundles are saved under the "bundles" key
export interface BundleDates {
  enrolled_at: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  current_day: number;
  is_active: boolean;
  completed_days: string[];
  last_activity: string;
}

export interface BundleHabitLocal {
  id: string;
  title: string;
  quote?: string;
  description: string;
  relatedDays: number[];
  relatedSalat: string[];
  category: { text: string; hexColor: string };
  completed: { date: string; prayer: string }[] | string[];
  streak: number;
  bestStreak: number;
}

export interface BundleLocal {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: { text: string; hexColor: string };
  image_url: string;
  dates: BundleDates;
  habits: BundleHabitLocal[];
  color: string;
}

interface BundlesState {
  bundles: BundleLocal[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  initialize: () => Promise<void>;
  setBundles: (items: BundleLocal[]) => Promise<void>;
  getBundleById: (id: string) => BundleLocal | undefined;
  addOrUpdateBundle: (bundle: BundleLocal) => Promise<void>;
  updateBundle: (
    id: string,
    updater: (b: BundleLocal) => BundleLocal
  ) => Promise<void>;
  removeBundle: (id: string) => Promise<void>;
  clearBundles: () => Promise<void>;
}

export const useBundlesStore = create<BundlesState>((set, get) => ({
  bundles: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem("bundles");
      const parsed: BundleLocal[] = raw ? JSON.parse(raw) : [];
      set({ bundles: parsed, isHydrated: true });
    } catch (error) {
      console.error("Error hydrating bundles:", error);
      set({ bundles: [], isHydrated: true });
    }
  },

  initialize: async () => {
    try {
      const raw = await AsyncStorage.getItem("bundles");
      const parsed = raw ? JSON.parse(raw) : [];

      const normalized: BundleLocal[] = Array.isArray(parsed)
        ? parsed.map((b: any) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            description: b.description,
            category: b.category,
            color: b.color,
            image_url: b.image_url || "",
            dates: b.dates,
            habits: Array.isArray(b.habits)
              ? b.habits.map((h: any) => ({
                  id: h.id,
                  title: h.title,
                  quote: h.quote,
                  description: h.description,
                  relatedDays: Array.isArray(h.relatedDays)
                    ? h.relatedDays
                    : [0, 1, 2, 3, 4, 5, 6],
                  relatedSalat: Array.isArray(h.relatedSalat)
                    ? h.relatedSalat
                    : ["fajr"],
                  category: h.category || b.category,
                  completed: Array.isArray(h.completed) ? h.completed : [],
                  streak: typeof h.streak === "number" ? h.streak : 0,
                  bestStreak:
                    typeof h.bestStreak === "number" ? h.bestStreak : 0,
                }))
              : [],
          }))
        : [];

      set({ bundles: normalized, isHydrated: true });

      if (!raw) {
        await AsyncStorage.setItem("bundles", JSON.stringify(normalized));
      }
    } catch (error) {
      console.error("Error initializing bundles:", error);
      set({ bundles: [], isHydrated: true });
    }
  },

  setBundles: async (items: BundleLocal[]) => {
    set({ bundles: items });
    try {
      await AsyncStorage.setItem("bundles", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving bundles:", error);
    }
  },

  getBundleById: (id: string) => get().bundles.find((b) => b.id === id),

  addOrUpdateBundle: async (bundle: BundleLocal) => {
    const existing = get().bundles;
    const index = existing.findIndex((b) => b.id === bundle.id);
    const next =
      index >= 0
        ? existing.map((b) => (b.id === bundle.id ? bundle : b))
        : [...existing, bundle];
    await get().setBundles(next);
  },

  updateBundle: async (id, updater) => {
    const next = get().bundles.map((b) => (b.id === id ? updater(b) : b));
    await get().setBundles(next);
  },

  removeBundle: async (id: string) => {
    const next = get().bundles.filter((b) => b.id !== id);
    await get().setBundles(next);
  },

  clearBundles: async () => {
    try {
      await AsyncStorage.removeItem("bundles");
    } catch (error) {
      console.error("Error clearing bundles:", error);
    } finally {
      set({ bundles: [] });
    }
  },
}));

export const selectBundles = (s: BundlesState) => s.bundles;
export const selectIsBundlesHydrated = (s: BundlesState) => s.isHydrated;
