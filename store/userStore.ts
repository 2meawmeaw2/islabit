import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "../types/user";

interface UserState {
  profile: User | null;
  setProfile: (profile: User | null) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => AsyncStorage),
      // Keep only essential data if User grows large
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);

export const selectIsAuthenticated = (s: UserState) => Boolean(s.profile?.id);
