import { ANIMATION_CONFIG, useReducedMotion } from "@/lib/animations";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useEffect, useState } from "react";
import { AccessibilityInfo, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOut,
  FadeOutLeft,
  FadeOutRight,
  FadeOutUp,
  Layout,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import PercentageCircle from "../PercentageCircle";

type SalatHabit = {
  id: string;
  title: string;
  description?: string;
  streak: number;
  completed: {
    date: string;
    prayer: string;
  }[]; // Array of completion records with date and prayer
  priority?: string; // supports custom labels
  priorityColor?: string;
  isCompletedForSelectedDay?: boolean;
};

type Props = {
  salatName: string;
  salatTime?: string;
  habits: SalatHabit[];
  onToggleHabit: (id: string, completed: boolean) => void;
  onHabitPress: (habit: SalatHabit) => void;
  onAddHabit?: () => void;
};

// Simple priority indicator (dot)
const getPriorityIndicator = (priority?: string, color?: string) => {
  if (!priority) return "";
  return "●";
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SalatHabitsDisplay: React.FC<Props> = memo(
  ({ salatName, habits, onToggleHabit, onHabitPress, onAddHabit }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [wasAllCompleted, setWasAllCompleted] = useState(false);
    const reducedMotion = useReducedMotion();

    // Animation values
    const headerOpacity = useSharedValue(0);
    const progressScale = useSharedValue(0);

    // Check if habit is completed for the selected day
    const completedCount = habits.filter(
      (h) => h.isCompletedForSelectedDay
    ).length;
    const totalHabits = habits.length;
    const completionPercentage =
      totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

    // Auto-collapse when all habits are completed for today
    const allCompleted = totalHabits > 0 && completedCount === totalHabits;

    // If all habits are completed and not manually expanded, show collapsed state
    const shouldShowCollapsed = allCompleted && !isCollapsed;

    // Animate on mount
    useEffect(() => {
      if (reducedMotion) {
        headerOpacity.value = 1;
        progressScale.value = 1;
      } else {
        headerOpacity.value = withDelay(
          100,
          withTiming(1, { duration: ANIMATION_CONFIG.MEDIUM })
        );
        progressScale.value = withDelay(
          200,
          withSpring(1, ANIMATION_CONFIG.SPRING_CONFIG)
        );
      }
    }, []);

    // Auto-collapse when transitioning to all completed
    useEffect(() => {
      // If we just completed all habits (transition from not all completed to all completed)
      if (allCompleted && !wasAllCompleted && totalHabits > 0) {
        // Add a small delay for celebration feeling
        const timer = setTimeout(() => {
          setIsCollapsed(false); // This will trigger shouldShowCollapsed logic
          // Provide haptic feedback for achievement
        }, 100); // 800ms delay for smooth transition

        return () => clearTimeout(timer);
      }

      // Update the tracking state
      setWasAllCompleted(allCompleted);
    }, [allCompleted, wasAllCompleted, totalHabits]);

    // Announce achievement
    useEffect(() => {
      if (allCompleted) {
        AccessibilityInfo.announceForAccessibility(
          `أكملت جميع عادات ${salatName}`
        );
      }
    }, [allCompleted, salatName]);

    const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
    };

    const headerAnimatedStyle = useAnimatedStyle(() => ({
      opacity: headerOpacity.value,
    }));

    const progressAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: progressScale.value }],
    }));

    return (
      <Animated.View
        entering={FadeInDown.duration(300).springify()}
        layout={Layout.springify().damping(15)}
        className="mx-4 mb-6 mt-4"
      >
        {/* Clean Salat Header */}
        <AnimatedPressable
          onPress={shouldShowCollapsed ? toggleCollapse : undefined}
          className={`mb-4 ${shouldShowCollapsed ? "cursor-pointer" : ""}`}
          style={headerAnimatedStyle}
          accessibilityRole="button"
          accessibilityLabel={`${salatName} - ${completedCount} من ${totalHabits} عادات مكتملة`}
        >
          <View className="flex-row-reverse items-center justify-between">
            <View className="flex-row-reverse items-center gap-3">
              <View className="flex-row-reverse items-center mr-3">
                <Animated.Text
                  entering={FadeInRight.duration(300)}
                  exiting={FadeOutRight.duration(300)}
                  className={`font-ibm-plex-arabic-bold text-xl  ${
                    allCompleted ? "text-text-brand" : "text-text-primary"
                  }`}
                >
                  {salatName}
                </Animated.Text>
              </View>
            </View>

            {/* Simple Progress Circle */}
            <View className="flex-row-reverse items-center gap-2">
              {completionPercentage === 100 ? (
                <Animated.View
                  key={1}
                  layout={Layout.springify()}
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  className={`w-10 h-10 rounded-full items-center justify-center bg-text-brand`}
                >
                  <Text className={`text-lg text-white`}>✓</Text>
                </Animated.View>
              ) : (
                <Animated.View
                  key={2}
                  layout={Layout.springify()}
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={progressAnimatedStyle}
                >
                  <PercentageCircle
                    showLabel={false}
                    size={32}
                    strokeWidth={4}
                    percentage={Math.round(completionPercentage)}
                    colors={["#4ADE80", "#FACC15", "#00AEEF"]}
                    trackColor={allCompleted ? "#4B9AB5" : "#334155"}
                    backgroundColor="transparent"
                    roundedCaps
                    durationMs={reducedMotion ? 0 : 600}
                  />
                </Animated.View>
              )}

              {shouldShowCollapsed && (
                <AnimatedPressable
                  entering={FadeInLeft.duration(300)}
                  exiting={FadeOutLeft.duration(300)}
                  onPress={toggleCollapse}
                  className="p-2"
                  accessibilityLabel="طي القائمة"
                  accessibilityRole="button"
                >
                  <Ionicons name="chevron-down" size={16} color="#6C7684" />
                </AnimatedPressable>
              )}
            </View>
          </View>
        </AnimatedPressable>

        {/* Habits Container - Only show when expanded or not all completed */}
        {!shouldShowCollapsed && (
          <Animated.View
            entering={reducedMotion ? undefined : FadeIn.duration(300)}
            exiting={reducedMotion ? undefined : FadeOutUp.duration(300)}
            layout={reducedMotion ? undefined : Layout.springify().damping(15)}
            className={`rounded-xl border overflow-hidden ${
              allCompleted
                ? "bg-bg border-text-brand"
                : "bg-bg border-text-brand"
            }`}
          >
            {/* Simple Header when all completed */}
            {allCompleted && (
              <Animated.View
                entering={reducedMotion ? undefined : FadeIn}
                exiting={reducedMotion ? undefined : FadeOut}
                className="p-4 border-b border-text-brand flex-row-reverse items-center justify-between"
              >
                <View className="flex-row-reverse items-center gap-2">
                  <Animated.Text
                    entering={FadeInRight.duration(300)}
                    exiting={FadeOutRight.duration(300)}
                    className="text-text-brand font-ibm-plex-arabic-medium text-sm"
                  >
                    جميع العادات مكتملة
                  </Animated.Text>
                </View>
                <AnimatedPressable
                  entering={FadeInLeft.duration(300)}
                  exiting={FadeOutLeft.duration(300)}
                  onPress={toggleCollapse}
                  className="p-2"
                  accessibilityLabel="طي القائمة"
                  accessibilityRole="button"
                >
                  <Ionicons name="chevron-up" size={16} color="#6C7684" />
                </AnimatedPressable>
              </Animated.View>
            )}

            {habits.length === 0 ? (
              <View className="py-8 px-4 items-center">
                <Text className="text-text-disabled font-ibm-plex-arabic text-sm mt-2">
                  لا توجد عادات لهذا الوقت
                </Text>
                {onAddHabit && (
                  <AnimatedPressable
                    onPress={() => {
                      onAddHabit();
                    }}
                    className="mt-3 bg-text-brand rounded-lg px-4 py-2"
                    entering={reducedMotion ? undefined : FadeInUp.delay(200)}
                    accessibilityLabel="إضافة عادة جديدة"
                    accessibilityRole="button"
                  >
                    <Text className="text-white font-ibm-plex-arabic-medium text-sm">
                      إضافة عادة جديدة
                    </Text>
                  </AnimatedPressable>
                )}
              </View>
            ) : (
              <View className="p-4 gap-3">
                {habits
                  .sort((a, b) => {
                    // First, sort by completion status (completed habits go to bottom)
                    const aCompleted = a.isCompletedForSelectedDay;
                    const bCompleted = b.isCompletedForSelectedDay;

                    if (aCompleted !== bCompleted) {
                      return aCompleted ? 1 : -1; // Uncompleted first, completed last
                    }

                    // If both have same completion status, sort by priority
                    // Custom bundle priorities go on top
                    const isCustomA =
                      a.priority &&
                      !["low", "medium", "high"].includes(a.priority as any);
                    const isCustomB =
                      b.priority &&
                      !["low", "medium", "high"].includes(b.priority as any);
                    if (isCustomA !== isCustomB) return isCustomA ? -1 : 1;

                    const priorityOrder = { high: 3, medium: 2, low: 1 } as any;
                    const aPriority = priorityOrder[a.priority || "low"] || 0;
                    const bPriority = priorityOrder[b.priority || "low"] || 0;
                    return bPriority - aPriority; // Higher priority first
                  })
                  .map((habit, index) => (
                    <HabitItem
                      key={habit.id}
                      habit={habit}
                      index={index}
                      allCompleted={allCompleted}
                      onToggle={onToggleHabit}
                      onPress={onHabitPress}
                    />
                  ))}
              </View>
            )}
          </Animated.View>
        )}
      </Animated.View>
    );
  }
);

const HabitItem: React.FC<{
  habit: SalatHabit;
  index: number;
  allCompleted: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onPress: (habit: SalatHabit) => void;
}> = memo(({ habit, index, allCompleted, onToggle, onPress }) => {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();
  const checkScale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const isCompletedToday = habit.isCompletedForSelectedDay;

  const [completedForAnimation, setCompletedForAnimation] = useState<boolean>(
    isCompletedToday || false
  );

  React.useEffect(() => {
    // Enhanced entrance animation with staggered timing
    const entranceDelay = index * 80; // Reduced delay for smoother cascade

    // Use setTimeout for delays since withTiming doesn't support delay
    setTimeout(() => {
      opacity.value = withTiming(isCompletedToday ? 0.6 : 1, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Smooth ease-out
      });
    }, entranceDelay);

    setTimeout(() => {
      translateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Smooth ease-out
      });
    }, entranceDelay);

    // Enhanced checkmark animation
    checkScale.value = withTiming(isCompletedToday ? 1 : 0, {
      duration: 400,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });

    setCompletedForAnimation(isCompletedToday || false);
    // Sync opacity with completion state as the single source
    opacity.value = withTiming(isCompletedToday ? 0.6 : 1, {
      duration: 400,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
  }, [isCompletedToday, index]);

  const handleToggle = () => {
    if (reducedMotion) {
      setCompletedForAnimation(!isCompletedToday);
      onToggle(habit.id, !isCompletedToday);
    } else {
      // Enhanced press animation with smooth timing
      scale.value = withSequence(
        withTiming(0.94, {
          duration: 120,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        }),
        withTiming(1.03, {
          duration: 120,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        }),
        withTiming(1, {
          duration: 160,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        })
      );

      // Update local state
      setCompletedForAnimation(!isCompletedToday);

      // Enhanced checkmark animation with smooth timing
      checkScale.value = withSequence(
        withTiming(1.15, {
          duration: 200,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        }),
        withTiming(1, {
          duration: 200,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        })
      );

      onToggle(habit.id, !isCompletedToday);
    }

    // Announce state change
    AccessibilityInfo.announceForAccessibility(
      isCompletedToday ? `ألغيت ${habit.title}` : `أكملت ${habit.title}`
    );
    // Update opacity directly as the only source
    opacity.value = withTiming(!isCompletedToday ? 0.6 : 1, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));
  // Removed separate opacity state effect; opacity now solely derives from the shared value above

  return (
    <Animated.View
      entering={
        reducedMotion
          ? undefined
          : FadeInUp.delay(80 * index)
              .duration(600)
              .easing(Easing.bezier(0.25, 0.46, 0.45, 0.94))
      }
      exiting={
        reducedMotion
          ? undefined
          : FadeOutUp.delay(40 * index)
              .duration(500)
              .easing(Easing.bezier(0.25, 0.46, 0.45, 0.94))
      }
      layout={
        reducedMotion
          ? undefined
          : LinearTransition.springify().mass(0.8).damping(25).stiffness(80)
      }
      style={[animatedStyle]}
      className="mb-2 last:mb-0"
    >
      <AnimatedPressable
        onPress={() => {
          onPress(habit);
        }}
        className="flex-row-reverse gap-2 items-center bg-fore rounded-lg p-3 border border-text-brand shadow-sm"
        accessibilityRole="button"
        accessibilityLabel={`${habit.title} - ${isCompletedToday ? "مكتمل" : "غير مكتمل"}`}
      >
        {/* Enhanced Toggle Button with better animations */}
        <AnimatedPressable
          onPress={handleToggle}
          className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center mr-3 border border-text-brand"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompletedToday }}
          accessibilityLabel="تبديل حالة الإكمال"
        >
          {completedForAnimation ? (
            <Animated.View
              style={checkAnimatedStyle}
              entering={FadeIn.duration(400).easing(
                Easing.bezier(0.25, 0.46, 0.45, 0.94)
              )}
            >
              <View className="w-5 h-5 rounded-full bg-white items-center justify-center">
                <Text className="text-slate-900 text-xs font-bold">✓</Text>
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(400).easing(
                Easing.bezier(0.25, 0.46, 0.45, 0.94)
              )}
              exiting={FadeOut.duration(400).easing(
                Easing.bezier(0.25, 0.46, 0.45, 0.94)
              )}
            >
              <View className="w-5 h-5 rounded-full border-2 border-text-brand" />
            </Animated.View>
          )}
        </AnimatedPressable>

        {/* Clean Habit Content with smooth transitions */}
        <Animated.View
          className="flex-1"
          layout={LinearTransition.springify()
            .mass(0.6)
            .damping(30)
            .stiffness(100)}
        >
          <View className="flex-row-reverse items-center mb-1 ">
            <Text
              className={`font-ibm-plex-arabic-semibold text-lg flex-1 text-right py-2 ${
                completedForAnimation
                  ? "text-text-disabled line-through"
                  : "text-white"
              }`}
              numberOfLines={1}
            >
              {habit.title}
            </Text>

            {/* Priority Badge (custom name with color or dot) */}
            {habit.priority && (
              <View className="ml-2 flex-row items-center">
                <Text
                  className="text-xs"
                  style={{
                    color:
                      habit.priorityColor ||
                      (completedForAnimation ? "#9CA3AF" : "#FFFFFF"),
                  }}
                >
                  {getPriorityIndicator(habit.priority, habit.priorityColor)}
                </Text>
                {!["low", "medium", "high"].includes(habit.priority as any) && (
                  <Text
                    className="text-xs ml-1 font-ibm-plex-arabic"
                    style={{ color: habit.priorityColor || "#22C55E" }}
                    numberOfLines={1}
                  >
                    {habit.priority}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Simple Description with smooth show/hide */}

          {/* Enhanced Streak Display with Islamic Design */}
          {habit.streak > 0 && (
            <Animated.View
              layout={LinearTransition.springify()
                .mass(0.4)
                .damping(20)
                .stiffness(150)}
              className="flex-row-reverse  items-center  gap-1 mt-1"
            >
              {/* Minimized Streak Badge */}
              <View
                className={`px-2 py-1 rounded-full flex-row  items-center gap-1 ${
                  completedForAnimation
                    ? "bg-slate-700/50"
                    : habit.streak >= 7
                      ? "bg-amber-900/30"
                      : habit.streak >= 3
                        ? "bg-blue-900/30"
                        : "bg-slate-700/50"
                }`}
              >
                {/* Small achievement icon */}
                {habit.streak >= 7 && (
                  <Text className="text-amber-400/70 text-[10px]">✦</Text>
                )}
                {habit.streak >= 3 && habit.streak < 7 && (
                  <Text className="text-blue-400/70 text-[10px]">◆</Text>
                )}
                {/* Compact streak number */}
                <Text
                  className={`text-xs  font-ibm-plex-arabic-medium ${
                    completedForAnimation
                      ? "text-text-disabled/60"
                      : habit.streak >= 7
                        ? "text-border-highlight"
                        : habit.streak >= 3
                          ? "text-blue-300/70"
                          : "text-text-white/60"
                  }`}
                >
                  {habit.streak}
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Simple Arrow with subtle animation */}
        <Animated.View
          entering={FadeIn.delay(150 + index * 40)
            .duration(400)
            .easing(Easing.bezier(0.25, 0.46, 0.45, 0.94))}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color="#4B9AB5"
            className="ml-2"
          />
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
});
