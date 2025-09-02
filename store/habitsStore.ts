import { create } from "zustand";
import type { HabitProps } from "../types/habit";

interface HabitsState {
  habits: HabitProps[];
  selectedHabitId: string | null;
  setHabits: (items: HabitProps[]) => void;
  selectHabit: (habitId: string | null) => void;
  updateHabit: (habit: HabitProps) => void;
  resetHabits: () => void;
}

export const useHabitsStore = create<HabitsState>()((set, get) => ({
  habits: [],
  selectedHabitId: null,
  setHabits: (items) => set({ habits: items }),
  selectHabit: (habitId) => set({ selectedHabitId: habitId }),
  updateHabit: (habit) =>
    set({
      habits: get().habits.map((h) => (h.id === habit.id ? habit : h)),
    }),
  resetHabits: () => set({ habits: [], selectedHabitId: null }),
}));

export const selectSelectedHabit = (s: HabitsState) =>
  s.habits.find((h) => h.id === s.selectedHabitId) || null;
