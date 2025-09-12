import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View, TouchableOpacity } from "react-native";
import Animated, {
  FadeInRight,
  FadeInUp,
  FadeOutLeft,
} from "react-native-reanimated";
import { router } from "expo-router";
import { HabitsShopHabit } from "@/types/habit";

interface TrendingSectionProps {
  onHabitPress?: (habitId: string) => void;
  trendingHabits?: HabitsShopHabit[];
  isLoading?: boolean;
  error?: string | null;
}

const SectionHeader: React.FC<{
  title: string;
  onViewAll: () => void;
  withIcon?: boolean;
  color?: string;
}> = ({ title, onViewAll, withIcon = true, color = "#00AEEF" }) => {
  return (
    <View className="flex-row-reverse items-center justify-between mb-6 px-1">
      {/* Right side: icon + title, anchored to the right in RTL */}
      <View className="flex-row-reverse items-center gap-2">
        <Text className="font-ibm-plex-arabic-semibold text-xl text-text-primary text-right">
          {title}
        </Text>
        {withIcon && (
          <View className="bg-fore/90 p-2 rounded-lg">
            <Ionicons
              name="trending-up"
              style={{ transform: [{ rotateY: "180deg" }] }}
              size={20}
              color="#ffffff"
            />
          </View>
        )}
      </View>

      {/* Left side: View all */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onViewAll}
        className="flex-row-reverse items-center gap-2 bg-fore px-3 py-2 rounded-xl"
      >
        <Text className="font-ibm-plex-arabic text-sm text-text-secondary">
          عرض الكل
        </Text>
        <Ionicons name={"chevron-back"} size={14} color="#F5F5F5" />
      </TouchableOpacity>
    </View>
  );
};
const TrendingSection: React.FC<TrendingSectionProps> = ({
  onHabitPress,
  trendingHabits = [],
  isLoading = false,
  error = null,
}) => {
  const handleMoreHabits = () => {
    router.push("/home/(habit)");
  };

  const handleMoreBundles = () => {
    router.push("/home/explore-bundles");
  };

  // Show loading state
  if (isLoading) {
    return (
      <Animated.View
        entering={FadeInUp.delay(300)}
        className="w-full"
      ></Animated.View>
    );
  }

  // Show error state
  if (error) {
    return (
      <Animated.View
        entering={FadeInUp.delay(300)}
        exiting={FadeOutLeft.delay(300)}
        className="w-full px-4"
      >
        <View className="flex-1 justify-center items-center py-20">
          <Text className="font-ibm-plex-arabic text-red-500 text-center">
            {error}
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInRight.delay(300)} className="w-full px-4">
      {/* Trending Habits Section */}
      <View className="mb-8">
        <SectionHeader
          title="عادات رائجة"
          onViewAll={() => router.push("/home/explore-bundles")}
          withIcon={true}
          color="#00AEEF"
        />

        {/* Content Area - Shows skeleton when loading, real content when loaded */}
        {isLoading ? (
          <></>
        ) : (
          <>
            <View className="gap-3">
              {trendingHabits.map((habit, index) => (
                <Animated.View
                  key={habit.id}
                  entering={FadeInRight.delay(400 + index * 100)}
                >
                  <Pressable
                    onPress={() => onHabitPress?.(habit.id)}
                    className="relative overflow-hidden"
                    android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
                  >
                    <View className="h-16 rounded-xl border border-border-primary/20 bg-white/5">
                      <View className="flex-row-reverse items-center h-full px-4">
                        {/* Category Icon */}
                        <View
                          className="w-10 h-10 rounded-lg items-center justify-center"
                          style={{
                            backgroundColor:
                              (habit.categories &&
                                habit.categories[0]?.hexColor) + "20" ||
                              "#8B5CF620",
                          }}
                        >
                          <Text className="text-lg">📋</Text>
                        </View>

                        {/* Content */}
                        <View className="flex-1 items-end mr-3">
                          <Text className="font-ibm-plex-arabic-medium text-base text-text-primary">
                            {habit.title}
                          </Text>
                          <Text className="font-ibm-plex-arabic text-xs text-text-disabled text-right">
                            {habit.quote || "عادة مهمة لتحسين حياتك اليومية"}
                          </Text>
                        </View>

                        {/* Streak Badge */}
                        <View className="rounded-full">
                          <Ionicons
                            name="chevron-back"
                            size={14}
                            color="#00AEEF"
                          />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Empty State */}
      {trendingHabits.length === 0 && !isLoading && !error && (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="font-ibm-plex-arabic text-text-muted text-center">
            لا توجد بيانات رائجة متاحة حالياً
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

export default TrendingSection;
