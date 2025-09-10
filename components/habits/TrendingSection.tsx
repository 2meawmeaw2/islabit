import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View, Image, ActivityIndicator } from "react-native";
import Animated, {
  FadeInRight,
  FadeInUp,
  FadeOutLeft,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { HabitsShopHabit } from "@/types/habit";
import { Bundle } from "@/lib/bundles";
import TrendingSkeleton from "@/components/TrendingSkeleton";

interface TrendingSectionProps {
  onHabitPress?: (habitId: string) => void;
  onBundlePress?: (bundle: Bundle) => void;
  trendingHabits?: HabitsShopHabit[];
  trendingBundles?: Bundle[];
  isLoading?: boolean;
  error?: string | null;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({
  onHabitPress,
  onBundlePress,
  trendingHabits = [],
  trendingBundles = [],
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
      <Animated.View entering={FadeInUp.delay(300)} className="w-full">
        <TrendingSkeleton habitCount={3} bundleCount={3} />
      </Animated.View>
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
        <View className="flex-row-reverse items-center justify-between mb-4">
          <Text className="font-ibm-plex-arabic-semibold text-xl text-text-brand">
            عادات رائجة
          </Text>
          <Pressable
            onPress={handleMoreHabits}
            className="flex-row-reverse items-center gap-2"
          >
            <Text className="font-ibm-plex-arabic-medium text-sm text-text-primary">
              المزيد
            </Text>
            <Ionicons name="chevron-back" size={12} color="#fff" />
          </Pressable>
        </View>

        {/* Content Area - Shows skeleton when loading, real content when loaded */}
        {isLoading ? (
          <TrendingSkeleton habitCount={3} bundleCount={3} />
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

      {/* Trending Bundles Section */}
      {trendingBundles.length > 0 && (
        <View className="mb-8">
          <View className="flex-row-reverse items-center justify-between mb-4">
            <Text className="font-ibm-plex-arabic-semibold text-xl text-text-brand">
              رحلات رائجة
            </Text>
            <Pressable
              onPress={handleMoreBundles}
              className="flex-row-reverse items-center gap-2"
            >
              <Text className="font-ibm-plex-arabic-medium text-sm text-text-primary">
                المزيد
              </Text>
              <Ionicons name="chevron-back" size={12} color="#fff" />
            </Pressable>
          </View>

          {/* Content Area - Shows skeleton when loading, real content when loaded */}
          {isLoading ? (
            <TrendingSkeleton habitCount={3} bundleCount={3} />
          ) : (
            <>
              <View className="gap-4">
                {trendingBundles.map((bundle, index) => (
                  <Animated.View
                    key={bundle.id}
                    entering={FadeInUp.delay(500 + index * 100)}
                  >
                    <Pressable
                      onPress={() => onBundlePress?.(bundle)}
                      className="h-48 rounded-2xl overflow-hidden"
                      style={{ width: "100%", backgroundColor: "#1a1a1a" }}
                      android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
                    >
                      <Image
                        source={require("../../assets/images/logo.png")}
                        className="w-full h-full"
                        style={{
                          opacity: 0.7,
                          transform: [{ translateX: -50 }],
                        }}
                      />
                      <LinearGradient
                        colors={[
                          "rgba(00,00,00,0.98)",
                          "rgba(00,00,00,0.45)",
                          "rgba(00,00,00,0.00)",
                        ]}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          padding: 16,
                        }}
                      >
                        <View className="px-3 rounded-full self-end">
                          <Text
                            style={{
                              color: bundle.category?.hexColor || "#8B5CF6",
                            }}
                            className="font-ibm-plex-arabic text-xs pb-2"
                          >
                            {bundle.category?.text || "عام"}
                          </Text>
                        </View>
                        <View className="w-full flex-1 items-end justify-center">
                          <Text className="font-ibm-plex-arabic-bold text-xl text-white mb-1">
                            {bundle.title}
                          </Text>
                          <Text className="font-ibm-plex-arabic text-sm text-gray-300 mb-2">
                            {bundle.subtitle}
                          </Text>
                        </View>
                        <View className="flex-row-reverse items-center justify-end w-full">
                          <View className="flex-row-reverse justify-start w-full gap-1">
                            <View className="px-2 rounded-full">
                              <Text className="font-ibm-plex-arabic text-xs text-text-muted pb-2">
                                {bundle.enrolled_users.length} مشارك
                              </Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* Empty State */}
      {trendingHabits.length === 0 &&
        trendingBundles.length === 0 &&
        !isLoading &&
        !error && (
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
