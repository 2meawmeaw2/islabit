import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { SimpleBundleCard } from "@/components/SimpleBundleCard";

export default function BundleTrackingPlaceholder() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <SimpleBundleCard
        title="روتين الصباح"
        subtitle="عادات الصباح لبداية يوم مثمر"
        habitCount={5}
        onPress={() => console.log("Bundle selected")}
      />
    </SafeAreaView>
  );
}
