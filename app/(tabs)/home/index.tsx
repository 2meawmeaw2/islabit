import HabitBundlesSection from "@/components/habits/HabitBundlesSection";
import HabitTypesSection from "@/components/habits/HabitTypesSection";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AllHabits = () => {
  const handleHabitTypePress = (typeId: string) => {
    // TODO: Navigate to habits of this type
    console.log(`Navigating to habit type: ${typeId}`);
  };

  const handleBundlePress = (bundleId: string) => {
    // Navigate to single bundle page
    // path: app/(tabs)/home/[singlebundle].tsx
    // we pass id as param "id"
    // using router from expo-router is not present here, keep simple via Link-less imperative using a lazy import to avoid refactor
    // To keep minimal changes, let's use a dynamic import of router
    const { router } = require("expo-router");
    router.push({
      pathname: "/home/[singlebundle]",
      params: { id: String(bundleId) },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar barStyle="light-content" />
      <View className="flex-row-reverse items-center justify-between px-4 bg-fore h-16">
        <Text className="font-ibm-plex-arabic-semibold text-2xl text-text-brand">
          اكتشف
        </Text>
        {/* Teaching Mode:
            To make this "more" button visually fit the home screen, let's use a Material "apps" icon (grid style) to suggest "more sections" or "explore". 
            This is a common, intuitive icon for "more features" in mobile UIs and fits the context better than a chevron.
        */}
        <Pressable className="flex-row-reverse items-center gap-2">
          <Ionicons name="apps" size={18} color="#00AEEF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="py-6 gap-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Habit Bundles - Horizontal Scroll */}
        <HabitBundlesSection onBundlePress={handleBundlePress} />

        {/* Habit Types - Vertical Scroll */}
        <HabitTypesSection onHabitTypePress={handleHabitTypePress} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllHabits;
