// lib/users.ts
import { supabase } from "@/utils/supabase";
import { useUserStore } from "@/store/userStore";
import type { User } from "@/types/user";

// Adjust table name/columns to your schema
const TABLE = "users";

export async function loadUserById(userId: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  useUserStore.getState().setProfile(data as User);
  return data as User;
}
