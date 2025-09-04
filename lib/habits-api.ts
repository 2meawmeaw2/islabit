import { HabitProps, HabitsShopHabit } from "@/types/habit";
import { PrayerKey } from "@/types/salat";
import { supabase } from "@/utils/supabase";

// Type definitions for habits API
export interface HabitFromAPI {
  id: string;
  title: string;
  quote?: string;
  description?: string;
  related_days: number[];
  related_salat: string[];
  category: {
    text: string;
    hexColor: string;
  };
  created_at: string;
  updated_at: string;
}

// Convert API habit to local habit format for shop/explore
export const convertApiHabitToLocal = (
  apiHabit: HabitFromAPI
): HabitsShopHabit => {
  return {
    id: apiHabit.id, // Keep the UUID as string
    title: apiHabit.title,
    benefit: [], // Default empty array for benefits
    quote: apiHabit.quote || "",
    whyDescription: apiHabit.description || "",
    suggestedRelatedSalat: (apiHabit.related_salat || []).map((salat) => ({
      key: salat as any,
      name: salat,
      time: "",
      emoji: "🕌",
    })),
    suggestedRelatedDays: (apiHabit.related_days || []).map(
      (day) => day.toString() as any
    ),
    categories: [apiHabit.category],
  };
};

// Convert API habit to HabitProps for store usage
export const convertApiHabitToStore = (apiHabit: HabitFromAPI): HabitProps => {
  return {
    id: apiHabit.id,
    title: apiHabit.title,
    quote: apiHabit.quote,
    description: apiHabit.description,
    streak: 0, // Default streak for new habits
    bestStreak: 0, // Default best streak
    completedDates: [], // Initialize empty completed dates
    relatedSalat: (apiHabit.related_salat || []) as PrayerKey[],
    relatedDays: apiHabit.related_days || [],
    category: apiHabit.category,
  };
};

// Fetch all habits (for explore page)
export const fetchAllHabits = async (): Promise<HabitFromAPI[]> => {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all habits:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchAllHabits:", error);
    throw error;
  }
};

// Fetch trending habits (popular habits from all users)
export const fetchTrendingHabits = async (): Promise<HabitFromAPI[]> => {
  try {
    const { data, error } = await supabase.from("habits").select("*").limit(10); // Get top 10 habits

    if (error) {
      console.error("Error fetching trending habits:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchTrendingHabits:", error);
    throw error;
  }
};

// Fetch a single habit by ID
export const fetchHabitById = async (id: string): Promise<HabitFromAPI> => {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching habit:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in fetchHabitById:", error);
    throw error;
  }
};

// Create a new habit
export const createHabit = async (
  habit: Omit<HabitFromAPI, "id" | "created_at" | "updated_at">
): Promise<HabitFromAPI> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("habits")
      .insert([{ ...habit, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("Error creating habit:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createHabit:", error);
    throw error;
  }
};
