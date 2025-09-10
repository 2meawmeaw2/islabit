import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBundlesStore, BundleLocal } from "@/store/bundlesStore";
import PercentageCircle from "@/components/PercentageCircle";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { format, parseISO } from "date-fns";
import tokens from "@/tokens";
import { SimpleHabitCard } from "@/components/tracking/SimpleHabitCard";

export default function BundleDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bundle, setBundle] = useState<BundleLocal | null>(null);
  const getBundleById = useBundlesStore((state) => state.getBundleById);
  console.log("bundle from this single tracking", bundle);
  useEffect(() => {
    if (id) {
      const bundleData = getBundleById(id);
      if (bundleData) {
        setBundle(bundleData);
      }
    }
  }, [id, getBundleById]);

  if (!bundle) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <Text className="text-text-primary">Loading bundle...</Text>
      </SafeAreaView>
    );
  }

  // Calculate progress and statistics
  const totalDays = bundle.dates?.duration_days || 30;
  const completedDays = bundle.dates?.completed_days?.length || 0;
  const progress =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const daysLeft = totalDays - completedDays; // Days left = total - completed (more accurate)

  // Calculate best streak
  // This is simplified and would need actual logic for consecutive days
  const bestStreak = Math.max(
    completedDays,
    (bundle.habits || []).reduce(
      (max, habit) => Math.max(max, habit.bestStreak || 0),
      0
    )
  );

  // Calculate missed days (days that have passed but weren't completed)
  const today = new Date();
  const startDate = new Date(bundle.dates?.start_date || today);
  const daysPassed = Math.max(
    0,
    Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const missedDays = Math.max(0, daysPassed - completedDays);

  // Progress Circle Component with animated percentage
  const ProgressCircle = ({ percentage }: { percentage: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            rotate: withSpring(`${percentage * 3.6}deg`, {
              damping: 15,
              stiffness: 100,
            }),
          },
        ],
      };
    });

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <View style={styles.progressBackground} />
          <Animated.View
            style={[
              styles.progressFill,
              animatedStyle,
              { backgroundColor: bundle.color },
            ]}
          />
          <View style={styles.progressCenter}>
            <Text className="text-text-primary font-ibm-plex-arabic-bold text-3xl">
              {Math.round(percentage)}%
            </Text>
            <Text className="text-text-primary font-ibm-plex-arabic-medium text-sm">
              مكتمل
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className="flex-1">
        {/* Header with Back Button */}
        <View className="px-4 pt-4 pb-2 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="bg-fore rounded-full p-2 mr-3"
          >
            <Ionicons name="chevron-back" size={24} color="#6C7684" />
          </Pressable>

          <Text className="text-text-primary font-ibm-plex-arabic-semibold text-lg">
            تفاصيل الحزمة
          </Text>
        </View>

        {/* Bundle Header with Icon Style */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          className="px-4 pt-2 pb-6 items-center w-full"
        >
          <View className="bg-fore p-6 rounded-2xl w-full  items-center">
            {/* Large Icon Container */}
            <View
              className="w-24 h-24 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: `${bundle.color}15` }} // Light beige background
            >
              <MaterialCommunityIcons
                name="flower"
                size={40}
                color={bundle.color}
              />
            </View>

            {/* Title */}
            <Text
              className="font-ibm-plex-arabic-semibold text-xl mb-2"
              style={{ color: bundle.color }}
            >
              {bundle.title}
            </Text>

            {/* Subtitle */}
            <Text
              className="font-ibm-plex-arabic text-sm mb-4"
              style={{ color: bundle.color }}
            >
              {bundle.subtitle}
            </Text>
          </View>
        </Animated.View>

        {/* Bundle Description */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          className="px-4 pb-6"
        >
          <View className="bg-fore p-4 rounded-2xl">
            <Text className="text-center  text-text-primary font-ibm-plex-arabic-semibold text-xl mt-4 mb-4">
              الوصف
            </Text>
            <Text className=" text-center leading-relaxed tracking-wide text-text-secondary font-ibm-plex-arabic text-sm">
              {bundle.description || "لا يوجد وصف لهذه الحزمة"}
            </Text>
          </View>
        </Animated.View>

        {/* Statistics */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          className="px-4 pb-6"
        >
          <View className="bg-fore gap-2 p-4 rounded-2xl">
            <Text className="text-center  text-text-primary font-ibm-plex-arabic-semibold text-xl mt-4 mb-4">
              معلومات عامة
            </Text>

            <View className="flex-row justify-between">
              {/* Best Streak */}
              <View className="items-center flex-1 bg-bg mx-2 py-4 rounded-2xl">
                <View className="bg-text-brand/10 rounded-full p-2 mb-2">
                  <MaterialCommunityIcons
                    name="fire"
                    size={20}
                    color="#00AEEF"
                  />
                </View>
                <Text className="text-text-primary font-ibm-plex-arabic-semibold text-xl">
                  {bestStreak}
                </Text>
                <Text className="text-text-muted font-ibm-plex-arabic text-xs">
                  أفضل تتابع
                </Text>
              </View>

              {/* Days Left */}
              <View className="items-center flex-1 bg-bg mx-2 py-4 rounded-2xl">
                <View className="bg-amber-500/10 rounded-full p-2 mb-2">
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={20}
                    color="#F59E0B"
                  />
                </View>
                <Text className="text-text-primary font-ibm-plex-arabic-semibold text-xl">
                  {daysLeft}
                </Text>
                <Text className="text-text-muted font-ibm-plex-arabic text-xs">
                  الأيام المتبقية
                </Text>
              </View>

              {/* Missed Days */}
              <View className="items-center flex-1 bg-bg mx-2 py-4 rounded-2xl ">
                <View className="bg-rose-500/10 rounded-full p-2 mb-2">
                  <MaterialCommunityIcons
                    name="calendar-remove"
                    size={20}
                    color="#F43F5E"
                  />
                </View>
                <Text className="text-text-primary font-ibm-plex-arabic-semibold text-xl">
                  {missedDays}
                </Text>
                <Text className="text-text-muted font-ibm-plex-arabic text-xs">
                  الأيام الفائتة
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Date Range Display */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(250)}
          className="px-4 pb-6"
        >
          <View className="bg-fore p-4 rounded-2xl">
            <Text className="text-center text-text-primary font-ibm-plex-arabic-semibold text-xl mb-4">
              فترة التنفيذ
            </Text>

            <View className="flex-row-reverse justify-between items-center">
              {/* Start Date */}
              <View className="flex-1  items-center bg-bg mx-2 py-4 rounded-2xl">
                <View className="bg-green-500/10 rounded-full p-2 mb-2">
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={20}
                    color="#10B981"
                  />
                </View>
                <Text className="text-text-primary font-ibm-plex-arabic-medium text-md mb-1">
                  تاريخ البداية
                </Text>
                <Text className="text-text-secondary font-ibm-plex-arabic text-xs text-center">
                  {bundle.dates?.start_date
                    ? format(parseISO(bundle.dates.start_date), "yyyy/MM/dd")
                    : "غير محدد"}
                </Text>
              </View>

              {/* End Date */}
              <View className="flex-1 items-center bg-bg mx-2 py-4 rounded-2xl">
                <View className="bg-text-brand/10 rounded-full p-2 mb-2">
                  <MaterialCommunityIcons
                    name="flag"
                    style={{ transform: [{ rotateY: "180deg" }] }}
                    size={20}
                    color="#00AEEF"
                  />
                </View>
                <Text className="text-text-primary font-ibm-plex-arabic-medium text-md mb-1">
                  تاريخ النهاية
                </Text>
                <Text className="text-text-secondary font-ibm-plex-arabic text-xs text-center">
                  {bundle.dates?.end_date
                    ? format(parseISO(bundle.dates.end_date), "yyyy/MM/dd")
                    : "غير محدد"}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Progress Circle */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(350)}
          className="px-4 pb-8"
        >
          <View className="bg-fore p-4 rounded-2xl items-center">
            <Text className="text-center text-text-primary font-ibm-plex-arabic-semibold text-xl mb-6">
              التقدم العام
            </Text>
            <ProgressCircle percentage={progress} />
          </View>
        </Animated.View>

        {/* Habits in Bundle */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(450)}
          className="px-4 pb-8"
        >
          <Text className="text-right text-text-primary font-ibm-plex-arabic-semibold text-lg mb-3">
            العادات في الحزمة
          </Text>

          {(bundle.habits || []).map((habit, index) => (
            <SimpleHabitCard
              key={habit.id}
              title={habit.title}
              subtitle={habit.quote}
              streak={habit.streak}
              color={bundle.color}
              onPress={() =>
                router.push({
                  pathname: "/time/habitDetails",
                  params: { habit: JSON.stringify(habit) },
                })
              }
            />
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles for Progress Circle
const styles = StyleSheet.create({
  progressContainer: {
    alignItems: "center",
  },
  progressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  progressBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 100,
    borderWidth: 8,
    borderColor: "#334155",
  },
  progressFill: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 100,
    borderWidth: 8,
    borderColor: "transparent",
    borderTopColor: "#00AEEF",
    transform: [{ rotate: "0deg" }],
  },
  progressCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
});
