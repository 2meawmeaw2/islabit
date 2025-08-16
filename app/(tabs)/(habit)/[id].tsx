// app/habit-details/[id].tsx
import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { habits, HabitItem } from "@/data/habits";

const HabitDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const habit = useMemo(
    () => habits.find((h) => String(h.id) === String(id)),
    [id]
  );

  // Fallbacks
  const habitName = habit?.habitName ?? "عادة";
  const targetPerWeek = habit?.targetPerWeek ?? "5 أيام/أسبوع";
  const bestTime = habit?.bestTime ?? "بعد الفجر";
  const emoji = habit?.emoji ?? "📘";
  const quoteText = habit?.quote?.text ?? "من داوم على القليل بلّغه الكثير.";
  const quoteSource = habit?.quote?.source;
  const habitWhy =
    habit?.why ?? "بناء عادة يومية صغيرة يقوّي هويتك ويثبت مسارك.";

  // --- Local state seeded from data ---
  const todayIdx = new Date().getDay(); // 0..6 Sun..Sat
  const [weeklyChecks, setWeeklyChecks] = useState<boolean[]>(
    habit?.weeklyChecks ?? [false, false, false, false, false, false, false]
  );
  const [streak, setStreak] = useState<number>(habit?.streak ?? 0);
  const [remindersOn, setRemindersOn] = useState(true);

  const committedToday = weeklyChecks[todayIdx];
  const completedThisWeek = weeklyChecks.filter(Boolean).length;

  // parse the number from "7 أيام/أسبوع"
  const targetDays = useMemo(() => {
    const m = targetPerWeek.match(/\d+/);
    return m ? Math.max(1, parseInt(m[0], 10)) : 5;
  }, [targetPerWeek]);

  const weekProgress = Math.min(1, completedThisWeek / Math.max(1, targetDays));

  const dateStr = useMemo(
    () =>
      new Date().toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

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
              long explaination + ressources to check
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
            onPress={toggleCommitToday}
            className={`rounded-lg py-3  ${
              committedToday
                ? "bg-fore border  border-r-4 border-text-primary"
                : "bg-text-primary border-r-4 border-text-brand"
            }`}
            accessibilityLabel="التزام اليوم"
            accessibilityHint="اضغط لتسجيل الالتزام لليوم"
          >
            <Text
              className={`font-ibm-plex-arabic-semibold text-center ${
                committedToday ? "text-text-white" : "text-black"
              }`}
            >
              {committedToday ? "تم الالتزام اليوم ✓" : "التزم اليوم"}
            </Text>
          </TouchableOpacity>

          {/* Quote (from data) */}
          {quoteText ? (
            <View className="bg-fore border-r-4 border-text-brand rounded-lg p-3 mt-4">
              <Text className="font-ibm-plex-arabic text-text-secondary text-center text-sm leading-5">
                {`“${quoteText}”`}
              </Text>
              {quoteSource ? (
                <Text className="font-ibm-plex-arabic-light text-text-disabled text-center text-xs mt-1">
                  {quoteSource}
                </Text>
              ) : null}
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
