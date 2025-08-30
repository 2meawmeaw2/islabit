import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { habits } from "@/lib/habits";
import { Category, DEFAULT_CATEGORIES } from "@/types/habit";
import Animated, {
  FadeInUp,
  FadeInLeft,
  FadeInDown,
} from "react-native-reanimated";

const ExploreHabits = () => {
  const { category: initialCategory } = useLocalSearchParams<{
    category?: string;
  }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  );

  // Filter habits based on search and category
  const filteredHabits = useMemo(() => {
    let filtered = habits;

    if (searchQuery) {
      filtered = filtered.filter(
        (habit) =>
          habit.title.includes(searchQuery) ||
          habit.whyDescription.includes(searchQuery) ||
          habit.benefit.some((benefit) => benefit.includes(searchQuery))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((habit) => {
        const title = habit.title.toLowerCase();
        const description = habit.whyDescription.toLowerCase();

        // Spiritual category - habits with prayer connections
        if (selectedCategory === "spiritual") {
          return (
            habit.suggestedRelatedSalat.length > 0 ||
            title.includes("صلاة") ||
            title.includes("قرآن") ||
            title.includes("ذكر") ||
            title.includes("دعاء") ||
            title.includes("صيام") ||
            title.includes("وضوء")
          );
        }

        // Health category - physical and mental health habits
        if (selectedCategory === "health") {
          return (
            title.includes("صحة") ||
            title.includes("رياضة") ||
            title.includes("نوم") ||
            title.includes("ماء") ||
            title.includes("تغذية") ||
            title.includes("تمرين") ||
            title.includes("حركة") ||
            description.includes("صحة") ||
            description.includes("جسم") ||
            description.includes("طاقة")
          );
        }

        // Educational category - learning and knowledge habits
        if (selectedCategory === "educational") {
          return (
            title.includes("قراءة") ||
            title.includes("تعلم") ||
            title.includes("دراسة") ||
            title.includes("كتاب") ||
            title.includes("معلومات") ||
            description.includes("تعلم") ||
            description.includes("قراءة") ||
            description.includes("معرفة")
          );
        }

        // Social category - community and helping others
        if (selectedCategory === "social") {
          return (
            title.includes("صلة") ||
            title.includes("مساعدة") ||
            title.includes("تواصل") ||
            title.includes("صدقة") ||
            title.includes("جوار") ||
            title.includes("أخوة") ||
            description.includes("مساعدة") ||
            description.includes("مجتمع") ||
            description.includes("آخرين")
          );
        }

        // Financial category - money and wealth habits
        if (selectedCategory === "financial") {
          return (
            title.includes("مال") ||
            title.includes("توفير") ||
            title.includes("إنفاق") ||
            title.includes("استثمار") ||
            title.includes("اقتصاد") ||
            description.includes("مال") ||
            description.includes("توفير") ||
            description.includes("اقتصاد")
          );
        }

        // Family category - family and relationship habits
        if (selectedCategory === "family") {
          return (
            title.includes("أرحام") ||
            title.includes("عائلة") ||
            title.includes("أولاد") ||
            title.includes("زوج") ||
            title.includes("والدين") ||
            description.includes("عائلة") ||
            description.includes("أرحام") ||
            description.includes("علاقات")
          );
        }

        // Work category - professional and career habits
        if (selectedCategory === "work") {
          return (
            title.includes("عمل") ||
            title.includes("مهنة") ||
            title.includes("وظيفة") ||
            title.includes("مشروع") ||
            title.includes("تطوير") ||
            description.includes("عمل") ||
            description.includes("مهنة") ||
            description.includes("وظيفة")
          );
        }

        // Sports category - physical activities and sports
        if (selectedCategory === "sports") {
          return (
            title.includes("رياضة") ||
            title.includes("تمرين") ||
            title.includes("حركة") ||
            title.includes("جري") ||
            title.includes("سباحة") ||
            title.includes("كرة") ||
            description.includes("رياضة") ||
            description.includes("تمرين") ||
            description.includes("حركة")
          );
        }

        // If no category matches, don't show the habit
        return false;
      });

      // Debug logging
      console.log(`Filtering by category: ${selectedCategory}`);
      console.log(`Total habits: ${habits.length}`);
      console.log(`Filtered habits: ${filtered.length}`);
      console.log(
        `Filtered habit titles:`,
        filtered.map((h) => h.title)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleHabitPress = (habitId: number) => {
    router.push({
      pathname: "/(tabs)/home/(habit)/[id]",
      params: { id: String(habitId) },
    });
  };

  const handleBackPress = () => {
    router.navigate("/home");
  };

  const getHabitCategory = (habit: any): Category => {
    // Determine habit category based on content and related salat
    if (habit.suggestedRelatedSalat.length > 0) {
      return DEFAULT_CATEGORIES[0]; // Spiritual
    }

    // Analyze habit title and description for better categorization
    const title = habit.title.toLowerCase();
    const description = habit.whyDescription.toLowerCase();

    // Health category - physical and mental health habits
    if (
      title.includes("صحة") ||
      title.includes("رياضة") ||
      title.includes("نوم") ||
      title.includes("ماء") ||
      title.includes("تغذية") ||
      title.includes("تمرين") ||
      title.includes("حركة") ||
      description.includes("صحة") ||
      description.includes("جسم") ||
      description.includes("طاقة")
    ) {
      return DEFAULT_CATEGORIES[1]; // Health
    }

    // Educational category - learning and knowledge habits
    if (
      title.includes("قراءة") ||
      title.includes("تعلم") ||
      title.includes("دراسة") ||
      title.includes("كتاب") ||
      title.includes("معلومات") ||
      description.includes("تعلم") ||
      description.includes("قراءة") ||
      description.includes("معرفة")
    ) {
      return DEFAULT_CATEGORIES[2]; // Educational
    }

    // Social category - community and helping others
    if (
      title.includes("صلة") ||
      title.includes("مساعدة") ||
      title.includes("تواصل") ||
      title.includes("صدقة") ||
      title.includes("جوار") ||
      title.includes("أخوة") ||
      description.includes("مساعدة") ||
      description.includes("مجتمع") ||
      description.includes("آخرين")
    ) {
      return DEFAULT_CATEGORIES[3]; // Social
    }

    // Financial category - money and wealth habits
    if (
      title.includes("مال") ||
      title.includes("توفير") ||
      title.includes("إنفاق") ||
      title.includes("استثمار") ||
      title.includes("اقتصاد") ||
      description.includes("مال") ||
      description.includes("توفير") ||
      description.includes("اقتصاد")
    ) {
      return DEFAULT_CATEGORIES[4]; // Financial
    }

    // Family category - family and relationship habits
    if (
      title.includes("أرحام") ||
      title.includes("عائلة") ||
      title.includes("أولاد") ||
      title.includes("زوج") ||
      title.includes("والدين") ||
      description.includes("عائلة") ||
      description.includes("أرحام") ||
      description.includes("علاقات")
    ) {
      return DEFAULT_CATEGORIES[5]; // Family
    }

    // Work category - professional and career habits
    if (
      title.includes("عمل") ||
      title.includes("مهنة") ||
      title.includes("وظيفة") ||
      title.includes("مشروع") ||
      title.includes("تطوير") ||
      description.includes("عمل") ||
      description.includes("مهنة") ||
      description.includes("وظيفة")
    ) {
      return DEFAULT_CATEGORIES[6]; // Work
    }

    // Sports category - physical activities and sports
    if (
      title.includes("رياضة") ||
      title.includes("تمرين") ||
      title.includes("حركة") ||
      title.includes("جري") ||
      title.includes("سباحة") ||
      title.includes("كرة") ||
      description.includes("رياضة") ||
      description.includes("تمرين") ||
      description.includes("حركة")
    ) {
      return DEFAULT_CATEGORIES[7]; // Sports
    }

    // Default to spiritual for Islamic habits
    return DEFAULT_CATEGORIES[0];
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

  // Update selected category when initial category changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100)}
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
        <Animated.View entering={FadeInUp.delay(200)} className="px-6 py-4">
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
        <Animated.View entering={FadeInUp.delay(300)} className="px-6 mb-6">
          <View className="flex-row-reverse items-center justify-between mb-3">
            <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary">
              الفئات
            </Text>
            {selectedCategory && (
              <View className="bg-brand/20 px-3 py-1 rounded-full border border-brand/30">
                <Text className="font-ibm-plex-arabic text-xs text-brand">
                  {DEFAULT_CATEGORIES.find((cat) => cat.id === selectedCategory)
                    ?.text || selectedCategory}
                </Text>
              </View>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            <View className="flex-row" style={{ flexDirection: "row-reverse" }}>
              <Pressable
                onPress={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full ml-3 ${
                  selectedCategory === null
                    ? "bg-brand border border-brand"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <Text
                  className={`font-ibm-plex-arabic-medium text-sm ${
                    selectedCategory === null ? "text-white" : "text-text-muted"
                  }`}
                >
                  الكل
                </Text>
              </Pressable>

              {/* Clear Filters Button */}
              {(searchQuery || selectedCategory) && (
                <Pressable
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="px-3 py-2 rounded-full bg-red-500/20 border border-red-500/30 ml-3"
                >
                  <Text className="font-ibm-plex-arabic text-xs text-red-400">
                    مسح
                  </Text>
                </Pressable>
              )}

              {DEFAULT_CATEGORIES.map((category, index) => (
                <Animated.View
                  key={category.id}
                  entering={FadeInUp.delay(400 + index * 50)}
                >
                  <Pressable
                    onPress={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full ml-3 border active:scale-95 ${
                      selectedCategory === category.id
                        ? "border-white/20"
                        : "border-white/10"
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === category.id
                          ? category.hexColor + "20"
                          : "rgba(255,255,255,0.05)",
                    }}
                    android_ripple={{ color: category.hexColor + "20" }}
                  >
                    <Text
                      className="font-ibm-plex-arabic-medium text-sm"
                      style={{
                        color:
                          selectedCategory === category.id
                            ? category.hexColor
                            : "#6C7684",
                      }}
                    >
                      {category.text}
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Habits Grid */}
        <Animated.View entering={FadeInUp.delay(400)} className="px-6">
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
              const category = getHabitCategory(habit);
              const emoji = getHabitEmoji(habit);

              return (
                <Animated.View
                  key={habit.id}
                  entering={FadeInLeft.delay(500 + index * 100)}
                >
                  <Pressable
                    onPress={() => handleHabitPress(habit.id)}
                    className="w-full rounded-2xl overflow-hidden border border-white/10 active:scale-95"
                    style={{ backgroundColor: "#1a1a1a" }}
                    android_ripple={{ color: "rgba(0, 174, 239, 0.1)" }}
                  >
                    {/* Background with subtle pattern */}
                    <View className="absolute inset-0 opacity-5">
                      <View
                        className="w-full h-full"
                        style={{
                          backgroundColor: category.hexColor,
                          opacity: 0.1,
                        }}
                      />
                    </View>

                    {/* Content */}
                    <View className="p-4">
                      <View className="flex-row-reverse items-start justify-between mb-3">
                        {/* Emoji and Title */}
                        <View className="flex-row-reverse items-center flex-1">
                          <View
                            className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                            style={{
                              backgroundColor: category.hexColor + "20",
                            }}
                          >
                            <Text className="text-2xl">{emoji}</Text>
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

                        {/* Category Badge */}
                        <View
                          className="px-3 py-1 rounded-full border"
                          style={{
                            backgroundColor: category.hexColor + "20",
                            borderColor: category.hexColor + "30",
                          }}
                        >
                          <Text
                            className="font-ibm-plex-arabic text-xs font-medium"
                            style={{ color: category.hexColor }}
                          >
                            {category.text}
                          </Text>
                        </View>
                      </View>

                      {/* Benefits */}
                      {habit.benefit.length > 0 && (
                        <View className="mb-3">
                          <Text className="font-ibm-plex-arabic-medium text-sm text-text-primary text-right mb-2">
                            الفوائد:
                          </Text>
                          <View className="flex-row-reverse flex-wrap gap-2">
                            {habit.benefit.slice(0, 2).map((benefit, idx) => (
                              <View
                                key={idx}
                                className="px-3 py-1 rounded-full"
                                style={{
                                  backgroundColor: category.hexColor + "15",
                                }}
                              >
                                <Text
                                  className="font-ibm-plex-arabic text-xs"
                                  style={{ color: category.hexColor }}
                                >
                                  {benefit}
                                </Text>
                              </View>
                            ))}
                            {habit.benefit.length > 2 && (
                              <View
                                className="px-3 py-1 rounded-full"
                                style={{
                                  backgroundColor: category.hexColor + "15",
                                }}
                              >
                                <Text
                                  className="font-ibm-plex-arabic text-xs"
                                  style={{ color: category.hexColor }}
                                >
                                  +{habit.benefit.length - 2}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}

                      {/* Quote */}
                      {habit.quote && (
                        <View className="border-t border-white/10 pt-3">
                          <Text className="font-ibm-plex-arabic text-sm text-text-muted text-right italic">
                            "{habit.quote}"
                          </Text>
                        </View>
                      )}

                      {/* Arrow indicator */}
                      <View className="absolute top-4 left-4">
                        <Ionicons
                          name="chevron-back"
                          size={16}
                          color={category.hexColor}
                        />
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Empty State */}
        {filteredHabits.length === 0 && (
          <Animated.View
            entering={FadeInUp.delay(600)}
            className="items-center justify-center py-20 px-6"
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
                        key={category.id}
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
