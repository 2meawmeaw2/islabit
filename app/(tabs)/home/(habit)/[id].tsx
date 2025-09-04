// app/habit-details/[id].tsx
import { HabitFromAPI, fetchHabitById } from "@/lib/habits-api";
import { useHabitsStore } from "@/store/habitsStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const HabitDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [habit, setHabit] = useState<HabitFromAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get habits from store
  const habits = useHabitsStore((state) => state.habits);

  useEffect(() => {
    const loadHabit = async () => {
      if (!id) return;

      // First check if we have the habit in the store
      const storedHabit = habits.find((h) => h.id === id);

      if (storedHabit) {
        // Convert back to API format if needed
        const apiHabit: HabitFromAPI = {
          id: storedHabit.id,
          title: storedHabit.title,
          quote: storedHabit.quote || undefined,
          description: storedHabit.whyDescription || undefined,
          related_days: storedHabit.suggestedRelatedDays?.map(Number) || [],
          related_salat:
            storedHabit.suggestedRelatedSalat?.map((s) => s.key) || [],
          category: storedHabit.categories[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setHabit(apiHabit);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const habitData = await fetchHabitById(id);
        setHabit(habitData);
      } catch (err) {
        console.error("Error loading habit:", err);
        setError("حدث خطأ في تحميل العادة");
      } finally {
        setIsLoading(false);
      }
    };

    loadHabit();
  }, [id, habits]);

  if (isLoading) {
    return (
      <SafeAreaView className="bg-bg flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="font-ibm-plex-arabic text-text-primary">
            جاري التحميل...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !habit) {
    return (
      <SafeAreaView className="bg-bg flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-ibm-plex-arabic text-text-primary text-center mb-4">
            {error || "العادة غير موجودة"}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="px-6 py-2 bg-brand/20 border border-brand/30 rounded-full"
          >
            <Text className="font-ibm-plex-arabic text-brand">رجوع</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Fallbacks
  const habitName = habit.title ?? "عادة";
  const targetPerWeek = "5 أيام/أسبوع"; // Default value
  const bestTime = "بعد الفجر"; // Default value
  const emoji = "📘"; // Default emoji
  const quoteText = habit.quote ?? "من داوم على القليل بلّغه الكثير.";
  const habitWhy =
    habit.description ?? "بناء عادة يومية صغيرة يقوّي هويتك ويثبت مسارك.";

  // Local state (seeded once from data)
  const todayIdx = new Date().getDay(); // 0..6 Sun..Sat
  const [weeklyChecks, setWeeklyChecks] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [streak, setStreak] = useState<number>(0);
  const [remindersOn, setRemindersOn] = useState(true);

  const committedToday = weeklyChecks[todayIdx];

  // Nice Arabic date (compute directly—no memo)
  const dateStr = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toggleCommitToday = () => {
    setWeeklyChecks((prev) => {
      const next = [...prev];
      const was = next[todayIdx];
      next[todayIdx] = !was;

      // update streak locally (seeded from data)
      if (!was) setStreak((s) => s + 1);
      else setStreak((s) => Math.max(0, s - 1));

      return next;
    });
  };

  // animate the button
  const FAST_TIMING = {
    duration: 100, // try 160–220ms
    easing: Easing.bezier(0.31, 0.26, 0.92, 0.74),
  } as const;
  const FAST_TIMING_BACK = {
    duration: 100, // try 160–220ms
    easing: Easing.bezier(0.31, 0.26, 1, 0.63),
  } as const;

  const y = useSharedValue(0);
  const firstTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: y.value }],
    };
  });
  const y2 = useSharedValue(50);
  const secondTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: y2.value }],
    };
  });
  const yChange = () => {
    if (!committedToday) {
      y.value = withTiming(-50, FAST_TIMING);
      y2.value = withTiming(0, FAST_TIMING);
    } else {
      y.value = withTiming(0, FAST_TIMING_BACK);
      y2.value = withTiming(50, FAST_TIMING_BACK);
    }
  };

  return (
    <SafeAreaView className="bg-bg flex-1">
      <ScrollView>
        <View className="px-6 pb-8">
          {/* Header */}
          <View className="items-center mt-6 mb-4">
            <View className="w-20 h-20 rounded-full items-center justify-center bg-fore border border-border-primary">
              <Text className="text-3xl">{emoji}</Text>
            </View>
            <Text className="font-ibm-plex-arabic-bold text-2xl text-text-brand text-center mt-3">
              {habitName}
            </Text>
            <Text className="font-ibm-plex-arabic-light text-text-secondary text-center text-sm mt-1">
              {dateStr}
            </Text>
          </View>

          {/* Meta card */}
          <View className="bg-fore border border-border-primary rounded-xl p-4 mb-4">
            <View className="flex-row-reverse justify-between mb-3">
              <View className="items-end">
                <Text className="font-ibm-plex-arabic text-text-primary">
                  الهدف الأسبوعي
                </Text>
                <Text className="font-ibm-plex-arabic-light text-text-secondary">
                  {targetPerWeek}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-ibm-plex-arabic text-text-primary">
                  أفضل وقت
                </Text>
                <Text className="font-ibm-plex-arabic-light text-text-secondary">
                  {bestTime}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-ibm-plex-arabic text-text-primary">
                  سلسلة الالتزام
                </Text>
                <Text className="font-ibm-plex-arabic-light text-text-secondary">
                  {streak} يوم
                </Text>
              </View>
            </View>
          </View>

          {/* Why this habit */}
          <View className="bg-fore border border-border-primary rounded-xl p-4 mb-4">
            <Text className="font-ibm-plex-arabic text-text-primary text-right mb-1">
              لماذا هذه العادة؟
            </Text>
            <Text className="font-ibm-plex-arabic-thin text-text-secondary text-right leading-6">
              {habitWhy}
            </Text>

            {/* reminders */}
            <View className="flex-row-reverse items-center justify-between mt-4">
              <Text className="font-ibm-plex-arabic-medium text-text-primary">
                التذكيرات
              </Text>
              <Switch value={remindersOn} onValueChange={setRemindersOn} />
            </View>
          </View>

          {/* Commitment button */}
          <TouchableOpacity
            onPress={() => {
              toggleCommitToday();
              yChange();
            }}
            activeOpacity={0.8} // controls how transparent it gets on press
            className="relative h-[50px] flex flex-1 justify-center items-center overflow-hidden rounded-lg"
            accessibilityLabel="التزام اليوم"
            accessibilityHint="اضغط لتسجيل الالتزام لليوم"
          >
            {/* Top label */}
            <Animated.Text
              // If you intended 300px down, do it in style:
              style={firstTextStyle}
              className="absolute top-0 left-0 z-10 rounded-lg h-[50px] font-ibm-plex-arabic-semibold py-3 text-center w-full bg-white bg-text-primary border-r-4 border-text-brand"
            >
              التزم اليوم
            </Animated.Text>

            {/* Background label */}
            <Animated.Text
              style={[secondTextStyle, { transform: [{ translateY: 50 }] }]}
              className="absolute left-0 rounded-lg h-[50px] font-ibm-plex-arabic-semibold py-3 text-center text-text-white w-full bg-black border border-r-4 border-text-brand"
            >
              تم الالتزام اليوم ✓
            </Animated.Text>
          </TouchableOpacity>

          {/* Quote (from data) */}
          {quoteText ? (
            <View className="bg-fore border-r-4 border-text-brand rounded-lg p-3 mt-4">
              <Text className="font-ibm-plex-arabic text-text-secondary text-center text-sm leading-5">
                {`"${quoteText}"`}
              </Text>
            </View>
          ) : null}

          {/* Secondary actions */}
          <View className="flex-row-reverse justify-center gap-3 mt-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="max-w-[125px] flex-1 mr-1 rounded-lg py-3 border border-border-secondary bg-fore"
            >
              <Text className="font-ibm-plex-arabic text-text-primary text-center">
                رجوع
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/", params: { id } })}
              className="max-w-[125px] flex-1 ml-1 rounded-lg py-3 border border-border-secondary bg-fore"
            >
              <Text className="font-ibm-plex-arabic text-text-primary text-center">
                تعديل العادة
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HabitDetails;
