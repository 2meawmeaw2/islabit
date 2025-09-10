import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SimpleHabitCard } from "@/components/tracking/SimpleHabitCard";
import { ScrollView } from "react-native";
import { useHabitsStore } from "@/store/habitsStore";
import { useRouter } from "expo-router";
export default function HabitsTrackingPlaceholder() {
  const habits = useHabitsStore((s) => s.habits);
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 outline-1 outline-red-500">
      <ScrollView className="py-2 px-1">
        {habits.map((habit) => (
          <SimpleHabitCard
            key={habit.id}
            title={habit.title}
            subtitle={habit.quote}
            streak={habit.streak}
            color={"#00AEEF"}
            onPress={() =>
              router.push({
                pathname: "/time/habitDetails",
                params: { habit: JSON.stringify(habit) },
              })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
