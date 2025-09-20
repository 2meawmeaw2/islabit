import { HabitProps, HabitsShopHabit } from "@/types/habit";
import { PrayerKey } from "@/types/salat";
import { supabase } from "@/utils/supabase";

// Type definitions for habits API
export interface HabitComment {
  id: string;
  userId: string;
  text: string;
  userName: string;
  createdAt: string;
}

export interface HabitFromAPI {
  id: string;
  title: string;
  quote?: string;
  description?: string;
  related_days: number[];
  related_salat: PrayerKey[];
  category: {
    text: string;
    hexColor: string;
  };
  comments?: HabitComment[];
  likes?: string[];
  enrolled_users?: string[];
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
      key: salat,
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
    const { data, error } = await supabase.from("habits").select("*").limit(3); // Get top 10 habits

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

    // Insert only safe columns to avoid schema mismatches in environments
    const insertData: any = {
      title: habit.title,
      quote: habit.quote ?? null,
      description: habit.description ?? null,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("habits")
      .insert([insertData])
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

// Add a comment to a habit
export async function addHabitComment(habitId: string, commentText: string) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "يجب تسجيل الدخول أولاً" };

    const { data: habit, error: fetchError } = await supabase
      .from("habits")
      .select("comments")
      .eq("id", habitId)
      .single();

    if (fetchError || !habit) return { error: "Habit not found" };

    const comments = habit.comments || [];
    const newComment = {
      id: Date.now().toString() + Math.random().toString(36),
      userId: user.id,
      text: commentText,
      userName: user.user_metadata?.full_name || "مستخدم",
      createdAt: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("habits")
      .update({ comments: [newComment, ...comments] })
      .eq("id", habitId);

    if (updateError) {
      console.error("Update error:", updateError);
      return { error: "فشل في إضافة التعليق" };
    }

    return { success: true, comment: newComment };
  } catch (err) {
    console.error("Exception in addHabitComment:", err);
    return { error: "حدث خطأ غير متوقع" };
  }
}

// Get comments for a habit
export async function getHabitComments(habitId: string) {
  const { data } = await supabase
    .from("habits")
    .select("comments")
    .eq("id", habitId)
    .single();

  return data?.comments || [];
}

// Toggle like on a habit (user can only like once)
export async function toggleHabitLike(habitId: string) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "يجب تسجيل الدخول أولاً" };

    const { data: habit, error: fetchError } = await supabase
      .from("habits")
      .select("likes")
      .eq("id", habitId)
      .single();

    if (fetchError || !habit) return { error: "Habit not found" };

    const likes = habit.likes || [];
    const userIndex = likes.indexOf(user.id);

    // If user already liked, remove like. If not, add like
    const newLikes =
      userIndex >= 0
        ? likes.filter((id) => id !== user.id)
        : [...likes, user.id];

    const { error: updateError } = await supabase
      .from("habits")
      .update({ likes: newLikes })
      .eq("id", habitId);

    if (updateError) {
      console.error("Update error:", updateError);
      return { error: "فشل في تحديث الإعجاب" };
    }

    return {
      success: true,
      liked: userIndex < 0,
      likesCount: newLikes.length,
    };
  } catch (err) {
    console.error("Exception in toggleHabitLike:", err);
    return { error: "حدث خطأ غير متوقع" };
  }
}

// Toggle enrollment in a habit
export async function toggleHabitEnrollment(habitId: string) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { error: "يجب تسجيل الدخول أولاً" };

    const { data: habit, error: fetchError } = await supabase
      .from("habits")
      .select("enrolled_users")
      .eq("id", habitId)
      .single();

    if (fetchError || !habit) return { error: "Habit not found" };

    const enrolledUsers = habit.enrolled_users || [];
    const userIndex = enrolledUsers.indexOf(user.id);

    // If user already enrolled, remove enrollment. If not, add enrollment
    const newEnrolledUsers =
      userIndex >= 0
        ? enrolledUsers.filter((id) => id !== user.id)
        : [...enrolledUsers, user.id];

    const { error: updateError } = await supabase
      .from("habits")
      .update({ enrolled_users: newEnrolledUsers })
      .eq("id", habitId);

    if (updateError) {
      console.error("Update error:", updateError);
      return { error: "فشل في تحديث التسجيل" };
    }

    return {
      success: true,
      enrolled: userIndex < 0,
      enrolledCount: newEnrolledUsers.length,
    };
  } catch (err) {
    console.error("Exception in toggleHabitEnrollment:", err);
    return { error: "حدث خطأ غير متوقع" };
  }
}
