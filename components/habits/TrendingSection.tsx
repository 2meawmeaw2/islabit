import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  Text,
  View,
  TouchableOpacity,
  I18nManager,
  FlatList,
} from "react-native";
import Animated, {
  FadeInRight,
  FadeInUp,
  FadeOutLeft,
  Layout,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { HabitsShopHabit } from "@/types/habit";

const isRTL = I18nManager.isRTL;

/* ----------------------------- Types & Props ----------------------------- */
interface TrendingSectionProps {
  onHabitPress?: (habitId: string) => void;
  trendingHabits?: HabitsShopHabit[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  showViewAll?: boolean;
  skeletonCount?: number;
}

/* ------------------------------ Utilities ------------------------------- */
const hexWithAlpha = (hex?: string, alphaHex = "20") => {
  if (!hex || !/^#([A-Fa-f0-9]{6})$/.test(hex)) return `#8B5CF6${alphaHex}`; // fallback violet
  return `${hex}${alphaHex}`;
};

/* ---------------------------- Section Header ---------------------------- */
const SectionHeader: React.FC<{
  title: string;
  onViewAll?: () => void;
  showViewAll?: boolean;
  count?: number;
}> = ({ title, onViewAll, showViewAll = true, count }) => {
  return (
    <View className="flex-row-reverse items-center justify-between mb-4 px-1">
      {/* Right side: icon + title */}
      <View className="flex-row-reverse items-center gap-2">
        <View className="items-end">
          <Text
            className="font-ibm-plex-arabic-semibold text-xl text-text-primary"
            accessibilityRole="header"
          >
            {title}
          </Text>
        </View>
        <View className="bg-fore/90 p-2 rounded-lg">
          <Ionicons
            name="trending-up"
            size={20}
            color="#ffffff"
            style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </View>
      </View>

      {/* Left side: View all */}
      {showViewAll && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onViewAll}
          className="flex-row-reverse items-center gap-2 bg-fore px-3 py-2 rounded-xl"
          accessibilityRole="button"
          accessibilityLabel="عرض جميع العادات الرائجة"
        >
          <Text className="font-ibm-plex-arabic text-sm text-text-secondary">
            عرض الكل
          </Text>
          <Ionicons name="chevron-back" size={14} color="#F5F5F5" />
        </TouchableOpacity>
      )}
    </View>
  );
};

/* ------------------------------ Skeletons -------------------------------- */
const SkeletonItem = ({ delay = 0 }: { delay?: number }) => (
  <Animated.View
    entering={FadeInUp.delay(150 + delay)}
    layout={Layout.springify().damping(20)}
    className="mb-3"
  >
    <View className="h-18 rounded-2xl bg-white/5 overflow-hidden border border-border-primary/10">
      <View className="flex-row-reverse items-center h-full px-4">
        <View className="w-10 h-10 rounded-lg bg-white/10" />
        <View className="flex-1 items-end mr-3 gap-2">
          <View className="w-40 h-4 rounded-full bg-white/10" />
          <View className="w-56 h-3 rounded-full bg-white/10" />
        </View>
        <View className="w-10 h-6 rounded-full bg-white/10" />
      </View>
    </View>
  </Animated.View>
);

/* ------------------------------- Habit Card ------------------------------ */
type HabitCardProps = {
  habit: HabitsShopHabit;
  index: number;
  onPress?: (id: string) => void;
};

const HabitCard = React.memo(({ habit, index, onPress }: HabitCardProps) => {
  const primaryColor = habit?.categories?.[0]?.hexColor || "#00AEEF";

  const accessibilityLabel = useMemo(
    () =>
      `${habit?.title ?? "عادة"}، ${
        habit?.quote || "عادة مهمة لتحسين حياتك اليومية"
      }`,
    [habit?.title, habit?.quote]
  );

  return (
    <Animated.View
      entering={FadeInRight.delay(150 + index * 80)}
      layout={Layout.springify().damping(20)}
    >
      <Pressable
        onPress={() => onPress?.(habit.id)}
        android_ripple={{ color: "rgba(255,255,255,0.08)" }}
        className="relative justify-center py-2 overflow-hidden rounded-2xl border border-border-primary/20 bg-white/5 mb-3"
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={6}
      >
        {/* subtle color strip for category */}
        <View
          className="absolute top-0 bottom-0"
          style={{
            [isRTL ? "right" : "left"]: 0,
            width: 6,
            backgroundColor: hexWithAlpha(primaryColor, "66"),
          }}
        />

        <View className="flex-row-reverse items-center px-4 py-3">
          {/* Category Icon */}
          <View
            className="w-10 h-10 rounded-lg items-center justify-center"
            style={{
              backgroundColor: hexWithAlpha(primaryColor, "20"),
            }}
          >
            <Text className="text-lg" accessible={false}>
              {habit?.categories?.[0]?.emoji ?? "📋"}
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1 items-end mr-3">
            <Text
              className="font-ibm-plex-arabic-medium text-base text-text-primary"
              numberOfLines={1}
            >
              {habit.title}
            </Text>
            <View className="flex-row-reverse items-center gap-2">
              <Text
                className="font-ibm-plex-arabic text-xs text-text-disabled text-right"
                numberOfLines={1}
              >
                {habit.quote || "عادة مهمة لتحسين حياتك اليومية"}
              </Text>
            </View>

            {/* Meta row: streak + completions if you have them (optional-safe) */}
            <View className="flex-row-reverse items-center gap-3 mt-1">
              {!!(habit as any)?.streak && (
                <View className="flex-row-reverse items-center gap-1">
                  <Ionicons name="flame" size={14} color={primaryColor} />
                  <Text className="font-ibm-plex-arabic text-[11px] text-text-secondary">
                    {(habit as any).streak} يوم
                  </Text>
                </View>
              )}
              {!!(habit as any)?.completionRate && (
                <View className="flex-row-reverse items-center gap-1">
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={primaryColor}
                  />
                  <Text className="font-ibm-plex-arabic text-[11px] text-text-secondary">
                    {(habit as any).completionRate}% إنجاز
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Trailing quick action */}
          <View className="items-center justify-center">
            <View className="flex-row-reverse items-center gap-1 bg-white/8 px-2 py-1 rounded-full">
              <Ionicons name="chevron-back" size={16} color={primaryColor} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

/* ---------------------------- Main Component ----------------------------- */
const TrendingSection: React.FC<TrendingSectionProps> = ({
  onHabitPress,
  trendingHabits = [],
  isLoading = false,
  error = null,
  onRetry,
  title = "عادات رائجة",
  showViewAll = true,
  skeletonCount = 4,
}) => {
  const handleViewAll = useCallback(() => {
    router.push("/home/explore-bundles");
  }, []);

  const keyExtractor = useCallback((item: HabitsShopHabit) => item.id, []);

  /* --------------------------- Loading state --------------------------- */
  if (isLoading) {
    return (
      <Animated.View entering={FadeInUp.delay(120)} className="w-full px-4">
        <SectionHeader title={title} showViewAll={false} />
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonItem key={`skeleton-${i}`} delay={i * 80} />
        ))}
      </Animated.View>
    );
  }

  /* ----------------------------- Error state ---------------------------- */
  if (error) {
    return (
      <Animated.View
        entering={FadeInUp.delay(120)}
        exiting={FadeOutLeft.delay(120)}
        className="w-full px-6"
      >
        <View className="items-center py-10 gap-3">
          <Ionicons name="alert-circle" size={28} color="#EF4444" />
          <Text className="font-ibm-plex-arabic text-red-500 text-center">
            {error}
          </Text>
          {onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              className="mt-2 bg-fore px-4 py-2 rounded-xl"
              accessibilityRole="button"
              accessibilityLabel="إعادة المحاولة"
            >
              <Text className="font-ibm-plex-arabic text-text-secondary">
                إعادة المحاولة
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  }

  const showEmpty = trendingHabits.length === 0;

  return (
    <Animated.View entering={FadeInRight.delay(120)} className="w-full px-4">
      <SectionHeader
        title={title}
        onViewAll={handleViewAll}
        showViewAll={showViewAll}
        count={trendingHabits.length}
      />

      {showEmpty ? (
        <View className="items-center py-16 gap-4">
          <Ionicons name="time-outline" size={36} color="#9CA3AF" />
          <Text className="font-ibm-plex-arabic text-text-muted text-center">
            لا توجد عادات رائجة متاحة حالياً
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/home/(habit)")}
            className="bg-fore px-5 py-3 rounded-2xl"
            accessibilityRole="button"
            accessibilityLabel="استكشف العادات المقترحة"
          >
            <Text className="font-ibm-plex-arabic text-text-secondary">
              استكشف عادات مقترحة
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trendingHabits}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 2, paddingBottom: 2 }}
          renderItem={({ item, index }) => (
            <HabitCard habit={item} index={index} onPress={onHabitPress} />
          )}
        />
      )}
    </Animated.View>
  );
};

export default TrendingSection;
