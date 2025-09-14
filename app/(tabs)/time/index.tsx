import S from "@/assets/styles/shared";
import DisplayDays from "@/components/time/displayDays";
import BundleFilter from "@/components/time/BundleFilter";
import { useAuth } from "@/lib/auth";
import { fmtArabicDateMonthAndNumber } from "@/lib/dates";
import { loadUserById } from "@/lib/usersTable";
import { useHabitsStore } from "@/store/habitsStore";
import { FloatingActionMenu } from "@/components/FloatingActionMenu";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useBundlesStore } from "@/store/bundlesStore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NextPrayerCard from "@/components/time/NextPrayerCard";
import PrayerTimesStrip from "@/components/time/PrayerTimesStrip";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";
import { useLocationStore } from "@/store/locationStore";
import HabitList from "@/components/time/HabitList";

const OrganizeModes: React.FC = () => {
  // load user from user table in supabase
  loadUserById(useAuth().user?.id ?? "");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(
    null
  );
  const router = useRouter();

  // Use Zustand store instead of local state
  const { habits, isHydrated, loadAllHabits, completeHabit, clearAllStorage } =
    useHabitsStore();

  const { bundles } = useBundlesStore();
  const { coords, ensureCoords } = useLocationStore();
  const { initializePrayers, isInitialized, days } = usePrayerTimesStore();

  // Initialize prayer times
  useEffect(() => {
    if (!coords) {
      ensureCoords();
    }
  }, [coords, ensureCoords]);

  useEffect(() => {
    if (coords && !isInitialized) {
      initializePrayers(coords.lat, coords.lng);
    }
  }, [coords, isInitialized, initializePrayers]);

  // Function to get local date string in YYYY-MM-DD format (avoids UTC shift)
  const getDateStr = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Pre-filter habits when bundle selection changes
  const filteredHabits = useMemo(() => {
    if (!selectedBundleId) return habits;

    const selectedBundle = bundles.find((b) => b.id === selectedBundleId);
    if (!selectedBundle) return habits;

    return habits.filter(
      (habit) =>
        habit.source === "bundle" && habit.bundleTitle === selectedBundle.title
    );
  }, [habits, selectedBundleId, bundles]);

  const habitsWithCompletion = useMemo(() => {
    const currentDateStr = getDateStr(selectedDate);
    return filteredHabits.map((habit) => {
      let completedArray: { date: string; prayer: string }[] = [];
      if (habit.completed && Array.isArray(habit.completed)) {
        if (typeof habit.completed[0] === "string") {
          completedArray = (habit.completed as string[]).map(
            (dateStr: string) => ({
              date: dateStr,
              prayer: "unknown",
            })
          );
        } else {
          completedArray = habit.completed as {
            date: string;
            prayer: string;
          }[];
        }
      }
      const isCompletedForSelectedDay = completedArray.some(
        (record) => record.date === currentDateStr
      );
      return { ...habit, isCompletedForSelectedDay };
    });
  }, [filteredHabits, selectedDate, getDateStr]);

  // Load habits when component mounts
  useEffect(() => {
    if (isHydrated) {
      loadAllHabits();
      useBundlesStore.getState().initialize();
    }
  }, [isHydrated, loadAllHabits]);
  const selectedDay = useMemo(() => selectedDate.getDay(), [selectedDate]);

  const handleToggleHabit = useCallback(
    async (id: string, completed: boolean, prayerName?: string) => {
      const selectedDateStr = getDateStr(selectedDate);
      const currentPrayer = prayerName || "unknown";

      // Use the store's completeHabit function
      completeHabit(id, selectedDateStr, currentPrayer, completed);

      // Update bundle completion if this habit belongs to a bundle
      const { updateBundleCompletion } = useBundlesStore.getState();
      await updateBundleCompletion(id, selectedDateStr, currentPrayer);
    },
    [selectedDate, getDateStr, completeHabit]
  );

  const handleHabitPress = (habit: any) => {
    router.push({
      pathname: "/(tabs)/time/habitDetails",
      params: {
        habit: JSON.stringify(habit),
        habitId: habit.id,
      },
    });
  };

  const handleAddHabit = () => {.
    router.push("/(tabs)/time/addNewHabit");
  };

  const handleGoToTracking = () => {
    router.navigate("/(tabs)/time/tracking");
  };

  const handleClearAllStorage = async () => {
    try {
      await clearAllStorage();
      alert("Storage cleared successfully!");
    } catch (error) {
      console.error("Error clearing storage:", error);
      alert("Failed to clear storage");
    }
  };

  // Show loading while store is hydrating
  if (!isHydrated) {
    return (
      <SafeAreaView className="h-full bg-bg justify-center items-center">
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text className="text-text-disabled font-ibm-plex-arabic mt-4">
          جاري تحميل العادات...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1 font-ibm-plex-arabic bg-bg">
        <View className="w-full bg-bg px-4 pt-4 pb-2 flex-row-reverse justify-between items-center">
          <View>
            <Text className="font-ibm-plex-arabic-bold text-text-primary text-3xl">
              اليوم
            </Text>
            <Text className="text-text-muted text-right font-ibm-plex-arabic text-base">
              {fmtArabicDateMonthAndNumber(new Date())}
            </Text>
          </View>
          <FloatingActionMenu
            onNavigate={handleGoToTracking}
            onClear={handleClearAllStorage}
            onAddHabit={handleAddHabit}
            onSalatTime={() => router.navigate("/(tabs)/time/salatTime")}
            position="top-left"
          />
        </View>

        <ScrollView
          className="flex-1 rounded-t-3xl bg-fore pt-4"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <NextPrayerCard />
          <PrayerTimesStrip />
          <View>
            <DisplayDays
              selectedDate={selectedDate}
              onChange={(date: Date) => setSelectedDate(date)}
            />
            <BundleFilter
              selectedBundleId={selectedBundleId}
              onSelectBundle={setSelectedBundleId}
            />
          </View>
          <View>
            {habits.length === 0 ? (
              <View className="mx-4 mt-8 items-center">
                <View className="bg-bg rounded-2xl p-8 items-center border border-text-brand">
                  <AntDesign name="heart" size={48} color="#6C7684" />
                  <Text className="text-text-primary font-ibm-plex-arabic-bold text-xl mt-4 text-center">
                    ابدأ رحلتك
                  </Text>
                  <Text className="text-text-disabled font-ibm-plex-arabic text-base mt-2 text-center">
                    أضف عاداتك اليومية لتتبع تقدمك
                  </Text>
                  <Pressable
                    onPress={handleAddHabit}
                    className="mt-6 bg-text-brand rounded-full px-6 py-3 flex-row-reverse items-center"
                  >
                    <AntDesign name="plus" size={20} color="white" />
                    <Text className="text-white font-ibm-plex-arabic-medium mr-2">
                      أضف عادة جديدة
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <HabitList
                habits={habitsWithCompletion}
                onToggleHabit={handleToggleHabit}
                onHabitPress={handleHabitPress}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default OrganizeModes;
