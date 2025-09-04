import { convertApiHabitToLocal, fetchAllHabits } from "@/lib/habits-api";
import { useHabitsStore } from "@/store/habitsStore";
import { Category, DEFAULT_CATEGORIES } from "@/types/habit";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const ExploreHabits = () => {
  const { category: initialCategory } = useLocalSearchParams<{
    category?: string;
  }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get habits directly from the store
  const habits = useHabitsStore((state) => state.habits);
  const setHabits = useHabitsStore((state) => state.setHabits);

  // Fetch habits if not in store
  useEffect(() => {
    const fetchHabits = async () => {
      if (habits.length > 0) return; // Skip if we already have habits

      try {
        setIsLoading(true);
        const habitsData = await fetchAllHabits();
        const localHabits = habitsData.map(convertApiHabitToLocal);
        setHabits(localHabits);
      } catch (err) {
        console.error("Error loading habits:", err);
        setError("حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabits();
  }, [habits.length, setHabits]);
  // Filter habits based on search and category
  const filteredHabits = useMemo(() => {
    let filtered = habits;

    if (searchQuery) {
      filtered = filtered.filter(
        (habit) =>
          habit.title.includes(searchQuery) ||
          habit.whyDescription.includes(searchQuery) ||
          habit.benefit.some((benefit: string) => benefit.includes(searchQuery))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((habit) =>
        habit.categories.some((cat) => cat.text === selectedCategory)
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

  const handleBackPress = () => {
    router.navigate("/home");
  };

  const getHabitCategories = (habit: any): Category[] => {
    // Get all categories for the habit
    return habit.categories.map((category: Category) => {
      const foundCategory = DEFAULT_CATEGORIES.find(
        (cat) => cat.text === category.text
      );
      return foundCategory || DEFAULT_CATEGORIES[0];
    });
  };

  const getHabitEmoji = (habit: any): string => {
    // Return relevant emoji based on habit content
    if (
      habit.title.includes("صلاة") ||
      habit.title.includes("قرآن") ||
      habit.title.includes("ذكر")
    ) {
      return "🕌";
    } else if (habit.title.includes("رياضة") || habit.title.includes("صحة")) {
      return "💪";
    } else if (habit.title.includes("قراءة") || habit.title.includes("تعلم")) {
      return "📚";
    } else if (habit.title.includes("صدقة") || habit.title.includes("مساعدة")) {
      return "🤝";
    } else if (habit.title.includes("صيام")) {
      return "🌙";
    } else if (habit.title.includes("أرحام") || habit.title.includes("عائلة")) {
      return "👨‍👩‍👧‍👦";
    }
    return "✨"; // Default emoji
  };

  const getPrimaryCategory = (habit: any): Category => {
    // Get the primary category (first one) for main styling
    return getHabitCategories(habit)[0];
  };

  const getCategoryGradient = (
    categories: Category[]
  ): [string, string, ...string[]] => {
    if (categories.length === 1) {
      return [categories[0].hexColor + "40", categories[0].hexColor + "20"];
    }

    // Create gradient from multiple category colors with higher opacity
    const colors = categories.map((cat) => cat.hexColor + "50");
    if (colors.length === 2) {
      return [colors[0], colors[1]];
    } else if (colors.length === 3) {
      return [colors[0], colors[1], colors[2]];
    } else {
      return [colors[0], colors[1], colors[2], colors[3]];
    }
  };

  const getEmojiGradient = (
    categories: Category[]
  ): [string, string, ...string[]] => {
    if (categories.length === 1) {
      return [categories[0].hexColor + "20", categories[0].hexColor + "10"];
    }

    // Create gradient for emoji background
    const colors = categories.map((cat) => cat.hexColor + "25");
    if (colors.length === 2) {
      return [colors[0], colors[1]];
    } else if (colors.length === 3) {
      return [colors[0], colors[1], colors[2]];
    } else {
      return [colors[0], colors[1], colors[2], colors[3]];
    }
  };

  // Update selected category when initial category changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Scroll to the end of category list by default
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar style="light" />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(400)}
        className="bg-fore px-6 py-4"
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={handleBackPress}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#00AEEF" />
          </Pressable>

          <Text className="font-ibm-plex-arabic-bold text-xl text-text-brand">
            اكتشف العادات
          </Text>

          <View className="w-10" />
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Search Section */}
        <Animated.View entering={FadeInUp.delay(600)} className="px-6 py-4">
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
        </Animated.View>

        {/* Category Filter */}
        <Animated.View className="pr-6 mb-6">
          <View className="flex-row-reverse items-center justify-between mb-3">
            <Animated.Text
              entering={FadeInRight.delay(900)}
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
                  className="flex-row-reverse items-center justify-center    rounded-full px-3 py-2 gap-2 ml-2"
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
                  entering={FadeInRight.delay(800)}
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
                  entering={FadeInLeft.delay(800 + index * 50)}
                >
                  <Pressable
                    onPress={() => setSelectedCategory(category.text)}
                    className={`px-4  rounded-full ml-3 border active:scale-95 ${
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

        {/* Loading State */}
        {isLoading && (
          <Animated.View
            entering={FadeInUp.delay(800)}
            className="items-center justify-center py-20 px-6"
          >
            <View className="w-20 h-20 bg-fore rounded-full items-center justify-center mb-6">
              <Ionicons name="refresh" size={40} color="#00AEEF" />
            </View>
            <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary text-center mb-3">
              جاري تحميل العادات...
            </Text>
          </Animated.View>
        )}

        {/* Error State */}
        {error && (
          <Animated.View
            entering={FadeInUp.delay(800)}
            className="items-center justify-center py-20 px-6"
          >
            <View className="w-20 h-20 bg-fore rounded-full items-center justify-center mb-6">
              <Ionicons name="alert-circle" size={40} color="#E53935" />
            </View>
            <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary text-center mb-3">
              حدث خطأ
            </Text>
            <Text className="font-ibm-plex-arabic text-base text-text-muted text-center leading-6 mb-4">
              {error}
            </Text>
            <Pressable
              onPress={() => window.location.reload()}
              className="px-6 py-2 bg-brand/20 border border-brand/30 rounded-full"
            >
              <Text className="font-ibm-plex-arabic-medium text-sm text-brand">
                إعادة المحاولة
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Habits Grid */}
        {!isLoading && !error && (
          <Animated.View entering={FadeInUp.delay(800)} className="px-6">
            <View className="flex-row-reverse items-center justify-between mb-4">
              <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary">
                العادات
              </Text>
              <View className="bg-white/10 px-3 py-1 rounded-full">
                <Text className="font-ibm-plex-arabic-medium text-sm text-text-muted">
                  {filteredHabits.length} عادة
                </Text>
              </View>
            </View>

            <View className="gap-4">
              {filteredHabits.map((habit, index) => {
                const allCategories = getHabitCategories(habit);
                const emoji = getHabitEmoji(habit);
                const categoryGradient = getCategoryGradient(allCategories);
                const emojiGradient = getEmojiGradient(allCategories);

                return (
                  <Animated.View
                    layout={LinearTransition.duration(200)}
                    key={habit.id}
                    entering={
                      searchQuery || selectedCategory
                        ? undefined
                        : FadeInUp.delay(600 + index * 50)
                    }
                  >
                    <Pressable
                      onPress={() => handleHabitPress(habit.id)}
                      className="w-full rounded-2xl overflow-hidden border border-white/10 active:scale-95"
                      style={{ backgroundColor: "#1a1a1a" }}
                      android_ripple={{ color: "rgba(0, 174, 239, 0.1)" }}
                    >
                      {/* Background with full gradient */}
                      <LinearGradient
                        colors={categoryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          opacity: 0.2,
                        }}
                      />

                      {/* Subtle overlay for text readability */}
                      <View
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(0,0,0,0.3)",
                        }}
                      />

                      {/* Content */}
                      <View className="p-4">
                        <View className="flex-row-reverse items-start justify-between mb-3">
                          {/* Emoji and Title */}
                          <View className="flex-row-reverse items-center flex-1 gap-3">
                            <View className="w-12 h-12 rounded-xl items-center justify-center mr-3 overflow-hidden">
                              <LinearGradient
                                colors={emojiGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Text className="text-2xl">{emoji}</Text>
                              </LinearGradient>
                            </View>

                            <View className="flex-1">
                              <Text className="font-ibm-plex-arabic-bold text-lg text-text-primary mb-1 text-right">
                                {habit.title}
                              </Text>
                              <Text className="font-ibm-plex-arabic text-sm text-text-muted text-right leading-5">
                                {habit.whyDescription}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Quote */}
                        {habit.quote && (
                          <View className="border-t mt-5 border-white/10 pt-3">
                            <Text className="font-ibm-plex-arabic-light text-sm text-text-brand text-right ">
                              {habit.quote}
                            </Text>
                          </View>
                        )}

                        {/* Arrow indicator */}
                        <View className="absolute top-4 left-4">
                          <Ionicons
                            name="chevron-back"
                            size={16}
                            color="#00AEEF"
                          />
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredHabits.length === 0 && (
          <Animated.View
            entering={FadeInUp.delay(1000)}
            className="items-center justify-center  py-20 px-6"
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreHabits;
