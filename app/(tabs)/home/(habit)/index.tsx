import { HabitsShopHabit, DEFAULT_CATEGORIES } from "@/types/habit";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated, {
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExploreStore } from "@/store/exploreStore";

const HabitIndex = () => {
  const router = useRouter();
  const { category, q } = useLocalSearchParams<{
    category?: string;
    q?: string;
  }>();

  // Get data and actions from explore store
  const { habits, isLoading, error, hasMore, fetchMoreHabits } =
    useExploreStore();
  console.log("habits", habits);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load initial data
  useEffect(() => {
    fetchMoreHabits(20); // Initial load with 20 items
  }, []);

  // Initialize filters from URL params
  useEffect(() => {
    if (typeof q === "string" && q.trim().length > 0) setSearchQuery(q);

    if (typeof category === "string" && category.trim().length > 0) {
      const isValid = DEFAULT_CATEGORIES.some((c) => c.text === category);
      if (isValid) setSelectedCategory(category);
    }
  }, [category, q]);

  // Scroll to the end of category list by default
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  // Filter habits based on search and category
  const filteredHabits = useMemo(() => {
    let filtered = habits;

    if (searchQuery) {
      filtered = filtered.filter(
        (habit) =>
          habit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (habit.description &&
            habit.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (habit) => habit.category.text === selectedCategory
      );
    }

    return filtered;
  }, [habits, searchQuery, selectedCategory]);

  const handleHabitPress = (habitId: string) => {
    router.push({
      pathname: "/(tabs)/home/(habit)/[id]",
      params: { id: habitId },
    });
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchMoreHabits();
    }
  };

  if (error) {
    return (
      <SafeAreaView className="bg-bg flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-ibm-plex-arabic text-text-primary text-center mb-4">
            {error}
          </Text>
          <Pressable
            onPress={() => fetchMoreHabits(20)}
            className="px-6 py-2 bg-brand/20 border border-brand/30 rounded-full"
          >
            <Text className="font-ibm-plex-arabic text-brand">
              إعادة المحاولة
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="bg-bg flex-1">
      {/* Header */}
      <View className="px-6 py-4">
        <View className="flex-row-reverse items-center justify-between">
          <Text className="font-ibm-plex-arabic-bold text-xl text-text-brand">
            متجر العادات
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#00AEEF" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 " showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View className="px-6 py-4">
          <View className="relative">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="ابحث عن عادة..."
              placeholderTextColor="#6C7684"
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pl-12 text-right text-text-primary font-ibm-plex-arabic focus:border-brand/50"
              style={{
                borderColor: searchQuery
                  ? "rgba(0, 174, 239, 0.3)"
                  : "rgba(255, 255, 255, 0.1)",
              }}
            />
            <Ionicons
              name="search"
              size={20}
              color={searchQuery ? "#00AEEF" : "#6C7684"}
              style={{ position: "absolute", left: 16, top: 12 }}
            />
          </View>
        </View>

        {/* Category Filter */}
        <Animated.View className="pr-6 mb-6">
          <View className="flex-row-reverse items-center justify-between mb-3">
            <Animated.Text
              entering={FadeInRight.delay(200)}
              className="font-ibm-plex-arabic-semibold text-lg text-text-primary"
            >
              الفئات
            </Animated.Text>
            <Animated.View className="h-10" entering={FadeIn} exiting={FadeOut}>
              {(searchQuery || selectedCategory) && (
                <Pressable
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="flex-row-reverse items-center justify-center rounded-full px-3 py-2 gap-2 ml-2"
                >
                  <Ionicons name="close-circle" size={20} color="#E53935" />
                </Pressable>
              )}
            </Animated.View>
          </View>

          {/* Horizontal Category Scroll */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            <View className="flex-row" style={{ flexDirection: "row-reverse" }}>
              {/* All Categories Button */}
              <Pressable
                onPress={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full ml-3 ${
                  selectedCategory === null
                    ? "bg-brand border border-brand"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <Animated.Text
                  entering={FadeInRight.delay(100)}
                  className={`font-ibm-plex-arabic-medium text-sm ${
                    selectedCategory === null ? "text-white" : "text-text-muted"
                  }`}
                >
                  الكل
                </Animated.Text>
              </Pressable>

              {/* Category Buttons */}
              {DEFAULT_CATEGORIES.map((category, index) => (
                <Animated.View
                  key={category.text}
                  entering={FadeInLeft.delay(100 + index * 50)}
                >
                  <Pressable
                    onPress={() => setSelectedCategory(category.text)}
                    className={`px-4 rounded-full ml-3 border active:scale-95 ${
                      selectedCategory === category.text
                        ? "border-white/20"
                        : "border-white/10"
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === category.text
                          ? "#00AEEF"
                          : "rgba(255,255,255,0.05)",
                    }}
                    android_ripple={{ color: category.hexColor + "20" }}
                  >
                    <Text className="font-ibm-plex-arabic-medium py-2 text-text-primary text-sm">
                      {category.text}
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Habits List */}
        <View className="px-6">
          <View className="flex-row-reverse items-center justify-between mb-4">
            <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary">
              العادات المتاحة
            </Text>
            <View className="bg-white/10 px-3 py-1 rounded-full">
              <Text className="font-ibm-plex-arabic-medium text-sm text-text-muted">
                {filteredHabits.length} عادة
              </Text>
            </View>
          </View>

          <View className="gap-4">
            {filteredHabits.map((habit, index) => (
              <Animated.View
                key={habit.id}
                entering={FadeInUp.delay(index * 50)}
              >
                <Pressable
                  onPress={() => handleHabitPress(habit.id)}
                  className="w-full rounded-2xl  overflow-hidden border border-white/10 active:scale-95"
                  style={{ backgroundColor: "#1a1a1a", height: 80 }}
                >
                  <View className="flex-row-reverse gap-4 h-full items-center justify-between py-2">
                    <View
                      style={{ height: 55, width: 55 }}
                      className=" rounded-3xl items-center border border-white/20 justify-center mr-3 bg-white/10"
                    >
                      <Ionicons name="cafe" size={28} color="#00AEEF" />
                    </View>
                    <View className="flex-row-reverse   items-center flex-1 gap-3 ">
                      <View className="flex-1">
                        <Text className="font-ibm-plex-arabic-bold text-lg text-text-primary mb-1 text-right">
                          {habit.title}
                        </Text>
                        <Text className="font-ibm-plex-arabic text-sm text-text-muted text-right leading-5">
                          {habit.description
                            ? habit.description.slice(0, 40) + "..."
                            : habit.quote?.slice(0, 40) + "..."}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Arrow indicator */}
                  <View
                    style={{ transform: [{ translateY: "-50%" }] }}
                    className="absolute top-1/2  left-2"
                  >
                    <Ionicons name="chevron-back" size={18} color="#ffffff80" />
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {/* Show More Button */}
          {hasMore && !isLoading && filteredHabits.length > 0 && (
            <Animated.View entering={FadeInUp} className="mt-6 mb-8">
              <Pressable
                onPress={handleLoadMore}
                className="bg-text-brand/20 border border-brand/30 rounded-full py-3 px-6 items-center"
              >
                <Text className="font-ibm-plex-arabic-medium text-text-brand">
                  عرض المزيد
                </Text>
              </Pressable>
            </Animated.View>
          )}
          {!hasMore && (
            <Animated.View entering={FadeInUp} className="mt-6 mb-8">
              <Pressable
                onPress={handleLoadMore}
                className=" border border-brand/30 rounded-full py-3 px-6 items-center"
              >
                <Text className="font-ibm-plex-arabic-medium text-text-primary">
                  لا توجد عادات أخرى متاحة
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Loading State */}
          {isLoading && (
            <View className="items-center justify-center py-8">
              <Text className="font-ibm-plex-arabic text-text-muted">
                جاري التحميل...
              </Text>
            </View>
          )}

          {/* Empty State */}
          {filteredHabits.length === 0 && (
            <Animated.View
              entering={FadeInUp.delay(1000)}
              className="items-center justify-center py-20"
            >
              <View className="w-20 h-20 bg-fore rounded-full items-center justify-center mb-6">
                <Ionicons
                  name={
                    searchQuery || selectedCategory
                      ? "search-outline"
                      : "star-outline"
                  }
                  size={40}
                  color="#6C7684"
                />
              </View>
              <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary text-center mb-3">
                {searchQuery || selectedCategory
                  ? "لم نجد عادات"
                  : "لا توجد عادات متاحة"}
              </Text>
              <Text className="font-ibm-plex-arabic text-base text-text-muted text-center leading-6">
                {searchQuery || selectedCategory
                  ? "جرب البحث بكلمات مختلفة أو اختر فئة أخرى"
                  : "سيتم إضافة المزيد من العادات قريباً"}
              </Text>

              {(searchQuery || selectedCategory) && (
                <View className="mt-4 gap-3">
                  <Pressable
                    onPress={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                    }}
                    className="px-6 py-2 bg-brand/20 border border-brand/30 rounded-full"
                  >
                    <Text className="font-ibm-plex-arabic-medium text-sm text-brand">
                      إعادة تعيين
                    </Text>
                  </Pressable>

                  {/* Show available categories */}
                  <View className="items-center">
                    <Text className="font-ibm-plex-arabic text-sm text-text-muted mb-2">
                      الفئات المتاحة:
                    </Text>
                    <View className="flex-row flex-wrap justify-center gap-2">
                      {DEFAULT_CATEGORIES.slice(0, 4).map((category) => (
                        <View
                          key={category.text}
                          className="px-3 py-1 rounded-full"
                          style={{ backgroundColor: category.hexColor + "20" }}
                        >
                          <Text
                            className="font-ibm-plex-arabic text-xs"
                            style={{ color: category.hexColor }}
                          >
                            {category.text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HabitIndex;
