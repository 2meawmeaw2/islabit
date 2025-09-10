import {
  HabitShopDetailsScreen,
  SimpleBottomBar,
} from "@/components/habits/HabitShopDetailsScreen";
import { fetchHabitShopById } from "@/lib/habits-shop-api";
import { HabitsShopHabit } from "@/types/habit";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const HabitShopDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [habit, setHabit] = useState<HabitsShopHabit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animated values for scroll-based header
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const visible = scrollY.value > 150;
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(visible ? 0 : 6, { duration: 200 }) },
      ],
    };
  });

  const imageTitleAnimatedStyle = useAnimatedStyle(() => {
    const visible = scrollY.value <= 150;
    return {
      opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
      transform: [
        { translateY: withTiming(visible ? 0 : -6, { duration: 200 }) },
      ],
    };
  });

  useEffect(() => {
    const loadHabit = async () => {
      if (!params.id || typeof params.id !== "string") {
        setError("معرف العادة غير صحيح");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const habitData = await fetchHabitShopById(params.id);
        if (habitData) {
          setHabit(habitData);
        } else {
          setError("العادة غير موجودة");
        }
      } catch (err) {
        console.error("Error loading habit:", err);
        setError("حدث خطأ في تحميل العادة");
      } finally {
        setIsLoading(false);
      }
    };

    loadHabit();
  }, [params.id]);

  const handleAddToHabits = async (habit: HabitsShopHabit) => {
    // Navigate to confirmation screen with habit data
    router.push({
      pathname: "/(tabs)/home/(habit)/confirmHabitEnroll",
      params: {
        habitData: JSON.stringify(habit),
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="h-full bg-bg justify-center items-center">
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text className="text-text-disabled font-ibm-plex-arabic mt-4">
          جاري تحميل العادة...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !habit) {
    return (
      <SafeAreaView className="h-full bg-bg justify-center items-center px-6">
        <View className="items-center">
          <Text className="text-red-400 font-ibm-plex-arabic-bold text-xl text-center mb-4">
            خطأ
          </Text>
          <Text className="text-text-disabled font-ibm-plex-arabic text-center">
            {error || "العادة غير موجودة"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Modern Header */}
      <View className="flex-row-reverse items-center justify-between px-6 py-4 bg-fore border-b border-white/10">
        <Animated.Text
          style={[titleAnimatedStyle, { color: habit.color }]}
          className="font-ibm-plex-arabic-bold text-xl "
        >
          {habit.title}
        </Animated.Text>
        <Pressable
          onPress={() => router.navigate("/(tabs)/home")}
          className="w-8 h-8 bg-white/10 rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        <HabitShopDetailsScreen
          habit={habit}
          onAddToHabits={handleAddToHabits}
          imageTitleAnimatedStyle={imageTitleAnimatedStyle}
        />
      </Animated.ScrollView>
      <SimpleBottomBar
        label="أضف إلى عاداتي"
        onPress={() => handleAddToHabits(habit)}
        disabled={isLoading}
        isLoading={isLoading}
        color={habit.color}
      />
    </SafeAreaView>
  );
};

export default HabitShopDetails;
