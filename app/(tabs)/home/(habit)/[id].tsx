import {
  HabitShopDetailsScreen,
  SimpleBottomBar,
} from "@/components/habits/HabitShopDetailsScreen";
import { fetchHabitShopById } from "@/lib/habits-shop-api";
import { HabitsShopHabit } from "@/types/habit";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { toggleHabitLike } from "@/lib/habits-api";
import { supabase } from "@/utils/supabase";
const HabitShopDetails = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [habit, setHabit] = useState<HabitsShopHabit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const likeScale = useSharedValue(1);
  const [isLiked, setIsLiked] = useState(false);

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
          // Check if current user has liked this habit
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && habitData.likes?.includes(user.id)) {
            setIsLiked(true);
          }
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

  const handleLike = async () => {
    if (!habit || isLiking) return;

    setIsLiking(true);

    // Get current user ID for optimistic update
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("تنبيه", "يجب تسجيل الدخول أولاً");
      setIsLiking(false);
      return;
    }

    // Immediately update UI
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);

    // Optimistically update likes count
    setHabit((prev) =>
      prev
        ? {
            ...prev,
            likes: prev.likes
              ? newIsLiked
                ? [...prev.likes, user.id]
                : prev.likes.filter((id) => id !== user.id)
              : newIsLiked
                ? [user.id]
                : [],
          }
        : null
    );

    // Trigger haptic feedback immediately
    Haptics.impactAsync(
      newIsLiked
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );

    // Animate the like button
    likeScale.value = withSequence(
      withSpring(1.2, { damping: 2 }),
      withSpring(1, { damping: 2 })
    );

    try {
      // Update server in background
      const result = await toggleHabitLike(habit.id);
      if (!result.success) {
        // Rollback on failure
        setIsLiked(!newIsLiked);
        setHabit((prev) =>
          prev
            ? {
                ...prev,
                likes: prev.likes
                  ? newIsLiked
                    ? prev.likes.filter((id) => id !== user.id)
                    : [...prev.likes, user.id]
                  : !newIsLiked
                    ? [user.id]
                    : [],
              }
            : null
        );
        Alert.alert("خطأ", "فشل تحديث الإعجاب، حاول مرة أخرى");
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      // Rollback on error
      setIsLiked(!newIsLiked);
      setHabit((prev) =>
        prev
          ? {
              ...prev,
              likes: prev.likes
                ? newIsLiked
                  ? prev.likes.filter((id) => id !== user.id)
                  : [...prev.likes, user.id]
                : !newIsLiked
                  ? [user.id]
                  : [],
            }
          : null
      );
      Alert.alert("خطأ", "فشل تحديث الإعجاب، حاول مرة أخرى");
    } finally {
      setIsLiking(false);
    }
  };

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
          onLike={handleLike}
          isLiked={isLiked}
          isLiking={isLiking}
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
