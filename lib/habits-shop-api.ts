import { supabase } from "@/utils/supabase";
import { HabitsShopHabit, Category } from "@/types/habit";

// Function to fetch all habits from the existing habits table
export async function fetchAllHabitsShop(): Promise<HabitsShopHabit[]> {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .order("created_at", { ascending: false });
    console.log("data from habit suapbase", data);
    if (error) {
      console.error("Error fetching habits:", error);
      throw error;
    }

    // Transform the data to match our HabitsShopHabit interface
    return data.map(transformApiHabitToShopHabit);
  } catch (error) {
    console.error("Error in fetchAllHabitsShop:", error);
    throw error;
  }
}

// Function to fetch a single habit by ID
export async function fetchHabitShopById(
  id: string
): Promise<HabitsShopHabit | null> {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching habit by ID:", error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return transformApiHabitToShopHabit(data);
  } catch (error) {
    console.error("Error in fetchHabitShopById:", error);
    throw error;
  }
}

// Function to search habits by category
export async function fetchHabitsShopByCategory(
  categoryText: string
): Promise<HabitsShopHabit[]> {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .contains("category", { text: categoryText })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching habits by category:", error);
      throw error;
    }

    return data.map(transformApiHabitToShopHabit);
  } catch (error) {
    console.error("Error in fetchHabitsShopByCategory:", error);
    throw error;
  }
}

// Function to search habits by prayer time
export async function fetchHabitsShopByPrayer(
  prayerKey: string
): Promise<HabitsShopHabit[]> {
  try {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .contains("related_salat", [prayerKey])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching habits by prayer:", error);
      throw error;
    }

    return data.map(transformApiHabitToShopHabit);
  } catch (error) {
    console.error("Error in fetchHabitsShopByPrayer:", error);
    throw error;
  }
}

// Transform API data to HabitsShopHabit interface
function transformApiHabitToShopHabit(apiHabit: any): HabitsShopHabit {
  // Create default benefits based on the habit's category or description
  const defaultBenefits = [
    "تحسين الروتين اليومي",
    "زيادة الإنتاجية",
    "بناء عادة إيجابية",
    "تحقيق الأهداف",
  ];

  return {
    id: apiHabit.id,
    title: apiHabit.title,
    benefit: defaultBenefits, // Using default benefits since the table doesn't have this field
    quote: apiHabit.quote || "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    description: apiHabit.description || "عادة مفيدة لتحسين نمط الحياة",
    suggestedRelatedSalat: apiHabit.suggestedRelatedSalat || [],
    suggestedRelatedDays: (apiHabit.suggestedRelatedDays || []).map(
      (day: number) => day.toString()
    ),
    categories: apiHabit.category
      ? [apiHabit.category]
      : [{ text: "عام", hexColor: "#8B5CF6" }],
    color: apiHabit.color || "#8B5CF6",
    comments: apiHabit.comments || [],
    likes: apiHabit.likes || [],
    enrolled_users: apiHabit.enrolled_users || [],
  };
}

// Function to add a new habit to the existing habits table
export async function addHabitToShop(
  habit: Omit<HabitsShopHabit, "id">
): Promise<HabitsShopHabit> {
  try {
    const { data, error } = await supabase
      .from("habits")
      .insert({
        title: habit.title,
        quote: habit.quote,
        description: habit.description,
        related_salat: habit.suggestedRelatedSalat,
        related_days: habit.suggestedRelatedDays?.map((day) =>
          parseInt(day)
        ) || [0, 1, 2, 3, 4, 5, 6],
        category: habit.categories[0] || { text: "عام", hexColor: "#8B5CF6" },
        priority_color: habit.color,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding habit:", error);
      throw error;
    }

    return transformApiHabitToShopHabit(data);
  } catch (error) {
    console.error("Error in addHabitToShop:", error);
    throw error;
  }
}
