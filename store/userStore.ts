import type { User } from "@/types/user";
import { create } from "zustand";

interface UserState {
  profile: User | null;
  setProfile: (profile: User) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));

export const selectIsAuthenticated = (s: UserState) => Boolean(s.profile?.id);
