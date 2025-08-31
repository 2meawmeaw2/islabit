import HabitBundlesSection from "@/components/habits/HabitBundlesSection";
import TrendingSection from "@/components/habits/TrendingSection";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import HabitTypesSection from "@/components/habits/HabitTypesSection";
import { useHomeData } from "@/lib/use-home-data";

const AllHabits = () => {
  // Use centralized data fetching hook
  const { bundles, trendingHabits, isLoading, error, refetch } = useHomeData();
  console.log("trendingHabits", trendingHabits);
  console.log("bundles", bundles);
  const handleHabitTypePress = (typeId: string) => {
    // Navigate to explore habits page with category filter
    router.push({
      pathname: "/home/explore-habits",
      params: { category: typeId },
    });
  };

  const handleBundlePress = (bundleId: string) => {
    // Find the bundle data
    const bundle = bundles.find((b) => b.id === bundleId);
    if (bundle) {
      // Navigate to single bundle page with bundle data
      router.push({
        pathname: "/home/[singlebundle]",
        params: { singlebundle: bundleId, bundleData: JSON.stringify(bundle) },
      });
    }
  };

  const handleTrendingHabitPress = (habitId: string) => {
    // Navigate to habit details or add to user's habits
    router.push({
      pathname: "/home/explore-habits",
      params: { habitId: String(habitId) },
    });
  };

  const handleTrendingBundlePress = (bundleId: string) => {
    // Find the bundle data
    const bundle = bundles.find((b) => b.id === bundleId);
    if (bundle) {
      // Navigate to single bundle page with bundle data
      router.push({
        pathname: "/home/[singlebundle]",
        params: { singlebundle: bundleId, bundleData: JSON.stringify(bundle) },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row-reverse items-center justify-between px-4 bg-fore h-16">
        <Text className="font-ibm-plex-arabic-semibold text-2xl text-text-brand">
          اكتشف
        </Text>
        <Pressable
          onPress={() => router.push("/home/explore-bundles")}
          className="flex-row-reverse items-center gap-2"
        >
          <Ionicons name="apps" size={18} color="#00AEEF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="py-6 gap-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* First HabitBundlesSection */}
        <HabitBundlesSection
          onBundlePress={handleBundlePress}
          bundles={bundles}
          isLoading={isLoading}
          error={error}
        />

        {/* Trending Section - Habits and Bundles */}
        <TrendingSection
          onHabitPress={handleTrendingHabitPress}
          onBundlePress={handleTrendingBundlePress}
          trendingHabits={trendingHabits}
          trendingBundles={bundles.slice(0, 3)}
          isLoading={isLoading}
          error={error}
        />
        {/* Second HabitBundlesSection */}
        <HabitTypesSection onHabitTypePress={handleHabitTypePress} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllHabits;
