import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBundlesStore, BundleLocal } from "@/store/bundlesStore";
import PercentageCircle from "@/components/PercentageCircle";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { format, parseISO } from "date-fns";
import tokens from "@/tokens";

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
  const daysLeft = totalDays - (bundle.dates?.current_day || 0);

  // Calculate best streak
  // This is simplified and would need actual logic for consecutive days
  const bestStreak = Math.max(
    completedDays,
    (bundle.habits || []).reduce(
      (max, habit) => Math.max(max, habit.bestStreak || 0),
      0
    )
  );

  // Calculate missed days (simplified)
  const missedDays = (bundle.dates?.current_day || 0) - completedDays;

  // Timeline positions
  const currentPosition = (bundle.dates?.current_day || 0) / totalDays;

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

        {/* Bundle Header with Progress */}
        <Animated.View
          entering={FadeInDown.duration(500)}
          className="px-4 pt-2 pb-6 "
        >
          <View className="flex-row bg-fore p-4 justify-between rounded-2xl">
            <PercentageCircle
              size={80}
              strokeWidth={8}
              percentage={progress}
              progressColor={bundle.color}
              backgroundColor="transparent"
              trackColor="#2A2F3833"
              labelStyle={{
                color: bundle.color,
                fontFamily: tokens.fontFamily["ibm-plex-arabic-medium"],
              }}
            />

            <View className="  ml-4">
              <View
                style={{
                  backgroundColor: `${bundle.category.hexColor}15`,
                  paddingHorizontal: 5, // Add horizontal padding to keep the text from touching the border
                  alignSelf: "flex-end",
                  marginBottom: 5,
                }}
                className="rounded-full px-2 py-0.5"
              >
                <Text
                  style={{ color: bundle.category.hexColor }}
                  className="font-ibm-plex-arabic-medium text-xs pb-1 "
                >
                  {bundle.category.text}
                </Text>
              </View>

              <Text
                style={{ color: bundle.color }}
                className="  text-right font-ibm-plex-arabic-semibold mb-2 text-xl "
              >
                {bundle.title}
              </Text>
              <Text
                style={{ color: bundle.color }}
                className=" font-ibm-plex-arabic text-sm"
              >
                {bundle.subtitle}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Bundle Description */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          className="px-4 pb-6"
        >
          <View className="bg-fore p-4 rounded-2xl">
            <Text className="text-right text-text-primary font-ibm-plex-arabic-medium text-base mb-1">
              الوصف
            </Text>
            <Text className=" text-right text-text-muted font-ibm-plex-arabic text-sm">
              {bundle.description || "لا يوجد وصف لهذه الحزمة"}
            </Text>
          </View>
        </Animated.View>

        {/* Statistics */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          className="px-4 pb-6"
        >
          <View className="bg-fore p-4 rounded-2xl">
            <Text className="text-right text-text-primary font-ibm-plex-arabic-medium text-base mb-3">
              معلومات عامة
            </Text>

            <View className="flex-row justify-between">
              {/* Best Streak */}
              <View className="items-center flex-1">
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
              <View className="items-center flex-1">
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
              <View className="items-center flex-1">
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

        {/* Timeline */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(300)}
          className="px-4 pb-8"
        >
          <View className="bg-fore p-4 rounded-2xl">
            <Text className=" text-right text-text-primary font-ibm-plex-arabic-medium text-base mb-4">
              التقدم الزمني
            </Text>

            <View className="h-60 items-center">
              {/* Timeline Track */}
              <View className="absolute top-0 bottom-0 w-1 bg-slate-700/20 rounded-full" />

              {/* Start Point */}
              <View className="absolute top-0 z-10 items-center">
                <View className="bg-sky-500 rounded-full p-3">
                  <MaterialCommunityIcons name="cloud" size={20} color="#fff" />
                </View>
                <Text className="text-text-muted font-ibm-plex-arabic text-xs mt-2">
                  {bundle.dates?.start_date
                    ? format(parseISO(bundle.dates.start_date), "yyyy/MM/dd")
                    : "بداية"}
                </Text>
              </View>

              {/* Current Progress */}
              <View
                className="absolute items-center z-20"
                style={{ top: `${Math.min(currentPosition * 100, 75)}%` }}
              >
                <View className="bg-white rounded-full p-3 shadow-md">
                  <Text className="text-sky-500 font-ibm-plex-arabic-semibold text-sm">
                    {progress}%
                  </Text>
                </View>
              </View>

              {/* End Point */}
              <View className="absolute bottom-0 z-10 items-center">
                <Text className="text-text-muted font-ibm-plex-arabic text-xs mb-2">
                  {bundle.dates?.end_date
                    ? format(parseISO(bundle.dates.end_date), "yyyy/MM/dd")
                    : "نهاية"}
                </Text>
                <View className="bg-slate-700 rounded-full p-3">
                  <MaterialCommunityIcons
                    name="laptop"
                    size={20}
                    color="#fff"
                  />
                </View>
              </View>

              {/* Filled Track for Progress */}
              <View
                className="absolute top-0 w-1 bg-gradient-to-b from-sky-500 to-blue-600 rounded-full"
                style={{ height: `${Math.min(currentPosition * 100, 100)}%` }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Habits in Bundle */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          className="px-4 pb-8"
        >
          <Text className="text-right text-text-primary font-ibm-plex-arabic-semibold text-lg mb-3">
            العادات في الحزمة
          </Text>

          {(bundle.habits || []).map((habit, index) => (
            <Animated.View
              key={habit.id}
              entering={FadeInRight.duration(300).delay(index * 100)}
              className="bg-fore p-4 rounded-2xl mb-3"
            >
              <View className="flex-row-reverse items-center justify-between">
                <View className="flex-1">
                  <Text className="text-text-primary font-ibm-plex-arabic-medium text-base text-right">
                    {habit.title}
                  </Text>

                  <View className="flex-row-reverse items-center mt-1">
                    {habit.streak > 0 && (
                      <View className="flex-row-reverse items-center mr-2">
                        <MaterialCommunityIcons
                          name="fire"
                          size={14}
                          color="#F59E0B"
                        />
                        <Text className="text-amber-500 font-ibm-plex-arabic-medium text-xs mr-1">
                          {habit.streak} تتابع
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View
                  style={{ backgroundColor: `${bundle.color}15` }}
                  className="rounded-full p-1"
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={18}
                    color={bundle.color}
                  />
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
