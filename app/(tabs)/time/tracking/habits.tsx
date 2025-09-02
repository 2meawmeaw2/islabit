import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { SimpleHabitCard } from "@/components/SimpleHabitCard";

export default function HabitsTrackingPlaceholder() {
  return (
    <SafeAreaView className="flex-1 outline-1 outline-red-500">
      <SimpleHabitCard
        title="قراءة القرآن"
        subtitle="بعد صلاة الفجر"
        onPress={() => console.log("Custom action")}
      />
    </SafeAreaView>
  );
}
