import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ewfvfnnmbecixxrqlbsq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZnZmbm5tYmVjaXh4cnFsYnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDIxODEsImV4cCI6MjA3MjIxODE4MX0.IUNckodJdCZCEY819opc23VBY1NRz_Qt1inf4r31_A0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
