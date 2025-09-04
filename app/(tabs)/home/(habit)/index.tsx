import { convertApiHabitToStore, fetchAllHabits } from "@/lib/habits-api";
import { useHabitsStore } from "@/store/habitsStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const HabitIndex = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Use the habits from the store
  const habits = useHabitsStore((state) => state.habits);
  const setHabitsInStore = useHabitsStore((state) => state.setHabits);

  useEffect(() => {
    const loadHabits = async () => {
      // If we already have habits in the store, don't fetch again
      if (habits.length > 0) {
        return;
      }

      try {
        setIsLoading(true);
        const habitsData = await fetchAllHabits();
        const localHabits = habitsData.map(convertApiHabitToStore);
        setHabitsInStore(localHabits);
      } catch (err) {
        console.error("Error loading habits:", err);
        setError("حدث خطأ في تحميل العادات");
      } finally {
        setIsLoading(false);
      }
    };

    loadHabits();
  }, [habits.length, setHabitsInStore]);

  const filteredHabits = habits.filter(
    (habit) =>
      habit.title.includes(searchQuery) ||
      (habit.description && habit.description.includes(searchQuery))
  );

  const handleHabitPress = (habitId: string) => {
    router.push({
      pathname: "/(tabs)/home/(habit)/[id]",
      params: { id: habitId },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="bg-bg flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="font-ibm-plex-arabic text-text-primary">
            جاري التحميل...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="bg-bg flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="font-ibm-plex-arabic text-text-primary text-center mb-4">
            {error}
          </Text>
          <Pressable
            onPress={() => window.location.reload()}
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
            عاداتي
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#00AEEF" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View className="px-6 py-4">
          <View className="relative">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="ابحث في عاداتك..."
              placeholderTextColor="#6C7684"
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pl-12 text-right text-text-primary font-ibm-plex-arabic"
            />
            <Ionicons
              name="search"
              size={20}
              color="#6C7684"
              style={{ position: "absolute", left: 16, top: 12 }}
            />
          </View>
        </View>

        {/* Habits List */}
        <View className="px-6">
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
            {filteredHabits.map((habit, index) => (
              <Animated.View
                key={habit.id}
                entering={FadeInUp.delay(index * 50)}
              >
                <Pressable
                  onPress={() => handleHabitPress(habit.id)}
                  className="w-full rounded-2xl overflow-hidden border border-white/10 active:scale-95"
                  style={{ backgroundColor: "#1a1a1a" }}
                >
                  <View className="p-4">
                    <View className="flex-row-reverse items-start justify-between mb-3">
                      <View className="flex-row-reverse items-center flex-1 gap-3">
                        <View className="w-12 h-12 rounded-xl items-center justify-center mr-3 bg-white/10">
                          <Text className="text-2xl">✨</Text>
                        </View>

                        <View className="flex-1">
                          <Text className="font-ibm-plex-arabic-bold text-lg text-text-primary mb-1 text-right">
                            {habit.title}
                          </Text>
                          <Text className="font-ibm-plex-arabic text-sm text-text-muted text-right leading-5">
                            {habit.description}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Quote */}
                    {habit.quote && (
                      <View className="border-t mt-5 border-white/10 pt-3">
                        <Text className="font-ibm-plex-arabic-light text-sm text-text-brand text-right">
                          {habit.quote}
                        </Text>
                      </View>
                    )}

                    {/* Arrow indicator */}
                    <View className="absolute top-4 left-4">
                      <Ionicons name="chevron-back" size={16} color="#00AEEF" />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {/* Empty State */}
          {filteredHabits.length === 0 && (
            <Animated.View
              entering={FadeInUp.delay(1000)}
              className="items-center justify-center py-20"
            >
              <View className="w-20 h-20 bg-fore rounded-full items-center justify-center mb-6">
                <Ionicons
                  name={searchQuery ? "search-outline" : "star-outline"}
                  size={40}
                  color="#6C7684"
                />
              </View>
              <Text className="font-ibm-plex-arabic-semibold text-lg text-text-primary text-center mb-3">
                {searchQuery ? "لم نجد عادات" : "لا توجد عادات"}
              </Text>
              <Text className="font-ibm-plex-arabic text-base text-text-muted text-center leading-6">
                {searchQuery
                  ? "جرب البحث بكلمات مختلفة"
                  : "ابدأ بإنشاء عادات جديدة"}
              </Text>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HabitIndex;
