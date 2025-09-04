import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SimpleHabitCard } from "@/components/tracking/SimpleHabitCard";
import { ScrollView } from "react-native";
export default function HabitsTrackingPlaceholder() {
  return (
    <SafeAreaView className="flex-1 outline-1 outline-red-500">
      <ScrollView>
        <SimpleHabitCard
          title="قراءة القرآن"
          subtitle="بعد صلاة الفجر"
          onPress={() => console.log("Custom action")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
