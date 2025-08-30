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
import { router } from "expo-router";

const AllHabits = () => {
  const handleHabitTypePress = (typeId: string) => {
    // Navigate to explore habits page with category filter
    router.push({
      pathname: "/home/explore-habits",
      params: { category: typeId },
    });
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
        {/* Explore More Button */}
        <Pressable
          onPress={() => {
            // Show options for exploring more
            // For now, navigate to explore bundles
            router.push("/home/explore-bundles");
          }}
          className="flex-row-reverse items-center gap-2"
        >
          <Ionicons name="apps" size={18} color="#00AEEF" />
        </Pressable>
      </View>

      {/* Quick Explore Section */}
      <View className="px-6 py-4 bg-white/5 mx-4 rounded-2xl mb-6">
        <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary text-right mb-4">
          اكتشف المزيد
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => router.push("/home/explore-bundles")}
            className="flex-1 bg-brand/20 border border-brand/30 rounded-xl p-4 items-center"
          >
            <Ionicons name="layers" size={24} color="#00AEEF" />
            <Text className="font-ibm-plex-arabic-medium text-sm text-text-primary mt-2 text-center">
              رحلات العادات
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/home/explore-habits")}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl p-4 items-center"
          >
            <Ionicons name="star" size={24} color="#00AEEF" />
            <Text className="font-ibm-plex-arabic-medium text-sm text-text-primary mt-2 text-center">
              عادات فردية
            </Text>
          </Pressable>
        </View>
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
