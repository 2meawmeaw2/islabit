import SvgHomeBg from "@/assets/images/svg-home-bg.svg";
import HabitBundlesSection from "@/components/habits/HabitBundlesSection";
import CategorySection from "@/components/habits/HabitTypesSection";
import TrendingSection from "@/components/habits/TrendingSection";
import { useHomeData } from "@/lib/use-home-data";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const AllHabits = () => {
  // Use centralized data fetching hook
  const { trendingBundles, trendingHabits, isLoading, error, refetch } =
    useHomeData();
  const handleHabitTypePress = (typeId: string) => {
    // Navigate to explore habits page with category filter
    router.push({
      pathname: "/home/(habit)",
      params: { category: typeId },
    });
  };

  const handleBundlePress = (bundle: any) => {
    // Serialize the bundle object to JSON string
    console.log("bundle");
    router.push({
      pathname: "/(tabs)/home/bundleCommit",
      params: {
        bundleData: JSON.stringify(bundle), // Convert to JSON string
      },
    });
  };

  const handleTrendingHabitPress = (habitId: string) => {
    // Navigate to habit details or add to user's habits
    router.push({
      pathname: "/home/(habit)",
      params: { habitId: String(habitId) },
    });
  };

  const handleTrendingBundlePress = (bundle: any) => {
    // Navigate to bundle page with bundle data directly
    router.push({
      pathname: "/(tabs)/home/bundleCommit",
      params: { bundleData: JSON.stringify(bundle) },
    });
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
        style={{ paddingBottom: 100 }}
        contentContainerClassName=" gap-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative ">
          <View
            style={{
              width: "100%",
              height: "150%",
              transform: [{ translateY: -100 }],
            }}
            className=" absolute top-0 right-0 -z-10"
          >
            <SvgHomeBg
              width="120%"
              height="120%"
              preserveAspectRatio="xMidYMid slice"
            />
          </View>

          <HabitBundlesSection
            onBundlePress={handleBundlePress}
            bundles={trendingBundles}
            isLoading={isLoading}
            error={error}
          />
        </View>
        {/* Trending Section - Habits and Bundles */}
        <TrendingSection
          onHabitPress={handleTrendingHabitPress}
          trendingHabits={trendingHabits}
          isLoading={isLoading}
          error={error}
        />
        {/* Second HabitBundlesSection */}
        <CategorySection
          onCategoryPress={(categoryId) =>
            router.push({
              pathname: "/home/(habit)",
              params: { category: categoryId },
            })
          }
          onExploreMore={() => router.navigate("/home/(habit)")}
        />
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllHabits;
