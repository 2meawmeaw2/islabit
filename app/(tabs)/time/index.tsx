import S from "@/assets/styles/shared";
import { SalatHabitsDisplay } from "@/components/time/SalatHabitsDisplay";
import DisplayDays from "@/components/time/displayDays";
import BundleFilter from "@/components/time/BundleFilter";
import { useAuth } from "@/lib/auth";
import { fmtArabicDateMonthAndNumber } from "@/lib/dates";
import { PRAYERS } from "@/assets/constants/prayers";
import { loadUserById } from "@/lib/usersTable";
import { useHabitsStore } from "@/store/habitsStore";
import { Ionicons } from "@expo/vector-icons";
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

const OrganizeModes: React.FC = () => {
  // load user from user table in supabase
  loadUserById(useAuth().user?.id ?? "");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const router = useRouter();

  // Use Zustand store instead of local state
  const { habits, isHydrated, loadAllHabits, completeHabit, clearAllStorage } =
    useHabitsStore();

  const { bundles } = useBundlesStore();

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

  // Function to get local date string in YYYY-MM-DD format (avoids UTC shift)
  const getDateStr = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Load habits when component mounts
  useEffect(() => {
    if (isHydrated) {
      loadAllHabits();
      useBundlesStore.getState().initialize();
      console.log(
        "bundles from zustand store from index time",
        useBundlesStore.getState().bundles
      );
    }
  }, [isHydrated, loadAllHabits]);
  const selectedDay = useMemo(() => selectedDate.getDay(), [selectedDate]);

  // Simplified filtering function that uses pre-filtered habits
  const getHabitsForPrayer = useCallback(
    (prayerName: string) => {
      // Only filter by prayer and day - bundle filtering is already done
      return filteredHabits
        .filter(
          (habit: any) =>
            habit.relatedSalat &&
            habit.relatedSalat.includes(prayerName) &&
            habit.relatedDays &&
            habit.relatedDays.includes(selectedDay)
        )
        .map((habit) => {
          // Check if habit is completed for this specific prayer on the selected date
          const currentDateStr = getDateStr(selectedDate);

          // Convert completed to the expected format for SalatHabit
          let completedArray: { date: string; prayer: string }[] = [];

          if (habit.completed && Array.isArray(habit.completed)) {
            if (typeof habit.completed[0] === "string") {
              // Convert old string format to new object format
              completedArray = (habit.completed as string[]).map(
                (dateStr: string) => ({
                  date: dateStr,
                  prayer: "unknown",
                })
              );
            } else {
              // Already in the correct format
              completedArray = habit.completed as {
                date: string;
                prayer: string;
              }[];
            }
          }

          const isCompletedForPrayer = completedArray.some(
            (record) =>
              record.date === currentDateStr && record.prayer === prayerName
          );

          return {
            ...habit,
            completed: completedArray,
            isCompletedForSelectedDay: isCompletedForPrayer,
          };
        });
    },
    [filteredHabits, selectedDay, getDateStr, selectedDate]
  );

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

  const handleAddHabit = () => {
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
      <SafeAreaView className="h-full font-ibm-plex-arabic bg-bg">
        <View className="w-full h-[60px] gap-1 bg-bg px-5 flex-row-reverse justify-between items-center">
          <View>
            <View style={S.rowBetween}>
              <Text className="font-ibm-plex-arabic-bold text-text-brand text-2xl my-1">
                اليوم
              </Text>
            </View>
            <Text className="text-text-disabled text-right font-ibm-plex-arabic-extralight">
              {fmtArabicDateMonthAndNumber(new Date())}
            </Text>
          </View>
          <View className="flex-row">
            <Pressable
              onPress={handleGoToTracking}
              className="bg-text-brand/70 rounded-full justify-center items-center h-10 w-10 mr-2"
            >
              <Ionicons name="navigate-outline" size={20} color="white" />
            </Pressable>
            <Pressable
              onPress={handleClearAllStorage}
              className="bg-red-500 rounded-full justify-center items-center h-10 w-10 mr-2"
            >
              <Ionicons name="trash" size={20} color="white" />
            </Pressable>
            <Pressable
              onPress={handleAddHabit}
              className="bg-text-brand rounded-full justify-center items-center h-10 w-10"
            >
              <Ionicons name="add" size={30} color="white" />
            </Pressable>
            <Pressable
              onPress={() => router.navigate("/(tabs)/time/salatTime")}
              className="bg-text-brand rounded-full justify-center items-center h-10 w-10"
            >
              <Ionicons name="alarm-sharp" size={30} color="white" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          className="bg-fore relative h-[100%] rounded-t-2xl"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
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
          <View className="mt-6">
            {habits.length === 0 ? (
              <View className="mx-4 mt-8 items-center">
                <View className="bg-bg rounded-2xl p-8 items-center border border-text-brand">
                  <Ionicons name="leaf-outline" size={48} color="#6C7684" />
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
                    <Ionicons name="add-circle" size={20} color="white" />
                    <Text className="text-white font-ibm-plex-arabic-medium mr-2">
                      أضف عادة جديدة
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              PRAYERS.map((prayer, idx) => (
                <SalatHabitsDisplay
                  key={prayer.name}
                  prayerKey={prayer.key}
                  salatName={prayer.name}
                  salatTime={prayer.time}
                  habits={getHabitsForPrayer(prayer.key)}
                  onToggleHabit={(id, completed) =>
                    handleToggleHabit(id, completed, prayer.key)
                  }
                  onHabitPress={(habit) =>
                    handleHabitPress({ ...habit, currentPrayer: prayer.key })
                  }
                  onAddHabit={handleAddHabit}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default OrganizeModes;
