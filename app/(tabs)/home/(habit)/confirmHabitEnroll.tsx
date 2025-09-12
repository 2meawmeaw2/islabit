import { HabitsShopHabit, HabitProps, Category } from "@/types/habit";
import { PrayerKey } from "@/types/salat";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHabitsStore } from "@/store/habitsStore";
import Button from "@/components/Button";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/utils/supabase";
// Interface for habit enrollment settings
interface HabitEnrollmentSettings {
  selectedDays: number[]; // Days of week (0-6, where 0=Sunday)
  selectedPrayers: PrayerKey[];
  selectedColor: string;
}

const ConfirmHabitEnroll = () => {
  const { profile } = useUserStore();

  const params = useLocalSearchParams();
  const router = useRouter();
  const [habit, setHabit] = useState<HabitsShopHabit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentSettings, setEnrollmentSettings] =
    useState<HabitEnrollmentSettings>({
      selectedDays: [],
      selectedPrayers: [],
      selectedColor: "#00AEEF",
    });

  // Get habits store functions
  const { habits, setHabits, saveHabitsToStorage } = useHabitsStore();

  useEffect(() => {
    const loadHabit = async () => {
      if (!params.habitData || typeof params.habitData !== "string") {
        setError("بيانات العادة غير صحيحة");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const habitData = JSON.parse(params.habitData);

        if (habitData) {
          setHabit(habitData);

          // Initialize enrollment settings with habit's suggested values
          const suggestedDays =
            habitData.suggestedRelatedDays?.map((day: string) =>
              parseInt(day)
            ) || [];
          const suggestedPrayers = habitData.suggestedRelatedSalat || [];

          setEnrollmentSettings({
            selectedDays: suggestedDays,
            selectedPrayers: suggestedPrayers,
            selectedColor: habitData.color,
          });
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
  }, [params.habitData]);

  const handleConfirmEnrollment = async () => {
    if (!habit) return;
    try {
      const { data: habitRow, error: fetchErr } = await supabase
        .from("habits")
        .select("enrolled_users")
        .eq("id", habit.id)
        .single();

      if (fetchErr) {
        console.error("Failed to fetch enrolled_users:", fetchErr);
        throw fetchErr;
      }
      // Convert HabitsShopHabit to HabitProps with user customizations
      const newHabit: HabitProps = {
        id: `shop_${habit.id}_${Date.now()}`, // Unique ID combining shop ID and timestamp
        title: habit.title,
        quote: habit.quote,
        description: habit.description,
        streak: 0,
        bestStreak: 0,
        color: enrollmentSettings.selectedColor,
        completed: [], // No completions yet
        relatedDays: enrollmentSettings.selectedDays.sort((a, b) => a - b),
        relatedSalat: enrollmentSettings.selectedPrayers,
        category: {
          text: habit.categories[0]?.text || "عام",
          hexColor: enrollmentSettings.selectedColor,
        },
      };

      // Get existing habits from AsyncStorage
      const existingHabits = await AsyncStorage.getItem("habits");
      const habitsArray = existingHabits ? JSON.parse(existingHabits) : [];

      // Add the new habit
      habitsArray.push(newHabit);

      // Save to AsyncStorage
      await AsyncStorage.setItem("habits", JSON.stringify(habitsArray));

      // Update the habits store
      const updatedHabits = [
        ...habits,
        { ...newHabit, source: "individual" as const },
      ];
      setHabits(updatedHabits);

      // Save to storage using the store method
      await saveHabitsToStorage();
      const current = (habitRow?.enrolled_users ?? []) as string[];

      const next = Array.from(new Set([...current, profile?.id])); // de-dup

      const { error: updateErr } = await supabase
        .from("habits")
        .update({ enrolled_users: next })
        .eq("id", habit.id);

      if (updateErr) {
        console.error("Failed to update enrolled_users:", updateErr);
        throw updateErr;
      }

      console.log("Successfully added habit:", newHabit);

      // Show success message and navigate back

      Alert.alert(
        "تمت الإضافة بنجاح!",
        `تم إضافة عادة "${habit.title}" إلى عاداتك الشخصية`,
        [
          {
            text: "حسنًا",
            onPress: () => router.navigate("/(tabs)/time"),
          },
        ]
      );
    } catch (error) {
      console.error("Error creating habit:", error);
      Alert.alert(
        "خطأ",
        "حدث خطأ أثناء إضافة العادة. يرجى المحاولة مرة أخرى.",
        [{ text: "حسنًا" }]
      );
    } finally {
      setIsLoading(false);
    }
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
          <Pressable
            onPress={() => router.back()}
            className="mt-6 px-6 py-3 bg-primary rounded-xl"
          >
            <Text className="text-white font-ibm-plex-arabic-bold">العودة</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-fore border-b border-white/10">
        <Pressable
          onPress={() => router.back()}
          className="w-8 h-8 bg-white/10 rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Habit Preview */}
        <Animated.View entering={FadeInDown.delay(50)} className="mb-6">
          <View
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: `${enrollmentSettings.selectedColor}20`,
              borderColor: `${enrollmentSettings.selectedColor}40`,
            }}
          >
            <View className="flex-row justify-between items-center gap-3 mb-3">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: `${enrollmentSettings.selectedColor}30`,
                }}
              >
                <Ionicons
                  name="star"
                  size={24}
                  color={enrollmentSettings.selectedColor}
                />
              </View>
              <View className="flex-1 ">
                <Text className="font-ibm-plex-arabic-bold text-right text-lg text-text-primary">
                  {habit.title}
                </Text>
                <Text className="font-ibm-plex-arabic text-sm text-right text-text-secondary">
                  {habit.description}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Days Selection */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          className="mb-6 bg-fore px-4 py-4 rounded-2xl"
        >
          <Text className="font-ibm-plex-arabic-semibold text-lg text-right text-text-primary mb-6">
            أيام الممارسة
          </Text>
          <View className="flex-row-reverse flex-wrap gap-2">
            {[
              "الأحد",
              "الاثنين",
              "الثلاثاء",
              "الأربعاء",
              "الخميس",
              "الجمعة",
              "السبت",
            ].map((day, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  const newDays = enrollmentSettings.selectedDays.includes(
                    index
                  )
                    ? enrollmentSettings.selectedDays.filter((d) => d !== index)
                    : [...enrollmentSettings.selectedDays, index];
                  setEnrollmentSettings((prev) => ({
                    ...prev,
                    selectedDays: newDays,
                  }));
                }}
                className={`px-4 py-2 rounded-xl border `}
                style={{
                  borderWidth: 1,
                  borderStyle: "dashed",
                  backgroundColor: enrollmentSettings.selectedDays.includes(
                    index
                  )
                    ? enrollmentSettings.selectedColor
                    : undefined,
                  borderColor: enrollmentSettings.selectedDays.includes(index)
                    ? enrollmentSettings.selectedColor
                    : "#9CA3AF",
                }}
              >
                <Text
                  className={`font-ibm-plex-arabic-medium text-sm ${
                    enrollmentSettings.selectedDays.includes(index)
                      ? "text-white"
                      : "text-text-secondary"
                  }`}
                >
                  {day}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Prayers Selection */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          className="mb-6 px-4 py-4 rounded-2xl bg-fore"
        >
          <Text className="font-ibm-plex-arabic-semibold text-lg text-right text-text-primary mb-6">
            مرتبطة بصلاة
          </Text>
          <View className="flex-row-reverse flex-wrap gap-2">
            {[
              { key: "fajr", name: "الفجر", emoji: "🌅" },
              { key: "dhuhr", name: "الظهر", emoji: "☀️" },
              { key: "asr", name: "العصر", emoji: "🌤️" },
              { key: "maghrib", name: "المغرب", emoji: "🌇" },
              { key: "isha", name: "العشاء", emoji: "🌙" },
            ].map((prayer) => (
              <Pressable
                key={prayer.key}
                onPress={() => {
                  const newPrayers =
                    enrollmentSettings.selectedPrayers.includes(
                      prayer.key as PrayerKey
                    )
                      ? enrollmentSettings.selectedPrayers.filter(
                          (p) => p !== prayer.key
                        )
                      : [
                          ...enrollmentSettings.selectedPrayers,
                          prayer.key as PrayerKey,
                        ];
                  setEnrollmentSettings((prev) => ({
                    ...prev,
                    selectedPrayers: newPrayers,
                  }));
                }}
                className={`px-4 py-2 my-1 rounded-xl flex-row-reverse items-center gap-2 `}
                style={{
                  borderWidth: 1,
                  borderStyle: "dashed",
                  backgroundColor: enrollmentSettings.selectedPrayers.includes(
                    prayer.key as PrayerKey
                  )
                    ? enrollmentSettings.selectedColor
                    : undefined,
                  borderColor: enrollmentSettings.selectedPrayers.includes(
                    prayer.key as PrayerKey
                  )
                    ? enrollmentSettings.selectedColor
                    : "#9CA3AF",
                }}
              >
                <Text
                  className={`font-ibm-plex-arabic-medium text-sm ${
                    enrollmentSettings.selectedPrayers.includes(
                      prayer.key as PrayerKey
                    )
                      ? "text-white"
                      : "text-text-secondary"
                  }`}
                >
                  {prayer.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Color Selection */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          className="mb-8 px-4 py-4 rounded-2xl bg-fore"
        >
          <Text className="font-ibm-plex-arabic-semibold text-lg text-right text-text-primary mb-6">
            لون العادة
          </Text>
          <View className="flex-row-reverse flex-wrap gap-3">
            {[
              "#7E57C2",
              "#4CAF50",
              "#2196F3",
              "#FF9800",
              "#1A1E1F",
              "#000000",
              "#DC2626",
            ].map((color) => (
              <Pressable
                key={color}
                onPress={() =>
                  setEnrollmentSettings((prev) => ({
                    ...prev,
                    selectedColor: color,
                  }))
                }
                className={`w-10 h-10 rounded-full border-2 ${
                  enrollmentSettings.selectedColor === color
                    ? "border-white"
                    : "border-white/30"
                }`}
                style={{ backgroundColor: color }}
              >
                {enrollmentSettings.selectedColor === color && (
                  <View className="w-full h-full items-center justify-center">
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="px-6 py-4 bg-fore border-t border-white/10">
        <Button
          label="تأكيد إضافة العادة"
          variant="primary" // "primary" | "secondary" | "ghost"
          size="md" // "sm" | "md" | "lg"
          iconLeft={null} // optional
          styleError={{ backgroundColor: "#DC2626" }}
          iconSuccess={
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
          }
          fullWidth
          loadingText="جاري الإضافة..."
          errorText="حدث خطأ أثناء الإضافة. يرجى المحاولة مرة أخرى."
          completedText="تمت الإضافة بنجاح!"
          onPress={() => handleConfirmEnrollment()}
          style={{
            backgroundColor:
              enrollmentSettings.selectedDays.length === 0 || isLoading
                ? undefined
                : enrollmentSettings.selectedColor,
          }}
          className="py-4"
          textClassName="text-white font-ibm-plex-arabic-bold text-base"
        />
      </View>
    </SafeAreaView>
  );
};

export default ConfirmHabitEnroll;
