// components/PrayerHabitsSection.tsx
import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { ActionCard } from "./habitCard"; // <- adjust the path if needed
import { Ionicons } from "@expo/vector-icons";
import PercentageCircle from "../PercentageCircle";
import AnimatedHeader from "./AnimatedHeader";
import { HabitProps } from "@/types/habit";

type Props = {
  /** Small section label, e.g. "فجر" | "ظهر" | "عصر" | "مغرب" | "عشاء" */
  label: string;
  habits: HabitProps[];

  /** Callbacks (receive the habit id) */
  onToggleHabit?: (id: number, next: boolean) => void;
  onMoreHabit?: (id: number) => void;
  onPressHabit?: (id: number) => void;

  /** Optional className if you use NativeWind */
  className?: string;
};

export const PrayerHabitsSection: React.FC<Props> = memo(
  ({ label, habits, onToggleHabit, onMoreHabit, onPressHabit, className }) => {
    const allDone =
      habits.length > 0 && habits.every((habit) => habit.completed);

    const noTasks = habits.length === 0;
    const completedCount = habits.filter((h) => h.completed).length;
    const completionPercent = habits.length
      ? Math.round((completedCount / habits.length) * 100)
      : 0;
    return (
      <Animated.View
        layout={Layout.springify().damping(15).duration(400)}
        entering={FadeInDown.duration(250).springify()}
        className={`  border-[1px] border-text-disabled  ${className ?? ""}`}
        style={styles.wrapper}
      >
        {/* Header */}
        <AnimatedHeader
          label={label}
          completionPercent={completionPercent}
          initialExpanded={false}
        />

        {/* Section container */}
        <Animated.View
          layout={Layout.springify().damping(15).duration(200)}
          className=" px-3 border border-border-primary rounded-2xl"
          style={styles.cardBox}
        >
          {noTasks ? (
            <View className="py-6 px-4 items-center justify-center">
              <Text className="text-text-disabled font-ibm-plex-arabic text-[13px]">
                No tasks
              </Text>
            </View>
          ) : allDone ? (
            <View className="py-6 px-4 items-center justify-center">
              <Text className="text-text-disabled font-ibm-plex-arabic text-[13px]">
                All done
              </Text>
            </View>
          ) : (
            <View className="py-2 gap-3">
              {habits.map((h, idx) => (
                <Animated.View
                  layout={Layout.springify().damping(60)}
                  key={h.id}
                  entering={FadeInDown.delay(60 * idx).springify()}
                  className=""
                >
                  <ActionCard
                    id={"meaw"}
                    description="وصف لل عادة , حديث ..."
                    title={h.title}
                    streak={h.streak ?? 0}
                    completed={!!h.completed}
                    onToggle={(next) => onToggleHabit?.(parseInt(h.id), next)}
                    onMore={() => onMoreHabit?.(parseInt(h.id))}
                    onPress={() => onPressHabit?.(parseInt(h.id))}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    // small horizontal padding to breathe against screen edges
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 10,
    width: "90%",
    backgroundColor: "#00070A",
    borderWidth: 1,
    borderColor: "#6C7684",
  },
  labelChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  brandHairline: {
    height: 2,
    opacity: 0.5,
    borderRadius: 999,
  },
  cardBox: {
    overflow: "hidden",
  },
});
