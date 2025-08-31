import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = "https://ewfvfnnmbecixxrqlbsq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZnZmbm5tYmVjaXh4cnFsYnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NDIxODEsImV4cCI6MjA3MjIxODE4MX0.IUNckodJdCZCEY819opc23VBY1NRz_Qt1inf4r31_A0";

// Create a web-compatible storage solution
const createWebStorage = () => {
  if (Platform.OS === "web") {
    return {
      getItem: (key: string) => {
        try {
          return Promise.resolve(localStorage.getItem(key));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
    };
  }
  return AsyncStorage;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createWebStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
