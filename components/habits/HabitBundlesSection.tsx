import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Category } from "@/types/habit";
import { DEFAULT_CATEGORIES } from "@/types/habit";
import { router } from "expo-router";
import { Bundle } from "@/lib/bundles";

interface HabitBundlesSectionProps {
  onBundlePress: (bundleId: string) => void;
  bundles?: Bundle[];
  isLoading?: boolean;
  error?: string | null;
}

const HabitBundlesSection: React.FC<HabitBundlesSectionProps> = ({
  onBundlePress,
  bundles = [],
  isLoading = false,
  error = null,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Show loading state
  if (isLoading) {
    return (
      <Animated.View entering={FadeInUp.delay(200)} className="w-full px-4">
        <View className="flex-row-reverse items-center justify-between mb-4">
          <Text className="font-ibm-plex-arabic-semibold text-xl text-text-brand">
            حزم العادات
          </Text>
          <Pressable
            onPress={() => router.push("/home/explore-bundles")}
            className="flex-row-reverse items-center gap-1"
          >
            <Text className="font-ibm-plex-arabic text-sm text-text-muted">
              عرض الكل
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </Pressable>
        </View>
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="font-ibm-plex-arabic text-text-muted mt-4">
            جاري تحميل الحزم...
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Show error state
  if (error) {
    return (
      <Animated.View entering={FadeInUp.delay(200)} className="w-full px-4">
        <View className="flex-row-reverse items-center justify-between mb-4">
          <Text className="font-ibm-plex-arabic-semibold text-xl text-text-brand">
            حزم العادات
          </Text>
          <Pressable
            onPress={() => router.push("/home/explore-bundles")}
            className="flex-row-reverse items-center gap-1"
          >
            <Text className="font-ibm-plex-arabic text-sm text-text-muted">
              عرض الكل
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </Pressable>
        </View>
        <View className="flex-1 justify-center items-center py-20">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="font-ibm-plex-arabic text-red-500 text-center mt-4">
            {error}
          </Text>
          <Text className="font-ibm-plex-arabic text-text-muted text-center mt-2">
            يرجى المحاولة مرة أخرى
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Show empty state
  if (bundles.length === 0) {
    return (
      <Animated.View entering={FadeInUp.delay(200)} className="w-full px-4">
        <View className="flex-row-reverse items-center justify-between mb-4">
          <Text className="font-ibm-plex-arabic-semibold text-xl text-text-brand">
            حزم العادات
          </Text>
          <Pressable
            onPress={() => router.push("/home/explore-bundles")}
            className="flex-row-reverse items-center gap-1"
          >
            <Text className="font-ibm-plex-arabic text-sm text-text-muted">
              عرض الكل
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </Pressable>
        </View>
        <View className="flex-1 justify-center items-center py-20">
          <Ionicons name="folder-outline" size={48} color="#6B7280" />
          <Text className="font-ibm-plex-arabic text-text-muted text-center mt-4">
            لا توجد حزم متاحة حالياً
          </Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.delay(200)} className="w-full ">
      {/* Header */}
      <View className="flex-row-reverse items-center justify-between mb-4 px-4">
        <Text className="font-ibm-plex-arabic-semibold text-xl text-text-brand">
          حزم العادات
        </Text>
        <Pressable
          onPress={() => router.push("/home/explore-bundles")}
          className="flex-row-reverse items-center gap-1"
        >
          <Text className="font-ibm-plex-arabic text-sm text-text-muted">
            عرض الكل
          </Text>
          <Ionicons name="chevron-back" size={16} color="#6B7280" />
        </Pressable>
      </View>

      {/* Bundles ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4"
        className="flex-1"
      >
        {bundles.map((bundle, index) => (
          <Animated.View
            key={bundle.id}
            entering={FadeInUp.delay(300 + index * 100)}
            className="w-72"
            style={{ height: 250 }}
          >
            <Pressable
              onPress={() => onBundlePress(bundle.id)}
              className="bg-fore rounded-2xl overflow-hidden shadow-lg"
            >
              {/* Bundle Image */}
              <View className="h-40 relative">
                <Image
                  source={{ uri: bundle.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.7)"]}
                  className="absolute bottom-0 left-0 right-0 h-20"
                />

                {/* Category Badge */}
                <View className="absolute top-3 right-3">
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: bundle.category.hexColor }}
                  >
                    <Text className="font-ibm-plex-arabic text-xs text-white">
                      {bundle.category.text}
                    </Text>
                  </View>
                </View>

                {/* Bundle Info Overlay */}
                <View className="absolute bottom-3  right-3">
                  <Text className="font-ibm-plex-arabic-bold text-right text-lg text-white mb-1">
                    {bundle.title}
                  </Text>
                  <Text className="font-ibm-plex-arabic text-sm text-right text-white/90">
                    {bundle.subtitle}
                  </Text>
                </View>
              </View>

              {/* Bundle Content */}
              <View className="p-4">
                <Text className="font-ibm-plex-arabic text-sm text-right text-text-muted mb-3 line-clamp-2">
                  {bundle.description}
                </Text>

                {/* Bundle Stats */}
                <View className="flex-row-reverse items-center justify-between">
                  <View className="flex-row-reverse items-center gap-2">
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text className="font-ibm-plex-arabic text-sm text-text-muted">
                      {bundle.rating.toFixed(1)}
                    </Text>
                    <Ionicons name="download" size={16} color="#9CA3AF" />

                    <Text className="font-ibm-plex-arabic text-sm text-text-muted">
                      {bundle.enrolled_users.length}
                    </Text>
                  </View>

                  <View className="flex-row-reverse items-center gap-1">
                    <Text className="font-ibm-plex-arabic text-sm text-text-brand">
                      {bundle.habits.length} عادة
                    </Text>
                    <Ionicons name="chevron-back" size={14} color="#00AEEF" />
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

export default HabitBundlesSection;
