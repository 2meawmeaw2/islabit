// lib/users.ts
import { useUserStore } from "@/store/userStore";
import type { User } from "@/types/user";
import { supabase } from "@/utils/supabase";
// Adjust table name/columns to your schema
const TABLE = "users";

export async function loadUserById(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  useUserStore.setState({ profile: data as User });
  return data as User;
}
