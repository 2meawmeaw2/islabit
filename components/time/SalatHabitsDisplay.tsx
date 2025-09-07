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
  category?: { text: string; hexColor: string }; // Category for the habit
  isCompletedForSelectedDay?: boolean;
  source?: "bundle" | "individual"; // Where the habit comes from
  bundleTitle?: string; // Title of the bundle if source is "bundle"
};

type Props = {
  salatName: string;
  salatTime?: string;
  habits: SalatHabit[];
  onToggleHabit: (id: string, completed: boolean) => void;
  onHabitPress: (habit: SalatHabit) => void;
  onAddHabit?: () => void;
};

// Priority indicator function removed - no longer needed

// Note: Layout animations and style animations are separated to avoid Reanimated conflicts.
// Outer Animated.View handles layout animations, inner Animated.View handles style animations.

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SalatHabitsDisplay: React.FC<Props> = memo(
  ({ salatName, habits, onToggleHabit, onHabitPress, onAddHabit }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [wasAllCompleted, setWasAllCompleted] = useState(false);
    const reducedMotion = useReducedMotion();

    // Animation values
    const headerOpacity = useSharedValue(0);
    const progressScale = useSharedValue(0);
    const chevronRotation = useSharedValue(0);
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
      if (allCompleted && totalHabits > 0) {
        // Add a small delay for celebration feeling
        const timer = setTimeout(() => {
          setIsCollapsed(false); // This will trigger shouldShowCollapsed logic
          // Provide haptic feedback for achievement
        }, 100); // 800ms delay for smooth transition

        return () => clearTimeout(timer);
      }

      // Update the tracking state
      setWasAllCompleted(allCompleted);
    }, [wasAllCompleted, totalHabits]);

    // Announce achievement

    const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed);

      // Animate chevron rotation
      if (!reducedMotion && allCompleted) {
        chevronRotation.value = withTiming(!isCollapsed ? 180 : 0, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });
      }
    };

    const headerAnimatedStyle = useAnimatedStyle(() => ({
      opacity: headerOpacity.value,
    }));

    const progressAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: progressScale.value }],
    }));

    const chevronAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: chevronRotation.value + "deg" }],
    }));

    return (
      <Animated.View
        entering={FadeInDown.duration(300).springify()}
        layout={Layout.springify().damping(15)}
        className="mx-2 mb-6 mt-4 rounded-2xl border border-slate-600/30 p-3 justify-center"
      >
        {/* Clean Salat Header */}
        <AnimatedPressable
          onPress={shouldShowCollapsed ? toggleCollapse : toggleCollapse}
          className={`  ${shouldShowCollapsed ? "cursor-pointer" : ""}`}
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
                  className={`font-ibm-plex-arabic-bold text-xl ${
                    allCompleted ? "text-text-brand" : "text-text-primary"
                  }`}
                >
                  {salatName}
                </Animated.Text>
              </View>
            </View>

            {/* Simple Progress Circle */}
            <View className="flex-row-reverse items-center gap-2">
              <View className="flex-row-reverse items-center gap-1  px-2 py-1 rounded-lg">
                <Text className="text-slate-200 text-xs font-ibm-plex-arabic-light">
                  12:44
                </Text>
              </View>
              {completionPercentage === 100 ? (
                <Animated.View
                  key={1}
                  layout={Layout.springify()}
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  className="w-10 h-10 rounded-full items-center justify-center bg-text-brand"
                >
                  <Text className="text-lg text-white">✓</Text>
                </Animated.View>
              ) : (
                <Animated.View
                  key={2}
                  layout={Layout.springify()}
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  className="items-center justify-center"
                >
                  <Animated.View style={progressAnimatedStyle}>
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
                </Animated.View>
              )}

              <Animated.View
                entering={FadeInLeft.duration(300)}
                exiting={FadeOutLeft.duration(300)}
                className="p-2 items-center justify-center"
              >
                <AnimatedPressable
                  onPress={toggleCollapse}
                  style={chevronAnimatedStyle}
                  accessibilityLabel="طي القائمة"
                  accessibilityRole="button"
                >
                  <Ionicons name="chevron-down" size={16} color="#6C7684" />
                </AnimatedPressable>
              </Animated.View>
            </View>
          </View>
        </AnimatedPressable>

        {/* Habits Container - Only show when expanded or not all completed */}
        {!shouldShowCollapsed && (
          <Animated.View
            entering={reducedMotion ? undefined : FadeIn.duration(300)}
            exiting={reducedMotion ? undefined : FadeOutUp.duration(300)}
            layout={reducedMotion ? undefined : Layout.springify().damping(15)}
            className={`rounded-xl mt-4  overflow-hidden ${
              allCompleted ? "bg-slate-800/50" : "bg-slate-800/30"
            }`}
          >
            {/* Simple Header when all completed */}
            {allCompleted && (
              <Animated.View
                entering={reducedMotion ? undefined : FadeIn}
                exiting={reducedMotion ? undefined : FadeOut}
                className="p-4 flex-row-reverse items-center justify-between bg-slate-700/40 rounded-t-xl"
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
              </Animated.View>
            )}

            {habits.length === 0 ? (
              <View className="py-8 px-4 items-center justify-center">
                <Text className="text-text-disabled font-ibm-plex-arabic text-sm mt-2 text-center">
                  لا توجد عادات لهذا الوقت
                </Text>
                {onAddHabit && (
                  <AnimatedPressable
                    onPress={() => {
                      onAddHabit();
                    }}
                    className="mt-3 bg-text-brand rounded-lg px-4 py-2 items-center justify-center"
                    entering={reducedMotion ? undefined : FadeInUp.delay(200)}
                    accessibilityLabel="إضافة عادة جديدة"
                    accessibilityRole="button"
                  >
                    <Text className="text-white font-ibm-plex-arabic-medium text-sm text-center">
                      إضافة عادة جديدة
                    </Text>
                  </AnimatedPressable>
                )}
              </View>
            ) : (
              <View className="p-4 gap-4">
                {habits
                  .sort((a, b) => {
                    // First, sort by completion status (completed habits go to bottom)
                    const aCompleted = a.isCompletedForSelectedDay;
                    const bCompleted = b.isCompletedForSelectedDay;

                    if (aCompleted !== bCompleted) {
                      return aCompleted ? 1 : -1; // Uncompleted first, completed last
                    }

                    // If both have same completion status, sort by source (bundles first)
                    if (a.source !== b.source) {
                      return a.source === "bundle" ? -1 : 1; // Bundles first
                    }

                    // If both have same source, maintain original order
                    return 0;
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

  // Use shared value instead of state to avoid unnecessary re-renders
  const isCompletedAnimation = useSharedValue(isCompletedToday ? 1 : 0);

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

    // Update the shared value instead of using React state
    isCompletedAnimation.value = isCompletedToday ? 1 : 0;

    // Sync opacity with completion state as the single source
    opacity.value = withTiming(isCompletedToday ? 0.6 : 1, {
      duration: 400,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
  }, [isCompletedToday, index]);

  const handleToggle = () => {
    try {
      // IMPORTANT: Create a local reference to avoid stale closures
      const habitId = habit.id;
      const currentCompletionState = isCompletedToday;
      const newCompletionState = !currentCompletionState;

      // 1. Update animation shared value directly (no React state update)
      isCompletedAnimation.value = newCompletionState ? 1 : 0;

      // 2. Set up animations
      if (!reducedMotion) {
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
      }

      // 3. Update opacity animation immediately
      opacity.value = withTiming(newCompletionState ? 0.6 : 1, {
        duration: 500,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });

      // 4. Announce state change for accessibility
      AccessibilityInfo.announceForAccessibility(
        currentCompletionState ? `ألغيت ${habit.title}` : `أكملت ${habit.title}`
      );

      // 5. Call the toggle callback directly - no need for requestAnimationFrame
      // The navigation context issue was caused by the React state update, not the callback
      onToggle(habitId, newCompletionState);
    } catch (error) {
      console.error("Error in toggle handler:", error);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  // Create animated styles for the completion states to avoid reading shared values during render
  const completedCheckAnimatedStyle = useAnimatedStyle(() => ({
    opacity: isCompletedAnimation.value,
  }));

  const uncompletedCheckAnimatedStyle = useAnimatedStyle(() => ({
    opacity: isCompletedAnimation.value === 1 ? 0 : 1,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: isCompletedAnimation.value === 1 ? "#9CA3AF" : "#FFFFFF",
    textDecorationLine:
      isCompletedAnimation.value === 1 ? "line-through" : "none",
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
      className="mb-10 last:mb-0"
    >
      <Animated.View
        style={[animatedStyle, { marginBottom: 10 }]}
        className="flex-row-reverse gap-3 items-center bg-slate-700/80 rounded-full p-4 shadow-lg border border-slate-600/30"
      >
        {/* Enhanced Toggle Button with better animations */}
        <AnimatedPressable className="w-8 h-8 rounded-full  items-center justify-center mr-4 border-2 border-text-disabled">
          <AnimatedPressable
            onPress={handleToggle}
            accessibilityRole="checkbox"
            accessibilityLabel="تبديل حالة الإكمال"
            style={[
              completedCheckAnimatedStyle,
              { width: "100%", height: "100%" },
            ]}
            className="absolute items-center justify-center  rounded-full"
          >
            <Animated.View
              entering={FadeIn.duration(400).easing(
                Easing.bezier(0.25, 0.46, 0.45, 0.94)
              )}
              style={{ width: "100%", height: "100%" }}
              className="items-center justify-center bg-black rounded-full"
            >
              <Animated.View
                style={[checkAnimatedStyle, { width: "100%", height: "100%" }]}
              >
                <View
                  style={{ width: "100%", height: "100%" }}
                  className="w-6 h-6 rounded-full bg-text-brand items-center justify-center shadow-sm"
                >
                  <Text className="text-text-primary text-sm font-bold">✓</Text>
                </View>
              </Animated.View>
            </Animated.View>
          </AnimatedPressable>
        </AnimatedPressable>

        {/* Clean Habit Content with smooth transitions */}
        <Animated.View
          layout={LinearTransition.springify()
            .mass(0.6)
            .damping(30)
            .stiffness(100)}
          className="flex-1"
        >
          <AnimatedPressable
            onPress={() => onPress(habit)} // Navigate to tracking screen
            className="flex-1"
            accessibilityRole="button"
            accessibilityLabel={`${habit.title} - ${isCompletedToday ? "مكتمل" : "غير مكتمل"}`}
          >
            <View className="flex-row-reverse items-center mb-1 ">
              <Animated.Text
                className="font-ibm-plex-arabic-medium text-base flex-1 text-right py-2"
                style={textAnimatedStyle}
                numberOfLines={1}
              >
                {habit.title}
              </Animated.Text>

              {/* Bundle Indicator */}
            </View>
          </AnimatedPressable>
        </Animated.View>

        {/* Simple Arrow with subtle animation */}
        <Pressable onPress={() => onPress(habit)}>
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
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});
